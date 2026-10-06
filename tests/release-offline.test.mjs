import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validateReleaseConfig } from '../scripts/check-release.mjs';

function candidate() {
  return {
    app: { expo: { owner: 'amoharroudj', version: '0.1.0', android: { package: 'com.leoqo.footballquiz' }, extra: { eas: { projectId: '99891114-dac6-4d4c-973c-3a246db2a7b1' } } } },
    editorial: { independentEditorialApproval: false },
    eas: {
      cli: { appVersionSource: 'remote' },
      build: { production: { distribution: 'store', environment: 'production', credentialsSource: 'remote', autoIncrement: true, android: { buildType: 'app-bundle' }, env: { EXPO_PUBLIC_COMMERCE_READY: 'false' } } },
      submit: { 'play-internal': { android: { track: 'internal', releaseStatus: 'draft' } } },
    },
  };
}

test('a free signed AAB candidate can proceed to internal draft checks', () => {
  assert.deepEqual(validateReleaseConfig(candidate()).errors, []);
});

test('public rollout and unsigned/APK override mistakes are rejected', () => {
  const cases = [
    value => { value.eas.submit['play-internal'].android.track = 'production'; },
    value => { value.eas.submit['play-internal'].android.releaseStatus = 'completed'; },
    value => { value.eas.build.production.android.buildType = 'apk'; },
    value => { value.eas.build.production.android.withoutCredentials = true; },
    value => { value.eas.build.production.android.credentialsSource = 'local'; },
    value => { value.eas.build.production.android.autoIncrement = false; },
    value => { value.eas.build.production.android.gradleCommand = ':app:assembleDebug'; },
    value => { value.eas.build.production.developmentClient = true; },
    value => { value.app.expo.android.package = 'com.example.anotherapp'; },
    value => { value.eas.submit['play-internal'].android.serviceAccountKeyPath = './credentials.json'; },
  ];
  for (const mutate of cases) {
    const value = candidate(); mutate(value);
    assert.ok(validateReleaseConfig(value).errors.length > 0);
  }
});

test('inherited profiles cannot hide Android overrides or unsafe submit tracks', () => {
  const value = candidate();
  value.eas.build.base = value.eas.build.production;
  value.eas.build.production = { extends: 'base', android: { env: { EXPO_PUBLIC_COMMERCE_READY: 'true' } } };
  assert.ok(validateReleaseConfig(value).errors.some(error => error.includes('Free test')));
  value.eas.build.production.android.env.EXPO_PUBLIC_COMMERCE_READY = 'false';
  value.eas.submit.base = value.eas.submit['play-internal'];
  value.eas.submit['play-internal'] = { extends: 'base', android: { track: 'production' } };
  assert.ok(validateReleaseConfig(value).errors.some(error => error.includes('internal testing')));
});

test('paid checks require both content approval and an explicit commerce build', () => {
  const value = candidate();
  assert.equal(validateReleaseConfig(value, { paid: true }).errors.length, 2);
  value.editorial.independentEditorialApproval = true;
  value.eas.build.production.env.EXPO_PUBLIC_COMMERCE_READY = 'true';
  assert.deepEqual(validateReleaseConfig(value, { paid: true }).errors, []);
  assert.ok(validateReleaseConfig(value).errors.length > 0);
});

test('missing or circular profiles fail closed without recursion errors', () => {
  const value = candidate();
  delete value.eas.build.production;
  value.eas.submit['play-internal'] = { extends: 'play-internal' };
  assert.equal(validateReleaseConfig(value).errors.length, 2);
});
