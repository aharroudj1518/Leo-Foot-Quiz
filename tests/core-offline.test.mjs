import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
  advance, correctAnswer, dailyStreak, hydrate, initialProfile, makeSession,
  mastery, mergeQuestionBank, normalize, submit, validateBank,
} from '../src/core/quiz.ts';

const bank = JSON.parse(readFileSync(new URL('../src/content/questions.json', import.meta.url), 'utf8'));
const restore = profile => hydrate(JSON.stringify(profile), bank);
function complete(session, questions = bank) {
  let profile = { ...initialProfile(), session };
  for (const id of session.questionIds) {
    const q = questions.find(q => q.id === id);
    profile = advance(submit(profile, questions, q.answer, false));
  }
  return profile;
}
const daily = day => complete(makeSession(bank, 'mixed', 'fan', [], `daily-${day}`, { daily: true })).session;

test('the shipped bank has valid answers, options and sources', () => {
  assert.deepEqual(validateBank(bank), []);
  const q = bank.find(q => q.answer === 'Manchester United');
  assert.equal(correctAnswer(q, '  Man United '), true);
  assert.equal(correctAnswer(q, 'Manchester City'), false);
  assert.equal(normalize('Modrić'), 'modric');
});

test('untrusted question shapes and misleading options fail validation without crashing', () => {
  for (const bad of [null, {}, 'bank', [null], [{ ...bank[0], options: null }], [{ ...bank[0], category: 'unknown' }]]) {
    assert.ok(validateBank(bad).length);
  }
  assert.ok(validateBank([{ ...bank[0], options: ['Uruguay', 'Úruguay', 'Brazil', 'France'] }]).length);
  assert.ok(validateBank([{ ...bank[0], prompt: 'Is the answer Uruguay?' }]).length);
  assert.ok(validateBank([{ ...bank[0], source: 'https://', publishedAt: '2026-02-30' }]).length);
  assert.ok(validateBank([{ ...bank[0], updatedAt: '2026-10-05T24:00:00Z' }]).length);
  assert.deepEqual(validateBank([{ ...bank[0], updatedAt: '2026-10-05T23:00:00-03:00' }]), []);
});

test('daily opponents get identical free questions regardless of settings, bank order or entitlement', () => {
  const expected = makeSession(bank, 'mixed', 'starter', [], 'daily-2026-10-05', { daily: true });
  const other = makeSession([...bank].reverse(), 'clubs', 'expert', bank.map(q => q.id), 'daily-2026-10-05', {
    daily: true, premium: true, revision: [bank[0].id],
  });
  assert.deepEqual(other.questionIds, expected.questionIds);
  assert.equal(other.mode, 'mixed');
  assert.equal(other.practice, false);
  assert.equal(other.questionIds.length, 5);
  assert.ok(other.questionIds.every(id => !bank.find(q => q.id === id).premium));
  assert.deepEqual(bank[0].id, 'world-1930');
});

test('ordinary rounds finish unseen questions without padding with repeats', () => {
  const available = bank.filter(q => !q.premium && q.difficulty === 'fan');
  const seen = available.slice(1).map(q => q.id);
  assert.deepEqual(makeSession(bank, 'mixed', 'fan', seen, 'fresh').questionIds, [available[0].id]);
  assert.ok(makeSession(bank, 'mixed', 'fan', available.map(q => q.id), 'again').questionIds.length > 0);
  assert.throws(() => makeSession(bank, 'legends', 'fan', [], 'empty'));
});

test('revision is marked as practice and can span difficulties', () => {
  const q = bank.find(q => q.difficulty === 'expert' && !q.premium);
  const session = makeSession(bank, 'mixed', 'starter', [], 'revision', { revision: [q.id] });
  assert.equal(session.practice, true);
  assert.deepEqual(session.questionIds, [q.id]);
  const profile = submit({ ...initialProfile(), mistakes: [q.id], session }, bank, q.answer, true);
  assert.deepEqual(profile.mistakes, []);
});

