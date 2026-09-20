import {test,expect} from '@playwright/test';
import questions from '../src/content/visual-questions.json';
import {initialProfile,makeSession,type Question} from '../src/core/quiz';
for(const id of ['bernabeu','olympiastadion','da-luz'])test(`stadium ${id} loads and accepts its answer`,async({page})=>{
 const q=(questions as Question[]).find(q=>q.id===`visual-${id}`)!;
 const p=initialProfile();p.session=makeSession([q],'stadiums','fan',[],'stadium-photo');
 await page.addInitScript(p=>localStorage.setItem('leoqo.profile.v1',JSON.stringify(p)),p);
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/');await page.getByRole('button',{name:/Continue your round/}).click();
 const img=page.getByTestId('visual-question').locator('img').first();
 await expect(img).toHaveJSProperty('complete',true);
 expect(await img.evaluate((i:HTMLImageElement)=>i.naturalWidth)).toBeGreaterThan(500);
 await page.screenshot({path:`.expo/stadium-${id}.png`});
 await page.getByRole('button',{name:q.answer,exact:true}).click();
 await expect(page.getByText(q.explanation,{exact:true})).toBeVisible();
});
