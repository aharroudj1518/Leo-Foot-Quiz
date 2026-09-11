import {expect,it} from 'vitest';
import questions from '../src/content/squad-questions.json';
import chapters from '../src/content/squad-chapters.json';
import {hydrate,initialProfile,makeSession,Question,validateBank} from '../src/core/quiz';
it('covers 48 disjoint squads with one question per player and valid options',()=>{
  expect(chapters).toHaveLength(48);expect(questions).toHaveLength(1248);
  const ids=chapters.flatMap(c=>c.questionIds);expect(new Set(ids).size).toBe(1248);
  expect(validateBank(questions as Question[])).toEqual([]);
  for(const c of chapters){expect(c.questionIds).toHaveLength(26);expect(questions.filter(q=>q.squadCode===c.code).map(q=>q.id)).toEqual(c.questionIds);}
});
it('plays unseen country questions at all levels and restores the country round',()=>{
  const pool=questions.filter(q=>q.squadCode==='FRA') as Question[];
  for(const level of ['starter','fan','expert'] as const){
    const p=initialProfile();p.session=makeSession(pool,'squads',level,[],'archive');
    const first=p.session.questionIds;
    const next=makeSession(pool,'squads',level,first,'archive');
    expect(next.questionIds.every(id=>!first.includes(id))).toBe(true);
    expect(hydrate(JSON.stringify(p),questions as Question[]).session).toEqual(p.session);
  }
});
