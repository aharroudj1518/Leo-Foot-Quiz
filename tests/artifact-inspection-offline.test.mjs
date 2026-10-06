import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { artifactReport, BUNDLETOOL, checkedBuild, checkedDownloadUrl, downloadVerified, inspectionInputs, parseManifestXml, sanitizedManifest } from '../scripts/inspect-android-artifact.mjs';

const buildId = '12345678-1234-1234-1234-123456789abc';
const sourceCommit = 'faeb0a4e6328d11166478dc34ad7c09650daa58c';
const inputs = inspectionInputs({ INSPECT_BUILD_ID: buildId, INSPECT_SOURCE_COMMIT: sourceCommit });
const privateUrl = 'https://expo.dev/artifacts/eas/example.aab?token=private-signed-value';
const rawBuild = { id: buildId, platform: 'ANDROID', status: 'FINISHED', gitCommitHash: sourceCommit,
  app: { id: '99891114-dac6-4d4c-973c-3a246db2a7b1' }, appIdentifier: 'com.leoqo.footballquiz',
  distribution: 'STORE', buildProfile: 'production-paid', appBuildVersion: '6', appVersion: '0.1.0',
  artifacts: { applicationArchiveUrl: privateUrl } };
const rawManifest = { package: 'com.leoqo.footballquiz', versionCode: '6', versionName: '0.1.0', minSdk: '24', targetSdk: '36', debuggable: 'false', testOnly: null, usesCleartextTraffic: null,
  permissions: [{ name: 'android.permission.INTERNET', maxSdkVersion: null }, { name: 'com.android.vending.BILLING', maxSdkVersion: null }] };
const signature = { certificateSha256: 'AB'.repeat(32), signedPayloadEntries: 20, manifestModules: ['base'], cryptographicallySigned: true };
const downloaded = { bytes: 1000, sha256: 'cd'.repeat(32) };

test('artifact inspection requires an exact build ID, full commit and bounded version minimum', () => {
  assert.equal(inputs.minimumVersionCode, 6);
  for (const invalid of [
    { INSPECT_BUILD_ID: 'latest' }, { INSPECT_BUILD_ID: `${buildId}\n--json` },
    { INSPECT_SOURCE_COMMIT: sourceCommit.slice(0, 7) }, { INSPECT_MIN_VERSION_CODE: '-1' },
    { INSPECT_MIN_VERSION_CODE: '2100000001' }, { INSPECT_MIN_VERSION_CODE: '6; echo secret' },
    { INSPECT_UPLOAD_CERT_SHA256: 'not-a-certificate' },
  ]) assert.throws(() => inspectionInputs({ INSPECT_BUILD_ID: buildId, INSPECT_SOURCE_COMMIT: sourceCommit, ...invalid }));
  assert.equal(inspectionInputs({ INSPECT_BUILD_ID: buildId, INSPECT_SOURCE_COMMIT: sourceCommit, INSPECT_UPLOAD_CERT_SHA256: Array(32).fill('ab').join(':') }).expectedCertificateSha256, 'AB'.repeat(32));
});

test('metadata must identify the exact completed paid Android candidate and permits a higher version code', () => {
  assert.equal(checkedBuild(rawBuild, inputs).versionCode, 6);
  assert.equal(checkedBuild({ ...rawBuild, appBuildVersion: '7' }, inputs).versionCode, 7);
  for (const invalid of [
    { id: 'aaaaaaaa-1234-1234-1234-123456789abc' }, { gitCommitHash: 'a'.repeat(40) },
    { app: { id: 'another-project' } }, { appIdentifier: 'another.app' }, { buildProfile: 'production' },
    { platform: 'IOS' }, { status: 'IN_PROGRESS' }, { distribution: 'INTERNAL' },
    { appBuildVersion: '5' }, { appBuildVersion: '2100000001' }, { artifacts: { buildUrl: 'http://localhost/private' } },
  ]) assert.throws(() => checkedBuild({ ...rawBuild, ...invalid }, inputs));
  assert.throws(() => checkedBuild([rawBuild, rawBuild], inputs));
});

