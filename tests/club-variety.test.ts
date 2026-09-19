import {expect,test} from 'vitest';
import {makeSession,initialProfile,hydrate,seenQuestionIds,type Question} from '../src/core/quiz';

function question(id:string,topic='history',extra:Partial<Question>={}):Question{return {id,prompt:`Question ${id}?`,answer:'One',options:['One','Two','Three','Four'],explanation:'A sourced fact.',hint:'A clue.',category:'squads',difficulty:'fan',source:'https://www.uefa.com/',era:'Club history',squadCode:'club-a',clubTopic:topic as Question['clubTopic'],...extra};}
test('retired questions remain available to saved sessions and explicit mistake review only',()=>{
 const old=question('old','players',{retired:true}),fresh=question('fresh');
 expect(makeSession([old,fresh],'squads','fan',[],'new').questionIds).toEqual(['fresh']);
 const p=initialProfile();p.session=makeSession([old,fresh],'squads','fan',[],'review',{revision:['old']});
 expect(p.session.questionIds).toEqual(['old']);
 expect(hydrate(JSON.stringify(p),[old,fresh]).session).toEqual(p.session);
});
test('equivalent facts are seen across competitions even when selecting a filtered club',()=>{
 const a=question('a','history',{factId:'villa-1982'}),b=question('b','history',{factId:'villa-1982',squadCode:'club-b'}),c=question('c','grounds',{squadCode:'club-b'});
 const seen=seenQuestionIds([a,b,c],['a']);
 expect(seen).toContain('b');
 expect(makeSession([b,c],'squads','fan',seen,'new').questionIds).toEqual(['c']);
});
test('a round never contains a duplicate fact',()=>{
 const a=question('a','history',{factId:'same'}),b=question('b','history',{factId:'same'});
 expect(makeSession([a,b],'squads','fan',[],'duplicates').questionIds).toHaveLength(1);
});
test('club rounds cover distinct topics and cap roster clues without adjacent roster questions',()=>{
 const bank=[...Array.from({length:20},(_,i)=>question(`player-${i}`,'players')),...['identity','grounds','honours','managers','history','records','identity','history'].map((topic,i)=>question(`fact-${i}`,topic))];
 for(let i=0;i<20;i++){
  const s=makeSession(bank,'squads','fan',[],`seed-${i}`),selected=s.questionIds.map(id=>bank.find(q=>q.id===id)!);
  expect(selected).toHaveLength(10);
  expect(selected.filter(q=>q.clubTopic==='players')).toHaveLength(2);
  expect(new Set(selected.map(q=>q.clubTopic)).size).toBe(7);
  expect(selected.some((q,i)=>q.clubTopic==='players'&&selected[i+1]?.clubTopic==='players')).toBe(false);
 }
});
test('topic balance does not pad a short unseen remainder with seen facts',()=>{
 const bank=[question('a'),question('b','grounds'),question('c','players')];
 expect(makeSession(bank,'squads','fan',['a','c'],'last').questionIds).toEqual(['b']);
});
test('daily remains independent of history and excludes retired questions',()=>{
 const bank=[question('old','history',{retired:true}),question('a'),question('b','grounds')];
 expect(makeSession(bank,'mixed','fan',[],'today',{daily:true}).questionIds).toEqual(makeSession(bank,'mixed','starter',['a','b'],'today',{daily:true}).questionIds);
 expect(makeSession(bank,'mixed','fan',[],'today',{daily:true}).questionIds).not.toContain('old');
});
