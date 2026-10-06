import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium, expect } from '@playwright/test';

// These are screenshots of the running web app, not native Android captures.
// No clock, network responses, purchase state, or stored progress is replaced.
const baseURL = process.env.SCREENSHOT_BASE_URL ?? 'http://127.0.0.1:8081';
const outputDirectory = resolve('store-screenshots');
const viewport = { width: 360, height: 640 };
const deviceScaleFactor = 3;
const screenshots = [];
const startedAt = new Date().toISOString();
const pageErrors = new WeakMap();

async function waitForServer() {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(baseURL, { signal: AbortSignal.timeout(2000) });
      await response.body?.cancel();
      if (response.ok) return;
    } catch { /* The workflow may still be starting its local static server. */ }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  throw new Error('Screenshot server was not ready within 30 seconds. Serve dist on port 8081 first.');
}

async function settle(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    'The app overflows the phone viewport horizontally.');
  assert.deepEqual(pageErrors.get(page), [], 'The app reported a browser runtime error.');
}

async function capture(page, file, description) {
  await settle(page);
  const png = await page.screenshot({ path: resolve(outputDirectory, file), fullPage: false, scale: 'device', animations: 'disabled' });
  const width = png.readUInt32BE(16), height = png.readUInt32BE(20);
  assert.equal(width, 1080, 'Screenshot width must be 1080 pixels.');
  assert.equal(height, 1920, 'Screenshot height must be 1920 pixels.');
  screenshots.push({ file, description, width, height, capturedAt: new Date().toISOString() });
  console.log(`Captured ${file}: ${width}×${height}`);
}

async function openApp(browser) {
  const context = await browser.newContext({ viewport, deviceScaleFactor, isMobile: true, hasTouch: true, locale: 'en-GB', colorScheme: 'light' });
  const page = await context.newPage();
  page.setDefaultTimeout(15_000);
  const errors = [];
  pageErrors.set(page, errors);
  page.on('pageerror', error => { errors.push(error.message); });
  await page.goto(baseURL, { waitUntil: 'networkidle' });
  await expect(page.getByRole('button', { name: 'Let’s play', exact: true })).toBeVisible();
  await settle(page);
  return { context, page };
}

async function currentQuestion(page) {
  // Read the saved question snapshot to choose a real answer through the UI.
  // Nothing is written to storage or patched into application state.
  return page.evaluate(() => {
    const session = JSON.parse(localStorage.getItem('leoqo.profile.v1') ?? 'null')?.session;
    const question = session?.questionSnapshot?.find(item => item.id === session.questionIds[session.index]);
    if (!question) throw new Error('No active question snapshot was saved by the app.');
    return { answer: question.answer, sourceName: question.sourceName, prompt: question.prompt, options: question.options, promptLength: question.prompt.length, longestOption: Math.max(...question.options.map(option => option.length)), index: session.index, count: session.questionIds.length };
  });
}

async function answerAndAdvance(page, alreadyAnswered = false) {
  const question = await currentQuestion(page);
  if (!alreadyAnswered) {
    await page.getByRole('button', { name: question.answer, exact: true }).click();
    await expect(page.getByText('Nicely played.', { exact: true })).toBeVisible();
  }
  await page.getByRole('button', { name: question.index === question.count - 1 ? 'See my result' : 'Next question', exact: true }).click();
  if (question.index < question.count - 1) {
    await expect(page.getByText(`QUESTION ${question.index + 2} OF ${question.count}`, { exact: true })).toBeVisible();
  } else {
    await expect(page.getByText('FULL TIME. WELL PLAYED.', { exact: true })).toBeVisible();
  }
  return question.index === question.count - 1;
}

