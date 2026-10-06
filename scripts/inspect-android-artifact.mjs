import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { appendFile, copyFile, mkdir, mkdtemp, open, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { Readable, Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';
import { completedAndroidBuild } from './record-android-build.mjs';

// Official google/bundletool release 1.18.3, asset 329035725. Pin the bytes as
// well as the version; runtime release metadata cannot replace this trust pin.
export const BUNDLETOOL = Object.freeze({
  version: '1.18.3',
  url: 'https://github.com/google/bundletool/releases/download/1.18.3/bundletool-all-1.18.3.jar',
  sha256: 'a099cfa1543f55593bc2ed16a70a7c67fe54b1747bb7301f37fdfd6d91028e29',
});
const PACKAGE = 'com.leoqo.footballquiz';
const PROJECT = '99891114-dac6-4d4c-973c-3a246db2a7b1';
const PROFILE = 'production-paid';
const MAX_AAB_BYTES = 512 * 1024 * 1024;
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export function inspectionInputs(env) {
  const buildId = env.INSPECT_BUILD_ID ?? '';
  const sourceCommit = env.INSPECT_SOURCE_COMMIT ?? '';
  const minimum = env.INSPECT_MIN_VERSION_CODE ?? '6';
  const fingerprint = (env.INSPECT_UPLOAD_CERT_SHA256 ?? '').replaceAll(':', '').toUpperCase();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(buildId)) throw new Error('Supply one exact EAS build ID.');
  if (!/^[0-9a-f]{40}$/i.test(sourceCommit)) throw new Error('Supply the full reviewed source commit SHA.');
  if (!/^[1-9]\d*$/.test(String(minimum)) || !Number.isSafeInteger(Number(minimum)) || Number(minimum) > 2100000000) throw new Error('Minimum version code must be a positive Android version code.');
  if (fingerprint && !/^[0-9A-F]{64}$/.test(fingerprint)) throw new Error('Upload certificate fingerprint must be a SHA-256 hex fingerprint.');
  return { buildId: buildId.toLowerCase(), sourceCommit: sourceCommit.toLowerCase(), minimumVersionCode: Number(minimum), expectedCertificateSha256: fingerprint || null };
}

export function checkedDownloadUrl(value, kind) {
  let url;
  try { url = new URL(value); } catch { throw new Error('Download URL is invalid.'); }
  if (url.protocol !== 'https:' || url.username || url.password || url.hash || (url.port && url.port !== '443')) throw new Error('Downloads must use credential-free HTTPS URLs.');
  const host = url.hostname;
  const allowed = kind === 'bundletool'
    ? host === 'github.com' || host === 'release-assets.githubusercontent.com'
    : host === 'expo.dev' || host === 'artifacts.eascdn.net' ||
      /^(?:eas-build-artifacts(?:-[a-z0-9-]+)?|turtle-v2-artifacts)\.s3(?:[.-][a-z0-9-]+)?\.amazonaws\.com$/.test(host) ||
      (/^s3(?:[.-][a-z0-9-]+)?\.amazonaws\.com$/.test(host) && /^\/(?:eas-build-artifacts(?:-[a-z0-9-]+)?|turtle-v2-artifacts)\//.test(url.pathname));
  if (!allowed) throw new Error('Download host is outside the approved Expo or bundletool artifact hosts.');
  return url;
}

export function checkedBuild(raw, inputs) {
  const candidate = Array.isArray(raw) ? raw[0] : raw;
  if (candidate?.status !== 'FINISHED') throw new Error('The exact EAS build is not FINISHED. Re-run inspection after it finishes; no artifact was downloaded or new build started.');
  const validated = completedAndroidBuild(raw, inputs.sourceCommit, PROFILE);
  if (validated.id.toLowerCase() !== inputs.buildId) throw new Error('EAS returned a different build ID.');
  if (!Number.isSafeInteger(Number(validated.versionCode)) || Number(validated.versionCode) < inputs.minimumVersionCode || Number(validated.versionCode) > 2100000000) throw new Error('Build version code is below the requested minimum or invalid.');
  const build = Array.isArray(raw) ? raw[0] : raw;
  const artifactUrl = checkedDownloadUrl(build.artifacts?.applicationArchiveUrl || build.artifacts?.buildUrl, 'aab').href;
  return { ...validated, versionCode: Number(validated.versionCode), versionName: typeof build.appVersion === 'string' ? build.appVersion : null, artifactUrl };
}

function run(command, args, label, input) {
  try {
    return execFileSync(command, args, { encoding: 'utf8', input, timeout: 120000, maxBuffer: 8 * 1024 * 1024, stdio: ['pipe', 'pipe', 'pipe'] });
  } catch { throw new Error(`${label} failed. Raw command output was withheld to protect private build data.`); }
}

function parseJson(text, label) {
  try { return JSON.parse(text); } catch { throw new Error(`${label} did not return valid JSON.`); }
}

export async function downloadVerified(url, destination, { kind, maxBytes, expectedSha256, fetchImpl = fetch }) {
  let created = false;
  try {
    const signal = AbortSignal.timeout(300000);
    let current = checkedDownloadUrl(url, kind);
    for (let redirect = 0; redirect <= 5; redirect++) {
      const response = await fetchImpl(current.href, { redirect: 'manual', signal, credentials: 'omit', headers: { 'User-Agent': 'leoqo-artifact-inspection/1' } });
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get('location');
        await response.body?.cancel();
        if (!location || redirect === 5) throw new Error('Redirect limit.');
        current = checkedDownloadUrl(new URL(location, current).href, kind);
        continue;
      }
      if (!response.ok || !response.body) throw new Error('Download response not successful.');
      const length = response.headers.get('content-length');
      if (length && (!/^\d+$/.test(length) || Number(length) > maxBytes)) { await response.body.cancel(); throw new Error('Declared size exceeds limit.'); }
      let bytes = 0;
      const hash = createHash('sha256');
      const handle = await open(destination, 'wx', 0o600);
      created = true;
      await pipeline(Readable.fromWeb(response.body), new Transform({ transform(chunk, _, done) {
        bytes += chunk.length;
        if (bytes > maxBytes) { done(new Error('Stream size exceeds limit.')); return; }
        hash.update(chunk); done(null, chunk);
      } }), handle.createWriteStream());
      const sha256 = hash.digest('hex');
      if (!bytes || (expectedSha256 && sha256 !== expectedSha256)) throw new Error('Empty or mismatched artifact.');
      return { bytes, sha256 };
    }
  } catch {
    if (created) await rm(destination, { force: true });
    throw new Error(`${kind === 'bundletool' ? 'Pinned bundletool' : 'Android bundle'} download or integrity check failed. No private download URL was logged.`);
  }
}

const manifestParser = String.raw`
import json, sys, xml.etree.ElementTree as ET
xml = sys.stdin.read()
if '<!DOCTYPE' in xml.upper() or '<!ENTITY' in xml.upper(): raise ValueError('Unsupported XML declaration')
root = ET.fromstring(xml)
if root.tag != 'manifest': raise ValueError('Expected manifest')
ns = '{http://schemas.android.com/apk/res/android}'
def attr(node, name): return None if node is None else node.get(ns + name)
sdk = root.find('uses-sdk')
app = root.find('application')
permissions = [{'name': attr(p, 'name'), 'maxSdkVersion': attr(p, 'maxSdkVersion')} for p in root if p.tag in ('uses-permission', 'uses-permission-sdk-23')]
print(json.dumps({'package':root.get('package'), 'versionCode':attr(root,'versionCode'), 'versionName':attr(root,'versionName'), 'minSdk':attr(sdk,'minSdkVersion'), 'targetSdk':attr(sdk,'targetSdkVersion'), 'debuggable':attr(app,'debuggable'), 'usesCleartextTraffic':attr(app,'usesCleartextTraffic'), 'testOnly':attr(app,'testOnly'), 'permissions':permissions}))
`;

export function sanitizedManifest(raw, moduleName) {
  const int = value => value === null || value === undefined ? null : /^\d+$/.test(value) && Number.isSafeInteger(Number(value)) ? Number(value) : NaN;
  const bool = value => value == null ? null : value === 'true' ? true : value === 'false' ? false : 'invalid';
  if (!raw || !/^[A-Za-z0-9_]+$/.test(moduleName) || raw.package !== PACKAGE || !Array.isArray(raw.permissions)) throw new Error('Manifest identity or permission list is invalid.');
  const permissions = raw.permissions.map(permission => {
    if (!permission || typeof permission.name !== 'string' || !/^[A-Za-z0-9_.]{1,200}$/.test(permission.name)) throw new Error('Manifest contains an invalid permission name.');
    const maxSdkVersion = int(permission.maxSdkVersion);
    if (Number.isNaN(maxSdkVersion)) throw new Error('Manifest permission SDK bound is invalid.');
    return { name: permission.name, maxSdkVersion };
  }).sort((a, b) => a.name.localeCompare(b.name));
  const result = { module: moduleName, package: PACKAGE, versionCode: int(raw.versionCode), versionName: raw.versionName ?? null, minSdk: int(raw.minSdk), targetSdk: int(raw.targetSdk), debuggable: bool(raw.debuggable), testOnly: bool(raw.testOnly), usesCleartextTraffic: bool(raw.usesCleartextTraffic), permissions };
  if ([result.versionCode, result.minSdk, result.targetSdk].some(Number.isNaN) || [result.debuggable, result.testOnly, result.usesCleartextTraffic].includes('invalid') || (result.versionName !== null && !/^[A-Za-z0-9._+-]{1,128}$/.test(result.versionName))) throw new Error('Manifest version or application flags are invalid.');
  return result;
}

export function parseManifestXml(xml, moduleName) {
  const parsed = parseJson(run('python3', ['-c', manifestParser], 'Manifest summarization', xml), 'Manifest summarization');
  return sanitizedManifest(parsed, moduleName);
}

export function artifactReport(build, inputs, manifests, signature, download) {
  const base = manifests.find(manifest => manifest.module === 'base');
  if (!base || base.package !== PACKAGE || base.targetSdk !== 36 || base.versionCode !== build.versionCode || (build.versionName && base.versionName !== build.versionName)) throw new Error('Base manifest package, target SDK 36 or version does not match the validated build.');
  if (base.versionCode < inputs.minimumVersionCode || !Number.isInteger(base.minSdk) || base.minSdk < 24 || base.minSdk > base.targetSdk) throw new Error('Manifest version code or minimum Android SDK is invalid.');
  if (manifests.some(manifest => manifest.debuggable === true || manifest.testOnly === true)) throw new Error('The artifact is a debug or test-only application.');
  if (signature?.cryptographicallySigned !== true || !/^[0-9A-F]{64}$/.test(signature.certificateSha256 ?? '') || !Number.isSafeInteger(signature.signedPayloadEntries) || signature.signedPayloadEntries < 2) throw new Error('The bundle does not have a verified payload signature.');
  if (inputs.expectedCertificateSha256 && signature.certificateSha256 !== inputs.expectedCertificateSha256) throw new Error('Signing certificate does not match the supplied upload certificate fingerprint.');
  const permissions = [...new Set(manifests.flatMap(manifest => manifest.permissions.map(permission => permission.name)))].sort();
  const needsReview = permissions.filter(name => /(?:RECORD_AUDIO|CAMERA|LOCATION|CONTACTS|READ_PHONE|READ_SMS|SEND_SMS|AD_ID|AD_SERVICES|EXTERNAL_STORAGE|READ_MEDIA)/.test(name));
  return {
    inspection: 'Signed Android App Bundle inspected; no installation or Play submission performed.',
    buildId: build.id, sourceCommit: build.commit, projectId: PROJECT, package: PACKAGE,
    buildProfile: PROFILE, distribution: 'STORE', easStatus: 'FINISHED',
    versionCode: base.versionCode, versionName: base.versionName, minimumExpectedVersionCode: inputs.minimumVersionCode,
    targetSdk: base.targetSdk, minSdk: base.minSdk, debuggable: base.debuggable ?? false,
    bundleSha256: download.sha256, bundleBytes: download.bytes,
    bundletool: { version: BUNDLETOOL.version, sha256: BUNDLETOOL.sha256 },
    signing: { certificateSha256: signature.certificateSha256, signedPayloadEntries: signature.signedPayloadEntries,
      uploadCertificateMatch: inputs.expectedCertificateSha256 ? 'matched supplied fingerprint' : 'not checked; compare with Google Play upload certificate' },
    modules: manifests.map(manifest => manifest.module), permissions,
    permissionsRequiringReview: needsReview,
    cleartextTrafficExplicitlyEnabled: manifests.some(manifest => manifest.usesCleartextTraffic === true),
    limitations: [
      'This does not prove acceptance by Google Play or possession of the expected Play upload key unless its fingerprint was supplied.',
      'No native device, purchase, restore, accessibility or account-deletion flow was exercised.',
      'Version code is checked against the requested minimum and EAS metadata, not against the live Play Console version history.',
      'Review every listed permission; the highlighted list is not an exhaustive policy assessment.',
    ],
  };
}

async function main() {
  const inputs = inspectionInputs(process.env);
  if (!process.env.EXPO_TOKEN) throw new Error('EXPO_TOKEN is required to read this exact build.');
  const temporary = await mkdtemp(join(process.env.RUNNER_TEMP || tmpdir(), 'leoqo-aab-inspect-'));
  try {
    const raw = parseJson(run('eas', ['build:view', inputs.buildId, '--json'], 'Authenticated EAS build lookup'), 'EAS build lookup');
    const build = checkedBuild(raw, inputs);
    console.log('Exact EAS build identity validated. Downloading its Android bundle.');
    const bundle = join(temporary, 'candidate.aab');
    const tool = join(temporary, 'bundletool.jar');
    const download = await downloadVerified(build.artifactUrl, bundle, { kind: 'aab', maxBytes: MAX_AAB_BYTES });
    await downloadVerified(BUNDLETOOL.url, tool, { kind: 'bundletool', maxBytes: 64 * 1024 * 1024, expectedSha256: BUNDLETOOL.sha256 });
    console.log('Downloads complete. Verifying signed payloads and manifest details.');
    const signature = parseJson(run('java', [join(root, 'scripts/InspectAabSignature.java'), bundle], 'Bundle signature verification'), 'Signature verification');
    if (!Array.isArray(signature.manifestModules) || !signature.manifestModules.includes('base') || signature.manifestModules.length > 100 || signature.manifestModules.some(name => !/^[A-Za-z0-9_]+$/.test(name))) throw new Error('Bundle modules are invalid.');
    run('java', ['-jar', tool, 'validate', `--bundle=${bundle}`], 'Pinned bundletool validation');
    const manifests = signature.manifestModules.map(moduleName => {
      const xml = run('java', ['-jar', tool, 'dump', 'manifest', `--bundle=${bundle}`, `--module=${moduleName}`], 'Manifest decoding');
      return parseManifestXml(xml, moduleName);
    });
    const report = artifactReport(build, inputs, manifests, signature, download);
    const output = join(root, 'artifacts/android-inspection');
    await mkdir(output, { recursive: true });
    const filename = `leoqo-v${build.versionCode}-${inputs.buildId}.aab`;
    await copyFile(bundle, join(output, filename));
    await writeFile(join(output, 'manifest-summary.json'), JSON.stringify(manifests, null, 2) + '\n');
    await writeFile(join(output, 'inspection-report.json'), JSON.stringify(report, null, 2) + '\n');
    const summary = `Signed AAB inspected: ${filename}\nSource commit: ${build.commit}\nAndroid version code: ${build.versionCode}\nTarget SDK: ${report.targetSdk}\nBundle SHA-256: ${download.sha256}\nUpload certificate SHA-256: ${signature.certificateSha256}\nUpload key comparison: ${report.signing.uploadCertificateMatch}\n\nPermissions: ${report.permissions.join(', ') || 'none'}\nPermissions requiring review: ${report.permissionsRequiringReview.join(', ') || 'none highlighted'}\n\nDownload the separate workflow artifacts for the signed AAB and sanitized inspection report. This was artifact inspection only: no device testing or Google Play acceptance is implied.\n`;
    await writeFile(join(output, 'README.txt'), summary);
    if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, summary);
    console.log(`Inspected Android version ${build.versionCode}, target SDK ${report.targetSdk}. AAB and sanitized reports are ready for artifact upload.`);
  } finally { await rm(temporary, { recursive: true, force: true }); }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(`Artifact inspection failed: ${error.message}`); process.exitCode = 1; });
}
