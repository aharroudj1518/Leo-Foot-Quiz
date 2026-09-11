import {test,expect} from '@playwright/test';
import bank from '../src/content/squad-questions.json';
import chapters from '../src/content/squad-chapters.json';
test('Champions League searches, starts a club round and restores its answer',async({page},testInfo)=>{
  await page.goto('/');await expect(page.getByRole('button',{name:'Explore World Cup squads',exact:true})).toHaveCount(0);
  await page.screenshot({path:`.expo/competition-home-${testInfo.project.name}.png`});
  await page.getByRole('button',{name:'Explore Champions League 2026/27',exact:true}).click();
  await page.getByRole('textbox',{name:'Find a club',exact:true}).fill('Arsenal');
  const chapter=chapters.find(c=>c.code==='ucl27-52280')!;
  const label=`${chapter.name} club, 0 of ${chapter.questionIds.length} solved`;
  await expect(page.getByRole('button',{name:label,exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:/Liverpool FC club/})).toHaveCount(0);
  await page.screenshot({path:`.expo/champions-league-${testInfo.project.name}.png`});
  await page.getByRole('button',{name:label,exact:true}).click();
  const ids=await page.evaluate(()=>JSON.parse(localStorage.getItem('leoqo.profile.v1')!).session.questionIds as string[]);
  expect(ids.every(id=>bank.find(q=>q.id===id)?.squadCode==='ucl27-52280')).toBe(true);
  const q=bank.find(q=>q.id===ids[0])!;
  await page.getByRole('button',{name:q.answer,exact:true}).click();
  await page.reload();await page.getByRole('button',{name:/Continue your round/}).click();
  await expect(page.getByText(q.explanation,{exact:true})).toBeVisible();
});
test('each domestic league opens its own complete club space and playable questions',async({page},testInfo)=>{
 for(const [name,id,count] of [['Premier League','premier-league',20],['La Liga','la-liga',20],['Serie A','serie-a',20],['Bundesliga','bundesliga',18]] as const){
  await page.goto('/');await page.getByRole('button',{name:`Explore ${name} 2026/27`,exact:true}).click();
  await expect(page.getByRole('button',{name:/ club, .* solved$/})).toHaveCount(count);
  const club=chapters.find(c=>c.competition===id)!;
  if(id==='premier-league')await page.screenshot({path:`.expo/domestic-league-${testInfo.project.name}.png`});
  await page.getByRole('button',{name:`${club.name} club, 0 of ${club.questionIds.length} solved`,exact:true}).click();
  const ids=await page.evaluate(()=>JSON.parse(localStorage.getItem('leoqo.profile.v1')!).session.questionIds as string[]);
  expect(ids.every(q=>club.questionIds.includes(q))).toBe(true);
  const q=bank.find(q=>q.id===ids[0])!;
  await page.getByRole('button',{name:q.answer,exact:true}).click();
  await expect(page.getByText(q.explanation,{exact:true})).toBeVisible();
 }
});
