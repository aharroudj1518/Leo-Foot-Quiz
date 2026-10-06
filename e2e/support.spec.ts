import {expect, test, type Page} from '@playwright/test';

const SUPPORT_EMAIL = 'info@novaspheretechnology.co.uk';
const PRIVACY_URL = 'https://leo-foot-quiz.vercel.app/privacy.html';
type CapturedWindow = Window & {__supportOpenedUrls: string[]};

async function captureExternalLinks(page: Page, failMailto = false) {
  // React Native Web Linking uses window.open. Capture the requested URL without
  // launching a mail client or depending on the public policy site's uptime.
  await page.addInitScript(shouldFailMailto => {
    const opened: string[] = [];
    Object.defineProperty(window, '__supportOpenedUrls', {value: opened});
    window.open = (url?: string | URL) => {
      opened.push(String(url));
      if (shouldFailMailto && String(url).startsWith('mailto:')) {
        throw new Error('No email application is available');
      }
      return null;
    };
  }, failMailto);
  const externalRequests: string[] = [];
  page.on('request', request => {
    if (!request.url().startsWith('http://127.0.0.1:8081/') && !request.url().startsWith('data:')) {
      externalRequests.push(request.url());
    }
  });
  return externalRequests;
}

async function openedUrls(page: Page) {
  return page.evaluate(() => (window as unknown as CapturedWindow).__supportOpenedUrls);
}

async function openSettings(page: Page) {
  await page.getByRole('tab', {name: 'Settings', exact: true}).click();
}

async function openPrivacy(page: Page) {
  await openSettings(page);
  await page.getByRole('button', {name: 'Privacy & about Leoqo', exact: true}).click();
}

async function completeAdultStep(page: Page) {
  const continueButton = page.getByRole('button', {name: 'Continue', exact: true});
  await expect(continueButton).toBeDisabled();
  const instruction = await page.getByText(/Enter these digits in reverse order:/).textContent();
  const code = instruction!.match(/\d{3}/)![0];
  await page.getByRole('textbox', {name: 'Digits in reverse order'}).fill(code.split('').reverse().join(''));
  await expect(continueButton).toBeDisabled();
  await page.getByRole('checkbox').click();
  await continueButton.click();
  await expect(page.getByText('For a parent or grown-up.', {exact: true})).not.toBeVisible();
}

for (const location of ['settings', 'privacy'] as const) {
  test(`${location} support email is selectable and opens only after the adult step`, async ({page}) => {
    const externalRequests = await captureExternalLinks(page);
    const openLocation = location === 'settings' ? openSettings : openPrivacy;
    await page.goto('/');
    await openLocation(page);
    const address = page.getByText(SUPPORT_EMAIL, {exact: true});
    await expect(address).toBeVisible();
    await expect(address).toHaveCSS('user-select', 'text');
    if (location === 'privacy') {
      await expect(page.getByText(/request deletion of purchase-related data/i)).toBeVisible();
    }
    expect(await openedUrls(page)).toEqual([]);
    expect(externalRequests).toEqual([]);

    await page.getByRole('button', {name: 'Email support', exact: true}).click();
    await expect(page.getByRole('button', {name: 'Continue', exact: true})).toBeDisabled();
    expect(await openedUrls(page)).toEqual([]);
    await page.getByRole('button', {name: 'Back to free football', exact: true}).click();
    expect(await openedUrls(page)).toEqual([]);

    await openLocation(page);
    await page.getByRole('button', {name: 'Email support', exact: true}).click();
    await completeAdultStep(page);
    const urls = await openedUrls(page);
    expect(urls).toHaveLength(1);
    const email = new URL(urls[0]);
    expect(email.protocol).toBe('mailto:');
    expect(email.pathname).toBe(SUPPORT_EMAIL);
    expect(externalRequests).toEqual([]);
  });
}

