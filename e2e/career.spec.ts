import {test,expect} from '@playwright/test';
import {initialProfile} from '../src/core/quiz';
test('learning shows durable career totals separately from recent history',async({page})=>{
 const profile={...initialProfile(),totals:{rounds:125,answered:1000,correct:750}};
 await page.addInitScript(p=>localStorage.setItem('leoqo.profile.v1',JSON.stringify(p)),profile);
 await page.goto('/');await page.getByRole('tab',{name:'My learning',exact:true}).click();
 await expect(page.getByText('125',{exact:true})).toBeVisible();
 await expect(page.getByText('75%',{exact:true})).toBeVisible();
 await page.reload();await page.getByRole('tab',{name:'My learning',exact:true}).click();
 await expect(page.getByText('125',{exact:true})).toBeVisible();
});
