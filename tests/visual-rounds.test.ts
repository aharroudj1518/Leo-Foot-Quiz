import {describe,it,expect} from 'vitest';
import data from '../src/content/questions.json';
import assets from '../src/content/asset-register.json';
import {makeSession,hydrate,initialProfile,Question} from '../src/core/quiz';
const bank=data as Question[];
describe('visual rounds',()=>{
  it('varies badge and stadium distractors across their complete collections',()=>{
    for(const category of ['badges','stadiums']){
      const collection=bank.filter(q=>q.category===category);
      const appearances=new Map(collection.map(q=>[q.answer,0]));
      for(const q of collection){
        expect(new Set(q.options).size).toBe(4);
        expect(q.options).toContain(q.answer);
        for(const option of q.options.filter(o=>o!==q.answer)){
          expect(appearances.has(option)).toBe(true);
          appearances.set(option,appearances.get(option)!+1);
        }
      }
      expect(Math.min(...appearances.values())).toBeGreaterThan(0);
      expect(Math.max(...appearances.values())-Math.min(...appearances.values())).toBeLessThanOrEqual(1);
    }
  });
  it('has a playable visual-only set at every selected level',()=>{
    for(const mode of ['portraits','badges','stadiums'] as const)for(const level of ['starter','fan','expert'] as const){
      const round=makeSession(bank,mode,level,[],'visual-test');
      expect(round.questionIds.length).toBeGreaterThanOrEqual(3);
      expect(round.questionIds.every(id=>bank.find(q=>q.id===id)?.visual)).toBe(true);
    }
  });
  it('restores a saved visual round without losing it to mode validation',()=>{
    for(const mode of ['portraits','badges','stadiums'] as const){const p=initialProfile();p.session=makeSession(bank,mode,'fan',[],'resume');expect(hydrate(JSON.stringify(p),bank).session).toEqual(p.session);}
  });
  it('declares every visual asset for release review and includes a text alternative',()=>{
    const registered=new Set(assets.assets.map(a=>a.id));
    for(const q of bank.filter(q=>q.visual)){expect(q.assetIds).toContain(q.visual!.key);expect(registered.has(q.visual!.key)).toBe(true);expect(q.visual!.description.length).toBeGreaterThan(15);}
  });
});