test('submission and completion remain idempotent across save and resume', () => {
  let profile = { ...initialProfile(), session: makeSession(bank, 'rules', 'starter', [], 'resume') };
  assert.equal(advance(profile), profile);
  const first = bank.find(q => q.id === profile.session.questionIds[0]);
  profile = submit(profile, bank, first.answer, false);
  assert.equal(submit(profile, bank, 'wrong', false), profile);
  profile = restore(profile);
  assert.equal(profile.session.answers.length, 1);
  profile = advance(profile);
  assert.equal(profile.session.index, 1);
  while (!profile.session.completed) {
    const q = bank.find(q => q.id === profile.session.questionIds[profile.session.index]);
    profile = advance(submit(profile, bank, q.answer, false));
  }
  assert.equal(profile.history.length, 1);
  assert.equal(advance(profile), profile);
  assert.equal(submit(profile, bank, 'wrong', false), profile);
  assert.deepEqual(restore(profile).history[0], profile.history[0]);
  assert.deepEqual(mastery(profile, bank), [{ category: 'rules', correct: profile.session.questionIds.length, total: profile.session.questionIds.length }]);
});

test('missing legacy preferences and hint flags get safe defaults', () => {
  const profile = complete(makeSession(bank, 'rules', 'starter', [], 'legacy'));
  delete profile.timed; delete profile.sound; delete profile.largeText; delete profile.difficulty;
  delete profile.session.daily; delete profile.session.family; delete profile.session.practice;
  for (const answer of profile.session.answers) delete answer.hinted;
  const restored = restore(profile);
  assert.equal(restored.timed, false);
  assert.equal(restored.sound, false);
  assert.equal(restored.largeText, false);
  assert.equal(restored.difficulty, 'fan');
  assert.equal(restored.session.daily, false);
  assert.equal(restored.session.family, false);
  assert.equal(restored.session.practice, false);
  assert.equal(restored.session.hintUsed, false);
  assert.ok(restored.session.answers.every(a => a.hinted === false));
});

test('bad profile preferences, collections and reports trigger recovery', () => {
  assert.throws(() => hydrate('{broken', bank));
  for (const bad of [null, [], { ...initialProfile(), version: 2 }, { ...initialProfile(), seen: [null] },
    { ...initialProfile(), mistakes: [3] }, { ...initialProfile(), timed: 'yes' }, { ...initialProfile(), difficulty: 'impossible' },
    { ...initialProfile(), reports: [null] }, { ...initialProfile(), reports: [{ questionId: bank[0].id, reason: {}, at: '2026-10-05' }] },
    { ...initialProfile(), reports: [{ questionId: bank[0].id, reason: 'Wrong fact', at: '2026-02-30' }] }]) {
    assert.throws(() => restore(bad), /could not be read/);
  }
  assert.deepEqual(hydrate(null, bank), initialProfile());
});

test('corrupt history is never silently erased', () => {
  const done = daily('2026-10-05');
  for (const saved of [null, { ...done, mode: 'bogus' }, { ...done, completed: false },
    { ...done, answers: [null] }, { ...done, answers: done.answers.map((a, i) => i === 0 ? { ...a, correct: 'true' } : a) },
    { ...done, answers: done.answers.slice(1) }, { ...done, questionIds: [done.questionIds[0], done.questionIds[0]] },
    { ...done, edition: { id: 'edition', title: 'News', publishedAt: 'yesterday' } },
    { ...done, questionSnapshot: [null] }]) {
    assert.throws(() => restore({ ...initialProfile(), history: [saved] }), /could not be read/);
  }
});

test('invalid active sessions are discarded without losing other progress', () => {
  const valid = makeSession(bank, 'rules', 'starter', [], 'bad-active');
  for (const session of [null, {}, { ...valid, index: 0.5 }, { ...valid, index: 999 },
    { ...valid, daily: 'yes' }, { ...valid, hintUsed: 'yes' }, { ...valid, questionIds: [] }, { ...valid, answers: [null] },
    { ...valid, questionIds: ['gone-question'] }, { ...valid, answers: [{ questionId: 'another-id', value: '', correct: false, hinted: false }] },
    { ...valid, questionSnapshot: [null] }]) {
    const result = restore({ ...initialProfile(), session, seen: ['old-id'], mistakes: ['old-id'] });
    assert.equal(result.session, null);
    assert.deepEqual(result.seen, ['old-id']);
    assert.deepEqual(result.mistakes, ['old-id']);
  }
});

test('history keeps unknown question IDs when questions leave the bank', () => {
  const old = complete(makeSession(bank, 'mixed', 'fan', [], 'old', { revision: [bank[0].id] })).session;
  old.questionIds = ['retired-id']; old.answers[0].questionId = 'retired-id';
  const restored = restore({ ...initialProfile(), history: [old], mistakes: ['retired-id'] });
  assert.equal(restored.history[0].questionIds[0], 'retired-id');
  assert.deepEqual(restored.mistakes, ['retired-id']);
});

