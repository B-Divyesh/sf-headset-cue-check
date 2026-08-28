import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('home and legal pages meet the serious accessibility baseline', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Headset Cue Check/);
  await expect(page.locator('main')).toHaveCount(1);
  await expect(page.locator('h1')).toHaveCount(1);
  const results = await new AxeBuilder({ page: page as never }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(results.violations.filter(item => ['critical', 'serious'].includes(item.impact ?? ''))).toEqual([]);
  await page.getByRole('link', { name: 'Privacy', exact: true }).first().click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('stay yours');
});

test('completes the six observations and creates a local card', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Start the six checks/ }).click();
  for (let index = 0; index < 6; index += 1) {
    await page.locator('input[name="rating"]').first().check();
    await page.getByRole('button', { name: index === 5 ? 'Record settings' : 'Save and continue' }).click();
  }
  await page.getByLabel('Headset name').fill('Office headset');
  await page.getByRole('button', { name: 'Create setup card' }).click();
  await expect(page.getByRole('heading', { name: 'Your repeatable headset setup' })).toBeVisible();
  await expect(page.locator('.setup-card')).toContainText('Office headset');
  await page.getByRole('button', { name: 'Back to home' }).click();
  await expect(page.getByRole('heading', { name: 'Saved setup cards' })).toBeVisible();
  await expect(page.locator('.saved-list')).toContainText('Office headset');
});

test('reopens from the service worker while offline', async ({ page, context }) => {
  await page.goto('/');
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null, null, { timeout: 15_000 });
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Learn how your headset');
  await expect(page.getByText(/Offline — the guide/)).toBeVisible();
});
