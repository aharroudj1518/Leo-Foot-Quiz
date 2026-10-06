import { readFileSync } from 'node:fs';

// Build metadata includes signed log URLs. Never print it or forward Expo's
// token to those hosts. Emit only bounded, redacted diagnostic messages.
function safe(message) {
  return String(message)
    .replace(/https?:\/\/[^\s"<>]+/g, '[URL omitted]')
    .replace(/\b(?:goog|appl|sk|test)_[\w.-]+/g, '[SDK key omitted]')
    .replace(/((?:TOKEN|SECRET|PASSWORD|API_KEY)\s*[=:]\s*)[^\s,;]+/gi, '$1[omitted]')
    .replace(/\b[A-Za-z0-9+/_=-]{32,}\b/g, value => /^(?:EXPO_PUBLIC_|EAS_BUILD_)[A-Z0-9_]+$/.test(value) ? value : '[long value omitted]')
    .slice(0, 700);
}

const rawMetadata = readFileSync(process.argv[2], 'utf8');
let value;
try { value = JSON.parse(rawMetadata); }
catch {
  console.error('Build metadata query did not return JSON. Redacted CLI details:');
  for (const line of rawMetadata.split('\n').filter(Boolean).slice(-12)) console.error(safe(line));
  if (process.argv[3]) for (const line of readFileSync(process.argv[3], 'utf8').split('\n').filter(Boolean).slice(-8)) console.error(safe(line));
  process.exit(1);
}
const builds = Array.isArray(value) ? value : [value];
if (builds.length !== 1) throw new Error('Expected metadata for one exact build.');
const build = builds[0];
if (!build.id && build.error) {
  console.error(`Metadata query error: ${safe(build.error.message ?? 'Unknown CLI error')}`);
  process.exit(1);
}
if (build.app?.id !== '99891114-dac6-4d4c-973c-3a246db2a7b1' || build.platform !== 'ANDROID') {
  throw new Error('Diagnostic build does not belong to the existing Android project.');
}
console.log(`Build ${build.id}; status ${build.status}; profile ${build.buildProfile}; version code ${build.appBuildVersion}`);
if (build.error) console.log(`EAS error: ${safe(build.error.errorCode)} — ${safe(build.error.message)}`);

for (const [index, address] of (build.logFiles ?? []).entries()) {
  const url = new URL(address);
  if (url.protocol !== 'https:' || url.username || url.password) throw new Error('Unexpected log URL.');
  const response = await fetch(url, { credentials: 'omit', signal: AbortSignal.timeout(15_000) });
  if (!response.ok) { console.log(`Log ${index + 1} could not be retrieved (${response.status}).`); continue; }
  const raw = await response.text();
  if (raw.length > 8 * 1024 * 1024) throw new Error('Diagnostic log exceeded its size limit.');
  const messages = [];
  for (const line of raw.split('\n')) {
    if (!line.trim()) continue;
    try {
      const entry = JSON.parse(line);
      for (const item of Array.isArray(entry) ? entry : [entry]) {
        const message = item.msg ?? item.message ?? item.body;
        if (typeof message === 'string') messages.push(`${item.phase ?? ''} ${message}`);
        if (item.err?.message) messages.push(`${item.phase ?? ''} Error: ${item.err.message}`);
        if (item.result === 'failed') messages.push(`${item.phase ?? ''} Failed step: ${item.buildStepDisplayName ?? item.buildStepId ?? item.marker ?? ''}`);
      }
    } catch { messages.push(line); }
  }
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
