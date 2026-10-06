import { readFileSync, appendFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export function completedAndroidBuild(raw, expectedCommit, expectedProfile) {
  const builds = Array.isArray(raw) ? raw : [raw];
  if (builds.length !== 1) throw new Error('Expected exactly one Android build from this run.');
  const build = builds[0];
  if (!build || build.platform !== 'ANDROID' || build.status !== 'FINISHED' ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(build.id ?? '')) {
    throw new Error('EAS did not return a finished Android build with a valid ID.');
  }
  if (expectedCommit && build.gitCommitHash !== expectedCommit) {
    throw new Error('Build source commit does not match the checked-out release commit.');
  }
  if (build.app?.id !== '99891114-dac6-4d4c-973c-3a246db2a7b1' ||
      build.appIdentifier !== 'com.leoqo.footballquiz' || build.distribution !== 'STORE' ||
      (expectedProfile && build.buildProfile !== expectedProfile)) {
    throw new Error('Build project, application ID, distribution or profile does not match the release candidate.');
  }
  const artifact = build.artifacts?.applicationArchiveUrl || build.artifacts?.buildUrl;
  let artifactURL;
  try { artifactURL = new URL(artifact); } catch { throw new Error('Completed build has no downloadable application artifact.'); }
  if (artifactURL.protocol !== 'https:' || artifactURL.username || artifactURL.password) throw new Error('Build artifact must use HTTPS.');
  if (!/^\d+$/.test(build.appBuildVersion ?? '')) throw new Error('Build does not report its Android version code.');
  return { id: build.id, commit: build.gitCommitHash, versionCode: build.appBuildVersion, url: `https://expo.dev/accounts/amoharroudj/projects/leoqo-football-quiz/builds/${build.id}` };
}

function main() {
  const build = completedAndroidBuild(JSON.parse(readFileSync(process.argv[2], 'utf8')), process.env.GITHUB_SHA, process.env.BUILD_PROFILE);
  appendFileSync(process.env.GITHUB_OUTPUT, `build_id=${build.id}\n`);
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `Signed Android build completed: [${build.id}](${build.url})\n\nSource commit: ${build.commit}\n\nAndroid version code: ${build.versionCode}\n\nSubmission uses this exact build ID. A draft upload still needs rollout to internal testers in Play Console.\n`);
  console.log(`Completed Android build: ${build.url}`);
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
