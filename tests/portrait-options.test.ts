import {it,expect} from 'vitest';
import questions from '../src/content/visual-questions.json';
import portraits from '../assets/players/manifest.json';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
it('ships fifty distinct portraits with intact sourced files and visual review',()=>{
 expect(questions.filter(q=>q.category==='portraits')).toHaveLength(50);
 expect(new Set(portraits.map(p=>p.sha256)).size).toBe(portraits.length);
 for(const p of portraits){
  expect(p.visualReview).toBe(true);expect(p.description.length).toBeGreaterThan(20);
  expect(p.creator.length).toBeGreaterThan(0);expect(p.licenseUrl).toMatch(/^https:\/\//);
  expect(p.source).toMatch(/^https:\/\/commons.wikimedia.org\/wiki\/File:/);
  const bytes=fs.readFileSync(new URL(`../assets/players/${p.id}.jpg`,import.meta.url));
  expect(createHash('sha256').update(bytes).digest('hex')).toBe(p.sha256);
  expect(questions.some(q=>q.id===`visual-${p.id}`&&q.answer===p.name)).toBe(true);
 }
});
it('uses distinct alternatives from the same player chapter',()=>{
 const gallery=questions.filter(q=>q.category==='portraits');
 const chapter=(key:string)=>portraits.find(p=>p.id===key)?.collection??'stars';
 for(const q of gallery){
  expect(new Set(q.options).size).toBe(4);
  for(const alternative of q.options){const player=gallery.find(p=>p.answer===alternative);expect(player).toBeDefined();expect(chapter(player!.visual.key)).toBe(chapter(q.visual.key));}
 }
});