test('download destinations permit official artifact hosts and reject private, credentialed or insecure locations', () => {
  for (const url of [privateUrl, 'https://artifacts.eascdn.net/one.aab', 'https://eas-build-artifacts.s3.us-east-1.amazonaws.com/one.aab', 'https://turtle-v2-artifacts.s3.amazonaws.com/one.aab']) assert.equal(checkedDownloadUrl(url, 'aab').protocol, 'https:');
  for (const url of ['http://expo.dev/aab', 'https://user:secret@expo.dev/aab', 'https://expo.dev:444/aab', 'https://127.0.0.1/aab', 'https://expo.dev.attacker.example/aab', 'https://expo.dev/aab#secret', 'https://github.com/unrelated.aab']) assert.throws(() => checkedDownloadUrl(url, 'aab'));
  assert.equal(checkedDownloadUrl(BUNDLETOOL.url, 'bundletool').hostname, 'github.com');
  assert.equal(BUNDLETOOL.version, '1.18.3');
  assert.equal(BUNDLETOOL.sha256, 'a099cfa1543f55593bc2ed16a70a7c67fe54b1747bb7301f37fdfd6d91028e29');
});

test('manifest summarization uses the Android XML namespace and excludes arbitrary application metadata', () => {
  const xml = `<manifest xmlns:android="http://schemas.android.com/apk/res/android" package="com.leoqo.footballquiz" android:versionCode="6" android:versionName="0.1.0"><uses-sdk android:minSdkVersion="24" android:targetSdkVersion="36"/><uses-permission android:name="android.permission.INTERNET"/><application android:debuggable="false"><meta-data android:name="private-key" android:value="private-signed-value"/></application></manifest>`;
  const manifest = parseManifestXml(xml, 'base');
  assert.equal(manifest.targetSdk, 36);
  assert.equal(manifest.versionCode, 6);
  assert.equal(manifest.debuggable, false);
  assert.deepEqual(manifest.permissions, [{ name: 'android.permission.INTERNET', maxSdkVersion: null }]);
  assert.ok(!JSON.stringify(manifest).includes('private'));
  assert.throws(() => parseManifestXml('<!DOCTYPE manifest [<!ENTITY token "private-signed-value">]><manifest/>', 'base'), error => !error.message.includes('private-signed-value'));
  assert.throws(() => sanitizedManifest({ ...rawManifest, permissions: [{ name: 'https://secret.example' }] }, 'base'));
  assert.throws(() => sanitizedManifest({ ...rawManifest, targetSdk: 'unknown' }, 'base'));
});

test('the artifact report enforces manifest, signature and optional upload-certificate identity', () => {
  const build = checkedBuild(rawBuild, inputs);
  const base = sanitizedManifest(rawManifest, 'base');
  const report = artifactReport(build, inputs, [base], signature, downloaded);
  assert.equal(report.versionCode, 6);
  assert.equal(report.targetSdk, 36);
  assert.match(report.signing.uploadCertificateMatch, /not checked/);
  assert.ok(!JSON.stringify(report).includes('private-signed-value'));
  assert.ok(!JSON.stringify(report).includes('applicationArchiveUrl'));
  assert.match(report.limitations.join(' '), /No native device/);
  for (const change of [{ targetSdk: 35 }, { versionCode: 5 }, { versionName: '0.2.0' }, { debuggable: true }, { testOnly: true }, { minSdk: 23 }]) assert.throws(() => artifactReport(build, inputs, [{ ...base, ...change }], signature, downloaded));
  for (const change of [{ cryptographicallySigned: false }, { certificateSha256: 'bad' }, { signedPayloadEntries: 0 }]) assert.throws(() => artifactReport(build, inputs, [base], { ...signature, ...change }, downloaded));
  assert.throws(() => artifactReport(build, { ...inputs, expectedCertificateSha256: '11'.repeat(32) }, [base], signature, downloaded));
  assert.equal(artifactReport(build, { ...inputs, expectedCertificateSha256: signature.certificateSha256 }, [base], signature, downloaded).signing.uploadCertificateMatch, 'matched supplied fingerprint');
  const higher = checkedBuild({ ...rawBuild, appBuildVersion: '7' }, inputs);
  assert.equal(artifactReport(higher, inputs, [{ ...base, versionCode: 7 }], signature, downloaded).versionCode, 7);
});