test('full privacy policy requires the adult step and opens the published policy URL', async ({page}) => {
  const externalRequests = await captureExternalLinks(page);
  await page.goto('/');
  await openPrivacy(page);
  expect(await openedUrls(page)).toEqual([]);
  expect(externalRequests).toEqual([]);

  await page.getByRole('button', {name: 'Full privacy policy', exact: true}).click();
  await expect(page.getByRole('button', {name: 'Continue', exact: true})).toBeDisabled();
  expect(await openedUrls(page)).toEqual([]);
  await page.getByRole('button', {name: 'Back to free football', exact: true}).click();
  expect(await openedUrls(page)).toEqual([]);

  await openPrivacy(page);
  await page.getByRole('button', {name: 'Full privacy policy', exact: true}).click();
  await completeAdultStep(page);
  expect(await openedUrls(page)).toEqual([PRIVACY_URL]);
  expect(externalRequests).toEqual([]);
});

test('adult shop offers support without a purchase ID or remote billing request in web preview', async ({page}) => {
  const externalRequests = await captureExternalLinks(page);
  await page.goto('/');
  await page.getByRole('tab', {name: 'Explore', exact: true}).click();
  await page.getByRole('button', {name: /Legends Pack, 40 questions/}).click();
  await completeAdultStep(page);
  await expect(page.getByRole('button', {name: 'Purchases unavailable in this build'})).toBeDisabled();
  await expect(page.getByText(/^Support ID\b/i)).toHaveCount(0);
  expect(externalRequests).toEqual([]);

  await page.getByRole('button', {name: 'Email support', exact: true}).click();
  await expect(page.getByText('For a parent or grown-up.', {exact: true})).not.toBeVisible();
  await expect.poll(() => openedUrls(page)).toHaveLength(1);
  const [url] = await openedUrls(page);
  const email = new URL(url);
  expect(email.protocol).toBe('mailto:');
  expect(email.pathname).toBe(SUPPORT_EMAIL);
  expect(email.searchParams.get('body') ?? '').not.toMatch(/Support ID|\$RCAnonymousID:/i);
  expect(externalRequests).toEqual([]);
});

test('an unavailable email app restores Settings and shows the real support address', async ({page}) => {
  const externalRequests = await captureExternalLinks(page, true);
  await page.goto('/');
  await openSettings(page);
  await page.getByRole('button', {name: 'Email support', exact: true}).click();
  await completeAdultStep(page);

  await expect(page.getByText(
    `Your email app could not be opened. Please email ${SUPPORT_EMAIL} from any email service.`,
    {exact: true},
  )).toBeVisible();
  await expect(page.getByText('Your game. Your settings.', {exact: true})).toBeVisible();
  await expect(page.getByRole('tab', {name: 'Settings', exact: true})).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByText(SUPPORT_EMAIL, {exact: true})).toHaveCSS('user-select', 'text');
  await expect(page.getByRole('button', {name: 'Email support', exact: true})).toBeVisible();
  await expect(page.getByText(/^Support ID\b/i)).toHaveCount(0);
  const urls = await openedUrls(page);
  expect(urls).toHaveLength(1);
  expect(new URL(urls[0]).pathname).toBe(SUPPORT_EMAIL);
  expect(externalRequests).toEqual([]);
});

test('support email and policy controls fit a 320px screen with larger text', async ({page}) => {
  await page.setViewportSize({width: 320, height: 780});
  await page.goto('/');
  await openSettings(page);
  const largerText = page.getByRole('switch', {name: 'Larger text', exact: true});
  await largerText.click();
  await expect(largerText).toBeChecked();

  for (const location of ['settings', 'privacy'] as const) {
    if (location === 'privacy') {
      await page.getByRole('button', {name: 'Privacy & about Leoqo', exact: true}).click();
    }
    const controls = [
      page.getByText(SUPPORT_EMAIL, {exact: true}),
      page.getByRole('button', {name: 'Email support', exact: true}),
      ...(location === 'privacy' ? [page.getByRole('button', {name: 'Full privacy policy', exact: true})] : []),
    ];
    for (const control of controls) {
      await expect(control).toBeVisible();
      expect(await control.evaluate(element => {
        const bounds = element.getBoundingClientRect();
        return bounds.left >= 0 && bounds.right <= window.innerWidth && element.scrollWidth <= element.clientWidth;
      })).toBe(true);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
});
