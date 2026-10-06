import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { EXPECTED_SMOKE, expectedBundleFilename, prepareAndroidSmoke, validateArchiveEntries, validateInspectionReport, verifyInspection } from '../scripts/prepare-android-smoke.mjs';

const bytes = Buffer.from('unchanged signed-bundle fixture');
const actual = { bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') };
const report = () => ({ ...EXPECTED_SMOKE, bundleSha256: actual.sha256, bundleBytes: actual.bytes,
  signing: { signedPayloadEntries: 42, certificateSha256: 'AB'.repeat(32) } });

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'leoqo-native-artifact-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const input = join(root, 'inspection');
  await mkdir(input);
  await writeFile(join(input, expectedBundleFilename), bytes);
  await writeFile(join(input, 'inspection-report.json'), JSON.stringify(report()));
  return { root, input, bundle: join(input, expectedBundleFilename) };
}

test('native preparation accepts only the exact reviewed finished version 6 identity', () => {
  assert.deepEqual(validateInspectionReport(report(), actual), report());
  for (const [field, value] of Object.entries({ buildId: 'aaaaaaaa-1234-1234-1234-123456789abc',
    sourceCommit: 'a'.repeat(40), projectId: 'another-project', package: 'another.app',
    buildProfile: 'production', distribution: 'INTERNAL', easStatus: 'IN_PROGRESS', versionCode: 7,
    targetSdk: 35, debuggable: true })) {
    assert.throws(() => validateInspectionReport({ ...report(), [field]: value }, actual), /exact reviewed Android build/);
  }
  for (const value of [null, {}, { ...report(), versionCode: '6' }, { ...report(), debuggable: 'false' }]) {
    assert.throws(() => validateInspectionReport(value, actual));
  }
});

test('report cannot claim mismatched bytes or unsigned payloads and excludes untrusted fields', () => {
  for (const change of [{ bundleSha256: '0'.repeat(64) }, { bundleBytes: actual.bytes + 1 },
    { bundleSha256: 'not-a-hash' }, { bundleBytes: 0 }, { bundleBytes: 513 * 1024 * 1024 },
    { signing: { signedPayloadEntries: 1, certificateSha256: 'AB'.repeat(32) } },
    { signing: { signedPayloadEntries: 4, certificateSha256: 'https://private.example/signature' } }]) {
    assert.throws(() => validateInspectionReport({ ...report(), ...change }, actual));
  }
  const sanitized = validateInspectionReport({ ...report(), rawMetadata: 'private-value',
    artifactUrl: 'https://private.example/signed', signing: { ...report().signing, privateKey: 'private-value' } }, actual);
  assert.ok(!JSON.stringify(sanitized).includes('private'));
  assert.equal(sanitized.signing.certificateSha256, 'AB'.repeat(32));
});

test('downloaded AAB must match the inspected hash and size without modifying its bytes', async t => {
  const { input, bundle } = await fixture(t);
  const verified = await verifyInspection(input);
  assert.equal(verified.bundle, bundle);
  assert.deepEqual(verified.report, report());
  assert.deepEqual(await readFile(bundle), bytes);
  await writeFile(bundle, Buffer.from('tampered bytes'));
  await assert.rejects(verifyInspection(input), /do not match/);
});

test('nested or renamed additional bundles fail rather than selecting a convenient artifact', async t => {
  const { input, bundle } = await fixture(t);
  await mkdir(join(input, 'nested'));
  await writeFile(join(input, 'nested', 'extra.AAB'), bytes);
  await assert.rejects(verifyInspection(input), /exactly/);
  await rm(join(input, 'nested'), { recursive: true });
  await rm(bundle);
  await writeFile(join(input, 'another.aab'), bytes);
  await assert.rejects(verifyInspection(input), /exactly/);
});

test('root, parent, report, bundle and unrelated artifact symlinks are rejected', async t => {
  const { root, input, bundle } = await fixture(t);
  const alias = join(root, 'alias');
  await symlink(input, alias);
  await assert.rejects(verifyInspection(alias), /symbolic links/);
  await mkdir(join(input, 'nested'));
  await assert.rejects(verifyInspection(join(alias, 'nested')), /symbolic links/);
  await rm(join(input, 'nested'), { recursive: true });
  for (const name of ['inspection-report.json', expectedBundleFilename, 'unrelated.txt']) {
    const path = join(input, name);
    const target = join(root, `target-${name}`);
    if (name !== 'unrelated.txt') await rm(path);
    await writeFile(target, name === 'inspection-report.json' ? JSON.stringify(report()) : bytes);
    await symlink(target, path);
    await assert.rejects(verifyInspection(input), /symbolic links/);
    await rm(path);
    if (name !== 'unrelated.txt') await writeFile(path, name === 'inspection-report.json' ? JSON.stringify(report()) : bytes);
  }
  assert.deepEqual(await readFile(bundle), bytes);
});

test('input traversal and malformed report files fail before conversion', async t => {
  const { root, input } = await fixture(t);
  await assert.rejects(verifyInspection(`${root}/../${root.split('/').at(-1)}/inspection`), /traversal/);
  await writeFile(join(input, 'inspection-report.json'), '{not json');
  await assert.rejects(verifyInspection(input), /valid JSON/);
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
  const env = { BUNDLETOOL_PATH: tool, INSPECTION_RUN_ID: '12345678' };
  for (const [work, output] of [[input, join(root, 'report')], [join(root, 'work'), join(root, 'work', 'report')],
    [join(root, 'report', 'work'), join(root, 'report')]]) {
    await assert.rejects(prepareAndroidSmoke(input, work, output, env), /must be separate/);
  }
  await assert.rejects(prepareAndroidSmoke(input, join(root, 'work'), join(root, 'report'), { ...env, INSPECTION_RUN_ID: 'https://private.example' }), /run ID/);
  await assert.rejects(prepareAndroidSmoke(input, join(root, 'work'), join(root, 'report'), env), /pinned official/);
  assert.deepEqual((await readdir(root)).sort(), ['inspection', 'untrusted-tool.jar']);
  assert.deepEqual(await readFile(bundle), bytes);
});
