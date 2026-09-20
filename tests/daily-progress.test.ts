import {expect,it} from 'vitest';
import data from '../src/content/questions.json';
import {advance,hydrate,initialProfile,makeSession,Profile,Question,submit} from '../src/core/quiz';
import {dailyCalendar,dailyResult,isUtcDate} from '../src/core/daily';
const bank=data.slice(0,5) as Question[];
function finish(profile:Profile,seed:string,daily=false){
 let p={...profile,session:makeSession(bank,'mixed','fan',[],seed,{daily,revision:bank.map(q=>q.id)})};
 while(!p.session?.completed){const q=bank.find(q=>q.id===p.session!.questionIds[p.session!.index])!;p=advance(submit(p,bank,q.answer,false)) as typeof p;}
 return p;
}
it('retains today’s result when a hundred practice rounds evict it from recent history',()=>{
 let p:Profile=finish(initialProfile(),'daily-2026-09-11',true);
 for(let i=0;i<100;i++)p=finish(p,'practice-'+i);
 expect(p.history).toHaveLength(100);expect(p.history.some(s=>s.daily)).toBe(false);
 const restored=hydrate(JSON.stringify(p),bank);
 expect(dailyResult(restored,'2026-09-11')?.answers.filter(a=>a.correct)).toHaveLength(5);
 expect(restored.dailyCompleted).toEqual(['2026-09-11']);
 expect(dailyCalendar(restored,'2026-09-11').streak).toBe(1);
});
it('migrates only completed daily rounds from an older save',()=>{
 const finished=finish(initialProfile(),'daily-2026-09-10',true);
 const {dailyCompleted,latestDaily,...old}=finished;
 old.session=makeSession(bank,'mixed','fan',[],'daily-2026-09-11',{daily:true});
 const restored=hydrate(JSON.stringify(old),bank);
 expect(restored.dailyCompleted).toEqual(['2026-09-10']);
 expect(dailyResult(restored,'2026-09-11')).toBeUndefined();
 expect(dailyResult(restored,'2026-09-10')?.completed).toBe(true);
});
it('counts consecutive completed days, gives today time to play, and resets after a missed day',()=>{
 const p={...initialProfile(),dailyCompleted:['2026-08-30','2026-08-31','2026-09-01','2026-09-01','2026-10-01']};
 expect(dailyCalendar(p,'2026-09-01').streak).toBe(3);
 expect(dailyCalendar(p,'2026-09-02').streak).toBe(3);
 expect(dailyCalendar(p,'2026-09-03').streak).toBe(0);
 expect(dailyCalendar(p,'2026-09-02').days.filter(d=>d.completed)).toHaveLength(3);
});
it('does not count finishing the same daily challenge twice as two days',()=>{
 let p=finish(initialProfile(),'daily-2026-09-11',true);p=finish(p,'daily-2026-09-11',true);
 expect(p.dailyCompleted).toEqual(['2026-09-11']);expect(advance(p)).toBe(p);
});
it('rejects malformed retained data and validates leap-day dates',()=>{
 expect(isUtcDate('2026-02-29')).toBe(false);expect(isUtcDate('2028-02-29')).toBe(true);
 expect(()=>hydrate(JSON.stringify({...initialProfile(),dailyCompleted:['2026-02-30']}),bank)).toThrow('daily progress');
 expect(()=>hydrate(JSON.stringify({...initialProfile(),latestDaily:{completed:true}}),bank)).toThrow('daily result');
});
