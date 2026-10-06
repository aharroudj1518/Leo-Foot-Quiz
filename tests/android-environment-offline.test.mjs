import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { checkAndroidEnvironment } from '../scripts/check-android-environment.mjs';

function config() {
  const read = path => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'));
  const questionBytes = Buffer.from('[{"answer":"Reviewed fact"}]');
  return {
    app: read('app.json'), eas: read('eas.json'), questionBytes,
    editorial: { independentEditorialApproval: true, questionBankSha256: createHash('sha256').update(questionBytes).digest('hex') },
  };
}
const env = { EXPO_PUBLIC_REVENUECAT_ANDROID_KEY: 'goog_offline_public_key' };
const offering = identifier => ({ identifier, packages: [{ platform_product_identifier: 'leoqo_legends_lifetime' }] });
const ok = body => ({ ok: true, json: async () => body });

test('paid environment checks cannot be bypassed by an inherited free switch or a changed bank', async () => {
  const request = async () => assert.fail('Invalid local configuration must fail before contacting RevenueCat');
  for (const key of [undefined, '', 'sk_private_value', 'test_simulated_value', 'appl_other_platform', 'goog_', 'goog_bad key']) {
    const errors = await checkAndroidEnvironment({ config: config(), env: { EXPO_PUBLIC_COMMERCE_READY: 'false', EXPO_PUBLIC_REVENUECAT_ANDROID_KEY: key }, fetchImpl: request });
    assert.ok(errors.length);
    if (key) assert.ok(!errors.join(' ').includes(key));
  }
  const changed = config();
  changed.questionBytes = Buffer.from('[{"answer":"Unreviewed replacement"}]');
  assert.match((await checkAndroidEnvironment({ config: changed, env, fetchImpl: request })).join(' '), /review hash/);
  const disabled = config();
  disabled.eas.build['production-paid'].env.EXPO_PUBLIC_COMMERCE_READY = 'false';
  assert.match((await checkAndroidEnvironment({ config: disabled, env, fetchImpl: request })).join(' '), /Paid build requires/);
});

test('the free profile requires no RevenueCat key or API request', async () => {
  assert.deepEqual(await checkAndroidEnvironment({ config: config(), env: {}, buildProfile: 'production', fetchImpl: async () => assert.fail('Free build must not contact RevenueCat') }), []);
});

test('an EAS profile override cannot substitute a different key after preflight', async () => {
  for (const profileName of ['production', 'production-paid']) {
    for (const android of [false, true]) {
      const overridden = config();
      const profile = overridden.eas.build[profileName];
      const target = android ? (profile.android ??= {}) : profile;
      target.env = { ...target.env, EXPO_PUBLIC_REVENUECAT_ANDROID_KEY: 'goog_unchecked_override' };
      const errors = await checkAndroidEnvironment({ config: overridden, env, fetchImpl: async () => assert.fail('Profile key overrides must fail before API lookup') });
      assert.match(errors.join(' '), /Remove build-profile key overrides/);
      assert.ok(!errors.join(' ').includes('goog_unchecked_override'));
    }
  }
});

test('the diagnostic sends a bounded GET for Android and validates the current offering', async () => {
  const result = await checkAndroidEnvironment({ config: config(), env, fetchImpl: async (url, options) => {
    assert.match(url, /^https:\/\/api\.revenuecat\.com\/v1\/subscribers\/leoqo-release-check-[0-9a-f-]+\/offerings$/);
    assert.equal(options.method, 'GET');
    assert.equal(options.headers.Authorization, `Bearer ${env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY}`);
    assert.equal(options.headers['X-Platform'], 'android');
    assert.equal(options.redirect, 'error');
    assert.ok(options.signal instanceof AbortSignal);
    return ok({ current_offering_id: 'default', offerings: [offering('default')] });
  } });
  assert.deepEqual(result, []);
  for (const response of [
    {}, { current_offering_id: 'default', offerings: [] },
    { current_offering_id: 'default', offerings: [{ identifier: 'default', packages: [] }, offering('sale')] },
    { current_offering_id: 'default', offerings: [{ identifier: 'default', packages: [{ platform_product_identifier: 'another_product' }] }] },
  ]) {
    assert.ok((await checkAndroidEnvironment({ config: config(), env, fetchImpl: async () => ok(response) })).length);
  }
});

test('network and API failures remain actionable without exposing returned data or credentials', async () => {
  const privateText = 'private-response-or-credential';
  const cases = [
    async () => { throw new Error(privateText); },
    async () => ({ ok: false, status: 403, json: async () => ({ message: privateText }) }),
    async () => ({ ok: false, status: 429, json: async () => ({ message: privateText }) }),
    async () => ({ ok: false, status: 500, json: async () => ({ message: privateText }) }),
    async () => ({ ok: true, json: async () => { throw new Error(privateText); } }),
  ];
  for (const fetchImpl of cases) {
    const errors = await checkAndroidEnvironment({ config: config(), env, fetchImpl });
    assert.ok(errors.length);
    assert.ok(!errors.join(' ').includes(privateText));
    assert.ok(!errors.join(' ').includes(env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY));
  }
});
