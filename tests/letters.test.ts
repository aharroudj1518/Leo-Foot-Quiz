import {expect,it} from 'vitest';
import {answerWords,assembleAnswer,letterPool} from '../src/core/letters';
it('preserves repeated letters and reconstructs accented names with word boundaries',()=>{
  for(const answer of ['Lionel Messi','Kylian Mbappé','Erling Haaland']){
    const words=answerWords(answer),pool=letterPool(answer,'test');
    const remaining=[...pool];
    const selected=words.join('').split('').map(letter=>{
      const index=remaining.findIndex(tile=>tile.letter===letter);
      expect(index).toBeGreaterThanOrEqual(0);
      return remaining.splice(index,1)[0].id;
    });
    expect(assembleAnswer(words,pool,selected)).toBe(words.join(' '));
    expect(new Set(selected).size).toBe(selected.length);
  }
});
it('rejects reused or nonexistent tile identities',()=>{
  const pool=letterPool('Messi','test');
  expect(assembleAnswer(['MESSI'],pool,[pool[0].id,pool[0].id])).toBe('');
  expect(assembleAnswer(['MESSI'],pool,[999])).toBe('');
});
