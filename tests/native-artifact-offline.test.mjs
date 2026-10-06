import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { smokeTarget, expectedBundleFilename, prepareAndroidSmoke, validateArchiveEntries, validateInspectionReport, verifyInspection } from '../scripts/prepare-android-smoke.mjs';

const targetEnv = { SMOKE_BUILD_ID: '5f7931d6-c2a6-4a73-9397-12899c5d23a4',
  SMOKE_SOURCE_COMMIT: 'faeb0a4e6328d11166478dc34ad7c09650daa58c', SMOKE_VERSION_CODE: '6' };
const target = smokeTarget(targetEnv);
const bundleFilename = expectedBundleFilename(target);
const bytes = Buffer.from('unchanged signed-bundle fixture');
const actual = { bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') };
const report = (selectedTarget = target) => ({ ...selectedTarget, bundleSha256: actual.sha256, bundleBytes: actual.bytes,
  signing: { signedPayloadEntries: 42, certificateSha256: 'AB'.repeat(32) } });

async function fixture(t, selectedTarget = target) {
  const root = await mkdtemp(join(tmpdir(), 'leoqo-native-artifact-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const input = join(root, 'inspection');
  await mkdir(input);
  const selectedFilename = expectedBundleFilename(selectedTarget);
  await writeFile(join(input, selectedFilename), bytes);
  await writeFile(join(input, 'inspection-report.json'), JSON.stringify(report(selectedTarget)));
  return { root, input, bundle: join(input, selectedFilename) };
}

test('candidate pins are mandatory exact lowercase identities and canonical bounded version strings', () => {
  assert.equal(smokeTarget({ ...targetEnv, SMOKE_VERSION_CODE: '1' }).versionCode, 1);
  assert.equal(smokeTarget({ ...targetEnv, SMOKE_VERSION_CODE: '2100000000' }).versionCode, 2100000000);
  assert.throws(() => smokeTarget({}), /SMOKE_BUILD_ID/);
  for (const key of Object.keys(targetEnv)) {
    const partial = { ...targetEnv };
    delete partial[key];
    assert.throws(() => smokeTarget(partial), new RegExp(key));
  }
  for (const buildId of ['', 'latest', targetEnv.SMOKE_BUILD_ID.slice(0, 8), targetEnv.SMOKE_BUILD_ID.toUpperCase(), `${targetEnv.SMOKE_BUILD_ID}\n`]) {
    assert.throws(() => smokeTarget({ ...targetEnv, SMOKE_BUILD_ID: buildId }), /SMOKE_BUILD_ID/);
  }
  for (const sourceCommit of ['', targetEnv.SMOKE_SOURCE_COMMIT.slice(0, 7), targetEnv.SMOKE_SOURCE_COMMIT.toUpperCase(), `${targetEnv.SMOKE_SOURCE_COMMIT}\n`]) {
    assert.throws(() => smokeTarget({ ...targetEnv, SMOKE_SOURCE_COMMIT: sourceCommit }), /SMOKE_SOURCE_COMMIT/);
  }
  for (const versionCode of ['', '0', '-1', '06', '+6', '6.0', '6e0', '6\n', ' 6', '2100000001', '9007199254740992', 6]) {
    assert.throws(() => smokeTarget({ ...targetEnv, SMOKE_VERSION_CODE: versionCode }), /SMOKE_VERSION_CODE/);
  }
  assert.throws(() => expectedBundleFilename({ ...target, package: 'another.app' }), /fixed Android/);
  assert.throws(() => validateInspectionReport(report(), actual, { ...target, distribution: 'INTERNAL' }), /fixed Android/);
});

test('a different explicitly pinned candidate uses its own report and filename with no version 6 fallback', async t => {
  const next = smokeTarget({ ...targetEnv, SMOKE_BUILD_ID: 'aaaaaaaa-1234-1234-1234-123456789abc',
    SMOKE_SOURCE_COMMIT: 'b'.repeat(40), SMOKE_VERSION_CODE: '7' });
  assert.equal(expectedBundleFilename(next), 'leoqo-v7-aaaaaaaa-1234-1234-1234-123456789abc.aab');
  const { input, bundle } = await fixture(t, next);
  const verified = await verifyInspection(input, next);
  assert.equal(verified.bundle, bundle);
  assert.deepEqual(verified.report, report(next));
  assert.throws(() => validateInspectionReport(report(next), actual, target), /exact reviewed Android build/);
  await assert.rejects(verifyInspection(input, target), /exactly/);
  await assert.rejects(prepareAndroidSmoke(input, 'unused-work', 'unused-output', {}), /SMOKE_BUILD_ID/);
});

test('native preparation accepts only the exact reviewed finished version 6 identity', () => {
  assert.deepEqual(validateInspectionReport(report(), actual, target), report());
  for (const [field, value] of Object.entries({ buildId: 'aaaaaaaa-1234-1234-1234-123456789abc',
    sourceCommit: 'a'.repeat(40), projectId: 'another-project', package: 'another.app',
    buildProfile: 'production', distribution: 'INTERNAL', easStatus: 'IN_PROGRESS', versionCode: 7,
    targetSdk: 35, debuggable: true })) {
    assert.throws(() => validateInspectionReport({ ...report(), [field]: value }, actual, target), /exact reviewed Android build/);
  }
  for (const value of [null, {}, { ...report(), versionCode: '6' }, { ...report(), debuggable: 'false' }]) {
    assert.throws(() => validateInspectionReport(value, actual, target));
  }
});

test('report cannot claim mismatched bytes or unsigned payloads and excludes untrusted fields', () => {
  for (const change of [{ bundleSha256: '0'.repeat(64) }, { bundleBytes: actual.bytes + 1 },
    { bundleSha256: 'not-a-hash' }, { bundleBytes: 0 }, { bundleBytes: 513 * 1024 * 1024 },
    { signing: { signedPayloadEntries: 1, certificateSha256: 'AB'.repeat(32) } },
    { signing: { signedPayloadEntries: 4, certificateSha256: 'https://private.example/signature' } }]) {
    assert.throws(() => validateInspectionReport({ ...report(), ...change }, actual, target));
  }
  const sanitized = validateInspectionReport({ ...report(), rawMetadata: 'private-value',
    artifactUrl: 'https://private.example/signed', signing: { ...report().signing, privateKey: 'private-value' } }, actual, target);
  assert.ok(!JSON.stringify(sanitized).includes('private'));
  assert.equal(sanitized.signing.certificateSha256, 'AB'.repeat(32));
});

test('downloaded AAB must match the inspected hash and size without modifying its bytes', async t => {
  const { input, bundle } = await fixture(t);
  const verified = await verifyInspection(input, target);
  assert.equal(verified.bundle, bundle);
  assert.deepEqual(verified.report, report());
  assert.deepEqual(await readFile(bundle), bytes);
  await writeFile(bundle, Buffer.from('tampered bytes'));
  await assert.rejects(verifyInspection(input, target), /do not match/);
});

test('nested or renamed additional bundles fail rather than selecting a convenient artifact', async t => {
  const { input, bundle } = await fixture(t);
  await mkdir(join(input, 'nested'));
  await writeFile(join(input, 'nested', 'extra.AAB'), bytes);
  await assert.rejects(verifyInspection(input, target), /exactly/);
  await rm(join(input, 'nested'), { recursive: true });
  await rm(bundle);
  await writeFile(join(input, 'another.aab'), bytes);
  await assert.rejects(verifyInspection(input, target), /exactly/);
});

test('root, parent, report, bundle and unrelated artifact symlinks are rejected', async t => {
  const { root, input, bundle } = await fixture(t);
  const alias = join(root, 'alias');
  await symlink(input, alias);
  await assert.rejects(verifyInspection(alias, target), /symbolic links/);
  await mkdir(join(input, 'nested'));
  await assert.rejects(verifyInspection(join(alias, 'nested'), target), /symbolic links/);
  await rm(join(input, 'nested'), { recursive: true });
  for (const name of ['inspection-report.json', bundleFilename, 'unrelated.txt']) {
    const path = join(input, name);
    const linkTarget = join(root, `target-${name}`);
    if (name !== 'unrelated.txt') await rm(path);
    await writeFile(linkTarget, name === 'inspection-report.json' ? JSON.stringify(report()) : bytes);
    await symlink(linkTarget, path);
    await assert.rejects(verifyInspection(input, target), /symbolic links/);
    await rm(path);
    if (name !== 'unrelated.txt') await writeFile(path, name === 'inspection-report.json' ? JSON.stringify(report()) : bytes);
  }
  assert.deepEqual(await readFile(bundle), bytes);
});

test('input traversal and malformed report files fail before conversion', async t => {
  const { root, input } = await fixture(t);
  await assert.rejects(verifyInspection(`${root}/../${root.split('/').at(-1)}/inspection`, target), /traversal/);
  await writeFile(join(input, 'inspection-report.json'), '{not json');
  await assert.rejects(verifyInspection(input, target), /valid JSON/);
});

test('archive inspection requires x86_64 libraries and rejects traversal or duplicate entries', () => {
  const valid = 'base/manifest/AndroidManifest.xml\nbase/lib/x86_64/libreactnative.so\n';
  assert.equal(validateArchiveEntries(valid).length, 2);
  for (const unsafe of ['../escaped', '/absolute', 'C:/drive', 'base/../escaped',
    'base\\lib\\escaped', 'base/./file', 'base/evil\rname', 'base/lib/x86_64/libreactnative.so']) {
    assert.throws(() => validateArchiveEntries(valid + unsafe + '\n'), /unsafe or duplicate/);
  }
  assert.throws(() => validateArchiveEntries('base/lib/arm64-v8a/libreactnative.so\n'), /no x86_64/);
  assert.throws(() => validateArchiveEntries(''), /no x86_64/);
});

test('private conversion outputs cannot overlap uploaded artifacts and unpinned tools cannot run', async t => {
  const { root, input, bundle } = await fixture(t);
  const tool = join(root, 'untrusted-tool.jar');
  await writeFile(tool, 'not the pinned bundletool');
  const env = { ...targetEnv, BUNDLETOOL_PATH: tool, INSPECTION_RUN_ID: '12345678' };
  for (const [work, output] of [[input, join(root, 'report')], [join(root, 'work'), join(root, 'work', 'report')],
    [join(root, 'report', 'work'), join(root, 'report')]]) {
    await assert.rejects(prepareAndroidSmoke(input, work, output, env), /must be separate/);
  }
  await assert.rejects(prepareAndroidSmoke(input, join(root, 'work'), join(root, 'report'), { ...env, INSPECTION_RUN_ID: 'https://private.example' }), /run ID/);
  await assert.rejects(prepareAndroidSmoke(input, join(root, 'work'), join(root, 'report'), env), /pinned official/);
  assert.deepEqual((await readdir(root)).sort(), ['inspection', 'untrusted-tool.jar']);
  assert.deepEqual(await readFile(bundle), bytes);
});
