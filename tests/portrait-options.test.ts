import {it,expect} from 'vitest';
import questions from '../src/content/visual-questions.json';
import portraits from '../assets/players/manifest.json';
it('uses distinct alternatives from the same player chapter',()=>{
 const gallery=questions.filter(q=>q.category==='portraits');
 const chapter=(key:string)=>portraits.find(p=>p.id===key)?.collection??'stars';
 for(const q of gallery){
  expect(new Set(q.options).size).toBe(4);
  for(const alternative of q.options){const player=gallery.find(p=>p.answer===alternative);expect(player).toBeDefined();expect(chapter(player!.visual.key)).toBe(chapter(q.visual.key));}
 }
});
