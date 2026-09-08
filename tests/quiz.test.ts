import {describe,it,expect} from 'vitest';
import data from '../src/content/questions.json';
import {advance,correctAnswer,hydrate,initialProfile,makeSession,mastery,normalize,Question,submit,validateBank} from '../src/core/quiz';
const bank=data as Question[];
describe('published shape and answer correctness',()=>{
it('validates every development question',()=>expect(validateBank(bank)).toEqual([]));
it('rejects duplicate rendered labels after normalization',()=>{const q={...bank[0],options:['Oblak','Óblak','Other','Third'],answer:'Oblak'};expect(validateBank([q])).toContain(`Invalid options: ${q.id}`);});
it('accepts accents and defined club aliases, not arbitrary close names',()=>{const q=bank.find(q=>q.answer==='Manchester United')!;expect(correctAnswer(q,'  Man United ')).toBe(true);expect(correctAnswer(q,'Manchester City')).toBe(false);expect(normalize('Modrić')).toBe('modric');});
it('does not expose premium items in a free mixed round',()=>{for(let i=0;i<20;i++){const s=makeSession(bank,'mixed','fan',[],String(i));expect(s.questionIds.every(id=>!bank.find(q=>q.id===id)!.premium)).toBe(true);}});
it('gives the same daily set independent of difficulty and seen history',()=>{expect(makeSession(bank,'mixed','starter',[],'daily-2026-09-08',{daily:true}).questionIds).toEqual(makeSession(bank,'mixed','expert',bank.map(q=>q.id),'daily-2026-09-08',{daily:true}).questionIds);});
it('finishes unseen questions without padding a round with repeats',()=>{const available=bank.filter(q=>!q.premium&&q.difficulty==='fan');const only=available[0];const seen=available.slice(1).map(q=>q.id);expect(makeSession(bank,'mixed','fan',seen,'fresh').questionIds).toEqual([only.id]);});
it('rejects a clue that gives away its own answer',()=>{const q={...bank[0],id:'leak',prompt:'Which club is this?\n\nReal Madrid’s city rival, founded in 1903',answer:'Real Madrid',options:['Real Madrid','Atlético Madrid','Sevilla','Valencia']};expect(validateBank([q])).toContain('Answer leaked in prompt: leak');});
it('handles empty filtered pools explicitly',()=>expect(()=>makeSession(bank,'legends','fan',[],'empty')).toThrow());
});
describe('saveable session transitions',()=>{
it('blocks duplicate submissions and duplicate completion rewards',()=>{let p=initialProfile();p.session=makeSession(bank,'rules','fan',[],'unit');const total=p.session.questionIds.length;for(let i=0;i<total;i++){const q=bank.find(q=>q.id===p.session!.questionIds[i])!;p=submit(p,bank,q.answer,false);expect(submit(p,bank,q.answer,false)).toBe(p);p=advance(p);}expect(p.history).toHaveLength(1);expect(advance(p)).toBe(p);expect(p.history[0].answers).toHaveLength(total);});
it('preserves answer/reveal state across restart and then advances once',()=>{let p=initialProfile();p.session=makeSession(bank,'rules','starter',[],'resume');p=submit(p,bank,'wrong',false);const restored=hydrate(JSON.stringify(p),bank);expect(restored.session?.answers).toHaveLength(1);expect(restored.mistakes).toHaveLength(1);expect(advance(restored).session?.index).toBe(1);});
it('refuses to advance an unanswered question',()=>{const p=initialProfile();p.session=makeSession(bank,'world','starter',[],'start');expect(advance(p)).toBe(p);});
it('a correct revision clears its earlier mistake',()=>{let p=initialProfile();const q=bank[0];p.mistakes=[q.id];p.session=makeSession(bank,'mixed','fan',[],'review',{revision:[q.id]});p=submit(p,bank,q.answer,true);expect(p.mistakes).toEqual([]);});
it('rejects corrupt storage instead of silently deleting progress',()=>expect(()=>hydrate('{broken',bank)).toThrow());
it('refuses a save from an unknown schema version instead of guessing',()=>expect(()=>hydrate(JSON.stringify({...initialProfile(),version:2}),bank)).toThrow('could not be read'));
it('drops an in-progress session whose questions left the bank, but keeps history and mistakes',()=>{let p=initialProfile();p.session=makeSession(bank,'rules','starter',[],'gone');p=submit(p,bank,'x',false);p.session={...p.session!,questionIds:['removed-1',...p.session!.questionIds.slice(1)]};const r=hydrate(JSON.stringify(p),bank);expect(r.session).toBeNull();expect(r.mistakes).toHaveLength(1);expect(r.seen).toHaveLength(1);});
it('drops a session whose index points past its questions',()=>{const p=initialProfile();p.session={...makeSession(bank,'rules','starter',[],'idx'),index:99};expect(hydrate(JSON.stringify(p),bank).session).toBeNull();});
it('older saves without the timed flag hydrate with timed off',()=>{const {timed,...old}=initialProfile();expect(hydrate(JSON.stringify(old),bank).timed).toBe(false);});
it('tallies mastery per topic from completed rounds only',()=>{let p=initialProfile();p.session=makeSession(bank,'rules','starter',[],'m');const ids=p.session.questionIds;for(let i=0;i<ids.length;i++){const q=bank.find(q=>q.id===ids[i])!;p=submit(p,bank,i===0?q.answer:'__timed_out__',false);p=advance(p);}const m=mastery(p,bank);expect(m).toEqual([{category:'rules',correct:1,total:ids.length}]);expect(mastery(initialProfile(),bank)).toEqual([]);});
});
