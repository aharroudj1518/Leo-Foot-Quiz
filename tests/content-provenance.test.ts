import { describe, expect, it } from 'vitest';
import questions from '../src/content/questions.json';

describe('historical question provenance', () => {
  it('links European finals to the season ending in the final year', () => {
    // UEFA indexes seasons by their final year: /2024/ is Real Madrid's
    // 2023/24 title, while /2023/ is Manchester City's 2022/23 title.
    const finals = questions.filter(q => /^(clubs|legend)-\d{4}$/.test(q.id));
    expect(finals.length).toBeGreaterThan(0);
    for (const question of finals) {
      const finalYear = question.id.split('-')[1];
      expect(question.source, question.id).toBe(`https://www.uefa.com/uefachampionsleague/history/seasons/${finalYear}/`);
    }
  });
});
