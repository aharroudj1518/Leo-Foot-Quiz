import {test,expect} from '@playwright/test';
import data from '../src/content/questions.json';
import {initialProfile,makeSession,type Question} from '../src/core/quiz';
const bank=data as Question[];

test('a retired player question still resumes, scores and remains in mistake review',async({page})=>{
 const q=bank.find(q=>q.retired&&q.squadClue)!;
 const profile=initialProfile();
 profile.session=makeSession(bank,'squads','fan',[],'archived-save',{revision:[q.id]});
 await page.addInitScript(p=>{if(!localStorage.getItem('leoqo.profile.v1'))localStorage.setItem('leoqo.profile.v1',JSON.stringify(p));},profile);
 await page.goto('/');await page.getByRole('button',{name:/Continue your round/}).click();
 await expect(page.getByTestId('squad-clue')).toBeVisible();
 await page.getByRole('button',{name:'Skip question',exact:true}).click();
 await page.reload();await page.getByRole('button',{name:/Continue your round/}).click();
 await expect(page.getByText(q.explanation,{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Leoqo home',exact:true}).click();
 await page.getByRole('tab',{name:'My learning',exact:true}).click();
 const card=page.getByTestId(`review-${q.id}`);
 await card.getByRole('button',{name:`Practise ${q.answer} again`,exact:true}).click();
 await page.getByRole('button',{name:q.answer,exact:true}).click();
 await expect(page.getByRole('button',{name:`${q.answer}, correct answer`,exact:true})).toBeDisabled();
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('leoqo.profile.v1')!).mistakes)).not.toContain(q.id);
});

test('long player names fit inside a 320-pixel phone letter board',async({page})=>{
 const q=bank.find(q=>q.category==='portraits'&&q.answer==='Robert Lewandowski')!;
 expect(q).toBeDefined();
 const profile=initialProfile();profile.session=makeSession([q],'portraits','fan',[],'long-name');
 await page.setViewportSize({width:320,height:780});await page.emulateMedia({reducedMotion:'reduce'});
 await page.addInitScript(p=>localStorage.setItem('leoqo.profile.v1',JSON.stringify(p)),profile);
 await page.goto('/');await page.getByRole('button',{name:/Continue your round/}).click();
 const positions=page.getByRole('button',{name:/Empty position/});await expect(positions).toHaveCount(17);
 const bounds=await positions.evaluateAll(els=>els.map(el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right};}));
 expect(bounds.every(r=>r.left>=0&&r.right<=320)).toBe(true);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
