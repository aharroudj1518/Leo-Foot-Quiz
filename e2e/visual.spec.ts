import {test,expect} from '@playwright/test';
import bank from '../src/content/questions.json';

test('player images load, text alternatives work, and the complete visual round persists',async({page})=>{
  test.setTimeout(60000); // Ten full names require substantially more taps than the original five.
  await page.goto('/');
  await page.getByRole('button',{name:'Guess the player, 50 photo questions',exact:true}).click();
  await expect(page.getByTestId('visual-question')).toBeVisible();
  const photo=page.getByTestId('visual-question').locator('img').first();
  await expect(photo).toHaveJSProperty('complete',true);
  expect(await photo.evaluate((img:HTMLImageElement)=>img.naturalWidth)).toBeGreaterThan(100);
  const bounds=await page.getByTestId('visual-question').evaluate(el=>{
    const frame=el.getBoundingClientRect(),rendered=el.querySelector('img')!.getBoundingClientRect();
    return {overflowWidth:rendered.width-frame.width,overflowHeight:rendered.height-frame.height};
  }); // Measure in one animation frame, since the reveal scales the parent.
  expect(bounds.overflowWidth).toBeLessThanOrEqual(1);
  expect(bounds.overflowHeight).toBeLessThanOrEqual(1);
  await page.getByRole('button',{name:'Use text clue',exact:true}).click();
  await expect(page.getByRole('button',{name:'Show visual clue',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Show visual clue',exact:true}).click();
  for(let i=0;i<10;i++){
    const id=await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('leoqo.profile.v1')!).session;return s.questionIds[s.index];});
    const question=bank.find(q=>q.id===id)!;
    const name=question.answer.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z]/g,'');
    for(const letter of name){await page.getByRole('button',{name:new RegExp('^Letter '+letter+', tile ')}).and(page.locator(':enabled')).first().click();}
    await page.getByRole('button',{name:'Shuffle letters',exact:true}).click();
    await page.getByRole('button',{name:'Check name',exact:true}).click();
    await expect(page.getByText('NAILED IT',{exact:true})).toBeVisible();
    await page.getByRole('button',{name:i===9?'See my result':'Next question',exact:true}).click();
  }
  await expect(page.getByText('TOP BINS.',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Leoqo home',exact:true}).click();
  await expect(page.getByRole('button',{name:'Player album, 10 of 50 solved',exact:true})).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button',{name:'Player album, 10 of 50 solved',exact:true})).toBeVisible();
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('leoqo.profile.v1')!).history.at(-1).answers.every((a:any)=>a.correct))).toBe(true);
});

test('badge and stadium rounds open and survive a reload',async({page})=>{
  for(const label of ['Guess the badge, 6 club puzzles','Stadium tour, 6 visual questions']){
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
  await page.getByRole('button',{name:'Guess the player, 50 photo questions',exact:true}).click();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
