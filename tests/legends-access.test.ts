import {describe,it,expect} from 'vitest';
import data from '../src/content/questions.json';
import {makeSession,type Difficulty,type Question} from '../src/core/quiz';
const bank=data as Question[];
const paid=bank.filter(q=>q.category==='legends');

describe('purchased Legends collection',()=>{
 it.each(['starter','fan','expert'] as Difficulty[])('lets a %s buyer traverse the entire pack before repeating',difficulty=>{
  const seen:string[]=[];
  while(seen.length<paid.length){
   const round=makeSession(bank,'legends',difficulty,seen,`pack-${seen.length}`,{premium:true});
   expect(round.questionIds.length).toBeGreaterThan(0);
   for(const id of round.questionIds){expect(seen).not.toContain(id);expect(paid.some(q=>q.id===id)).toBe(true);seen.push(id);}
  }
  expect(new Set(seen).size).toBe(paid.length);
  expect(makeSession(bank,'legends',difficulty,seen,'replay',{premium:true}).questionIds).toHaveLength(10);
 });
 it.each(['starter','fan','expert'] as Difficulty[])('keeps the full pack locked without ownership at %s',difficulty=>{
  expect(()=>makeSession(bank,'legends',difficulty,[],'locked')).toThrow();
 });
 it('keeps the free preview limited to its three selected questions',()=>{
  const ids=['legend-1956','legend-1967','legend-1979'];
  const round=makeSession(bank.filter(q=>ids.includes(q.id)),'legends','fan',[],'preview',{premium:true,revision:ids});
  expect(round.questionIds.sort()).toEqual(ids.sort());
 });
 it('still filters ordinary practice by the selected difficulty',()=>{
  const round=makeSession(bank,'rules','starter',[],'rules');
  expect(round.questionIds.every(id=>bank.find(q=>q.id===id)?.difficulty==='starter')).toBe(true);
 });
});
