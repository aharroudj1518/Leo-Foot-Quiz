import {expect,it} from 'vitest';
import data from '../src/content/questions.json';
import {advance,careerTotals,hydrate,initialProfile,makeSession,Profile,Question,submit} from '../src/core/quiz';
const bank=data.slice(0,1) as Question[];
function finish(p:Profile,id:string,correct:boolean){p={...p,session:makeSession(bank,'mixed','fan',[],id,{revision:bank.map(q=>q.id)})};return advance(submit(p,bank,correct?bank[0].answer:'__skipped__',false));}
it('keeps recorded career accuracy and round count after history trimming and reload',()=>{
 let p=initialProfile();for(let i=0;i<125;i++)p=finish(p,'round-'+i,i<25);
 expect(p.history).toHaveLength(100);expect(p.history.flatMap(h=>h.answers).filter(a=>a.correct)).toHaveLength(0);
 expect(careerTotals(hydrate(JSON.stringify(p),bank))).toEqual({rounds:125,answered:125,correct:25});
 expect(advance(p)).toBe(p);
});
it('migrates known completed rounds without counting an unfinished round',()=>{
 const {totals,...old}=finish(initialProfile(),'first',true);old.session=makeSession(bank,'mixed','fan',[],'unfinished',{revision:bank.map(q=>q.id)});
 expect(careerTotals(hydrate(JSON.stringify(old),bank))).toEqual({rounds:1,answered:1,correct:1});
});
it('replaces a known duplicate result without counting a new round',()=>{
 const p=finish(finish(initialProfile(),'same',false),'same',true);
 expect(careerTotals(p)).toEqual({rounds:1,answered:1,correct:1});
});
it('rejects inconsistent or fractional totals instead of showing invented statistics',()=>{
 for(const totals of [{rounds:1,answered:1,correct:2},{rounds:1.5,answered:2,correct:1},{rounds:-1,answered:0,correct:0}])expect(()=>hydrate(JSON.stringify({...initialProfile(),totals}),bank)).toThrow('career totals');
});
