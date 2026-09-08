import {test,expect} from '@playwright/test';
test('a full round survives refresh and records one result',async({page})=>{
await page.goto('/');await page.getByRole('button',{name:'Let’s play',exact:true}).click();
await expect(page.getByText('QUESTION 1 OF 10')).toBeVisible();
await page.getByRole('button',{name:'Skip question',exact:true}).click();
await expect(page.getByText('One for the memory bank.',{exact:true})).toBeVisible();
await page.reload();await page.getByRole('button',{name:/Continue your round/}).click();
await expect(page.getByText('One for the memory bank.',{exact:true})).toBeVisible();
await page.getByRole('button',{name:'Next question',exact:true}).click();
for(let i=2;i<=10;i++){await expect(page.getByText(`QUESTION ${i} OF 10`)).toBeVisible();await page.getByRole('button',{name:'Skip question',exact:true}).click();await page.getByRole('button',{name:i===10?'See my result':'Next question',exact:true}).click();}
await expect(page.getByText('FULL TIME. WELL PLAYED.')).toBeVisible();
const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('leoqo.profile.v1')!));expect(saved.history).toHaveLength(1);expect(saved.mistakes).toHaveLength(10);
});
test('adult step guards the shop, and preview does not pretend to charge',async({page})=>{
await page.goto('/');await page.getByRole('tab',{name:'Explore',exact:true}).click();await page.getByRole('button',{name:/Legends Pack, 40 questions/}).click();
await expect(page.getByRole('button',{name:'Continue',exact:true})).toBeDisabled();
const instruction=await page.getByText(/Enter these digits in reverse order:/).textContent();const code=instruction!.match(/\d{3}/)![0];
await page.getByRole('textbox',{name:'Digits in reverse order'}).fill(code.split('').reverse().join(''));await page.getByRole('checkbox').click();await page.getByRole('button',{name:'Continue',exact:true}).click();
await expect(page.getByRole('button',{name:'Purchases unavailable in this build'})).toBeDisabled();
await page.getByRole('button',{name:'Restore purchases',exact:true}).click();await expect(page.getByText(/No payment has been taken/).first()).toBeVisible();
await page.getByRole('button',{name:'Try 3 questions free'}).click();await expect(page.getByText('QUESTION 1 OF 3')).toBeVisible();
});
test('large-text preference persists and layout fits a narrow screen',async({page})=>{
await page.setViewportSize({width:320,height:780});await page.goto('/');await page.getByRole('tab',{name:'Settings',exact:true}).click();await page.getByRole('switch',{name:'Larger text'}).click();await page.reload();await page.getByRole('tab',{name:'Settings',exact:true}).click();await expect(page.getByRole('switch',{name:'Larger text'})).toBeChecked();
expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
});
test('timed rounds are opt-in, count down, and reveal the answer when time runs out',async({page})=>{
await page.clock.install();await page.goto('/');await page.getByRole('button',{name:'Let’s play',exact:true}).click();await expect(page.getByText('TAKE YOUR TIME')).toBeVisible();
await page.getByRole('button',{name:'Save and leave round'}).click();await page.getByRole('tab',{name:'Settings',exact:true}).click();await page.getByRole('switch',{name:'Timed rounds'}).click();
await page.getByRole('tab',{name:'Play',exact:true}).click();await page.getByRole('button',{name:/Continue your round/}).click();await expect(page.getByText('20s left')).toBeVisible();
await page.clock.runFor(21000);await expect(page.getByText('Time’s up. Here’s the answer.')).toBeVisible();
});
test('free play sends no remote analytics, ad or billing requests',async({page})=>{
const external:string[]=[];page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:8081')&&!r.url().startsWith('data:'))external.push(r.url());});await page.goto('/');await page.getByRole('button',{name:'Let’s play',exact:true}).click();await page.getByRole('button',{name:'Skip question',exact:true}).click();expect(external).toEqual([]);
});
