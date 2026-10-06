import { createHash } from 'node:crypto';
import { appendFileSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';

const SITE = 'https://leo-foot-quiz.vercel.app';
const MAX_BYTES = 256 * 1024;
const REQUEST_MS = 12_000;
const TOTAL_MS = 180_000;
const RETRY_MS = 15_000;
const FILES = [
  { name: 'privacy.html', mime: 'text/html' },
  { name: 'support.html', mime: 'text/html' },
  { name: 'legal.css', mime: 'text/css' },
];
const sha256 = text => createHash('sha256').update(text, 'utf8').digest('hex');

function discard(response) {
  // Never print a redirect location or an error/login response body.
  void response.body?.cancel().catch(() => {});
}

function statusReason(status) {
  if (status === 404) return 'Page not found. Check the production deployment, public-file export and route configuration.';
  if (status === 401 || status === 403) return 'Public access denied. Check Vercel deployment protection, authentication and firewall rules.';
  if (status >= 300 && status < 400) return 'Unexpected redirect. The exact public URL must return its file directly; check authentication and route redirects.';
  if (status === 429) return 'Host rate limit. Retry after the limit clears.';
  if (status >= 500) return 'Hosting/deployment error. Check Vercel deployment status.';
  return 'Expected HTTP 200 from the exact public URL.';
}

async function readBounded(response) {
  const length = response.headers.get('content-length');
  if (length && /^\d+$/.test(length) && Number(length) > MAX_BYTES) {
    discard(response);
    throw new Error('BODY_TOO_LARGE');
  }
  if (!response.body) throw new Error('EMPTY_BODY');
  const reader = response.body.getReader();
  const chunks = [];
  let bytes = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_BYTES) {
        void reader.cancel().catch(() => {});
        throw new Error('BODY_TOO_LARGE');
      }
      chunks.push(value);
    }
    return new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks, bytes)).trim();
  } finally {
    reader.releaseLock();
  }
}

export function loadExpectedPages() {
  return FILES.map(file => {
    const bytes = readFileSync(new URL(`../public/${file.name}`, import.meta.url));
    if (bytes.byteLength > MAX_BYTES) throw new Error('Local public file exceeds the diagnostic size limit.');
    const expected = new TextDecoder('utf-8', { fatal: true }).decode(bytes).trim();
    if (!expected) throw new Error('A local public file is empty.');
    return { ...file, url: `${SITE}/${file.name}`, expected, expectedHash: sha256(expected) };
  });
}

export async function checkPage(page, { fetchImpl = fetch, timeoutMs = REQUEST_MS } = {}) {
  const result = { name: page.name, url: page.url, ok: false, expectedHash: page.expectedHash };
  const signal = AbortSignal.timeout(timeoutMs);
  try {
    const response = await fetchImpl(page.url, {
      method: 'GET', credentials: 'omit', redirect: 'manual', signal,
      headers: { Accept: page.mime, 'Cache-Control': 'no-cache' },
    });
    result.status = response.status;
    if (response.status !== 200) {
      discard(response);
      return { ...result, reason: statusReason(response.status) };
    }
    const mime = response.headers.get('content-type')?.split(';')[0].trim().toLowerCase();
    if (mime !== page.mime) {
      discard(response);
      return { ...result, reason: `Wrong MIME type; expected ${page.mime}. Check static-file routes and SPA fallbacks.` };
    }
    result.mime = mime;
    const actual = await readBounded(response);
    result.actualHash = sha256(actual);
    if (actual !== page.expected) {
      return { ...result, reason: 'Content differs from the checked-out public file. Possible older deployment, login/challenge page or SPA fallback.' };
    }
    return { ...result, ok: true };
  } catch (error) {
    const reason = signal.aborted ? 'Request or body read timed out.'
      : error?.message === 'BODY_TOO_LARGE' ? 'Response exceeds the 256 KiB size limit.'
      : error?.message === 'EMPTY_BODY' ? 'Response has no body.'
      : error?.code === 'ERR_ENCODING_INVALID_ENCODED_DATA' ? 'Response is not valid UTF-8.'
      : 'Network/TLS/request failure. Check DNS, connectivity and the public deployment.';
    return { ...result, reason };
  }
}

export async function checkPublicPages({ once = false, fetchImpl = fetch, log = console.log } = {}) {
  const pages = loadExpectedPages();
  const start = performance.now();
  let results = [];
  let attempt = 0;
  log(`Checking public files at ${SITE} without credentials, cookies or redirects. Maximum retry window: ${TOTAL_MS / 1000}s.`);
  do {
    attempt += 1;
    const remaining = Math.max(1, Math.floor(TOTAL_MS - (performance.now() - start)));
    results = await Promise.all(pages.map(page => checkPage(page, {
      fetchImpl, timeoutMs: Math.min(REQUEST_MS, remaining),
    })));
    for (const result of results) {
      // Only fixed diagnostics, status/MIME and hashes are logged, never bodies or remote headers.
      log(JSON.stringify({ attempt, ...result }));
    }
    if (results.every(result => result.ok) || once) break;
    const waitMs = Math.min(RETRY_MS, TOTAL_MS - (performance.now() - start));
    if (waitMs <= 0) break;
    await delay(waitMs);
  } while (performance.now() - start < TOTAL_MS);
  return { checkedAt: new Date().toISOString(), attempts: attempt, results };
}

async function main(args) {
  if (args.length > 1 || (args.length === 1 && args[0] !== '--once')) throw new Error('Use no arguments, or --once for a single attempt.');
  const report = await checkPublicPages({ once: args[0] === '--once' });
  const passed = report.results.length === FILES.length && report.results.every(result => result.ok);
  const outcome = passed ? 'PASS: All three exact public URLs returned HTTP 200, the expected MIME type and matching content without login.'
    : 'FAIL: Public policy/support availability is not verified. See the fixed diagnostics above; do not submit unverified URLs.';
  console.log(`${report.checkedAt} ${outcome}`);
  if (process.env.GITHUB_STEP_SUMMARY) {
    const lines = [
      '## Public privacy and support URL check', '', outcome, '',
      `Checked: ${report.checkedAt}. Attempts: ${report.attempts}. Content comparison trims only leading/trailing whitespace.`, '',
      '| URL | Result | HTTP | Expected SHA-256 | Received SHA-256 |',
      '| --- | --- | --- | --- | --- |',
      ...report.results.map(result => `| ${result.url} | ${result.ok ? 'PASS' : 'FAIL'} | ${result.status ?? 'No response'} | ${result.expectedHash} | ${result.actualHash ?? 'Not compared'} |`), '',
      ...report.results.filter(result => !result.ok).map(result => `- ${result.name}: ${result.reason}`), '',
      'This check verifies unauthenticated retrieval from this runner. It does not establish worldwide availability, legal approval or Google Play acceptance.', '',
    ];
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join('\n'));
  }
  if (!passed) process.exitCode = 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).catch(() => {
    console.error('Public-page check could not complete. Check local public files and invocation; no remote bodies or credentials were logged.');
    process.exitCode = 1;
  });
}
