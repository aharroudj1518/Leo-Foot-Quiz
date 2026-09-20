import {test,expect} from '@playwright/test';
import questions from '../src/content/connection-questions.json';

test('club connections show sourced clues and preserve an answered question after reload',async({page},testInfo)=>{
  await page.goto('/');
  await page.getByRole('button',{name:`Club connections, ${questions.length} puzzles`,exact:true}).click();
  const board=page.getByTestId('club-connections');
  await expect(board).toBeVisible();
  const bounds=await board.boundingBox();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x+bounds!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  await page.screenshot({path:`.expo/connections-${testInfo.project.name}.png`});
  const text=await board.innerText();
  const question=questions.find(q=>q.clubConnections.every(club=>text.includes(club)));
  expect(question).toBeDefined();
  await page.getByRole('button',{name:question!.answer,exact:true}).click();
  await expect(page.getByText(question!.explanation,{exact:true})).toBeVisible();
  await page.reload();
  await page.getByRole('button',{name:/Continue your round/}).click();
  await expect(board).toBeVisible();
  await expect(page.getByText(question!.explanation,{exact:true})).toBeVisible();
});

