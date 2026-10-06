import assert from 'node:assert/strict';
import { test } from 'node:test';
import { billingEnvironmentErrors } from '../scripts/check-cloud-build.mjs';
import { completedAndroidBuild } from '../scripts/record-android-build.mjs';
import { editorialReviewErrors } from '../scripts/check-release.mjs';
import { createHash } from 'node:crypto';

test('a recorded editorial review cannot cover a later changed bank', () => {
  const reviewed = Buffer.from('[{"answer":"Original verified fact"}]');
  const editorial = { questionBankSha256: createHash('sha256').update(reviewed).digest('hex') };
  assert.deepEqual(editorialReviewErrors(editorial, reviewed), []);
  assert.equal(editorialReviewErrors(editorial, Buffer.from('[{"answer":"Changed fact"}]')).length, 1);
  assert.equal(editorialReviewErrors({}, reviewed).length, 1);
});

test('paid cloud builds reject absent, private and simulated keys without exposing them', () => {
  for (const key of [undefined, '', 'sk_private_value', 'test_simulated_value', 'appl_other_platform']) {
    const errors = billingEnvironmentErrors({ EAS_BUILD_PLATFORM: 'android', EXPO_PUBLIC_COMMERCE_READY: 'true', EXPO_PUBLIC_REVENUECAT_ANDROID_KEY: key });
    assert.equal(errors.length, 1);
    if (key) assert.ok(!errors.join(' ').includes(key));
  }
  assert.deepEqual(billingEnvironmentErrors({ EAS_BUILD_PLATFORM: 'android', EXPO_PUBLIC_COMMERCE_READY: 'true', EXPO_PUBLIC_REVENUECAT_ANDROID_KEY: 'goog_public_sdk_value' }), []);
  assert.deepEqual(billingEnvironmentErrors({ EXPO_PUBLIC_COMMERCE_READY: 'false' }), []);
});

test('submission selects the completed build from this source commit', () => {
  const build = { id: '12345678-1234-1234-1234-123456789abc', platform: 'ANDROID', status: 'FINISHED', gitCommitHash: 'source-commit', app: { id: '99891114-dac6-4d4c-973c-3a246db2a7b1' }, appIdentifier: 'com.leoqo.footballquiz', distribution: 'STORE', buildProfile: 'production-paid', appBuildVersion: '12', artifacts: { applicationArchiveUrl: 'https://expo.dev/artifacts/test.aab' } };
  assert.equal(completedAndroidBuild([build], 'source-commit', 'production-paid').id, build.id);
  for (const value of [[], [build, build], [{ ...build, status: 'IN_QUEUE' }], [{ ...build, platform: 'IOS' }], [{ ...build, id: 'invalid\ninput' }], [{ ...build, gitCommitHash: 'another-commit' }], [{ ...build, appIdentifier: 'another.application' }], [{ ...build, app: { id: 'another-project' } }], [{ ...build, distribution: 'INTERNAL' }], [{ ...build, buildProfile: 'preview' }], [{ ...build, artifacts: {} }], [{ ...build, appBuildVersion: null }]]) {
    assert.throws(() => completedAndroidBuild(value, 'source-commit', 'production-paid'));
  }
});
