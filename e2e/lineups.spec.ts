import {test,expect} from '@playwright/test';

test('lineup hints, guesses, completion and recovery',async({page},testInfo)=>{
 await page.goto('/');
 await page.getByRole('button',{name:/Lineup detective/}).click();
 await expect(page.getByText('Eleven clues. One club.')).toBeVisible();
 await page.getByRole('button',{name:'Lineup puzzle 1',exact:true}).click();
 await page.screenshot({path:testInfo.outputPath('lineup-pitch.png'),fullPage:true});
 await page.getByRole('button',{name:'Show player (0/11)',exact:true}).click();
 await expect(page.getByRole('button',{name:'Show player (1/11)',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Team hint',exact:true}).click();
 await page.getByRole('textbox',{name:'Club name'}).fill('wrong club');
 await page.getByRole('button',{name:'Check answer',exact:true}).click();
 await expect(page.getByText('Not quite. Try again or reveal a player.')).toBeVisible();

 await page.getByRole('textbox',{name:'Club name'}).fill('AEK Athens');
 await page.getByRole('button',{name:'Check answer',exact:true}).click();
 await expect(page.getByText('Correct — you know your football.')).toBeVisible();
 await page.reload();
 await page.getByRole('button',{name:/Lineup detective/}).click();
 await expect(page.getByRole('button',{name:'Lineup puzzle 1, completed',exact:true})).toBeVisible();
 await page.screenshot({path:testInfo.outputPath('lineup-collection.png'),fullPage:true});
 await page.getByRole('button',{name:'Lineup puzzle 1, completed',exact:true}).click();
 await expect(page.getByText('Solved · 1 player reveals · team hint used')).toBeVisible();
});
