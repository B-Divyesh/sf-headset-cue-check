import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('home and legal pages meet the serious accessibility baseline', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page).toHaveTitle(/Headset Cue Check/);
  await expect(page.locator('main')).toHaveCount(1);
  await expect(page.locator('h1')).toHaveCount(1);
  const results = await new AxeBuilder({ page: page as never }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(results.violations.filter(item => ['critical', 'serious'].includes(item.impact ?? ''))).toEqual([]);
  await page.emulateMedia({ colorScheme: 'dark' });
  const darkResults = await new AxeBuilder({ page: page as never }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(darkResults.violations.filter(item => ['critical', 'serious'].includes(item.impact ?? ''))).toEqual([]);
  await page.getByRole('link', { name: 'Privacy', exact: true }).first().click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('stay yours');
  await expect(page).toHaveTitle('Privacy — Headset Cue Check');
  expect(errors).toEqual([]);
});

test('completes the six observations and creates a local card', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Start the six checks/ }).click();
  const audioResponse = page.waitForResponse(response => response.url().endsWith('/audio/field-sentence.wav'));
  await page.getByRole('button', { name: 'Play speech sample' }).click();
  expect((await audioResponse).ok()).toBe(true);
  await expect(page.locator('#audio-state')).toContainText('finished', { timeout: 12_000 });
  for (let index = 0; index < 6; index += 1) {
    await page.locator('.rating-options label').first().click();
    await page.getByRole('button', { name: index === 5 ? 'Record settings' : 'Save and continue' }).click();
  }
  const setupAxe = await new AxeBuilder({ page: page as never }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(setupAxe.violations.filter(item => ['critical', 'serious'].includes(item.impact ?? ''))).toEqual([]);
  await page.getByLabel('Headset name').fill('Office headset');
  await page.getByRole('button', { name: 'Create setup card' }).click();
  await expect(page.getByRole('heading', { name: 'Your repeatable headset setup' })).toBeVisible();
  await expect(page.locator('.setup-card')).toContainText('Office headset');
  const cardAxe = await new AxeBuilder({ page: page as never }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(cardAxe.violations.filter(item => ['critical', 'serious'].includes(item.impact ?? ''))).toEqual([]);
  await page.getByRole('button', { name: 'Back to home' }).click();
  await expect(page.getByRole('heading', { name: 'Saved setup cards' })).toBeVisible();
  await expect(page.locator('.saved-list')).toContainText('Office headset');
});

test('reopens from the service worker while offline', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller), null, { timeout: 15_000 });
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Learn how your headset');
  await expect(page.getByText(/Offline — the guide/)).toBeVisible();
});

test('supports the essential keyboard path', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Start the six checks/ }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Speech clarity' })).toBeFocused();
  await page.locator('input[name="rating"]').first().focus();
  await page.keyboard.press('Space');
  await page.getByRole('button', { name: 'Save and continue' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Left and right' })).toBeFocused();
});
