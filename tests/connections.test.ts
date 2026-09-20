import {expect,it} from 'vitest';
import data from '../src/content/questions.json';
import connections from '../src/content/connection-questions.json';
import {makeSession,type Question} from '../src/core/quiz';

it('offers a full connection round followed by unseen careers without padding repeats',()=>{
  const bank=data as Question[];
  const first=makeSession(bank,'connections','starter',[],'connections-first');
  expect(first.questionIds).toHaveLength(10);
  const second=makeSession(bank,'connections','expert',first.questionIds,'connections-second');
  expect(second.questionIds).toHaveLength(connections.length-10);
  expect(second.questionIds.every(id=>!first.questionIds.includes(id))).toBe(true);
  expect(new Set([...first.questionIds,...second.questionIds]).size).toBe(connections.length);
});

it('does not offer Ibrahimović as a wrong answer to the Barcelona and PSG clue',()=>{
  const messi=connections.find(q=>q.id==='connections-messi')!;
  expect(messi.options).not.toContain('Zlatan Ibrahimović');
  expect(messi.options).toHaveLength(4);
});
