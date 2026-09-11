import {expect,it} from 'vitest';
import data from '../src/content/questions.json';
import {hydrate,initialProfile,makeSession,submit,Question} from '../src/core/quiz';
const bank=data as Question[];
it('keeps collection wins after history is trimmed and later answers are wrong',()=>{
  let p=initialProfile();p.session=makeSession(bank,'portraits','fan',[],'collection');
  const q=bank.find(q=>q.id===p.session!.questionIds[0])!;
  p=submit(p,bank,q.answer,false);
  p.session=makeSession(bank,'portraits','fan',[],'collection');
  p=submit(p,bank,'wrong',false);p.history=[];p.session=null;
  expect(hydrate(JSON.stringify(p),bank).solved).toContain(q.id);
});
it('migrates previous saved correct answers without counting incorrect answers',()=>{
  const p=initialProfile();delete p.solved;p.session=makeSession(bank,'portraits','fan',[],'old');
  const id=p.session.questionIds[0];p.session.answers=[{questionId:id,value:'saved',correct:true,hinted:false}];
  expect(hydrate(JSON.stringify(p),bank).solved).toEqual([id]);
  p.session.answers[0].correct=false;
  expect(hydrate(JSON.stringify(p),bank).solved).toEqual([]);
});
