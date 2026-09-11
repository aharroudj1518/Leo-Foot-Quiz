import {test,expect} from '@playwright/test';
import questions from '../src/content/visual-questions.json';
import {initialProfile,makeSession,type Question} from '../src/core/quiz';

for(const id of ['rivaldo','caicedo'])test(`portrait ${id} keeps the full source frame on a narrow phone`,async({page},info)=>{
 await page.setViewportSize({width:320,height:780});
 await page.emulateMedia({reducedMotion:'reduce'});
 const question=(questions as Question[]).find(q=>q.id===`visual-${id}`)!;
 const profile=initialProfile();profile.session=makeSession([question],'portraits','fan',[],`framing-${id}`);
 await page.addInitScript(p=>localStorage.setItem('leoqo.profile.v1',JSON.stringify(p)),profile);
 await page.goto('/');await page.getByRole('button',{name:/Continue your round/}).click();
 const photo=page.getByTestId('visual-question').locator('img').first();
 await expect(photo).toHaveJSProperty('complete',true);
 // React Native Web paints the visible image as a background; img is its accessibility counterpart.
 const visiblePhoto=page.getByTestId('visual-question').locator('[style*="background-image"]').first();
 await expect(visiblePhoto).toHaveCSS('background-size','contain');
 expect(await photo.evaluate((img:HTMLImageElement)=>img.naturalWidth)).toBeGreaterThan(100);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
 await page.screenshot({path:`.expo/portrait-${id}-${info.project.name}.png`});
});
