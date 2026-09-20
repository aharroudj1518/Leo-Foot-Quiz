import {expect,it} from 'vitest';
import catalogue from '../src/content/squad-questions.json';
import chapters from '../src/content/squad-chapters.json';
import legacy from '../src/content/sources/club-legacy-questions.json';
import {hydrate,initialProfile,submit,type Question} from '../src/core/quiz';
type Fact = typeof catalogue[number] & {factId?:string;clubTopic?:string;retired?:boolean};
const questions=catalogue as Fact[];
it('gives every club ten distinct sourced facts and at least eight non-roster clues',()=>{
 for(const chapter of chapters){
  const active=questions.filter(q=>chapter.questionIds.includes(q.id));
  expect(new Set(active.map(q=>q.factId)).size,chapter.name).toBeGreaterThanOrEqual(10);
  expect(new Set(active.map(q=>q.factId)).size,chapter.name).toBe(active.length);
  expect(active.filter(q=>q.clubTopic!=='players').length,chapter.name).toBeGreaterThanOrEqual(8);
  expect(new Set(active.map(q=>q.clubTopic)).size,chapter.name).toBeGreaterThanOrEqual(3);
  for(const q of active){expect(q.retired,q.id).not.toBe(true);expect(q.factId,q.id).toBeTruthy();expect(q.source,q.id).toMatch(/^https:\/\//);}
 }
});
it('uses one canonical fact identity when a club appears in two competitions',()=>{
 const arsenal=chapters.filter(c=>c.name==='Arsenal'||c.name==='Arsenal FC');
 expect(arsenal).toHaveLength(2);
 const stories=arsenal.map(c=>questions.filter(q=>q.squadCode===c.code&&q.id.includes('-story-')));
 expect(stories[0].map(q=>q.factId)).toEqual(stories[1].map(q=>q.factId));
 const facts=arsenal.map(c=>questions.filter(q=>q.squadCode===c.code&&q.id.includes('-fact-')));
 expect(facts[0].length).toBeGreaterThan(0);
 expect(facts[0].map(q=>q.factId)).toEqual(facts[1].map(q=>q.factId));
});
it('keeps the complete previous question payload for saved sessions',()=>{
 const byId=new Map(questions.map(q=>[q.id,q]));
 for(const old of legacy){
  const current=byId.get(old.id);
  expect(current,old.id).toBeDefined();
  for(const [key,value] of Object.entries(old))expect(current?.[key as keyof Fact],`${old.id}.${key}`).toEqual(value);
 }
});
it('lists exactly the active catalogue and retires most repetitive player clues',()=>{
 const listed=new Set(chapters.flatMap(c=>c.questionIds));
 expect([...listed].sort()).toEqual(questions.filter(q=>!q.retired).map(q=>q.id).sort());
 expect(questions.filter(q=>q.retired).length).toBeGreaterThan(1000);
});
it('can resume and answer a saved question that is retired from new rounds',()=>{
 const retired=questions.find(q=>q.retired)!;
 expect(retired).toBeDefined();
 const profile=initialProfile();
 profile.session={id:'old-roster-round',mode:'squads',difficulty:'fan',questionIds:[retired.id],answers:[],index:0,seed:'before-refresh',daily:false,family:false,completed:false};
 const restored=hydrate(JSON.stringify(profile),questions as Question[]);
 expect(restored.session).toEqual(profile.session);
 expect(submit(restored,questions as Question[],retired.answer,false).session?.answers[0].correct).toBe(true);
});
it('recognises Como’s stadium name aliases as one fact across all chapters',()=>{
 const como=chapters.filter(c=>c.name==='Como'||c.name==='Como 1907');
 const ground=questions.filter(q=>como.some(c=>c.code===q.squadCode)&&(q.id.endsWith('-stadium')||q.id.endsWith('-story-3')));
 expect(ground).toHaveLength(3);
 expect(new Set(ground.map(q=>q.factId)).size).toBe(1);
 expect(ground.find(q=>q.id.endsWith('-stadium'))?.retired).toBe(true);
 for(const chapter of como){
  const active=questions.filter(q=>chapter.questionIds.includes(q.id));
  expect(active.filter(q=>q.factId===ground[0].factId)).toHaveLength(1);
  expect(new Set(active.map(q=>q.factId)).size).toBeGreaterThanOrEqual(10);
 }
});
