export type Mode = 'mixed' | 'world' | 'clubs' | 'players' | 'rules' | 'legends';
export type Difficulty = 'starter' | 'fan' | 'expert';
export type Question = {
  id: string; prompt: string; answer: string; options: string[]; aliases?: string[];
  explanation: string; hint: string; category: Exclude<Mode, 'mixed'>;
  difficulty: Difficulty; source: string; era: string; premium?: boolean;
};
export type Answer = { questionId: string; value: string; correct: boolean; hinted: boolean };
export type Session = {
  id: string; mode: Mode; difficulty: Difficulty; questionIds: string[]; answers: Answer[];
  index: number; seed: string; daily: boolean; family: boolean; completed: boolean;
};
export type Profile = {
  version: 1; seen: string[]; mistakes: string[]; history: Session[]; session: Session | null;
  largeText: boolean; sound: boolean; timed: boolean; difficulty: Difficulty; reports: { questionId: string; reason: string; at: string }[];
};
export const TIMER_SECONDS = 20;
export const initialProfile = (): Profile => ({ version: 1, seen: [], mistakes: [], history: [], session: null, largeText: false, sound: false, timed: false, difficulty: 'fan', reports: [] });
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
  let pool = bank.filter(q => (!q.premium || options.premium) && (mode === 'mixed' || q.category === mode));
  if (options.revision) pool = pool.filter(q => options.revision!.includes(q.id));
  if (!options.daily && !options.revision) pool = pool.filter(q => q.difficulty === difficulty);
  const ordered = shuffled(pool, seed);
  const unseen = options.daily || options.revision ? ordered : ordered.filter(q => !seen.includes(q.id));
  // Finish the unseen pool before offering deliberate revision. No silent repeats to pad a round.
  const selected = (unseen.length ? unseen : ordered).slice(0, options.daily ? 5 : 10);
  if (!selected.length) throw new Error('No questions at this level yet. Try a different level or topic.');
  return { id: seed, mode, difficulty, questionIds: selected.map(q => q.id), answers: [], index: 0, seed, daily: !!options.daily, family: !!options.family, completed: false };
}
export function submit(profile: Profile, bank: Question[], value: string, hinted: boolean): Profile {
  const s = profile.session;
  if (!s || s.completed || s.answers.length > s.index) return profile;
  const q = bank.find(q => q.id === s.questionIds[s.index]);
  if (!q) throw new Error('This question is no longer available. Start a new round.');
  const answer = { questionId: q.id, value, correct: correctAnswer(q, value), hinted };
  const mistakes = answer.correct ? profile.mistakes.filter(id => id !== q.id) : Array.from(new Set([...profile.mistakes, q.id]));
  return { ...profile, mistakes, seen: Array.from(new Set([...profile.seen, q.id])), session: { ...s, answers: [...s.answers, answer] } };
}
export function advance(profile: Profile): Profile {
  const s = profile.session;
  if (!s || s.completed || s.answers.length <= s.index) return profile;
  if (s.index < s.questionIds.length - 1) return { ...profile, session: { ...s, index: s.index + 1 } };
  const done = { ...s, completed: true };
  return { ...profile, session: done, history: [...profile.history.filter(h => h.id !== done.id), done].slice(-100) };
}
export function validateBank(bank: Question[]): string[] {
  const errors: string[] = []; const ids = new Set<string>();
  for (const q of bank) {
    if (ids.has(q.id)) errors.push(`Duplicate id: ${q.id}`); ids.add(q.id);
    if (q.options.length !== 4 || new Set(q.options.map(normalize)).size !== 4) errors.push(`Invalid options: ${q.id}`);
    if (q.options.filter(o => correctAnswer(q, o)).length !== 1) errors.push(`Expected exactly one correct option: ${q.id}`);
    if (!q.explanation || !q.hint || !q.era || !q.source.startsWith('https://')) errors.push(`Missing provenance: ${q.id}`);
    if (normalize(q.prompt).includes(normalize(q.answer))) errors.push(`Answer leaked in prompt: ${q.id}`);
  }
  return errors;
}
export function hydrate(raw: string | null, bank: Question[]): Profile {
  if (!raw) return initialProfile();
  const p = JSON.parse(raw) as Profile;
  if (p.version !== 1 || !Array.isArray(p.seen) || !Array.isArray(p.history) || !Array.isArray(p.mistakes) || !Array.isArray(p.reports)) throw new Error('Saved data could not be read. Export it before resetting.');
  const valid = new Set(bank.map(q => q.id));
  if (p.session && (!Array.isArray(p.session.questionIds) || !Array.isArray(p.session.answers) || p.session.questionIds.some(id => !valid.has(id)) || p.session.index < 0 || p.session.index >= p.session.questionIds.length)) p.session = null;
  return { ...initialProfile(), ...p };
}
