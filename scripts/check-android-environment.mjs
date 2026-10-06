import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { billingEnvironmentErrors } from './check-cloud-build.mjs';
import { editorialReviewErrors, validateReleaseConfig } from './check-release.mjs';

const productId = 'leoqo_legends_lifetime';
const keyVariable = 'EXPO_PUBLIC_REVENUECAT_ANDROID_KEY';

function profileOverridesKey(eas, name) {
  const visited = new Set();
  while (name && !visited.has(name)) {
    visited.add(name);
    const profile = eas?.build?.[name];
    if (!profile) break;
    if (Object.hasOwn(profile.env ?? {}, keyVariable) || Object.hasOwn(profile.android?.env ?? {}, keyVariable)) return true;
    name = profile.extends;
  }
  return false;
}

// Run under `eas env:exec production ... --non-interactive`. That command loads
// Plain text and Sensitive values, but cannot read variables marked Secret.
export async function checkAndroidEnvironment({ config, env, buildProfile = 'production-paid', fetchImpl = fetch }) {
  if (!['production', 'production-paid'].includes(buildProfile)) return ['Unsupported Android release profile.'];
  const paid = buildProfile === 'production-paid';
  const errors = validateReleaseConfig(config, { buildProfile, paid }).errors;
  if (!paid) return errors;

  errors.push(...editorialReviewErrors(config.editorial, config.questionBytes));
  if (profileOverridesKey(config.eas, buildProfile)) {
    errors.push('Keep the Android public SDK key in the production EAS environment. Remove build-profile key overrides so this preflight checks the key that will ship.');
  }
  // env:exec loads the EAS environment, not eas.json build-profile overrides.
  // The release validator above checks the profile's actual commerce switch.
  const keyErrors = billingEnvironmentErrors({
    ...env, EAS_BUILD_PLATFORM: 'android', EXPO_PUBLIC_COMMERCE_READY: 'true',
  });
  errors.push(...keyErrors);
  const key = env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;
  if (typeof key === 'string' && /\s/.test(key)) errors.push('The Android public SDK key must not contain whitespace.');
  if (errors.length) {
    if (keyErrors.length) {
      errors.push('Use Plain text or Sensitive visibility for the public SDK key in the production EAS environment; this preflight cannot read Secret values.');
    }
    return errors;
  }

  // RevenueCat v1 permits a nonexistent App User ID for this endpoint. A fresh
  // diagnostic ID avoids reading a real customer's data. This does not purchase,
  // grant entitlements, or change offering overrides.
  // https://www.revenuecat.com/docs/api-v1/offerings
  let response;
  try {
    response = await fetchImpl(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(`leoqo-release-check-${randomUUID()}`)}/offerings`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${key}`, Accept: 'application/json', 'X-Platform': 'android' },
      redirect: 'error',
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    return ['Could not reach RevenueCat for the Android offering check within 15 seconds. Check service availability and rerun before starting a paid build.'];
  }
  if (!response.ok) {
    if ([401, 403].includes(response.status)) return ['RevenueCat rejected the Android public SDK key. Check the Google Play app key in the production EAS environment.'];
    if (response.status === 429) return ['RevenueCat rate-limited the offering check. Wait and rerun before starting a paid build.'];
    return ['RevenueCat could not return Android offerings. Check service availability and the Google Play app configuration, then rerun.'];
  }

  let offerings;
  try { offerings = await response.json(); }
  catch { return ['RevenueCat returned an unreadable offering response. Rerun the check before starting a paid build.']; }
  if (typeof offerings?.current_offering_id !== 'string' || !offerings.current_offering_id || !Array.isArray(offerings.offerings)) {
    return ['RevenueCat has no valid current Android offering for the release diagnostic. Set a current offering and check targeting rules.'];
  }
  const current = offerings.offerings.filter(offering => offering?.identifier === offerings.current_offering_id);
  if (current.length !== 1 || !Array.isArray(current[0].packages) || !current[0].packages.some(pkg => pkg?.platform_product_identifier === productId)) {
    return [`The current RevenueCat Android offering must include ${productId}. Check its Google Play package mapping and any targeting or experiments.`];
  }
  return [];
}

async function main(args) {
  if (args.length > 1) throw new Error('Invalid arguments');
  const buildProfile = args[0] ?? 'production-paid';
  const read = path => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'));
  const config = {
    app: read('app.json'), eas: read('eas.json'), editorial: read('src/content/editorial-status.json'),
    questionBytes: readFileSync(new URL('../src/content/questions.json', import.meta.url)),
  };
  if (buildProfile === 'production-paid') {
    console.log(`EXPO_PUBLIC_NEWS_FEED_URL configured: ${Boolean(process.env.EXPO_PUBLIC_NEWS_FEED_URL?.trim())}`);
  }
  const errors = await checkAndroidEnvironment({ config, env: process.env, buildProfile });
  for (const error of errors) console.error(`FAIL: ${error}`);
  if (errors.length) process.exitCode = 1;
  else if (buildProfile === 'production') console.log('Free Android profile checked; RevenueCat environment check skipped.');
  else {
    console.log('Paid Android configuration, reviewed question bank, public SDK key and current offering mapping checked. No credential values were logged.');
    console.log('This diagnostic made no purchase. Native Google Play price, entitlement, purchase and restore checks are still required; targeting may vary for other users.');
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).catch(() => {
    console.error('FAIL: Android environment preflight could not read valid configuration or complete its check. No build was started.');
    process.exitCode = 1;
  });
}
