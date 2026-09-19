import {test,expect} from '@playwright/test';
import bank from '../src/content/squad-questions.json';
import source from '../src/content/sources/bundesliga-players-2026-27.json';
import {initialProfile,makeSession,type Question} from '../src/core/quiz';

test('Bundesliga shirt round shows sourced details and restores a correct answer',async({page})=>{
 const club=source.clubs.find(c=>c.club==='Bayern Munich')!;
 const player=club.players.find(p=>p.id==='manuel-neuer')!;
 const q=(bank as Question[]).find(q=>q.id===`club27-bundesliga-bayern-munich-player-${player.id}`)!;
 expect(q.answer).toBe(player.name);expect(q.squadClue?.number).toBe(player.number);expect(q.source).toBe(club.source);
 const profile=initialProfile();profile.session=makeSession([q],'squads','fan',[],'bundesliga-device');
 await page.addInitScript(p=>{if(!localStorage.getItem('leoqo.profile.v1'))localStorage.setItem('leoqo.profile.v1',JSON.stringify(p));},profile);
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/');await page.getByRole('button',{name:/Continue your round/}).click();
 await expect(page.getByTestId('squad-clue').getByRole('img',{name:new RegExp(`club-colour shirt:.*number ${player.number}$`)})).toBeVisible();
 await expect(page.getByText('BUNDESLIGA · 2026/27',{exact:true})).toBeVisible();
 await page.screenshot({path:'.expo/bundesliga-shirt.png'});
 await page.getByRole('button',{name:player.name,exact:true}).click();
 await expect(page.getByText(q.explanation,{exact:true})).toBeVisible();
 await page.reload();await page.getByRole('button',{name:/Continue your round/}).click();
 await expect(page.getByText(q.explanation,{exact:true})).toBeVisible();
 await expect(page.getByRole('button',{name:`${player.name}, correct answer`,exact:true})).toBeDisabled();
 await page.getByRole('button',{name:'See my result',exact:true}).click();
 await page.getByRole('button',{name:'Play another round',exact:true}).click();
 const next=await page.evaluate(()=>JSON.parse(localStorage.getItem('leoqo.profile.v1')!).session);
 expect(next.questionIds).toHaveLength(10);
 expect(next.questionIds).not.toContain(q.id);
 expect(next.questionIds.every((id:string)=>(bank as Question[]).find(item=>item.id===id)?.squadCode===q.squadCode)).toBe(true);
});

