import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {expect,it} from 'vitest';
import chapters from '../src/content/squad-chapters.json';
import data from '../src/content/squad-questions.json';
import crests from '../assets/crests/manifest.json';
import {clubKit} from '../src/clubKits';
import {makeSession,type Question} from '../src/core/quiz';
const questions=data as Question[];
it('gives every Champions League club varied rounds and limits current roster clues',()=>{
 for(const club of chapters.filter(c=>c.competition==='champions-league')){
  const pool=questions.filter(q=>q.squadCode===club.code);
  const history=pool.filter(q=>q.clubTopic==='history');
  expect(history.length,club.name).toBeGreaterThanOrEqual(3);
  expect(pool.filter(q=>q.squadClue).length,club.name).toBeLessThanOrEqual(3);
  expect(pool.some(q=>/is listed for|nationality is listed/i.test(q.prompt)),club.name).toBe(false);
  for(const q of history){expect(q.source).toMatch(/^https:\/\//);expect(q.explanation).not.toBe(q.answer);}
  for(const seed of ['first','second','third']){
   const round=makeSession(pool,'squads','fan',[],seed);
   const selected=round.questionIds.map(id=>pool.find(q=>q.id===id)!);
   expect(selected).toHaveLength(10);
   expect(selected.filter(q=>q.clubTopic!=='players').length).toBeGreaterThanOrEqual(8);
   expect(selected.filter(q=>q.clubTopic==='players').length).toBeLessThanOrEqual(2);
   expect(new Set(selected.map(q=>q.clubTopic)).size).toBeGreaterThanOrEqual(3);
  }
 }
});
it('has a locally bundled, traceable real crest and explicit kit colours for every club',()=>{
 for(const club of chapters){
  const crest=crests.find(c=>c.code===club.code);expect(crest,club.name).toBeDefined();
  const bytes=fs.readFileSync(crest!.file);expect(bytes.subarray(0,8).toString('hex')).toBe('89504e470d0a1a0a');
  expect(createHash('sha256').update(bytes).digest('hex')).toBe(crest!.sha256);
  expect(clubKit(club.name),club.name).toBeDefined();
 }
});
it('uses recognisable traditional patterns rather than one generic cream shirt',()=>{
 expect(clubKit('AC Milan')).toMatchObject({base:'#C41230',secondary:'#151515',pattern:'stripes'});
 expect(clubKit('Juventus')).toMatchObject({base:'#FFFFFF',secondary:'#171717',pattern:'stripes'});
 expect(clubKit('Arsenal')).toMatchObject({pattern:'sleeves'});
 expect(clubKit('Sporting Clube de Portugal')).toMatchObject({pattern:'hoops'});
 expect(clubKit('Paris Saint-Germain')).toMatchObject({pattern:'panel'});
 expect(clubKit('Parma')).toMatchObject({pattern:'cross'});
});
it('shares historical stories across a club’s European and domestic chapters',()=>{
 for(const [european,domestic] of [['Arsenal FC','Arsenal'],['FC Barcelona','Barcelona'],['FC Bayern München','Bayern Munich']]){
  const a=chapters.find(c=>c.name===european)!;const b=chapters.find(c=>c.name===domestic)!;
  expect(questions.filter(q=>q.squadCode===a.code&&q.clubTopic==='history').map(q=>q.prompt)).toEqual(questions.filter(q=>q.squadCode===b.code&&q.clubTopic==='history').map(q=>q.prompt));
 }
});
