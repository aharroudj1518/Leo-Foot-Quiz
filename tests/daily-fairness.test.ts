import { describe, expect, it } from 'vitest';
import data from '../src/content/questions.json';
import { makeSession, Question } from '../src/core/quiz';

describe('daily challenge purchase fairness', () => {
  const bank = data as Question[];
  it('serves the same free questions to pack owners and guests', () => {
    for (let day = 1; day <= 31; day++) {
      const seed = `daily-2026-10-${String(day).padStart(2, '0')}`;
      const guest = makeSession(bank, 'mixed', 'starter', [], seed, { daily: true });
      const owner = makeSession(bank, 'mixed', 'expert', bank.map(q => q.id), seed, { daily: true, premium: true });
      expect(owner.questionIds).toEqual(guest.questionIds);
      expect(owner.questionIds.every(id => !bank.find(q => q.id === id)!.premium)).toBe(true);
    }
  });
  it('still includes purchased content in ordinary practice', () => {
    const session = makeSession(bank, 'legends', 'fan', [], 'practice', { premium: true });
    expect(session.questionIds.length).toBeGreaterThan(0);
    expect(session.questionIds.every(id => bank.find(q => q.id === id)!.category === 'legends')).toBe(true);
  });
});
