import {test,expect} from '@playwright/test';
import data from '../src/content/questions.json';
import {initialProfile,makeSession,Question} from '../src/core/quiz';

test('a typed surname counts and survives reopening the saved answer',async({page})=>{
 const profile=initialProfile();profile.session=makeSession(data as Question[],'portraits','fan',[],'typed-messi',{revision:['visual-messi']});
 await page.addInitScript(p=>{if(!localStorage.getItem('leoqo.profile.v1'))localStorage.setItem('leoqo.profile.v1',JSON.stringify(p));},profile);
 await page.goto('/');await page.getByRole('button',{name:/Continue your round/}).click();
 await page.getByRole('button',{name:/I’d rather type the name/}).click();
 await page.getByRole('textbox',{name:'Your answer',exact:true}).fill('Messi');
 await page.getByRole('button',{name:'Check answer',exact:true}).click();
 await expect(page.getByText('NAILED IT',{exact:true})).toBeVisible();
 await page.reload();await page.getByRole('button',{name:/Continue your round/}).click();
 await expect(page.getByText('NAILED IT',{exact:true})).toBeVisible();
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('leoqo.profile.v1')!));
 expect(saved.session.answers).toHaveLength(1);expect(saved.solved).toContain('visual-messi');
});

test('an ambiguous surname stays unscored and a nickname resolves it',async({page})=>{
 const profile=initialProfile();profile.session=makeSession(data as Question[],'portraits','fan',[],'typed-r9',{revision:['visual-ronaldo-brazil']});
 await page.addInitScript(p=>localStorage.setItem('leoqo.profile.v1',JSON.stringify(p)),profile);
 await page.goto('/');await page.getByRole('button',{name:/Continue your round/}).click();
 await page.getByRole('button',{name:/I’d rather type the name/}).click();
 const input=page.getByRole('textbox',{name:'Your answer',exact:true});await input.fill('Ronaldo');
 await page.getByRole('button',{name:'Check answer',exact:true}).click();
 await expect(page.getByText(/More than one player uses that name/)).toBeVisible();
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('leoqo.profile.v1')!));
 expect(saved.session.answers).toEqual([]);expect(saved.mistakes).toEqual([]);expect(saved.seen).toEqual([]);
 await input.fill('R9');await expect(page.getByText(/More than one player uses that name/)).toHaveCount(0);
 await page.getByRole('button',{name:'Check answer',exact:true}).click();
 await expect(page.getByText('NAILED IT',{exact:true})).toBeVisible();
});
