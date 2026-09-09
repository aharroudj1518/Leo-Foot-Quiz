import {test,expect} from '@playwright/test';
import bank from '../src/content/questions.json';

test('player images load, text alternatives work, and the complete visual round persists',async({page})=>{
  await page.goto('/');
  await page.getByRole('button',{name:'Guess the player, 5 photo questions',exact:true}).click();
  await expect(page.getByTestId('visual-question')).toBeVisible();
  const photo=page.getByTestId('visual-question').locator('img').first();
  await expect(photo).toHaveJSProperty('complete',true);
  expect(await photo.evaluate((img:HTMLImageElement)=>img.naturalWidth)).toBeGreaterThan(100);
  await page.getByRole('button',{name:'Use text clue',exact:true}).click();
  await expect(page.getByRole('button',{name:'Show visual clue',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Show visual clue',exact:true}).click();
  for(let i=0;i<5;i++){
    const id=await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('leoqo.profile.v1')!).session;return s.questionIds[s.index];});
    const question=bank.find(q=>q.id===id)!;
    await page.getByRole('button',{name:question.answer,exact:true}).click();
    await expect(page.getByText('NAILED IT',{exact:true})).toBeVisible();
    await page.getByRole('button',{name:i===4?'See my result':'Next question',exact:true}).click();
  }
  await expect(page.getByText('TOP BINS.',{exact:true})).toBeVisible();
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('leoqo.profile.v1')!).history.at(-1).answers.every((a:any)=>a.correct))).toBe(true);
});

test('badge and stadium rounds open and survive a reload',async({page})=>{
  for(const label of ['Guess the badge, 6 club puzzles','Stadium tour, 3 visual questions']){
    await page.goto('/');await page.getByRole('button',{name:label,exact:true}).click();
    await expect(page.getByTestId('visual-question')).toBeVisible();
    await page.getByRole('button',{name:'Skip question',exact:true}).click();
    await page.reload();await page.getByRole('button',{name:/Continue your round/}).click();
    await expect(page.getByText('ONE TO REMEMBER',{exact:true})).toBeVisible();
  }
});

test('visual home and answer grid fit a small phone with reduced motion',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:320,height:780});
  await page.goto('/');await expect(page.getByRole('button',{name:'Guess the badge, 6 club puzzles',exact:true})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.getByRole('button',{name:'Guess the player, 5 photo questions',exact:true}).click();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
