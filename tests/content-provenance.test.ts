import { describe, expect, it } from 'vitest';
import questions from '../src/content/questions.json';

describe('historical question provenance', () => {
  it('uses the independently reviewed UEFA routes for all 65 finals', () => {
    // Actual page titles and winner sections were checked on 2026-10-06.
    // UEFA's historical routes differ from its recent routes. In particular,
    // /2006/ covers the 2007 final, /2007/ returned 404, and /2008/ covers 2008.
    // Evidence and the complete 65-question review: docs/google-play/paid-content-review.md.
    const finals = questions.filter(q => /^(clubs|legend)-\d{4}$/.test(q.id));
    expect(finals).toHaveLength(65);
    for (const question of finals) {
      const finalYear = Number(question.id.split('-')[1]);
      const sourceYear = finalYear <= 2007 ? finalYear - 1 : finalYear;
      expect(question.source, question.id).toBe(`https://www.uefa.com/uefachampionsleague/history/seasons/${sourceYear}/`);
    }
  });

  it.each([
    ['legend-1956', 'Real Madrid', 1955],
    ['legend-1963', 'AC Milan', 1962],
    ['legend-1995', 'Ajax', 1994],
    ['clubs-2000', 'Real Madrid', 1999],
    ['clubs-2007', 'AC Milan', 2006],
    ['clubs-2008', 'Manchester United', 2008],
    ['clubs-2023', 'Manchester City', 2023],
    ['clubs-2024', 'Real Madrid', 2024],
  ])('%s keeps its verified winner and season link', (id, answer, sourceYear) => {
    const question = questions.find(q => q.id === id);
    expect(question?.answer).toBe(answer);
    expect(question?.source).toBe(`https://www.uefa.com/uefachampionsleague/history/seasons/${sourceYear}/`);
  });
});
