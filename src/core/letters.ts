import {shuffled} from './quiz';
export type LetterTile={id:number;letter:string};
export function answerWords(answer:string):string[]{
  return answer.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().split(/[^A-Z]+/).filter(Boolean);
}
export function letterPool(answer:string,seed:string):LetterTile[]{
  const letters=answerWords(answer).join('').split('');
  const extras=shuffled('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),seed+':extras').slice(0,4);
  return shuffled([...letters,...extras].map((letter,id)=>({id,letter})),seed);
}
export function assembleAnswer(words:string[],tiles:LetterTile[],selected:number[]):string{
  const byId=new Map(tiles.map(t=>[t.id,t.letter]));
  if(new Set(selected).size!==selected.length||selected.some(id=>!byId.has(id)))return '';
  let offset=0;
  return words.map(word=>{const value=selected.slice(offset,offset+word.length).map(id=>byId.get(id)).join('');offset+=word.length;return value;}).join(' ').trim();
}
