export type Mode = 'mixed' | 'world' | 'clubs' | 'players' | 'rules' | 'legends';
export type Difficulty = 'starter' | 'fan' | 'expert';
export type Question = {
  id: string; prompt: string; answer: string; options: string[]; aliases?: string[];
  explanation: string; hint: string; category: Exclude<Mode, 'mixed'>;
  difficulty: Difficulty; source: string; era: string; premium?: boolean;
  sourceName?: string; publishedAt?: string; updatedAt?: string;
};
export type Answer = { questionId: string; value: string; correct: boolean; hinted: boolean };
export type Session = {
  id: string; mode: Mode; difficulty: Difficulty; questionIds: string[]; answers: Answer[];
  index: number; seed: string; daily: boolean; family: boolean; completed: boolean;
  practice?: boolean; hintUsed?: boolean;
  edition?: { id: string; title: string; publishedAt: string };
  questionSnapshot?: Question[];
};
export type Profile = {
  version: 1; seen: string[]; mistakes: string[]; history: Session[]; session: Session | null;
  dailyCompletedDates: string[];
  largeText: boolean; sound: boolean; timed: boolean; difficulty: Difficulty; reports: { questionId: string; reason: string; at: string }[];
};
export const TIMER_SECONDS = 20;
export const initialProfile = (): Profile => ({ version: 1, seen: [], mistakes: [], history: [], session: null, dailyCompletedDates: [], largeText: false, sound: false, timed: false, difficulty: 'fan', reports: [] });
export function mastery(profile: Profile, bank: Question[]): { category: Question['category']; correct: number; total: number }[] {
  const byId = new Map(bank.map(q => [q.id, q.category]));
  const tally = new Map<Question['category'], { correct: number; total: number }>();
  for (const a of profile.history.flatMap(h => h.answers)) {
    const c = byId.get(a.questionId); if (!c) continue;
    const t = tally.get(c) ?? { correct: 0, total: 0 }; t.total++; if (a.correct) t.correct++; tally.set(c, t);
  }
  return [...tally].map(([category, t]) => ({ category, ...t })).sort((a, b) => b.total - a.total);
}
export function normalize(value: string) { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[’']/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim(); }
export function correctAnswer(q: Question, value: string) { return [q.answer, ...(q.aliases ?? [])].some(a => normalize(a) === normalize(value)); }
export function hash(seed: string) { let h = 2166136261; for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; }
export function shuffled<T>(values: T[], seed: string): T[] {
  const result = [...values]; let h = hash(seed);
  for (let i = result.length - 1; i > 0; i--) { h = (Math.imul(h, 1664525) + 1013904223) >>> 0; const j = h % (i + 1); [result[i], result[j]] = [result[j], result[i]]; }
  return result;
}
export function makeSession(bank: Question[], mode: Mode, difficulty: Difficulty, seen: string[], seed: string, options: { daily?: boolean; family?: boolean; premium?: boolean; revision?: string[] } = {}): Session {
  // Everyone gets the same free daily challenge, including subscribers and topic players.
  let pool = options.daily
    ? bank.filter(q => !q.premium).sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
    : bank.filter(q => (!q.premium || options.premium) && (mode === 'mixed' || q.category === mode));
  if (options.revision && !options.daily) pool = pool.filter(q => options.revision!.includes(q.id));
  if (!options.daily && !options.revision) pool = pool.filter(q => q.difficulty === difficulty);
  const ordered = shuffled(pool, seed);
  const unseen = options.daily || options.revision ? ordered : ordered.filter(q => !seen.includes(q.id));
  // Finish the unseen pool before offering deliberate revision. No silent repeats to pad a round.
  const selected = (unseen.length ? unseen : ordered).slice(0, options.daily ? 5 : 10);
  if (!selected.length) throw new Error('No questions at this level yet. Try a different level or topic.');
  return { id: seed, mode: options.daily ? 'mixed' : mode, difficulty, questionIds: selected.map(q => q.id), answers: [], index: 0, seed, daily: !!options.daily, family: !!options.family, completed: false, practice: !options.daily && !!options.revision, hintUsed: false };
}
export function submit(profile: Profile, bank: Question[], value: string, hinted: boolean): Profile {
  const s = profile.session;
  if (!s || s.completed || s.answers.length > s.index) return profile;
  const q = bank.find(q => q.id === s.questionIds[s.index]);
  if (!q) throw new Error('This question is no longer available. Start a new round.');
  const answer = { questionId: q.id, value, correct: correctAnswer(q, value), hinted: hinted || !!s.hintUsed };
  const mistakes = answer.correct ? profile.mistakes.filter(id => id !== q.id) : Array.from(new Set([...profile.mistakes, q.id]));
  return { ...profile, mistakes, seen: Array.from(new Set([...profile.seen, q.id])), session: { ...s, answers: [...s.answers, answer] } };
}
export function advance(profile: Profile): Profile {
  const s = profile.session;
  if (!s || s.completed || s.answers.length <= s.index) return profile;
  if (s.index < s.questionIds.length - 1) return { ...profile, session: { ...s, index: s.index + 1, hintUsed: false } };
  const done = { ...s, completed: true };
  const history = [...profile.history.filter(h => h.id !== done.id), done];
  return { ...profile, session: done, history: history.slice(-100), dailyCompletedDates: completedDailyDates(history, profile.dailyCompletedDates) };
}
const modes: Mode[] = ['mixed', 'world', 'clubs', 'players', 'rules', 'legends'];
const difficulties: Difficulty[] = ['starter', 'fan', 'expert'];
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const isText = (value: unknown, max = 10000): value is string => typeof value === 'string' && value.trim().length > 0 && value.length <= max;
const isStrings = (value: unknown, maxItems: number, maxLength = 300): value is string[] => Array.isArray(value) && value.length <= maxItems && value.every(item => isText(item, maxLength));
const isOptionalBoolean = (value: unknown): value is boolean | undefined => value === undefined || typeof value === 'boolean';
const isMode = (value: unknown): value is Mode => typeof value === 'string' && modes.includes(value as Mode);
const isDifficulty = (value: unknown): value is Difficulty => typeof value === 'string' && difficulties.includes(value as Difficulty);
function isDate(value: unknown): value is string {
  if (!isText(value, 50) || !/^\d{4}-\d{2}-\d{2}(?:T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,9})?(?:Z|[+-]\d{2}:\d{2}))?$/.test(value)
    || !Number.isFinite(Date.parse(value))) return false;
  const day = value.slice(0, 10);
  return new Date(`${day}T00:00:00Z`).toISOString().slice(0, 10) === day;
}
const isUtcDay = (value: unknown): value is string => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && isDate(value);
function completedDailyDates(history: Session[], dates: string[] = []): string[] {
  const saved = history.filter(s => s.daily && s.completed && /^daily-\d{4}-\d{2}-\d{2}$/.test(s.seed) && isUtcDay(s.seed.slice(6))).map(s => s.seed.slice(6));
  return [...new Set([...dates.filter(isUtcDay), ...saved])].sort().slice(-10000);
}
function isHttpsUrl(value: unknown): value is string {
  if (!isText(value, 2048)) return false;
  try { const url = new URL(value); return url.protocol === 'https:' && !!url.hostname && !url.username && !url.password; } catch { return false; }
}
function isQuestion(value: unknown): value is Question {
  return isRecord(value) && isText(value.id, 300) && isText(value.prompt) && isText(value.answer, 1000)
    && isStrings(value.options, 4, 1000) && (value.aliases === undefined || isStrings(value.aliases, 30, 1000))
    && isText(value.explanation) && isText(value.hint) && isMode(value.category) && value.category !== 'mixed'
    && isDifficulty(value.difficulty) && isText(value.source, 2048) && isText(value.era, 300)
    && isOptionalBoolean(value.premium) && (value.sourceName === undefined || isText(value.sourceName, 300))
    && (value.publishedAt === undefined || isDate(value.publishedAt)) && (value.updatedAt === undefined || isDate(value.updatedAt));
}
export function validateBank(bank: unknown): string[] {
  const errors: string[] = []; const ids = new Set<string>();
  if (!Array.isArray(bank) || bank.length > 100000) return ['Invalid question bank'];
  for (const [index, q] of bank.entries()) {
    if (!isQuestion(q)) { errors.push(`Invalid question shape: ${isRecord(q) && isText(q.id, 300) ? q.id : index}`); continue; }
    if (ids.has(q.id)) errors.push(`Duplicate id: ${q.id}`); ids.add(q.id);
    if (q.options.length !== 4 || new Set(q.options.map(normalize)).size !== 4) errors.push(`Invalid options: ${q.id}`);
    if (q.options.filter(o => correctAnswer(q, o)).length !== 1) errors.push(`Expected exactly one correct option: ${q.id}`);
    if (!isHttpsUrl(q.source)) errors.push(`Missing provenance: ${q.id}`);
    if (normalize(q.prompt).includes(normalize(q.answer))) errors.push(`Answer leaked in prompt: ${q.id}`);
  }
  return errors;
}
function readSession(value: unknown): Session | null {
  if (!isRecord(value) || !isText(value.id, 300) || !isText(value.seed, 300)
    || !isMode(value.mode) || !isDifficulty(value.difficulty)
    || !isStrings(value.questionIds, 100) || !value.questionIds.length || new Set(value.questionIds).size !== value.questionIds.length
    || !Array.isArray(value.answers) || value.answers.length > value.questionIds.length
    || typeof value.index !== 'number' || !Number.isInteger(value.index) || value.index < 0 || value.index >= value.questionIds.length
    || !isOptionalBoolean(value.daily) || !isOptionalBoolean(value.family) || !isOptionalBoolean(value.practice) || !isOptionalBoolean(value.hintUsed)
    || typeof value.completed !== 'boolean') return null;
  const answers: Answer[] = [];
  for (const [index, answer] of value.answers.entries()) {
    if (!isRecord(answer) || answer.questionId !== value.questionIds[index] || typeof answer.value !== 'string' || answer.value.length > 10000
      || typeof answer.correct !== 'boolean' || !isOptionalBoolean(answer.hinted)) return null;
    answers.push({ questionId: value.questionIds[index], value: answer.value, correct: answer.correct, hinted: answer.hinted ?? false });
  }
  if (value.completed
    ? answers.length !== value.questionIds.length || value.index !== value.questionIds.length - 1
    : answers.length !== value.index && answers.length !== value.index + 1) return null;
  let edition: Session['edition'];
  if (value.edition !== undefined) {
    const e = value.edition;
    if (!isRecord(e) || !isText(e.id, 300) || !isText(e.title, 300) || !isDate(e.publishedAt)) return null;
    edition = { id: e.id, title: e.title, publishedAt: e.publishedAt };
  }
  let questionSnapshot: Question[] | undefined;
  if (value.questionSnapshot !== undefined) {
    if (!Array.isArray(value.questionSnapshot) || value.questionSnapshot.length > 100 || validateBank(value.questionSnapshot).length) return null;
    questionSnapshot = value.questionSnapshot as Question[];
  }
  return {
    id: value.id, seed: value.seed, mode: value.mode, difficulty: value.difficulty,
    questionIds: value.questionIds, answers, index: value.index,
    daily: value.daily ?? false, family: value.family ?? false, completed: value.completed,
    practice: value.practice ?? false, hintUsed: value.hintUsed ?? false, ...(edition ? { edition } : {}), ...(questionSnapshot ? { questionSnapshot } : {}),
  };
}
// Current corrections win for new rounds. Saved editions fill gaps; an active round keeps its original wording.
export function mergeQuestionBank(base: Question[], history: Session[], active: Session | null): Question[] {
  const byId = new Map(base.map(q => [q.id, q]));
  for (const session of [...history].reverse()) {
    for (const question of session.questionSnapshot ?? []) if (!byId.has(question.id)) byId.set(question.id, question);
  }
  for (const question of active?.questionSnapshot ?? []) byId.set(question.id, question);
  return [...byId.values()];
}
export function dailyStreak(history: Session[], today: string, completedDates: string[] = []): number {
  if (!isUtcDay(today)) return 0;
  const completedDays = new Set(completedDailyDates(history, completedDates));
  const dayMs = 86400000;
  let day = Date.parse(`${today}T00:00:00Z`);
  const dateAt = (time: number) => new Date(time).toISOString().slice(0, 10);
  if (!completedDays.has(dateAt(day))) day -= dayMs;
  let streak = 0;
  while (completedDays.has(dateAt(day))) { streak++; day -= dayMs; }
  return streak;
}
export function hydrate(raw: string | null, bank: Question[]): Profile {
  if (!raw) return initialProfile();
  const unreadable = () => new Error('Saved data could not be read. Export it before resetting.');
  if (raw.length > 10000000) throw unreadable();
  const p: unknown = JSON.parse(raw);
  if (!isRecord(p) || p.version !== 1 || !isStrings(p.seen, 100000) || !isStrings(p.mistakes, 100000)
    || !Array.isArray(p.history) || p.history.length > 100 || !Array.isArray(p.reports) || p.reports.length > 10000
    || (p.dailyCompletedDates !== undefined && (!isStrings(p.dailyCompletedDates, 10000, 10) || !p.dailyCompletedDates.every(isUtcDay)))
    || !isOptionalBoolean(p.largeText) || !isOptionalBoolean(p.sound) || !isOptionalBoolean(p.timed)
    || (p.difficulty !== undefined && !isDifficulty(p.difficulty))) throw unreadable();
  const history = p.history.map(saved => {
    const session = readSession(saved);
    if (!session || !session.completed) throw unreadable();
    return session;
  });
  const reports = p.reports.map(report => {
    if (!isRecord(report) || !isText(report.questionId, 300) || !isText(report.reason, 10000) || !isDate(report.at)) throw unreadable();
    return { questionId: report.questionId, reason: report.reason, at: report.at };
  });
  let session = readSession(p.session);
  const valid = new Set(mergeQuestionBank(bank, history, session).map(q => q.id));
  if (session && session.questionIds.some(id => !valid.has(id))) session = null;
  return {
    version: 1, seen: p.seen, mistakes: p.mistakes, history, reports, session,
    dailyCompletedDates: completedDailyDates(history, p.dailyCompletedDates),
    largeText: p.largeText ?? false, sound: p.sound ?? false, timed: p.timed ?? false,
    difficulty: p.difficulty ?? 'fan',
  };
}
