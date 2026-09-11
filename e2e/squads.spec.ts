import {test,expect} from '@playwright/test';
import bank from '../src/content/squad-questions.json';
test('country archive searches, starts a scoped round and restores its answer',async({page})=>{
  await page.goto('/');await page.getByRole('button',{name:'Explore World Cup squads',exact:true}).click();
  await page.getByRole('textbox',{name:'Find a country',exact:true}).fill('France');
  await expect(page.getByRole('button',{name:'France squad, 0 of 26 solved',exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:/Argentina squad/})).toHaveCount(0);
  await page.getByRole('button',{name:'France squad, 0 of 26 solved',exact:true}).click();
  const ids=await page.evaluate(()=>JSON.parse(localStorage.getItem('leoqo.profile.v1')!).session.questionIds as string[]);
  expect(ids.every(id=>bank.find(q=>q.id===id)?.squadCode==='FRA')).toBe(true);
  const q=bank.find(q=>q.id===ids[0])!;
  await page.getByRole('button',{name:q.answer,exact:true}).click();
  await page.reload();await page.getByRole('button',{name:/Continue your round/}).click();
  await expect(page.getByText(q.explanation,{exact:true})).toBeVisible();
});
