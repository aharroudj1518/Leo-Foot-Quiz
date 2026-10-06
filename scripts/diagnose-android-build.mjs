import { appendFileSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectId = '99891114-dac6-4d4c-973c-3a246db2a7b1';
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function validateDiagnosticBuild(build, { buildId, sourceCommit } = {}) {
  if (!build || !uuid.test(build.id ?? '') || build.app?.id !== projectId || build.platform !== 'ANDROID') {
    throw new Error('Diagnostic build does not belong to the existing Android project or has no valid ID.');
  }
  if (buildId && build.id.toLowerCase() !== buildId.toLowerCase()) throw new Error('Diagnostic metadata does not match the selected exact build ID.');
  if (sourceCommit && (build.gitCommitHash?.toLowerCase() !== sourceCommit.toLowerCase() || build.buildProfile !== 'production-paid')) {
    throw new Error('Diagnostic build does not match the exact source commit and paid profile.');
  }
  return build;
}

export function selectSourceBuild(values, sourceCommit) {
  if (!/^[0-9a-f]{40}$/i.test(sourceCommit ?? '')) throw new Error('Source lookup requires a full exact commit hash.');
  if (!Array.isArray(values)) throw new Error('Build-list query did not return a valid build list. Raw metadata was omitted.');
  const matches = values.filter(build => build?.gitCommitHash?.toLowerCase() === sourceCommit.toLowerCase()
    && build.platform === 'ANDROID' && build.buildProfile === 'production-paid' && build.app?.id === projectId);
  if (matches.length === 0) throw new Error('No matching Android paid build was found for this exact source commit. It may not have reached EAS yet.');
  if (matches.length !== 1) throw new Error('Multiple builds match this source commit. Supply an exact build ID; no latest build was selected.');
  return validateDiagnosticBuild(matches[0], { sourceCommit });
}

export function buildSummary(build) {
  validateDiagnosticBuild(build);
  const knownStatuses = ['NEW', 'IN_QUEUE', 'IN_PROGRESS', 'PENDING_CANCEL', 'ERRORED', 'FINISHED', 'CANCELED'];
  const status = knownStatuses.includes(build.status) ? build.status : 'UNKNOWN';
  const version = /^\d{1,10}$/.test(String(build.appBuildVersion ?? '')) ? String(build.appBuildVersion) : 'not assigned';
  return `Build ${build.id}; status ${status}; version code ${version}\nhttps://expo.dev/accounts/amoharroudj/projects/leoqo-football-quiz/builds/${build.id}`;
}

// Build metadata includes signed log URLs. Never print it or forward Expo's
// token to those hosts. Emit only bounded, redacted diagnostic messages.
export function safe(message) {
  return String(message)
    .replace(/https?:\/\/[^\s"<>]+/g, '[URL omitted]')
    .replace(/\b(?:goog|appl|sk|test)_[\w.-]+/g, '[SDK key omitted]')
    .replace(/(\b(?:Bearer|Basic)\s+)[A-Za-z0-9+/_=.-]+/gi, '$1[omitted]')
    .replace(/((?:["']?[\w.-]*(?:TOKEN|SECRET|PASSWORD|API[_-]?KEY|AUTHORIZATION)[\w.-]*["']?)\s*[=:]\s*)(?:"[^"]*"|'[^']*'|[^\s,;}]+)/gi, '$1[omitted]')
    .replace(/\b[A-Za-z0-9+/_=-]{32,}\b/g, value => /^(?:EXPO_PUBLIC_|EAS_BUILD_)[A-Z0-9_]+$/.test(value) ? value : '[long value omitted]')
    .slice(0, 700);
}

async function main(args) {
  if (args[0] === '--select-source') {
    let values;
    try { values = JSON.parse(readFileSync(args[1], 'utf8')); }
    catch { throw new Error('Build-list query did not return readable JSON. Raw metadata and CLI output were omitted.'); }
    const selected = selectSourceBuild(values, process.env.SOURCE_COMMIT);
    console.log(buildSummary(selected));
    if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `build_id=${selected.id}\n`);
    return;
  }
  const rawMetadata = readFileSync(args[0], 'utf8');
  let value;
  try { value = JSON.parse(rawMetadata); }
  catch {
    console.error('Build metadata query did not return JSON. Redacted CLI details:');
    for (const line of rawMetadata.split('\n').filter(Boolean).slice(-12)) console.error(safe(line));
    if (args[1]) for (const line of readFileSync(args[1], 'utf8').split('\n').filter(Boolean).slice(-8)) console.error(safe(line));
    process.exitCode = 1;
    return;
  }
  const builds = Array.isArray(value) ? value : [value];
  if (builds.length !== 1) throw new Error('Expected metadata for one exact build.');
  const build = builds[0];
  if (!build.id && build.error) {
    console.error(`Metadata query error: ${safe(build.error.message ?? 'Unknown CLI error')}`);
    process.exitCode = 1;
    return;
  }
  validateDiagnosticBuild(build, { buildId: process.env.BUILD_ID, sourceCommit: process.env.SOURCE_COMMIT });
  console.log(buildSummary(build));
  if (build.error) console.log(`EAS error: ${safe(build.error.errorCode)} — ${safe(build.error.message)}`);

  for (const [index, address] of (build.logFiles ?? []).entries()) {
    const url = new URL(address);
    if (url.protocol !== 'https:' || url.username || url.password) throw new Error('Unexpected log URL.');
    const response = await fetch(url, { credentials: 'omit', signal: AbortSignal.timeout(15_000) });
    if (!response.ok) { console.log(`Log ${index + 1} could not be retrieved (${response.status}).`); continue; }
    const raw = await response.text();
    if (raw.length > 8 * 1024 * 1024) throw new Error('Diagnostic log exceeded its size limit.');
    const messages = [];
    let lastPhase;
    for (const line of raw.split('\n')) {
      if (!line.trim()) continue;
      try {
        const entry = JSON.parse(line);
        for (const item of Array.isArray(entry) ? entry : [entry]) {
          if (typeof item.phase === 'string' && /^[A-Z0-9_]{1,80}$/.test(item.phase)) lastPhase = item.phase;
          const message = item.msg ?? item.message ?? item.body;
          if (typeof message === 'string') messages.push(`${item.phase ?? ''} ${message}`);
          if (item.err?.message) messages.push(`${item.phase ?? ''} Error: ${item.err.message}`);
          if (item.result === 'failed') messages.push(`${item.phase ?? ''} Failed step: ${item.buildStepDisplayName ?? item.buildStepId ?? item.marker ?? ''}`);
        }
      } catch { messages.push(line); }
    }
    if (lastPhase) console.log(`Log ${index + 1}: last recorded phase ${lastPhase}.`);
    // Doctor prints the dependency names and advice on lines that do not include
    // "error". Include the bounded phase so the actual failing check is visible.
    const doctor = messages.filter(message => /^RUN_EXPO_DOCTOR\s/.test(message));
    if (doctor.length) {
      console.log(`Log ${index + 1}: Expo Doctor phase (${doctor.length} messages).`);
      for (const message of doctor.slice(-100)) console.log(safe(message));
    }
    const errors = messages.filter(message => !/^RUN_EXPO_DOCTOR\s/.test(message) && /FAIL:|error|failed|requires|unsupported|cannot|could not|not found|ENOENT/i.test(message));
    if (errors.length) {
      console.log(`Log ${index + 1}: ${errors.length} relevant message(s).`);
      for (const message of errors.slice(-35)) console.log(safe(message));
    }
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).catch(error => {
    console.error(`FAIL: ${safe(error.message)}`);
    process.exitCode = 1;
  });
}
