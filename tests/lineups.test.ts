import {describe,it,expect} from 'vitest';
import {lineups,matchesClub,validLineupProgress} from '../src/core/lineups';
import {hydrate,initialProfile} from '../src/core/quiz';

describe('2026/27 lineup collection',()=>{
 it('uses eleven distinct players in their sourced positions',()=>{
  expect(lineups.length).toBeGreaterThan(0);
  expect(new Set(lineups.map(c=>c.id)).size).toBe(lineups.length);
  for(const club of lineups){
   expect(club.rows.map(r=>r.length)).toEqual([3,3,4,1]);
   expect(new Set(club.rows.flat().map(p=>p.name)).size).toBe(11);
   club.rows.flat().forEach(p=>expect(club.players).toContainEqual(p));
   expect(matchesClub(club,club.name)).toBe(true);
   expect(matchesClub(club,'')).toBe(false);
  }
 });
 it('accepts curated club aliases and accents, rejects partial guesses',()=>{
  const bayern=lineups.find(c=>c.name==='FC Bayern München')!;
  expect(matchesClub(bayern,' BAYERN Munich ')).toBe(true);
  expect(matchesClub(bayern,'FC Bayern Munchen')).toBe(true);
  expect(matchesClub(bayern,'Munich')).toBe(false);
 });
 it('preserves hint usage and completion through profile recovery',()=>{
  const lineupProgress={[lineups[0].id]:{revealed:3,teamHint:true,solved:true}};
  expect(hydrate(JSON.stringify({...initialProfile(),lineupProgress}),[]).lineupProgress).toEqual(lineupProgress);
  expect(hydrate(JSON.stringify(initialProfile()),[]).lineupProgress).toBeUndefined();
 });
 it('rejects invalid saved reveal counts',()=>{
  for(const revealed of [-1,12,1.5,'3'])expect(validLineupProgress({x:{revealed,teamHint:false,solved:false}})).toBe(false);
  expect(()=>hydrate(JSON.stringify({...initialProfile(),lineupProgress:{x:{revealed:12,teamHint:false,solved:true}}}),[])).toThrow('lineup progress');
 });
});
