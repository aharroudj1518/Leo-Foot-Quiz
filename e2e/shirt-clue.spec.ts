import {test,expect} from '@playwright/test';
import questions from '../src/content/squad-questions.json';
import {initialProfile,makeSession,type Question} from '../src/core/quiz';

for(const largeText of [false,true])test(`shirt clue is readable and playable on a narrow phone, large text ${largeText}`,async({page},testInfo)=>{
 await page.setViewportSize({width:320,height:780});
 await page.emulateMedia({reducedMotion:'reduce'});
 const question=(questions as Question[]).find(q=>q.squadClue&&q.squadClue.number>=90&&q.squadClue.country.length>=16)!;
 expect(question).toBeDefined();
 const profile=initialProfile();profile.largeText=largeText;
 profile.session=makeSession([question],'squads','fan',[],'shirt-accessibility');
 await page.addInitScript(p=>{if(!localStorage.getItem('leoqo.profile.v1'))localStorage.setItem('leoqo.profile.v1',JSON.stringify(p));},profile);
 await page.goto('/');await page.getByRole('button',{name:/Continue your round/}).click();
 const shirt=page.getByRole('img',{name:`Football shirt number ${question.squadClue!.number}`,exact:true});
 await expect(shirt).toBeVisible();
 const clue=page.getByTestId('squad-clue');
 await expect(clue.getByText(question.squadClue!.country,{exact:true})).toBeVisible();
 const bounds=await clue.boundingBox();
 expect(bounds!.x).toBeGreaterThanOrEqual(0);
 expect(bounds!.x+bounds!.width).toBeLessThanOrEqual(320);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
 const buttons=await Promise.all(question.options.map(o=>page.getByRole('button',{name:o,exact:true}).boundingBox()));
 for(const b of buttons){expect(b!.height).toBeGreaterThanOrEqual(44);expect(b!.x+b!.width).toBeLessThanOrEqual(320);}
 if(largeText)expect(new Set(buttons.map(b=>Math.round(b!.x))).size).toBe(1);
 else expect(new Set(buttons.map(b=>Math.round(b!.x))).size).toBe(2);
 await page.screenshot({path:`.expo/shirt-${largeText?'large':'standard'}-${testInfo.project.name}.png`});
 await page.getByRole('button',{name:question.answer,exact:true}).click();
 await expect(page.getByText(question.explanation,{exact:true})).toBeVisible();
 await page.reload();await page.getByRole('button',{name:/Continue your round/}).click();
 await expect(shirt).toBeVisible();
 await expect(page.getByText(question.explanation,{exact:true})).toBeVisible();
});
