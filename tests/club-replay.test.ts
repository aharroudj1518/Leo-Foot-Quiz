import {expect,test} from 'vitest';
import {makeSession,replayClub,type Question} from '../src/core/quiz';
import data from '../src/content/squad-questions.json';
const bank=data as Question[];
test('saved club rounds retain their club, while mixed club rounds remain mixed',()=>{
 const club=bank[0].squadCode!;
 const session=makeSession(bank.filter(q=>q.squadCode===club),'squads','fan',[],'replay');
 expect(replayClub(JSON.parse(JSON.stringify(session)),bank)).toBe(club);
 const other=bank.find(q=>q.squadCode!==club)!;
 expect(replayClub({...session,questionIds:[session.questionIds[0],other.id]},bank)).toBeUndefined();
 expect(replayClub({...session,questionIds:['removed-question']},bank)).toBeUndefined();
 expect(replayClub({...session,mode:'mixed'},bank)).toBeUndefined();
});
