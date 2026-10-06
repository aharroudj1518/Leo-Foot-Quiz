import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const identity = {
  package: 'com.leoqo.footballquiz',
  owner: 'amoharroudj',
  projectId: '99891114-dac6-4d4c-973c-3a246db2a7b1',
};

function merge(parent, child) {
  const result = { ...parent };
  for (const [key, value] of Object.entries(child)) {
    result[key] = value && typeof value === 'object' && !Array.isArray(value)
      ? merge(parent?.[key] ?? {}, value) : value;
  }
  return result;
}

function profile(profiles, name, visited = []) {
  if (visited.includes(name)) throw new Error(`Circular EAS profile inheritance: ${name}.`);
  const current = profiles?.[name];
  if (!current || typeof current !== 'object' || Array.isArray(current)) {
    throw new Error(`Missing EAS profile: ${name}.`);
  }
  return current.extends
    ? merge(profile(profiles, current.extends, [...visited, name]), current)
    : current;
}

export function editorialReviewErrors(editorial, questionBytes) {
  const hash = createHash('sha256').update(questionBytes).digest('hex');
  return editorial?.questionBankSha256 === hash ? []
    : ['The question bank has changed or has no matching recorded review hash. Review the final bank before a paid build.'];
}

/** Static repository checks only; this does not authenticate or contact any store. */
export function validateReleaseConfig({ app, eas, editorial }, {
  buildProfile = 'production', submitProfile = 'play-internal', paid = false,
} = {}) {
  const errors = [];
  const warnings = [];
  const check = (condition, message) => { if (!condition) errors.push(message); };
  const expo = app?.expo;
  check(expo?.android?.package === identity.package, 'Android package must match the existing Leoqo Play app.');
  check(expo?.owner === identity.owner, 'Expo owner must match the existing Leoqo project.');
  check(expo?.extra?.eas?.projectId === identity.projectId, 'EAS project ID must match the existing Leoqo project.');
  check(typeof expo?.version === 'string' && /^\d+\.\d+\.\d+$/.test(expo.version), 'Set a numeric major.minor.patch app version.');
  check(eas?.cli?.appVersionSource === 'remote', 'EAS must manage Android version codes remotely.');

  try {
    const build = profile(eas?.build, buildProfile);
    const android = merge(build, build.android ?? {});
    check(android.distribution === 'store', 'Release build must use store distribution.');
    check(build.environment === 'production', 'Release build must select the production EAS environment.');
    check(android.buildType === 'app-bundle', 'Release build must explicitly produce an Android App Bundle.');
    check(android.developmentClient !== true, 'Release build cannot be a development client.');
    check(android.credentialsSource === 'remote', 'Release build must use the existing EAS signing credentials.');
    check(android.withoutCredentials !== true, 'Release build must require signing credentials.');
    check(android.autoIncrement === true || android.autoIncrement === 'versionCode', 'Release build must increment the Android version code.');
    check(!android.gradleCommand && !android.config, 'Custom build commands need a separate artifact/signing review.');
    const commerce = android.env?.EXPO_PUBLIC_COMMERCE_READY;
    if (paid) {
      check(commerce === 'true', 'Paid build requires EXPO_PUBLIC_COMMERCE_READY=true in its build profile.');
      check(editorial?.independentEditorialApproval === true, 'Paid build requires recorded independent editorial approval.');
      warnings.push('Paid configuration does not verify RevenueCat keys, products, ownership, or real purchase/restore flows.');
    } else {
      check(commerce === 'false', 'Free test candidate must explicitly keep EXPO_PUBLIC_COMMERCE_READY=false.');
      warnings.push('This candidate keeps purchases disabled; dashboard setup alone does not enable them.');
    }
  } catch (error) {
    errors.push(error.message);
  }

  try {
    const submit = profile(eas?.submit, submitProfile).android;
    check(submit?.track === 'internal', 'Submission must target the internal testing track.');
    check(submit?.releaseStatus === 'draft', 'Submission must create a draft for review in Play Console.');
    check(!submit?.serviceAccountKeyPath, 'Use the service-account key stored in EAS, not a repository credential path.');
    check(!submit?.applicationId || submit.applicationId === identity.package, 'Submission application ID must match the existing Play app.');
  } catch (error) {
    errors.push(error.message);
  }

  warnings.push('Remote signing, EXPO_TOKEN, Play permissions, existing version codes, and listing status need verification in their services.');
  return { errors, warnings };
}

function main(args) {
  const options = {};
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--paid') options.paid = true;
    else if ((arg === '--build-profile' || arg === '--submit-profile') && args[index + 1] && !args[index + 1].startsWith('--')) {
      options[arg === '--build-profile' ? 'buildProfile' : 'submitProfile'] = args[++index];
    } else throw new Error('Usage: node scripts/check-release.mjs [--build-profile NAME] [--submit-profile NAME] [--paid]');
  }
  const read = path => JSON.parse(readFileSync(resolve(projectRoot, path), 'utf8'));
  const result = validateReleaseConfig({
    app: read('app.json'), eas: read('eas.json'), editorial: read('src/content/editorial-status.json'),
  }, options);
  if (options.paid) result.errors.push(...editorialReviewErrors(read('src/content/editorial-status.json'), readFileSync(resolve(projectRoot, 'src/content/questions.json'))));
  for (const error of result.errors) console.error(`FAIL: ${error}`);
  for (const warning of result.warnings) console.log(`NOTE: ${warning}`);
  if (result.errors.length) process.exitCode = 1;
  else console.log('Android release configuration checks passed. No build or submission was started.');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(process.argv.slice(2)); }
  catch { console.error('Release check could not read valid configuration or arguments. See docs/google-play/release-runbook.md.'); process.exitCode = 1; }
}
