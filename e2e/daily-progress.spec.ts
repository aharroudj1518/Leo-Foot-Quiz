import {test,expect} from '@playwright/test';
import data from '../src/content/questions.json';
import {advance,initialProfile,makeSession,Profile,Question,submit} from '../src/core/quiz';
test('retained daily result and three-day streak survive reload beside an unfinished round',async({page},testInfo)=>{
 await page.clock.install({time:new Date('2026-09-11T12:00:00Z')});
 const bank=data as Question[];let profile:Profile=initialProfile();
 profile.session=makeSession(bank,'mixed','fan',[],'daily-2026-09-11',{daily:true});
 while(!profile.session?.completed){const q=bank.find(q=>q.id===profile.session!.questionIds[profile.session!.index])!;profile=advance(submit(profile,bank,q.answer,false));}
 profile.dailyCompleted=['2026-09-09','2026-09-10','2026-09-11'];profile.history=[];
 profile.session=makeSession(bank,'rules','fan',[],'unfinished-practice');
 await page.addInitScript(p=>{if(!localStorage.getItem('leoqo.profile.v1'))localStorage.setItem('leoqo.profile.v1',JSON.stringify(p));},profile);
 await page.setViewportSize({width:360,height:800});await page.goto('/');
 await expect(page.getByText('3-day streak',{exact:true})).toBeVisible();
 await expect(page.getByLabel('2026-09-11, today: completed',{exact:true})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 if(testInfo.project.name==='phone')await page.getByTestId('daily-challenge').screenshot({path:'.expo/daily-challenge-phone.png'});
 await page.reload();await page.getByRole('button',{name:'See today’s result',exact:true}).click();
 await expect(page.getByText('TOP BINS.',{exact:true})).toBeVisible();
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('leoqo.profile.v1')!).session.id)).toBe('unfinished-practice');
});
