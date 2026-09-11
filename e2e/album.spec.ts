import {test,expect} from '@playwright/test';
import manifest from '../assets/players/manifest.json';
test('all fifty album portraits load across the three chapters',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Open player album',exact:true}).click();
 for(const [title,count] of [['World stars',26],['Game changers',12],['The greats',12]] as const){
  await page.getByRole('tab',{name:title,exact:true}).click();
  const cards=page.locator('[aria-label^="Uncollected player "]');await expect(cards).toHaveCount(count);
  await expect.poll(async()=>cards.locator('img').evaluateAll(images=>images.filter(i=>(i as HTMLImageElement).complete&&(i as HTMLImageElement).naturalWidth>100).length)).toBe(count);
 }
});
test('album chapters keep their own questions and restore progress',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Open player album',exact:true}).click();
 await page.getByRole('tab',{name:'Game changers',exact:true}).click();
 await expect(page.getByRole('progressbar',{name:'Game changers collection'})).toHaveAttribute('aria-valuemax','12');
 await page.getByRole('button',{name:'Play Game changers',exact:true}).click();
 await expect(page.getByTestId('visual-question')).toBeVisible();
 const ids=await page.evaluate(()=>JSON.parse(localStorage.getItem('leoqo.profile.v1')!).session.questionIds);
 expect(ids).toHaveLength(10);
 const allowed=manifest.filter(p=>p.collection==='women').map(p=>'visual-'+p.id);
 expect(ids.every((id:string)=>allowed.includes(id))).toBe(true);
 const player=manifest.find(p=>'visual-'+p.id===ids[0])!;
 await page.getByRole('button',{name:'Use answer choices',exact:true}).click();
 await page.getByRole('button',{name:player.name,exact:true}).click();
 await page.reload();await page.getByRole('button',{name:/Continue your round/}).click();
 await expect(page.getByText('NAILED IT',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Leoqo home',exact:true}).click();
 await page.getByRole('button',{name:'Open player album',exact:true}).click();
 await page.getByRole('tab',{name:'Game changers',exact:true}).click();
 await expect(page.getByText(player.name,{exact:true})).toBeVisible();
 await expect(page.getByRole('progressbar',{name:'Game changers collection'})).toHaveAttribute('aria-valuenow','1');
});
test('album chapter navigation fits a narrow phone',async({page})=>{
 await page.setViewportSize({width:320,height:780});await page.goto('/');
 await page.getByRole('button',{name:'Open player album',exact:true}).click();
 await page.getByRole('tab',{name:'The greats',exact:true}).click();
 await expect(page.getByRole('button',{name:'Play The greats',exact:true})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
