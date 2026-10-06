import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseNewsFeed, getEditionStatus, selectLatestEdition, mergeFeed } from '../src/core/news.ts';
import { fetchNewsFeed, MAX_NEWS_BODY_BYTES, NEWS_TIMEOUT_MS } from '../src/services/news.ts';

const edition = (id = '2026-10-05') => ({
  id,
  title: 'European football briefing',
  summary: 'Five questions about verified football stories.',
  publishedAt: '2026-10-05T12:00:00Z',
  expiresAt: '2026-10-12T12:00:00Z',
  questions: Array.from({ length: 5 }, (_, index) => ({
    id: `news-${id}-${index + 1}`,
    prompt: `Which club won the featured match in story ${index + 1}?`,
    answer: 'Arsenal', options: ['Arsenal', 'Inter', 'Barcelona', 'Bayern'],
    explanation: 'The original match report identifies the winning club.',
    hint: 'This team plays in London.', category: 'clubs', difficulty: 'fan',
    source: 'https://www.uefa.com/uefachampionsleague/news/123/match-report/',
    sourceName: 'UEFA', publishedAt: '2026-10-04', era: '2026/27',
  })),
});
const feed = (...editions) => ({ version: 1, editions });

test('the shipped news edition has five sourced, dated, valid questions', () => {
  const bundled = JSON.parse(readFileSync(new URL('../src/content/news.json', import.meta.url), 'utf8'));
  const parsed = parseNewsFeed(bundled);
  assert.ok(parsed.editions.length > 0);
  for (const item of parsed.editions) {
    assert.equal(item.questions.length, 5);
    assert.ok(item.questions.every(question => question.sourceName && (question.publishedAt || question.updatedAt)));
  }
});

test('accepts a validated feed, strips unknown fields, and does not mutate its input', () => {
  const input = feed(edition());
  input.tracking = 'discard';
  const parsed = parseNewsFeed(input);
  assert.equal(parsed.editions.length, 1);
  assert.equal(parsed.editions[0].questions.length, 5);
  assert.equal(parsed.tracking, undefined);
  parsed.editions[0].questions[0].options[0] = 'Changed';
  assert.equal(input.editions[0].questions[0].options[0], 'Arsenal');
});

test('malformed schema, duplicate identities, and incomplete questions are rejected', () => {
  for (const invalid of [null, [], {}, { version: 2, editions: [] }, feed(null), { version: 1, editions: Array(13).fill(edition()) }]) {
    assert.throws(() => parseNewsFeed(invalid), /Invalid news feed/);
  }
  assert.deepEqual(parseNewsFeed(feed()), feed());
  assert.throws(() => parseNewsFeed(feed(edition(), edition())), /duplicated/);
  const repeated = edition('second');
  repeated.questions[0].id = edition().questions[0].id;
  assert.throws(() => parseNewsFeed(feed(edition(), repeated)), /duplicated/);
  for (const mutate of [
    item => item.questions.pop(),
    item => { item.questions[0].id = 'evergreen-question'; },
    item => { item.questions[0].category = 'mixed'; },
    item => { item.questions[0].difficulty = 'impossible'; },
    item => { item.questions[0].options = ['Arsenal', 'Ársenal', 'Inter', 'Bayern']; },
    item => { item.questions[0].answer = 'Real Madrid'; },
    item => { item.questions[0].aliases = ['Inter']; },
    item => { item.questions[0].prompt = 'Did Arsenal win?'; },
    item => { item.questions[0].premium = 'true'; },
    item => { item.questions[0].premium = true; },
    item => { item.questions[0].hint = ''; },
    item => { item.questions[0].explanation = 'x'.repeat(1201); },
    item => { item.questions[0].sourceName = null; },
    item => { item.questions[0].source = 'https://www.uefa.com/'; },
    item => { item.questions[0].source = 'http://www.uefa.com/story'; },
    item => { item.questions[0].source = 'https://secret@example.com/story'; },
  ]) {
    const candidate = edition();
    mutate(candidate);
    assert.throws(() => parseNewsFeed(feed(candidate)), /Invalid news feed/);
  }
});

test('source dates distinguish published and updated articles without inventing dates', () => {
  const candidate = edition();
  delete candidate.questions[0].publishedAt;
  candidate.questions[0].updatedAt = '2026-10-04';
  const parsed = parseNewsFeed(feed(candidate));
  assert.equal(parsed.editions[0].questions[0].publishedAt, undefined);
  assert.equal(parsed.editions[0].questions[0].updatedAt, '2026-10-04');
  delete candidate.questions[0].updatedAt;
  assert.throws(() => parseNewsFeed(feed(candidate)), /source date/);
});

test('publication dates, freshness limits, and source chronology are enforced', () => {
  for (const mutate of [
    item => { item.publishedAt = '2026-02-30T12:00:00Z'; },
    item => { item.publishedAt = '2026-10-05'; },
    item => { item.expiresAt = item.publishedAt; },
    item => { item.expiresAt = '2026-10-20T12:00:00Z'; },
    item => { item.questions[0].publishedAt = '2026-10-06'; },
    item => { item.questions[0].updatedAt = '2026-10-06'; },
    item => { item.questions[0].updatedAt = '2026-10-03'; },
    item => { item.questions[0].publishedAt = '2026-02-30'; },
  ]) {
    const candidate = edition();
    mutate(candidate);
    assert.throws(() => parseNewsFeed(feed(candidate)), /Invalid news feed/);
  }
  const boundary = edition();
  boundary.expiresAt = '2026-10-19T12:00:00.000Z';
  assert.equal(parseNewsFeed(feed(boundary)).editions.length, 1);
});

