import {test,expect} from '@playwright/test';
import source from '../src/content/sources/la-liga-players-2026-27.json';
import milan from '../src/content/sources/serie-a-players-2026-27.json';
import data from '../src/content/squad-questions.json';
import {initialProfile,makeSession,type Question} from '../src/core/quiz';
for(const [club,code,name,competition] of [
 [source.clubs[0],'la-liga-barcelona','Joan García','LA LIGA'],
 [milan.clubs[0],'serie-a-ac-milan','Mike Maignan','SERIE A'],
] as const){
test(`${club.club} official player snapshot is playable in ${competition}`,async({page})=>{
 const player=club.players.find(p=>p.name===name)!;
 const q=(data as Question[]).find(q=>q.id===`club27-${code}-player-${player.id}`)!;
 expect(q.squadClue?.number).toBe(player.number);
 expect(q.source).toBe(club.source);
 await page.addInitScript(p=>localStorage.setItem('leoqo.profile.v1',JSON.stringify(p)),{...initialProfile(),session:makeSession([q],'squads','fan',[],'barcelona-qa')});
 await page.goto('/');
 await page.getByRole('button',{name:/Continue your round/}).click();
 await expect(page.getByRole('img',{name:`Football shirt number ${player.number}`,exact:true})).toBeVisible();
 await expect(page.getByText(`${competition} · 2026/27`,{exact:true})).toBeVisible();
 await page.getByRole('button',{name:player.name,exact:true}).click();
 await expect(page.getByText(q.explanation,{exact:true})).toBeVisible();
});
}
