import {test,expect} from '@playwright/test';
import source from '../src/content/sources/la-liga-players-2026-27.json';
import data from '../src/content/squad-questions.json';
import {initialProfile,makeSession,type Question} from '../src/core/quiz';
test('Barcelona official player snapshot is playable in La Liga',async({page})=>{
 const club=source.clubs[0],player=club.players.find(p=>p.name==='Joan García')!;
 const q=(data as Question[]).find(q=>q.id===`club27-la-liga-barcelona-player-${player.id}`)!;
 expect(q.squadClue?.number).toBe(player.number);
 expect(q.source).toBe(club.source);
 await page.addInitScript(p=>localStorage.setItem('leoqo.profile.v1',JSON.stringify(p)),{...initialProfile(),session:makeSession([q],'squads','fan',[],'barcelona-qa')});
 await page.goto('/');
 await page.getByRole('button',{name:/Continue your round/}).click();
 await expect(page.getByRole('img',{name:'Football shirt number 1',exact:true})).toBeVisible();
 await expect(page.getByText('LA LIGA · 2026/27',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:player.name,exact:true}).click();
 await expect(page.getByText(q.explanation,{exact:true})).toBeVisible();
});
