import type { Question } from './quiz';

export type NewsQuestion = Question & { sourceName: string; publishedAt?: string; updatedAt?: string };
export type NewsEdition = {
  id: string;
  title: string;
  summary: string;
  publishedAt: string;
  expiresAt: string;
  questions: NewsQuestion[];
};
export type NewsFeed = { version: 1; editions: NewsEdition[] };
export type EditionStatus = 'upcoming' | 'current' | 'archive';

export const MAX_NEWS_EDITIONS = 12;
export const NEWS_QUESTIONS_PER_EDITION = 5;
const MAX_CURRENT_AGE = 14 * 24 * 60 * 60 * 1000;
const categories = new Set(['world', 'clubs', 'players', 'rules', 'legends']);
const difficulties = new Set(['starter', 'fan', 'expert']);

function invalid(field: string): never {
  // Field paths are generated here. Do not display untrusted feed content in errors.
  throw new Error(`Invalid news feed: ${field}.`);
}

function object(value: unknown, field: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) invalid(field);
  return value as Record<string, unknown>;
}

function text(value: unknown, field: string, max: number): string {
  if (typeof value !== 'string' || !value.trim() || value.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)) invalid(field);
  return value;
}

function identifier(value: unknown, field: string, newsQuestion = false): string {
  const result = text(value, field, 96);
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(result) || (newsQuestion && !/^news-[a-zA-Z0-9]/.test(result))) invalid(field);
  return result;
}

function isoDate(value: unknown, field: string, allowDateOnly = false): string {
  const result = text(value, field, 30);
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(result);
  if (!(allowDateOnly && dateOnly) && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(result)) invalid(field);
  const parsed = new Date(result);
  if (!Number.isFinite(parsed.getTime())) invalid(field);
  // Date.parse alone accepts invalid dates such as February 30.
  const expected = dateOnly ? `${result}T00:00:00.000Z` : result.length === 20 ? result.replace(/Z$/, '.000Z') : result;
  if (parsed.toISOString() !== expected) invalid(field);
  return result;
}

function sourceURL(value: unknown, field: string): string {
  const result = text(value, field, 2048);
  try {
    const url = new URL(result);
    if (url.protocol !== 'https:' || url.username || url.password || url.pathname === '/' || !url.hostname) invalid(field);
  } catch {
    invalid(field);
  }
  return result;
}

