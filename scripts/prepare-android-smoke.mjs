import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { constants, createReadStream, closeSync, openSync } from 'node:fs';
import { chmod, lstat, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { isAbsolute, join, parse, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const fixedTarget = Object.freeze({
  projectId: '99891114-dac6-4d4c-973c-3a246db2a7b1',
  package: 'com.leoqo.footballquiz', buildProfile: 'production-paid',
  distribution: 'STORE', easStatus: 'FINISHED', targetSdk: 36, debuggable: false,
});
const bundletoolSha256 = 'a099cfa1543f55593bc2ed16a70a7c67fe54b1747bb7301f37fdfd6d91028e29';
const maximumBundleBytes = 512 * 1024 * 1024;
class SmokePreparationError extends Error {}

export function smokeTarget(env = process.env) {
  const buildId = env.SMOKE_BUILD_ID;
  const sourceCommit = env.SMOKE_SOURCE_COMMIT;
  const versionCode = env.SMOKE_VERSION_CODE;
  if (typeof buildId !== 'string' || buildId.length !== 36 || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(buildId)) {
    throw new SmokePreparationError('SMOKE_BUILD_ID must identify one exact build with a full lowercase UUID.');
  }
  if (typeof sourceCommit !== 'string' || sourceCommit.length !== 40 || !/^[0-9a-f]{40}$/.test(sourceCommit)) {
    throw new SmokePreparationError('SMOKE_SOURCE_COMMIT must be the full lowercase source commit hash.');
  }
  if (typeof versionCode !== 'string' || !/^[1-9]\d{0,9}$/.test(versionCode)
    || String(Number(versionCode)) !== versionCode || Number(versionCode) > 2100000000) {
    throw new SmokePreparationError('SMOKE_VERSION_CODE must be a canonical decimal Android version code from 1 to 2100000000.');
  }
  return Object.freeze({ ...fixedTarget, buildId, sourceCommit, versionCode: Number(versionCode) });
}

function checkedTarget(target) {
  if (!Number.isInteger(target?.versionCode) || Object.entries(fixedTarget).some(([field, value]) => target?.[field] !== value)) {
    throw new SmokePreparationError('The smoke target must preserve the fixed Android release identity and configuration.');
  }
  return smokeTarget({ SMOKE_BUILD_ID: target.buildId, SMOKE_SOURCE_COMMIT: target.sourceCommit, SMOKE_VERSION_CODE: String(target.versionCode) });
}

export function expectedBundleFilename(target) {
  const checked = checkedTarget(target);
  return `leoqo-v${checked.versionCode}-${checked.buildId}.aab`;
}

function checkedPath(value) {
  if (typeof value !== 'string' || !value || /[\\\x00-\x1f]/.test(value) || value.split('/').includes('..')) {
    throw new SmokePreparationError('Artifact paths must not contain traversal or control characters.');
  }
  return resolve(value);
}

async function noSymlinks(path) {
  let current = parse(path).root;
  for (const component of path.slice(current.length).split(sep).filter(Boolean)) {
    current = join(current, component);
    try {
      if ((await lstat(current)).isSymbolicLink()) throw new SmokePreparationError('Artifact paths must not contain symbolic links.');
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
}

async function digest(path, maximum = maximumBundleBytes) {
  const info = await lstat(path);
  if (!info.isFile() || info.isSymbolicLink() || info.size <= 0 || info.size > maximum) throw new SmokePreparationError('Artifact file type or size is invalid.');
  const hash = createHash('sha256');
  let bytes = 0;
  for await (const chunk of createReadStream(path, { flags: constants.O_RDONLY | constants.O_NOFOLLOW })) {
    bytes += chunk.length;
    if (bytes > maximum) throw new SmokePreparationError('Artifact exceeds the size limit.');
    hash.update(chunk);
  }
  if (bytes !== info.size) throw new SmokePreparationError('Artifact changed during verification.');
  return { sha256: hash.digest('hex'), bytes };
}

export function validateInspectionReport(report, actual, target = smokeTarget()) {
  const expectedTarget = checkedTarget(target);
  for (const [field, expected] of Object.entries(expectedTarget)) {
    if (report?.[field] !== expected) throw new SmokePreparationError('Inspection report does not match the exact reviewed Android build.');
  }
  if (!/^[0-9a-f]{64}$/i.test(report.bundleSha256 ?? '') || !Number.isSafeInteger(report.bundleBytes)
    || report.bundleBytes <= 0 || report.bundleBytes > maximumBundleBytes
    || report.bundleSha256.toLowerCase() !== actual?.sha256 || report.bundleBytes !== actual?.bytes) {
    throw new SmokePreparationError('Android bundle bytes do not match the inspection report.');
  }
  if (!Number.isSafeInteger(report.signing?.signedPayloadEntries) || report.signing.signedPayloadEntries < 2
    || !/^[0-9a-f]{64}$/i.test(report.signing?.certificateSha256 ?? '')) {
    throw new SmokePreparationError('Inspection report lacks verified bundle signing evidence.');
  }
  return { ...expectedTarget, bundleSha256: actual.sha256, bundleBytes: actual.bytes,
    signing: { signedPayloadEntries: report.signing.signedPayloadEntries, certificateSha256: report.signing.certificateSha256.toUpperCase() } };
}

export async function verifyInspection(directory, target = smokeTarget()) {
  const expectedTarget = checkedTarget(target);
  const input = checkedPath(directory);
  await noSymlinks(input);
  if (!(await lstat(input)).isDirectory()) throw new SmokePreparationError('Inspection input must be a directory.');
  const bundles = [];
  let count = 0;
  async function walk(path) {
    for (const name of await readdir(path)) {
      if (++count > 1000 || /[\\\x00-\x1f]/.test(name)) throw new SmokePreparationError('Inspection artifact layout is invalid.');
      const child = join(path, name);
      const info = await lstat(child);
      if (info.isSymbolicLink() || (!info.isDirectory() && !info.isFile())) throw new SmokePreparationError('Inspection artifacts must be regular files without symbolic links.');
      if (info.isDirectory()) await walk(child);
      else if (/\.aab$/i.test(name)) bundles.push(child);
    }
  }
  await walk(input);
  const bundle = join(input, expectedBundleFilename(expectedTarget));
  if (bundles.length !== 1 || bundles[0] !== bundle) throw new SmokePreparationError('Expected exactly the pinned inspected Android bundle at the artifact root.');
  const reportPath = join(input, 'inspection-report.json');
  const reportInfo = await lstat(reportPath);
  if (!reportInfo.isFile() || reportInfo.size > 1024 * 1024) throw new SmokePreparationError('Inspection report file is invalid.');
  let report;
  try { report = JSON.parse(await readFile(reportPath, 'utf8')); }
  catch { throw new SmokePreparationError('Inspection report is not valid JSON.'); }
  return { bundle, report: validateInspectionReport(report, await digest(bundle), expectedTarget) };
}

export function validateArchiveEntries(listing) {
  if (typeof listing !== 'string') throw new SmokePreparationError('Bundle archive listing is invalid.');
  const entries = listing.split('\n').filter(Boolean);
  const unique = new Set();
  for (const entry of entries) {
    if (entry.startsWith('/') || /^[A-Za-z]:/.test(entry) || /[\\\x00-\x1f]/.test(entry)
      || entry.split('/').some(part => part === '..' || part === '.') || unique.has(entry)) {
      throw new SmokePreparationError('Bundle contains an unsafe or duplicate archive entry.');
    }
    unique.add(entry);
  }
  if (!entries.some(entry => /^base\/lib\/x86_64\/[^/]+\.so$/.test(entry))) {
    throw new SmokePreparationError('The inspected bundle has no x86_64 native libraries. This emulator cannot test it; no replacement build was requested.');
  }
  return entries;
}

function run(command, args, label, output) {
  try {
    return execFileSync(command, args, { encoding: output === undefined ? 'utf8' : undefined,
      timeout: 120000, maxBuffer: 16 * 1024 * 1024, stdio: ['ignore', output ?? 'pipe', 'pipe'] });
  } catch { throw new SmokePreparationError(`${label} failed. Raw command output was withheld.`); }
}

function contains(parent, child) {
  const path = relative(parent, child);
  return path === '' || (!path.startsWith(`..${sep}`) && path !== '..' && !isAbsolute(path));
}

export async function prepareAndroidSmoke(inputDirectory, workDirectory, outputDirectory, env = process.env) {
  const target = smokeTarget(env);
  const input = checkedPath(inputDirectory);
  const work = checkedPath(workDirectory);
  const output = checkedPath(outputDirectory);
  for (const [left, right] of [[input, work], [input, output], [work, output]]) {
    if (contains(left, right) || contains(right, left)) throw new SmokePreparationError('Inspection, private work and uploaded report directories must be separate.');
  }
  if (!/^[1-9]\d{0,19}$/.test(env.INSPECTION_RUN_ID ?? '')) throw new SmokePreparationError('Supply the exact inspection workflow run ID.');
  const tool = checkedPath(env.BUNDLETOOL_PATH);
  await noSymlinks(tool);
  if ((await digest(tool, 64 * 1024 * 1024)).sha256 !== bundletoolSha256) throw new SmokePreparationError('Bundletool does not match the pinned official 1.18.3 bytes.');
  const verified = await verifyInspection(input, target);
  validateArchiveEntries(run('unzip', ['-Z1', verified.bundle], 'Bundle architecture inspection'));
  for (const directory of [work, output]) {
    await noSymlinks(directory);
    await mkdir(directory, { recursive: true });
    if ((await readdir(directory)).length) throw new SmokePreparationError('Private work and report directories must be empty before preparation.');
  }
  await chmod(work, 0o700);
  const key = join(work, 'test-signing.jks');
  const apkSet = join(work, 'universal.apks');
  const apk = join(work, 'universal.apk');
  let complete = false;
  try {
    run('keytool', ['-genkeypair', '-noprompt', '-storetype', 'JKS', '-keystore', key,
      '-storepass', 'android', '-keypass', 'android', '-alias', 'androiddebugkey', '-keyalg', 'RSA',
      '-keysize', '2048', '-validity', '30', '-dname', 'CN=Disposable Native Smoke,O=Test,C=US'], 'Disposable test signing key creation');
    run('java', ['-jar', tool, 'build-apks', `--bundle=${verified.bundle}`, `--output=${apkSet}`, '--mode=universal',
      `--ks=${key}`, '--ks-key-alias=androiddebugkey', '--ks-pass=pass:android', '--key-pass=pass:android'], 'Local universal APK conversion');
    const outputs = run('unzip', ['-Z1', apkSet], 'Universal APK archive inspection').split('\n').filter(Boolean);
    if (outputs.filter(entry => entry === 'universal.apk').length !== 1) throw new SmokePreparationError('Bundletool did not produce exactly one universal APK.');
    const descriptor = openSync(apk, 'wx', 0o600);
    try { run('unzip', ['-p', apkSet, 'universal.apk'], 'Universal APK extraction', descriptor); }
    finally { closeSync(descriptor); }
    const apkDigest = await digest(apk);
    const finalBundle = await digest(verified.bundle);
    validateInspectionReport(verified.report, finalBundle, target);
    const summary = { ...verified.report, inspectionRunId: env.INSPECTION_RUN_ID,
      aabSha256: finalBundle.sha256, aabBytes: finalBundle.bytes, apkSha256: apkDigest.sha256, apkBytes: apkDigest.bytes,
      bundletool: { version: '1.18.3', sha256: bundletoolSha256 }, emulatorArchitecture: 'x86_64',
      apkSigning: 'Disposable local test key; the original signed AAB was not modified.',
      limitations: ['This test-signed APK is not the Google Play-signed application and cannot verify Play Billing, purchases, restore, Play acceptance or production signing.',
        'APK preparation alone does not establish successful native launch or UI behavior. No EAS build, store submission or account change was performed.'] };
    await writeFile(join(output, 'input-verification.json'), JSON.stringify(summary, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
    complete = true;
    console.log(`Exact inspected version ${target.versionCode} bundle verified; a disposable test-signed universal APK is ready in the private work directory.`);
    return summary;
  } finally {
    await rm(key, { force: true });
    await rm(apkSet, { force: true });
    if (!complete) await rm(apk, { force: true });
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  Promise.resolve().then(() => {
    if (args.length !== 3) throw new SmokePreparationError('Expected inspection, private work and report directories.');
    return prepareAndroidSmoke(...args);
  }).catch(error => {
    console.error(`FAIL: ${error instanceof SmokePreparationError ? error.message : 'Android smoke preparation could not read or convert the exact inspected artifact. Raw details were withheld.'}`);
    process.exitCode = 1;
  });
}