test('oversized saved collections trigger recovery', () => {
  assert.throws(() => restore({ ...initialProfile(), history: Array(101).fill(daily('2026-10-05')) }), /could not be read/);
  assert.throws(() => restore({ ...initialProfile(), seen: Array(100001).fill('id') }), /could not be read/);
});

test('saved news questions survive updates, resume correctly and remain available for revision', () => {
  const original = { ...bank[0], id: 'edition-question', sourceName: 'FIFA', publishedAt: '2026-10-05T09:00:00Z' };
  const session = makeSession([original], 'mixed', 'expert', [], 'edition-1');
  session.edition = { id: 'edition-1', title: 'The football briefing', publishedAt: original.publishedAt };
  session.questionSnapshot = [original];
  const profile = restore({ ...initialProfile(), session });
  assert.equal(profile.session.edition.title, 'The football briefing');
  const updated = { ...original, answer: 'Brazil', explanation: 'Updated article.' };
  const merged = mergeQuestionBank([...bank, updated], profile.history, profile.session);
  assert.equal(merged.find(q => q.id === original.id).answer, original.answer);
  const finished = complete(profile.session, merged);
  const resumed = restore({ ...finished, session: null });
  const revisionBank = mergeQuestionBank(bank, resumed.history, null);
  assert.ok(revisionBank.some(q => q.id === original.id));
  const practice = makeSession(revisionBank, 'mixed', 'starter', [], 'revision', { revision: [original.id] });
  assert.deepEqual(restore({ ...resumed, session: practice }).session.questionIds, [original.id]);
});

test('the active question snapshot takes priority over history and the current bank', () => {
  const question = bank[0];
  const session = makeSession(bank, 'mixed', 'fan', [], 'snapshot', { revision: [question.id] });
  const older = { ...session, questionSnapshot: [{ ...question, explanation: 'Older saved wording.' }] };
  const active = { ...session, questionSnapshot: [{ ...question, explanation: 'Active saved wording.' }] };
  const merged = mergeQuestionBank(bank, [older], active);
  assert.equal(merged.length, bank.length);
  assert.equal(merged.find(q => q.id === question.id).explanation, 'Active saved wording.');
  assert.notEqual(bank[0].explanation, 'Active saved wording.');
});

test('historical revisions never override corrected classic answers in new rounds', () => {
  const original = bank[0];
  const corrected = { ...original, answer: 'Brazil', explanation: 'Corrected test fixture.' };
  const old = complete(makeSession([original], 'mixed', 'expert', [], 'older'), [original]).session;
  old.questionSnapshot = [original];
  const freshBank = mergeQuestionBank([corrected], [old], null);
  const freshSession = makeSession(freshBank, 'mixed', 'expert', [], 'fresh');
  assert.equal(submit({ ...initialProfile(), session: freshSession }, freshBank, corrected.answer, false).session.answers[0].correct, true);
  const active = { ...makeSession([original], 'mixed', 'expert', [], 'active'), questionSnapshot: [original] };
  const activeBank = mergeQuestionBank([corrected], [old], active);
  assert.equal(submit({ ...initialProfile(), session: active }, activeBank, original.answer, false).session.answers[0].correct, true);
});

test('the most recent historical snapshot restores news questions absent from the current bank', () => {
  const oldQuestion = { ...bank[0], id: 'news-archived', explanation: 'Earlier snapshot.' };
  const latestQuestion = { ...oldQuestion, explanation: 'Most recent snapshot.' };
  const old = { ...makeSession([oldQuestion], 'mixed', 'expert', [], 'older'), questionSnapshot: [oldQuestion] };
  const recent = { ...old, id: 'recent', questionSnapshot: [latestQuestion] };
  assert.equal(mergeQuestionBank(bank, [old, recent], null).find(q => q.id === oldQuestion.id).explanation, latestQuestion.explanation);
});

test('daily streak counts unique consecutive UTC days through today or yesterday', () => {
  const yesterday = daily('2026-10-04');
  const twoDaysAgo = daily('2026-10-03');
  assert.equal(dailyStreak([yesterday, twoDaysAgo, yesterday], '2026-10-05'), 2);
  assert.equal(dailyStreak([daily('2026-10-05'), yesterday, twoDaysAgo], '2026-10-05'), 3);
  assert.equal(dailyStreak([twoDaysAgo], '2026-10-05'), 0);
  assert.equal(dailyStreak([daily('2026-10-06'), yesterday], '2026-10-05'), 1);
  assert.equal(dailyStreak([{ ...yesterday, completed: false }, twoDaysAgo], '2026-10-05'), 0);
  assert.equal(dailyStreak([{ ...yesterday, daily: false }], '2026-10-05'), 0);
  assert.equal(dailyStreak([], 'invalid'), 0);
});