// Match the quiz engine without a runtime import, so validation also runs in the
// dependency-free publishing checks. Only one option may match answer/aliases.
function normalized(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[’']/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

function question(value: unknown, field: string, publishedAt: string): NewsQuestion {
  const raw = object(value, field);
  const id = identifier(raw.id, `${field}.id`, true);
  const prompt = text(raw.prompt, `${field}.prompt`, 400);
  const answer = text(raw.answer, `${field}.answer`, 160);
  if (!Array.isArray(raw.options) || raw.options.length !== 4) invalid(`${field}.options`);
  const options = raw.options.map((value, index) => text(value, `${field}.options[${index}]`, 160));
  if (options.some(value => !normalized(value)) || new Set(options.map(normalized)).size !== 4) invalid(`${field}.options`);
  let aliases: string[] | undefined;
  if (raw.aliases !== undefined) {
    if (!Array.isArray(raw.aliases) || raw.aliases.length > 10) invalid(`${field}.aliases`);
    aliases = raw.aliases.map((value, index) => text(value, `${field}.aliases[${index}]`, 160));
  }
  const acceptedAnswers = [answer, ...(aliases ?? [])].map(normalized);
  if (acceptedAnswers.some(value => !value) || options.filter(option => acceptedAnswers.includes(normalized(option))).length !== 1) invalid(`${field}.answer`);
  if (normalized(prompt).includes(normalized(answer))) invalid(`${field}.prompt leaks answer`);
  const category = text(raw.category, `${field}.category`, 16);
  const difficulty = text(raw.difficulty, `${field}.difficulty`, 16);
  if (!categories.has(category)) invalid(`${field}.category`);
  if (!difficulties.has(difficulty)) invalid(`${field}.difficulty`);
  if (raw.premium !== undefined && typeof raw.premium !== 'boolean') invalid(`${field}.premium`);
  if (raw.premium === true) invalid(`${field}.news questions must be free`);
  if (raw.publishedAt === undefined && raw.updatedAt === undefined) invalid(`${field}.source date is required`);
  const articleDate = raw.publishedAt === undefined ? undefined : isoDate(raw.publishedAt, `${field}.publishedAt`, true);
  const updatedAt = raw.updatedAt === undefined ? undefined : isoDate(raw.updatedAt, `${field}.updatedAt`, true);
  for (const date of [articleDate, updatedAt]) {
    if (date !== undefined && Date.parse(date) > Date.parse(publishedAt)) invalid(`${field}.source date is after edition publication`);
  }
  if (articleDate && updatedAt && Date.parse(updatedAt) < Date.parse(articleDate)) invalid(`${field}.updatedAt precedes publication`);
  return {
    id, prompt, answer, options,
    ...(aliases === undefined ? {} : { aliases }),
    explanation: text(raw.explanation, `${field}.explanation`, 1200),
    hint: text(raw.hint, `${field}.hint`, 300),
    category: category as Question['category'],
    difficulty: difficulty as Question['difficulty'],
    source: sourceURL(raw.source, `${field}.source`),
    sourceName: text(raw.sourceName, `${field}.sourceName`, 100),
    ...(articleDate === undefined ? {} : { publishedAt: articleDate }),
    ...(updatedAt === undefined ? {} : { updatedAt }),
    era: text(raw.era, `${field}.era`, 100),
    ...(raw.premium === undefined ? {} : { premium: raw.premium as boolean }),
  };
}

/** Validate all external or bundled feed data before it can reach a session. */
export function parseNewsFeed(value: unknown): NewsFeed {
  const raw = object(value, 'root');
  if (raw.version !== 1) invalid('version');
  if (!Array.isArray(raw.editions) || raw.editions.length > MAX_NEWS_EDITIONS) invalid('editions');
  const editionIds = new Set<string>();
  const questionIds = new Set<string>();
  const editions = raw.editions.map((entry, index): NewsEdition => {
    const field = `editions[${index}]`;
    const edition = object(entry, field);
    const id = identifier(edition.id, `${field}.id`);
    if (editionIds.has(id)) invalid(`${field}.id is duplicated`);
    editionIds.add(id);
    const publishedAt = isoDate(edition.publishedAt, `${field}.publishedAt`);
    const expiresAt = isoDate(edition.expiresAt, `${field}.expiresAt`);
    const lifetime = Date.parse(expiresAt) - Date.parse(publishedAt);
    if (lifetime <= 0 || lifetime > MAX_CURRENT_AGE) invalid(`${field}.expiry must be within 14 days`);
    if (!Array.isArray(edition.questions) || edition.questions.length !== NEWS_QUESTIONS_PER_EDITION) invalid(`${field}.questions must contain five questions`);
    const questions = edition.questions.map((entry, questionIndex) => {
      const result = question(entry, `${field}.questions[${questionIndex}]`, publishedAt);
      if (questionIds.has(result.id)) invalid(`${field}.questions[${questionIndex}].id is duplicated`);
      questionIds.add(result.id);
      return result;
    });
    return {
      id,
      title: text(edition.title, `${field}.title`, 120),
      summary: text(edition.summary, `${field}.summary`, 500),
      publishedAt, expiresAt, questions,
    };
  });
  return { version: 1, editions };
}

export function getEditionStatus(edition: NewsEdition, now: number | Date = Date.now()): EditionStatus {
  const timestamp = Number(now);
  if (!Number.isFinite(timestamp)) throw new Error('A valid news date is required.');
  if (timestamp < Date.parse(edition.publishedAt)) return 'upcoming';
  return timestamp < Date.parse(edition.expiresAt) ? 'current' : 'archive';
}

/** An expired edition remains playable as an explicitly labelled archive. */
export function selectLatestEdition(feed: NewsFeed, now: number | Date = Date.now()): NewsEdition | null {
  return feed.editions
    .filter(edition => getEditionStatus(edition, now) !== 'upcoming')
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt) || a.id.localeCompare(b.id))[0] ?? null;
}

/** Updates replace the feed, while an existing edition must remain immutable.
 * Sessions keep their own question snapshots, so publishers may remove editions.
 * Corrections require new edition AND question IDs to preserve existing results.
 */
export function mergeFeed(previous: NewsFeed, incoming: NewsFeed): NewsFeed {
  const before = parseNewsFeed(previous);
  const next = parseNewsFeed(incoming);
  const previousEditions = new Map(before.editions.map(edition => [edition.id, edition]));
  const previousQuestions = new Map(before.editions.flatMap(edition => edition.questions.map(item => [item.id, { editionId: edition.id, question: item }] as const)));
  for (const edition of next.editions) {
    const existing = previousEditions.get(edition.id);
    if (existing && JSON.stringify(existing) !== JSON.stringify(edition)) throw new Error('Published news editions cannot be edited. Publish corrections with new edition and question IDs.');
    for (const item of edition.questions) {
      const oldQuestion = previousQuestions.get(item.id);
      if (oldQuestion && (oldQuestion.editionId !== edition.id || JSON.stringify(oldQuestion.question) !== JSON.stringify(item))) throw new Error('Published news question IDs cannot be reused. Publish corrections with new IDs.');
    }
  }
  return next;
}
