import { expect, it } from 'vitest';
import data from '../src/content/questions.json';
import { hydrate, initialProfile, makeSession, Question } from '../src/core/quiz';
const bank = data as Question[];
it.each([null, [], { ...initialProfile(), history: [null] }, { ...initialProfile(), sound: 'yes' }, { ...initialProfile(), reports: [null] }])('rejects malformed profile without silently resetting it: %j', value => {
  expect(() => hydrate(JSON.stringify(value), bank)).toThrow();
});
it.each([NaN, 0.5, undefined, -1, 100])('discards an unusable current session index: %s', index => {
  const p = { ...initialProfile(), seen: ['kept'], session: { ...makeSession(bank, 'mixed', 'fan', [], 'save'), index } };
  const restored = hydrate(JSON.stringify(p), bank);
  expect(restored.session).toBeNull();
  expect(restored.seen).toEqual(['kept']);
});
it('discards out-of-order answers that would reveal the wrong feedback', () => {
  const session = makeSession(bank, 'mixed', 'fan', [], 'save');
  session.answers = [{ questionId: session.questionIds[1], value: 'x', correct: false, hinted: false }];
  expect(hydrate(JSON.stringify({ ...initialProfile(), session }), bank).session).toBeNull();
});
