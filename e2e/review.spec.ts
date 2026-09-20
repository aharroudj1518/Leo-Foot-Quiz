import {test,expect} from '@playwright/test';
import bank from '../src/content/questions.json';
import {initialProfile} from '../src/core/quiz';
test('a visual mistake shows its clue and a successful retry clears it',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:`Guess the player, ${bank.filter(q=>q.category==='portraits').length} photo questions`,exact:true}).click();
 const id=await page.evaluate(()=>JSON.parse(localStorage.getItem('leoqo.profile.v1')!).session.questionIds[0]);
 const question=bank.find(q=>q.id===id)!;
 await page.getByRole('button',{name:'Skip question',exact:true}).click();
 await page.getByRole('button',{name:'Leoqo home',exact:true}).click();await page.getByRole('tab',{name:'My learning',exact:true}).click();
 const card=page.getByTestId('review-'+id);await expect(card.getByText(question.answer,{exact:true})).toBeVisible();
 const photo=card.locator('img').first();await expect(photo).toHaveJSProperty('complete',true);expect(await photo.evaluate((img:HTMLImageElement)=>img.naturalWidth)).toBeGreaterThan(0);
 await card.getByRole('button',{name:`Practise ${question.answer} again`,exact:true}).click();
 await expect(page.getByText('QUESTION 1 OF 1',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Use answer choices',exact:true}).click();await page.getByRole('button',{name:question.answer,exact:true}).click();
 await page.getByRole('button',{name:'See my result',exact:true}).click();await page.getByRole('button',{name:'Leoqo home',exact:true}).click();await page.getByRole('tab',{name:'My learning',exact:true}).click();
 await expect(page.getByTestId('review-'+id)).toHaveCount(0);
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('leoqo.profile.v1')!).solved)).toContain(id);
});
test('all mistakes remain reachable beyond the first page',async({page})=>{
 const profile=initialProfile();profile.mistakes=bank.filter(q=>!q.premium).slice(0,13).map(q=>q.id);
 await page.addInitScript(p=>localStorage.setItem('leoqo.profile.v1',JSON.stringify(p)),profile);
 await page.goto('/');await page.getByRole('tab',{name:'My learning',exact:true}).click();
 await expect(page.locator('[data-testid^="review-"]')).toHaveCount(6);
 await page.getByRole('button',{name:'Show more mistakes (7 remaining)',exact:true}).click();
 await expect(page.locator('[data-testid^="review-"]')).toHaveCount(12);
 await page.getByRole('button',{name:'Show more mistakes (1 remaining)',exact:true}).click();
 await expect(page.locator('[data-testid^="review-"]')).toHaveCount(13);
});