await waitForServer();
await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch();
try {
  const news = await openApp(browser);
  await capture(news.page, '01-home.png', 'Fresh guest home, using the actual capture date.');
  await news.page.getByRole('button', { name: /^(Play the news quiz|Play this archive)$/ }).click();
  await expect(news.page.getByText('QUESTION 1 OF 5', { exact: true })).toBeVisible();
  // The session shuffles stories. Select a compact question through actual
  // play, answering earlier questions normally without altering its order.
  let candidate = await currentQuestion(news.page);
  while ((candidate.promptLength > 100 || candidate.longestOption > 30) && candidate.index < candidate.count - 1) {
    await answerAndAdvance(news.page);
    candidate = await currentQuestion(news.page);
  }
  // Scroll the actual question into view so the screenshot includes all four
  // choices on a small phone, rather than clipping them below the header.
  await news.page.getByText(candidate.prompt, { exact: true }).evaluate(element => element.scrollIntoView({ block: 'start' }));
  for (const option of candidate.options) {
    await expect(news.page.getByRole('button', { name: option, exact: true })).toBeInViewport({ ratio: 1 });
  }
  await capture(news.page, '02-matchday-question.png', 'Actual bundled Matchday question, scrolled to show its choices; dates and question order are unchanged.');

  const firstQuestion = await currentQuestion(news.page);
  await news.page.getByRole('button', { name: firstQuestion.answer, exact: true }).click();
  await expect(news.page.getByText('Nicely played.', { exact: true })).toBeVisible();
  const source = news.page.getByRole('button', { name: 'Read the source', exact: true });
  await source.scrollIntoViewIfNeeded();
  await expect(source).toBeVisible();
  if (firstQuestion.sourceName) await expect(news.page.getByText(firstQuestion.sourceName, { exact: false })).toBeVisible();
  await capture(news.page, '03-matchday-explanation.png', 'Actual answer reveal, explanation and source attribution, scrolled into view.');

  let finished = await answerAndAdvance(news.page, true);
  while (!finished) finished = await answerAndAdvance(news.page);
  await news.page.getByRole('button', { name: 'Review what I learned', exact: true }).click();
  await expect(news.page.getByText('THE STORIES BEHIND YOUR SCORE', { exact: true })).toBeVisible();
  await capture(news.page, '05-answer-review.png', 'Review of the Matchday round completed by this script through normal answer buttons.');
  await news.context.close();

  const daily = await openApp(browser);
  await daily.page.getByRole('button', { name: 'Play today’s five', exact: true }).click();
  await expect(daily.page.getByText('QUESTION 1 OF 5', { exact: true })).toBeVisible();
  finished = false;
  while (!finished) finished = await answerAndAdvance(daily.page);
  await capture(daily.page, '04-daily-result.png', 'Actual Daily Five result earned by the scripted answers, with the current UTC date.');
  await daily.context.close();

  await writeFile(resolve(outputDirectory, 'capture-manifest.json'), `${JSON.stringify({
    kind: 'web-phone-previews',
    reviewRequired: 'Compare every image with the signed Android candidate before using it in the Play listing. These are not native-device screenshots.',
    startedAt,
    completedAt: new Date().toISOString(),
    sourceCommit: process.env.GITHUB_SHA ?? null,
    browser: `Chromium ${browser.version()}`,
    viewport,
    deviceScaleFactor,
    captureMethod: 'Real UI interactions; no clock overrides, response mocks, paid unlocks or storage writes. Correct answers are read from each active saved question snapshot and selected through the visible buttons.',
    screenshots: screenshots.sort((a, b) => a.file.localeCompare(b.file)),
  }, null, 2)}\n`);
  await writeFile(resolve(outputDirectory, 'README.txt'),
    'WEB PHONE PREVIEWS — not native Android screenshots.\n\n' +
    'Five real app screenshots at 1080 x 1920 pixels (360 x 640 viewport, 3x device scale).\n' +
    'Compare these images with the signed Android build before uploading to Google Play.\n' +
    'Scores come from scripted correct answers through the app. Dates and content are not replaced.\n' +
    'No paid screens or purchase claims are shown. See capture-manifest.json for the capture time and commit.\n');
} finally {
  await browser.close();
}
