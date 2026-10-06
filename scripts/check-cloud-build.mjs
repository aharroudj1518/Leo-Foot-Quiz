import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { validateReleaseConfig, editorialReviewErrors } from './check-release.mjs';

// EXPO_PUBLIC values are embedded in the app. Validate the key type without
// printing a value or requiring credentials in the repository.
export function billingEnvironmentErrors(env) {
  if (env.EXPO_PUBLIC_COMMERCE_READY !== 'true') return [];
  const platform = env.EAS_BUILD_PLATFORM;
  if (!['android', 'ios'].includes(platform)) return ['A paid cloud build must identify its platform.'];
  const variable = platform === 'android' ? 'EXPO_PUBLIC_REVENUECAT_ANDROID_KEY' : 'EXPO_PUBLIC_REVENUECAT_IOS_KEY';
  const prefix = platform === 'android' ? 'goog_' : 'appl_';
  if (!env[variable]?.startsWith(prefix) || env[variable].length <= prefix.length) {
    return [`Set ${variable} to the platform public SDK key in the production EAS environment. Do not use a secret REST key or a Test Store key.`];
  }
  return [];
}

function main() {
  if (!process.env.EAS_BUILD) return;
  const errors = billingEnvironmentErrors(process.env);
  if (process.env.EAS_BUILD_PROFILE === 'production-paid') {
    const read = path => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'));
    errors.push(...validateReleaseConfig({
      app: read('app.json'), eas: read('eas.json'), editorial: read('src/content/editorial-status.json'),
    }, { buildProfile: 'production-paid', paid: true }).errors);
    errors.push(...editorialReviewErrors(read('src/content/editorial-status.json'), readFileSync(new URL('../src/content/questions.json', import.meta.url))));
    if (process.env.EXPO_PUBLIC_COMMERCE_READY !== 'true') errors.push('Paid build is missing its commerce switch.');
  }
  if (errors.length) {
    for (const error of errors) console.error(`FAIL: ${error}`);
    process.exitCode = 1;
  } else console.log('Cloud build configuration checked; no credential values were logged.');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