test('daily streak handles UTC month boundaries and leap days without accepting impossible dates', () => {
  assert.equal(dailyStreak([daily('2024-02-29'), daily('2024-02-28')], '2024-03-01'), 2);
  assert.equal(dailyStreak([daily('2025-12-31')], '2026-01-01'), 1);
  assert.equal(dailyStreak([daily('2026-02-30')], '2026-03-01'), 0);
  assert.equal(dailyStreak([daily('2026-02-28')], '2026-02-30'), 0);
});

test('daily completions survive more than 100 subsequent practice rounds and a restart', () => {
  let profile = complete(makeSession(bank, 'mixed', 'fan', [], 'daily-2026-10-03', { daily: true }));
  profile.session = makeSession(bank, 'mixed', 'fan', [], 'daily-2026-10-04', { daily: true });
  for (const id of profile.session.questionIds) {
    profile = advance(submit(profile, bank, bank.find(q => q.id === id).answer, false));
  }
  for (let i = 0; i < 101; i++) {
    profile.session = makeSession(bank, 'mixed', 'fan', [], `practice-${i}`, { revision: [bank[0].id] });
    profile = advance(submit(profile, bank, bank[0].answer, false));
  }
  assert.equal(profile.history.length, 100);
  assert.ok(profile.history.every(s => !s.daily));
  assert.deepEqual(profile.dailyCompletedDates, ['2026-10-03', '2026-10-04']);
  profile = restore(profile);
  assert.equal(dailyStreak(profile.history, '2026-10-05', profile.dailyCompletedDates), 2);
});

test('legacy saves migrate completed daily history and merge duplicate ledger entries', () => {
  const old = { ...initialProfile(), history: [daily('2026-10-03'), daily('2026-10-04')] };
  delete old.dailyCompletedDates;
  const migrated = restore(old);
  assert.deepEqual(migrated.dailyCompletedDates, ['2026-10-03', '2026-10-04']);
  const merged = restore({ ...migrated, dailyCompletedDates: ['2026-10-02', '2026-10-03', '2026-10-03'] });
  assert.deepEqual(merged.dailyCompletedDates, ['2026-10-02', '2026-10-03', '2026-10-04']);
  assert.equal(dailyStreak(merged.history, '2026-10-05', merged.dailyCompletedDates), 3);
});

test('invalid daily date ledgers trigger recovery rather than fabricating a streak', () => {
  for (const dates of [null, '2026-10-05', [null], ['2026-02-30'], ['2026-10-05T00:00:00Z'], Array(10001).fill('2026-10-05')]) {
    assert.throws(() => restore({ ...initialProfile(), dailyCompletedDates: dates }), /could not be read/);
  }
  assert.equal(dailyStreak([], '2026-10-05', ['2026-10-03', '2026-10-04', '2026-10-04']), 2);
});

test('a repeated daily completion records its date only once', () => {
  let profile = complete(makeSession(bank, 'mixed', 'fan', [], 'daily-2026-10-05', { daily: true }));
  profile.session = makeSession(bank, 'mixed', 'expert', [], 'daily-2026-10-05', { daily: true });
  for (const id of profile.session.questionIds) {
    profile = advance(submit(profile, bank, bank.find(q => q.id === id).answer, false));
  }
  assert.deepEqual(profile.dailyCompletedDates, ['2026-10-05']);
  assert.equal(profile.history.length, 1);
  assert.equal(dailyStreak(profile.history, '2026-10-05', profile.dailyCompletedDates), 1);
});

test('a saved hint remains assisted after restarting and resets only for the next question', () => {
  let profile = { ...initialProfile(), session: { ...makeSession(bank, 'rules', 'starter', [], 'hint-resume'), hintUsed: true } };
  profile = restore(profile);
  assert.equal(profile.session.hintUsed, true);
  const first = bank.find(q => q.id === profile.session.questionIds[0]);
  profile = submit(profile, bank, first.answer, false);
  assert.equal(profile.session.answers[0].hinted, true);
  profile = advance(profile);
  assert.equal(profile.session.hintUsed, false);
  const second = bank.find(q => q.id === profile.session.questionIds[1]);
  profile = submit(profile, bank, second.answer, false);
  assert.equal(profile.session.answers[1].hinted, false);
});