test('all module permissions are included and sensitive permissions are highlighted without calling this a device test', () => {
  const base = sanitizedManifest(rawManifest, 'base');
  const feature = sanitizedManifest({ ...rawManifest, permissions: [{ name: 'android.permission.RECORD_AUDIO', maxSdkVersion: null }], usesCleartextTraffic: 'true' }, 'feature');
  const report = artifactReport(checkedBuild(rawBuild, inputs), inputs, [base, feature], signature, downloaded);
  assert.deepEqual(report.modules, ['base', 'feature']);
  assert.deepEqual(report.permissionsRequiringReview, ['android.permission.RECORD_AUDIO']);
  assert.equal(report.cleartextTrafficExplicitlyEnabled, true);
  assert.match(report.inspection, /no installation or Play submission/);
});

test('downloads verify pinned bytes, keep signed URLs out of errors and never overwrite existing files', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'leoqo-download-test-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const bytes = Buffer.from('verified fixture');
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  const destination = join(directory, 'artifact.aab');
  let request;
  const result = await downloadVerified(privateUrl, destination, { kind: 'aab', maxBytes: 100, expectedSha256: sha256, fetchImpl: async (url, options) => { request = { url, options }; return new Response(bytes); } });
  assert.deepEqual(result, { bytes: bytes.length, sha256 });
  assert.deepEqual(await readFile(destination), bytes);
  assert.equal(request.options.redirect, 'manual');
  assert.equal(request.options.credentials, 'omit');
  assert.equal(request.options.headers.Authorization, undefined);
  await assert.rejects(downloadVerified(privateUrl, destination, { kind: 'aab', maxBytes: 100, fetchImpl: async () => new Response('overwrite') }), error => !error.message.includes('private-signed-value'));
  assert.deepEqual(await readFile(destination), bytes);
  for (const [name, options] of [
    ['checksum', { expectedSha256: '0'.repeat(64), fetchImpl: async () => new Response(bytes) }],
    ['declared', { fetchImpl: async () => new Response(bytes, { headers: { 'content-length': '101' } }) }],
    ['streamed', { maxBytes: 2, fetchImpl: async () => new Response(bytes) }],
    ['network', { fetchImpl: async () => { throw new Error(privateUrl); } }],
    ['http', { fetchImpl: async () => new Response('private response', { status: 403 }) }],
  ]) {
    const file = join(directory, name);
    await assert.rejects(downloadVerified(privateUrl, file, { kind: 'aab', maxBytes: 100, ...options }), error => !error.message.includes('private-signed-value') && !error.message.includes('private response') && !error.message.includes('https://'));
    await assert.rejects(stat(file));
  }
});

test('redirects are checked before following and are limited', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'leoqo-redirect-test-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  let requests = 0;
  await assert.rejects(downloadVerified(privateUrl, join(directory, 'blocked'), { kind: 'aab', maxBytes: 100, fetchImpl: async () => { requests++; return new Response(null, { status: 302, headers: { location: 'http://127.0.0.1/private' } }); } }));
  assert.equal(requests, 1);
  requests = 0;
  await assert.rejects(downloadVerified(privateUrl, join(directory, 'loop'), { kind: 'aab', maxBytes: 100, fetchImpl: async () => { requests++; return new Response(null, { status: 302, headers: { location: privateUrl } }); } }));
  assert.equal(requests, 6);
});
