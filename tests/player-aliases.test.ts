import {expect,it} from 'vitest';
import questions from '../src/content/questions.json';
import {correctAnswer,initialProfile,makeSession,needsMoreSpecificAnswer,Question,submit} from '../src/core/quiz';
const bank=questions as Question[];
const portrait=(id:string)=>bank.find(q=>q.id==='visual-'+id)!;
it('accepts familiar surnames, accents and documented nicknames',()=>{
 for(const [id,value] of [['messi',' Messi '],['ronaldo','cr7'],['ronaldo-brazil','R9'],['bonmati','bonmati'],['son','Heung min Son'],['van-dijk','van dijk'],['neymar','Neymar Jr']])expect(correctAnswer(portrait(id),value),id).toBe(true);
});
it('does not award points for near matches or the other Ronaldo',()=>{
 expect(correctAnswer(portrait('messi'),'Mesi')).toBe(false);
 expect(correctAnswer(portrait('ronaldo'),'R9')).toBe(false);
 expect(correctAnswer(portrait('ronaldo-brazil'),'CR7')).toBe(false);
});
it('clarifies an ambiguous name without consuming the attempt or changing progress',()=>{
 for(const id of ['ronaldo','ronaldo-brazil']){
  const q=portrait(id),profile=initialProfile();profile.session=makeSession([q],'portraits','fan',[],'alias');
  expect(needsMoreSpecificAnswer(q,' RONALDO ')).toBe(true);
  expect(submit(profile,bank,'Ronaldo',false)).toBe(profile);
  const corrected=submit(profile,bank,id==='ronaldo'?'CR7':'R9',false);
  expect(corrected.session!.answers).toHaveLength(1);expect(corrected.session!.answers[0].correct).toBe(true);
  expect(corrected.solved).toContain(q.id);expect(corrected.mistakes).toEqual([]);
 }
});
