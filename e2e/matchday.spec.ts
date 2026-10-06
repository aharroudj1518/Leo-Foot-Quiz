import {expect, test} from '@playwright/test';

async function finishBySkipping(page: import('@playwright/test').Page, count: number, from = 1) {
  for (let index = from; index <= count; index++) {
    await expect(page.getByText(`QUESTION ${index} OF ${count}`)).toBeVisible();
    await page.getByRole('button', {name: 'Skip question', exact: true}).click();
    await page.getByRole('button', {name: index === count ? 'See my result' : 'Next question', exact: true}).click();
  }
}

test('news round survives refresh and has a complete source-based review', async ({page}) => {
  await page.clock.install({time: new Date('2026-10-05T12:00:00Z')});
  await page.goto('/');
  await page.getByRole('button', {name: 'Play the news quiz', exact: true}).click();
  await page.getByRole('button', {name: 'Skip question', exact: true}).click();
  await page.reload();
  await page.getByRole('button', {name: /Continue your round/}).click();
  await expect(page.getByText('One for the memory bank.', {exact: true})).toBeVisible();
  await page.getByRole('button', {name: 'Next question', exact: true}).click();
  await finishBySkipping(page, 5, 2);
  await page.getByRole('button', {name: 'Review what I learned', exact: true}).click();
  await expect(page.getByRole('button', {name: /Read source for question/})).toHaveCount(5);
  const profile = await page.evaluate(() => JSON.parse(localStorage.getItem('leoqo.profile.v1')!));
  expect(profile.history).toHaveLength(1);
  expect(profile.history[0].questionSnapshot).toHaveLength(5);
});

test('daily CTA resumes a saved answer and viewing a daily result preserves another round', async ({page}) => {
  await page.clock.install({time: new Date('2026-10-05T12:00:00Z')});
  await page.goto('/');
  await page.getByRole('button', {name: 'Play today’s five', exact: true}).click();
  await page.getByRole('button', {name: 'Skip question', exact: true}).click();
  await page.getByRole('button', {name: 'Save and leave round'}).click();
  await page.getByRole('button', {name: 'Continue today’s five', exact: true}).click();
  await expect(page.getByText('One for the memory bank.', {exact: true})).toBeVisible();
  await page.getByRole('button', {name: 'Next question', exact: true}).click();
  await finishBySkipping(page, 5, 2);
  await page.getByRole('button', {name: 'Back to the clubhouse', exact: true}).click();
  await page.getByRole('button', {name: 'Let’s play', exact: true}).click();
  await page.getByRole('button', {name: 'Save and leave round'}).click();
  const before = await page.evaluate(() => localStorage.getItem('leoqo.profile.v1'));
  await page.getByRole('button', {name: 'See today’s result', exact: true}).click();
  await expect(page.getByText('FULL TIME. WELL PLAYED.')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('leoqo.profile.v1'))).toBe(before);
});

test('a different round needs a deliberate replacement and hints survive restart', async ({page}) => {
  await page.goto('/');
  await page.getByRole('button', {name: 'Let’s play', exact: true}).click();
  await page.getByRole('button', {name: 'A little hint', exact: true}).click();
  await page.reload();
  await page.getByRole('button', {name: /Continue your round/}).click();
  const correct = await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('leoqo.profile.v1')!).session;
    return s.questionSnapshot.find((q: {id: string}) => q.id === s.questionIds[s.index]).answer;
  });
  await page.getByRole('button', {name: correct, exact: true}).click();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('leoqo.profile.v1')!).session.answers[0].hinted)).toBe(true);
  await page.getByRole('button', {name: 'Save and leave round'}).click();
  await page.getByRole('button', {name: 'Let’s play', exact: true}).click();
  await expect(page.getByText('Finish this one first?')).toBeVisible();
  await page.getByRole('button', {name: 'Continue saved round', exact: true}).click();
  await expect(page.getByText('Nicely played.', {exact: true})).toBeVisible();
});

test('expired briefing is labelled as archive at a narrow viewport', async ({page}) => {
  await page.clock.install({time: new Date('2026-10-13T12:00:00Z')});
  await page.setViewportSize({width: 320, height: 780});
  await page.goto('/');
  await expect(page.getByText('FROM THE ARCHIVE', {exact: true})).toBeVisible();
  await expect(page.getByRole('button', {name: 'Play this archive', exact: true})).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('a corrupt news cache falls back without damaging quiz progress', async ({page}) => {
  await page.addInitScript(() => localStorage.setItem('leoqo.news.v1', '{broken'));
  await page.goto('/');
  await expect(page.getByText('Saved briefings could not be read. The included edition is still available.')).toBeVisible();
  await page.getByRole('button', {name: 'Let’s play', exact: true}).click();
  await expect(page.getByText('QUESTION 1 OF 10')).toBeVisible();
});
