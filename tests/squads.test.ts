import {expect,it} from 'vitest';
import questions from '../src/content/squad-questions.json';
import chapters from '../src/content/squad-chapters.json';
import premier from '../src/content/sources/premier-league-players-2026-27.json';
import {advance,careerTotals,correctAnswer,hydrate,initialProfile,makeSession,Question,submit,validateBank} from '../src/core/quiz';
it('replaces the World Cup with all Champions League clubs and four complete domestic club lists',()=>{
  for(const [competition,total] of [['champions-league',36],['premier-league',20],['la-liga',20],['serie-a',20],['bundesliga',18]] as const)expect(chapters.filter(c=>c.competition===competition)).toHaveLength(total);
  const ids=chapters.flatMap(c=>c.questionIds);expect(new Set(ids).size).toBe((questions as Question[]).filter(q=>!q.retired).length);
  expect(questions.some(q=>q.id.startsWith('squad26-')||q.era.includes('World Cup'))).toBe(false);
  expect(validateBank(questions as Question[])).toEqual([]);
  for(const c of chapters){expect(c.questionIds.length).toBeGreaterThanOrEqual(10);expect((questions as Question[]).filter(q=>q.squadCode===c.code&&!q.retired).map(q=>q.id)).toEqual(c.questionIds);}
});
it('never presents a stadium alias as an incorrect choice',()=>{
 for(const q of questions as Question[])expect(q.options.filter(option=>correctAnswer(q,option)),q.id).toHaveLength(1);
});
it('preserves Premier League player definitions while limiting active roster clues',()=>{
 for(const club of premier.clubs){
  const chapter=chapters.find(c=>c.competition==='premier-league'&&c.name===club.club)!;
  const roster=new Set(club.players.map(p=>p.name));
  const pool=questions.filter(q=>q.squadCode===chapter.code&&q.id.includes('-player-')) as Question[];
  expect(pool.length).toBe(club.players.length);
  expect(pool.length).toBeGreaterThanOrEqual(18);
  for(const q of pool){
   expect(q.options.filter(o=>roster.has(o))).toEqual([q.answer]);
   expect(q.source).toBe(premier.source);
  }
  expect(pool.filter(q=>!q.retired)).toHaveLength(2);
  const first=makeSession(questions.filter(q=>q.squadCode===chapter.code) as Question[],'squads','fan',[],'pl-first');
  expect(first.questionIds.filter(id=>pool.some(q=>q.id===id)).length).toBeLessThanOrEqual(2);
  expect(first.questionIds).toHaveLength(10);
  expect(first.questionIds.every(id=>chapter.questionIds.includes(id))).toBe(true);
 }
});
it('retains earned career totals when the retired World Cup catalogue leaves the app',()=>{
 const retired=[{...questions[0],id:'squad26-retired-player'}] as Question[];
 let p=initialProfile();p.session=makeSession(retired,'squads','fan',[],'old-season');
 p=advance(submit(p,retired,retired[0].answer,false));
 const restored=hydrate(JSON.stringify(p),questions as Question[]);
 expect(careerTotals(restored)).toEqual({rounds:1,answered:1,correct:1});
 expect(restored.session).toBeNull();
 expect(restored.solved).not.toContain(retired[0].id);
});
it('restores full club rounds with retained historical definitions',()=>{
  const pool=(questions as Question[]).filter(q=>q.squadCode==='ucl27-52280'&&!q.retired);
  for(const level of ['starter','fan','expert'] as const){
    const p=initialProfile();p.session=makeSession(pool,'squads',level,[],'archive');
    const first=p.session.questionIds;
    const next=makeSession(pool,'squads',level,first,'archive');
    expect(first).toHaveLength(10);
    expect(next.questionIds.every(id=>pool.some(q=>q.id===id))).toBe(true);
    expect(hydrate(JSON.stringify(p),questions as Question[]).session).toEqual(p.session);
  }
});
