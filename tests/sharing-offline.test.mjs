import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {makeSession, submit, initialProfile, hydrate, advance} from '../src/core/quiz.ts';
import {scoreMessage} from '../src/core/sharing.ts';

const bank = JSON.parse(readFileSync(new URL('../src/content/questions.json', import.meta.url)));
test('daily score uses its original edition date and spoiler-free hint tiles', () => {
  const session = makeSession(bank, 'mixed', 'fan', [], 'daily-2026-09-30', {daily: true});
  session.answers = [
    {questionId: session.questionIds[0], value: 'secret', correct: true, hinted: false},
    {questionId: session.questionIds[1], value: 'secret', correct: true, hinted: true},
    {questionId: session.questionIds[2], value: 'secret', correct: false, hinted: false},
  ];
  const message = scoreMessage(session, 'https://example.com/quiz');
  assert.match(message, /Daily Five · 2026-09-30/);
  assert.match(message, /🟩🟨⬜/);
  assert.match(message, /https:\/\/example.com\/quiz/);
  assert.ok(!message.includes('secret'));
});
test('shared links reject insecure or credential-bearing destinations', () => {
  const session = makeSession(bank, 'mixed', 'fan', [], 'share');
  for (const url of ['http://example.com', 'https://user:secret@example.com', 'javascript:alert(1)']) {
    assert.equal(scoreMessage(session, url), scoreMessage(session));
  }
});
test('saved news round completes and keeps its original story after feed removal', () => {
  const {editions: [edition]} = JSON.parse(readFileSync(new URL('../src/content/news.json', import.meta.url)));
  let profile = initialProfile();
  profile.session = {...makeSession(edition.questions, 'mixed', 'fan', [], 'edition-round', {revision: edition.questions.map(q => q.id)}), edition: {id: edition.id, title: edition.title, publishedAt: edition.publishedAt}, questionSnapshot: edition.questions};
  for (let i = 0; i < 5; i++) {
    // Rehydrate using only the classics as if the remote edition had disappeared.
    profile = hydrate(JSON.stringify(profile), bank);
    const question = profile.session.questionSnapshot.find(q => q.id === profile.session.questionIds[i]);
    profile = submit(profile, profile.session.questionSnapshot, question.answer, false);
    profile = advance(profile);
  }
  assert.equal(profile.history.length, 1);
  assert.match(scoreMessage(profile.session), /Early October football briefing · 2026-10-05/);
  assert.match(scoreMessage(profile.session), /5\/5/);
  assert.equal(profile.history[0].questionSnapshot.length, 5);
});
