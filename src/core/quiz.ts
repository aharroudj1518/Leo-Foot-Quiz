export type Mode = 'mixed' | 'world' | 'clubs' | 'players' | 'rules' | 'legends' | 'portraits' | 'badges' | 'stadiums' | 'connections' | 'squads';
import {dailyDate,isUtcDate,retainDailyProgress} from './daily.ts';
export type Difficulty = 'starter' | 'fan' | 'expert';
export type Question = {
  id: string; prompt: string; answer: string; options: string[]; aliases?: string[];
  ambiguousAliases?: string[];
  explanation: string; hint: string; category: Exclude<Mode, 'mixed'>;
  difficulty: Difficulty; source: string; era: string; premium?: boolean;
  visual?: { kind: 'portrait' | 'badge' | 'stadium'; key: string; description: string };
  assetIds?: string[];
  clubConnections?: string[];
  squadCode?: string;
  squadClue?: {country:string;number:number;club:string;competition?:string};
};
export type Answer = { questionId: string; value: string; correct: boolean; hinted: boolean };
export type Session = {
  id: string; mode: Mode; difficulty: Difficulty; questionIds: string[]; answers: Answer[];
  index: number; seed: string; daily: boolean; family: boolean; completed: boolean;
};
export type Profile = {
  totals?: {rounds:number;answered:number;correct:number};
  dailyCompleted?: string[]; latestDaily?: Session|null;
  version: 1; solved?: string[]; seen: string[]; mistakes: string[]; history: Session[]; session: Session | null;
  largeText: boolean; sound: boolean; timed: boolean; difficulty: Difficulty; reports: { questionId: string; reason: string; at: string }[];
};
export const TIMER_SECONDS = 20;
export const initialProfile = (): Profile => ({ version: 1, solved: [], seen: [], mistakes: [], history: [], session: null, largeText: false, sound: false, timed: false, difficulty: 'fan', reports: [] });
export function careerTotals(profile:Profile){
 if(profile.totals)return profile.totals;
 const sessions=new Map([...profile.history,...(profile.latestDaily?[profile.latestDaily]:[]),...(profile.session?.completed?[profile.session]:[])].map(s=>[s.id,s]));
 const answers=[...sessions.values()].flatMap(s=>s.answers);
 return {rounds:sessions.size,answered:answers.length,correct:answers.filter(a=>a.correct).length};
}
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
export function needsMoreSpecificAnswer(q: Question, value: string) { return (q.ambiguousAliases??[]).some(a=>normalize(a)===normalize(value)); }
export function hash(seed: string) { let h = 2166136261; for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; }
export function shuffled<T>(values: T[], seed: string): T[] {
  const result = [...values]; let h = hash(seed);
  for (let i = result.length - 1; i > 0; i--) { h = (Math.imul(h, 1664525) + 1013904223) >>> 0; const j = h % (i + 1); [result[i], result[j]] = [result[j], result[i]]; }
  return result;
}
export function makeSession(bank: Question[], mode: Mode, difficulty: Difficulty, seen: string[], seed: string, options: { daily?: boolean; family?: boolean; premium?: boolean; revision?: string[] } = {}): Session {
  // The shared daily challenge must not change when a player buys a pack.
  let pool = bank.filter(q => (!q.premium || (options.premium && !options.daily)) && (mode === 'mixed' || q.category === mode));
  if (options.revision) pool = pool.filter(q => options.revision!.includes(q.id));
  if (!options.daily && !options.revision && !['portraits','badges','stadiums','connections','squads'].includes(mode)) pool = pool.filter(q => q.difficulty === difficulty);
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
  if (needsMoreSpecificAnswer(q,value)) return profile;
  const answer = { questionId: q.id, value, correct: correctAnswer(q, value), hinted };
  const mistakes = answer.correct ? profile.mistakes.filter(id => id !== q.id) : Array.from(new Set([...profile.mistakes, q.id]));
  return { ...profile, solved: Array.from(new Set([...(profile.solved ?? []), ...(answer.correct ? [q.id] : [])])), mistakes, seen: Array.from(new Set([...profile.seen, q.id])), session: { ...s, answers: [...s.answers, answer] } };
}
export function advance(profile: Profile): Profile {
  const s = profile.session;
  if (!s || s.completed || s.answers.length <= s.index) return profile;
  if (s.index < s.questionIds.length - 1) return { ...profile, session: { ...s, index: s.index + 1 } };
  const done = { ...s, completed: true };
  const previous=profile.history.find(h=>h.id===done.id)??(profile.latestDaily?.id===done.id?profile.latestDaily:null);
  const old=careerTotals(profile),totals={rounds:old.rounds+(previous?0:1),answered:old.answered+done.answers.length-(previous?.answers.length??0),correct:old.correct+done.answers.filter(a=>a.correct).length-(previous?.answers.filter(a=>a.correct).length??0)};
  const retained=retainDailyProgress({...profile,totals,session:done,history:[...profile.history.filter(h=>h.id!==done.id),done]});
  return {...retained,history:retained.history.slice(-100)};
}
export function validateBank(bank: Question[]): string[] {
  const errors: string[] = []; const ids = new Set<string>();
  for (const q of bank) {
    if (ids.has(q.id)) errors.push(`Duplicate id: ${q.id}`); ids.add(q.id);
    if (q.options.length !== 4 || new Set(q.options.map(normalize)).size !== 4) errors.push(`Invalid options: ${q.id}`);
    if (q.options.filter(o => correctAnswer(q, o)).length !== 1) errors.push(`Expected exactly one correct option: ${q.id}`);
    if ((q.ambiguousAliases??[]).some(a=>correctAnswer(q,a))) errors.push(`Ambiguous alias also accepted: ${q.id}`);
    if (!q.explanation || !q.hint || !q.era || !q.source.startsWith('https://')) errors.push(`Missing provenance: ${q.id}`);
    if (normalize(q.prompt).includes(normalize(q.answer))) errors.push(`Answer leaked in prompt: ${q.id}`);
  }
  return errors;
}
export function hydrate(raw: string | null, bank: Question[]): Profile {
  if (!raw) return initialProfile();
  const p: unknown = JSON.parse(raw);
  if (!record(p) || p.version !== 1 || !strings(p.seen) || !strings(p.mistakes)
    || !Array.isArray(p.history) || !p.history.every(h => validSession(h) && h.completed)
    || !Array.isArray(p.reports) || !p.reports.every(r => record(r) && typeof r.questionId === 'string' && typeof r.reason === 'string' && typeof r.at === 'string')
    || !['starter', 'fan', 'expert'].includes(String(p.difficulty))
    || typeof p.largeText !== 'boolean' || typeof p.sound !== 'boolean'
    || (p.timed !== undefined && typeof p.timed !== 'boolean')) {
    throw new Error('Saved data could not be read. Export it before resetting.');
  }
  if (p.solved !== undefined && !strings(p.solved)) throw new Error('Saved collection progress could not be read.');
  if(p.totals!==undefined&&(!record(p.totals)||![p.totals.rounds,p.totals.answered,p.totals.correct].every(n=>typeof n==='number'&&Number.isSafeInteger(n)&&n>=0)||Number(p.totals.correct)>Number(p.totals.answered)||Number(p.totals.rounds)>Number(p.totals.answered)))throw new Error('Saved career totals could not be read.');
  if(p.dailyCompleted!==undefined&&(!strings(p.dailyCompleted)||!p.dailyCompleted.every(isUtcDate)))throw new Error('Saved daily progress could not be read.');
  if(p.latestDaily!=null&&(!validSession(p.latestDaily)||dailyDate(p.latestDaily)===null))throw new Error('Saved daily result could not be read.');
  const profile = p as unknown as Profile;
  const valid = new Set(bank.map(q => q.id));
  if (!validSession(profile.session) || profile.session.questionIds.some(id => !valid.has(id))) profile.session = null;
  const solved = Array.from(new Set([...(profile.solved ?? []), ...profile.history.flatMap(h => h.answers.filter(a => a.correct).map(a => a.questionId)), ...(profile.session?.answers.filter(a => a.correct).map(a => a.questionId) ?? [])])).filter(id => valid.has(id));
  return retainDailyProgress({ ...initialProfile(), ...profile, solved,totals:careerTotals(profile) });
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function strings(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
}
function validSession(value: unknown): value is Session {
  if (!record(value) || typeof value.id !== 'string' || typeof value.seed !== 'string'
    || !['mixed', 'world', 'clubs', 'players', 'rules', 'legends', 'portraits', 'badges', 'stadiums', 'connections', 'squads'].includes(String(value.mode))
    || !['starter', 'fan', 'expert'].includes(String(value.difficulty))
    || !strings(value.questionIds) || value.questionIds.length === 0
    || new Set(value.questionIds).size !== value.questionIds.length
    || !Array.isArray(value.answers) || !Number.isInteger(value.index)
    || typeof value.index !== 'number' || value.index < 0 || value.index >= value.questionIds.length
    || typeof value.daily !== 'boolean' || typeof value.family !== 'boolean' || typeof value.completed !== 'boolean') return false;
  const ids = value.questionIds;
  if (!value.answers.every((a, i) => record(a) && a.questionId === ids[i]
    && typeof a.value === 'string' && typeof a.correct === 'boolean' && typeof a.hinted === 'boolean')) return false;
  return value.completed
    ? value.index === ids.length - 1 && value.answers.length === ids.length
    : value.answers.length === value.index || value.answers.length === value.index + 1;
}