test('publication is inclusive and expiry switches immediately to archive', () => {
  const item = edition();
  const publication = Date.parse(item.publishedAt);
  assert.equal(getEditionStatus(item, publication - 1), 'upcoming');
  assert.equal(getEditionStatus(item, publication), 'current');
  assert.equal(getEditionStatus(item, new Date(item.expiresAt)), 'archive');
  assert.throws(() => getEditionStatus(item, NaN), /valid news date/);
});

test('latest selection ignores future stories, retains archives, and preserves feed order', () => {
  const older = edition('older');
  older.publishedAt = '2026-10-04T12:00:00Z';
  older.expiresAt = '2026-10-05T12:00:00Z';
  const current = edition();
  const future = edition('future');
  future.publishedAt = '2026-10-06T12:00:00Z';
  const input = parseNewsFeed(feed(older, future, current));
  assert.equal(selectLatestEdition(input, new Date('2026-10-05T15:00:00Z')).id, current.id);
  assert.deepEqual(input.editions.map(item => item.id), ['older', 'future', current.id]);
  assert.equal(selectLatestEdition(input, new Date('2026-10-25')).id, future.id);
  assert.equal(selectLatestEdition(input, new Date('2026-10-01')), null);
  assert.equal(selectLatestEdition(feed()), null);
});

test('feed updates reject rewritten editions and recycled question IDs but allow removal', () => {
  const original = parseNewsFeed(feed(edition()));
  const sameContent = JSON.parse(JSON.stringify(original));
  assert.deepEqual(mergeFeed(original, sameContent), original);
  sameContent.editions[0].summary = 'Silently rewritten edition';
  assert.throws(() => mergeFeed(original, sameContent), /cannot be edited/);
  const corrected = edition('correction');
  corrected.questions[0].id = original.editions[0].questions[0].id;
  assert.throws(() => mergeFeed(original, feed(corrected)), /cannot be reused/);
  assert.deepEqual(mergeFeed(original, feed()), feed());
  assert.equal(mergeFeed(original, feed(edition('new-edition'))).editions[0].id, 'new-edition');
});

test('fetch sends no cookies, requests JSON, validates the response, and supplies an abort signal', async () => {
  const result = await fetchNewsFeed('https://news.example.com/quiz.json', async (url, options) => {
    assert.equal(url, 'https://news.example.com/quiz.json');
    assert.equal(options.credentials, 'omit');
    assert.equal(options.redirect, 'error');
    assert.equal(options.headers.Accept, 'application/json');
    assert.ok(options.signal instanceof AbortSignal);
    return new Response(JSON.stringify(feed(edition())));
  });
  assert.equal(result.editions.length, 1);
});

test('invalid feed endpoints are rejected before any network request', async () => {
  for (const endpoint of ['http://example.com/feed', 'https://user:secret@example.com/feed', 'javascript:alert(1)', 'not a URL']) {
    await assert.rejects(fetchNewsFeed(endpoint, () => { assert.fail('fetch must not run'); }), /HTTPS URL without credentials/);
  }
});

test('HTTP failures, invalid JSON and malformed content do not produce playable feeds', async () => {
  await assert.rejects(fetchNewsFeed('https://example.com/feed', async () => new Response('', { status: 503 })), /unavailable/);
  await assert.rejects(fetchNewsFeed('https://example.com/feed', async () => new Response('<html>error</html>')), /valid JSON/);
  await assert.rejects(fetchNewsFeed('https://example.com/feed', async () => new Response('{"version":1,"editions":[null]}')), /Invalid news feed/);
});

test('declared size, streaming size, and UTF-8 fallback size are capped at 1 MiB', async () => {
  const endpoint = 'https://example.com/feed';
  await assert.rejects(fetchNewsFeed(endpoint, async () => new Response('{}', { headers: { 'content-length': String(MAX_NEWS_BODY_BYTES + 1) } })), /size limit/);
  await assert.rejects(fetchNewsFeed(endpoint, async () => new Response('x'.repeat(MAX_NEWS_BODY_BYTES + 1))), /size limit/);
  await assert.rejects(fetchNewsFeed(endpoint, async () => ({ ok: true, headers: new Headers(), text: async () => 'é'.repeat(MAX_NEWS_BODY_BYTES / 2 + 1) })), /size limit/);
});

test('an unresponsive request times out and aborts within eight seconds', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  let signal;
  const result = fetchNewsFeed('https://example.com/feed', async (_url, options) => {
    signal = options.signal;
    return new Promise(() => {});
  });
  const rejection = assert.rejects(result, /timed out/);
  t.mock.timers.tick(NEWS_TIMEOUT_MS);
  await rejection;
  assert.equal(signal.aborted, true);
});
