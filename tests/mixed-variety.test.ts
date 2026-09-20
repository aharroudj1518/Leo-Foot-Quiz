import {expect,test} from 'vitest';
import {makeSession,type Question} from '../src/core/quiz';
import data from '../src/content/questions.json';
const bank=data as Question[];
const categories=(ids:string[])=>ids.map(id=>bank.find(q=>q.id===id)!.category);

test('large squad catalogue does not dominate mixed fan rounds',()=>{
 for(let seed=0;seed<30;seed++){
  const round=makeSession(bank,'mixed','fan',[],`variety-${seed}`);
  const topics=categories(round.questionIds);
  expect(round.questionIds).toHaveLength(10);
  expect(new Set(topics).size).toBe(9);
  expect(topics.filter(c=>c==='squads').length).toBeLessThanOrEqual(2);
  expect(new Set(round.questionIds).size).toBe(10);
 }
});
test('daily five covers five free topics and stays identical across player settings',()=>{
 const a=makeSession(bank,'mixed','starter',[],'daily-2026-09-12',{daily:true});
 const b=makeSession(bank,'mixed','expert',bank.map(q=>q.id),'daily-2026-09-12',{daily:true,premium:true});
 expect(a.questionIds).toEqual(b.questionIds);
 expect(new Set(categories(a.questionIds)).size).toBe(5);
 expect(a.questionIds.every(id=>!bank.find(q=>q.id===id)!.premium)).toBe(true);
});
test('variety never reintroduces seen questions when only one topic remains unseen',()=>{
 const available=bank.filter(q=>q.category==='squads'&&!q.retired).slice(0,3);
 const unseen=new Set(available.map(q=>q.id));
 const round=makeSession(bank,'mixed','fan',bank.filter(q=>!unseen.has(q.id)).map(q=>q.id),'almost-done');
 expect(new Set(round.questionIds)).toEqual(unseen);
});
