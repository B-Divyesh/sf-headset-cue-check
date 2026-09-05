import { readFile } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function seriousViolations(page: Page) {
  const results = await new AxeBuilder({ page: page as never }).withTags(['wcag2a', 'wcag2aa']).analyze();
  return results.violations.filter(item => ['critical', 'serious'].includes(item.impact ?? ''));
}

async function completeCheck(page: Page, headsetName = 'Office headset') {
  await page.getByRole('button', { name: /Start (a sample|your) check/ }).click();
  await completeObservations(page);
  await page.getByLabel('Headset name').fill(headsetName);
  await page.getByRole('button', { name: 'Create setup card' }).click();
}

async function completeObservations(page: Page) {
  for (let index = 0; index < 6; index += 1) {
    await page.locator('.rating-options label').first().click();
    await page.getByRole('button', { name: index === 5 ? 'Record settings' : 'Save and continue' }).click();
  }
}

async function horizontalOverflow(page: Page) {
  return page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    offenders: [...document.querySelectorAll<HTMLElement>('body *')]
      .map(element => {
        const bounds = element.getBoundingClientRect();
        return {
          selector: `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''}${element.classList.length ? `.${[...element.classList].join('.')}` : ''}`,
          left: Math.round(bounds.left * 100) / 100,
          right: Math.round(bounds.right * 100) / 100,
          width: Math.round(bounds.width * 100) / 100,
        };
      })
      .filter(item => !item.selector.includes('.sr-only') && (item.left < 0 || item.right > document.documentElement.clientWidth))
  }));
}

async function expectNoHorizontalOverflow(page: Page) {
  const result = await horizontalOverflow(page);
  expect(result.scrollWidth, JSON.stringify(result.offenders)).toBeLessThanOrEqual(result.clientWidth);
}

test('home and legal pages meet the serious accessibility baseline', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page).toHaveTitle('Headset Cue Check — check speech and alert cues');
  await expect(page.locator('main')).toHaveCount(1);
  await expect(page.locator('h1')).toHaveCount(1);
  expect(await seriousViolations(page)).toEqual([]);
  await page.emulateMedia({ colorScheme: 'dark' });
  expect(await seriousViolations(page)).toEqual([]);
  await page.getByRole('link', { name: 'Privacy', exact: true }).first().click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('How Headset Cue Check handles your data');
  await expect(page).toHaveTitle('Privacy — Headset Cue Check');
  expect(await seriousViolations(page)).toEqual([]);
  expect(errors).toEqual([]);
});

test('supports 200% text, reduced motion, and narrow screens without overflow', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.evaluate(() => { document.documentElement.style.fontSize = '32px'; });
  await expectNoHorizontalOverflow(page);
  await expect(page.getByRole('link', { name: 'Try it with sample data' })).toBeVisible();
  await page.getByRole('button', { name: 'Start your check' }).click();
  await expectNoHorizontalOverflow(page);
  expect(await page.locator('.observation').evaluate(node => Number.parseFloat(getComputedStyle(node).animationDuration))).toBeLessThanOrEqual(0.001);
});

test('@claim:guided-check completes all six observations and creates a setup card', async ({ page }) => {
  await page.goto('/demo');
  await completeCheck(page);
  await expect(page.getByRole('heading', { name: 'Your repeatable headset setup' })).toBeVisible();
  await expect(page.locator('.setup-card')).toContainText('Office headset');
  await expect(page.locator('.result-list li')).toHaveCount(6);
  expect(await seriousViolations(page)).toEqual([]);
  await page.getByRole('button', { name: 'Back to home' }).click();
  await expect(page.locator('.saved-list')).toContainText('Office headset');
});

test('@claim:offline-reload reloads the demo and plays bundled audio offline', async ({ page, context }) => {
  await page.goto('/demo');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller), null, { timeout: 15_000 });
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Check the headset cues');
  await expect(page.getByText(/Offline — the guide/)).toBeVisible();
  await page.getByRole('button', { name: 'Start a sample check' }).click();
  await page.getByRole('button', { name: 'Play speech sample' }).click();
  await expect(page.locator('#audio-state')).toContainText('finished', { timeout: 12_000 });
  await context.setOffline(false);
  const updateState = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    await registration?.update();
    return { active: Boolean(registration?.active), caches: await caches.keys() };
  });
  expect(updateState.active).toBe(true);
  expect(updateState.caches).toContain('hcc-shell-v4');
});

test('@claim:keyboard-access supports keyboard use, visible import focus, and 44px targets', async ({ page }) => {
  await page.goto('/demo');
  const importInput = page.locator('#import-file');
  await page.locator('#export-all').focus();
  await page.keyboard.press('Tab');
  await expect(importInput).toBeFocused();
  const label = page.locator('.file-label');
  expect((await label.boundingBox())?.height).toBeGreaterThanOrEqual(44);
  expect(await label.evaluate(node => getComputedStyle(node).outlineWidth)).toBe('3px');
  await page.getByRole('button', { name: 'Start a sample check' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Speech clarity' })).toBeFocused();
  await expect(page.locator('#audio-state')).toHaveAttribute('aria-live', 'assertive');
  await expect(page.locator('#live-status')).toHaveAttribute('aria-live', 'polite');
  await page.locator('input[name="rating"]').first().focus();
  await page.keyboard.press('Space');
  await page.getByRole('button', { name: 'Save and continue' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Left and right' })).toBeFocused();
  await page.goto('/privacy');
  const returnLink = page.getByRole('link', { name: 'Return to Headset Cue Check' });
  expect((await returnLink.boundingBox())?.height).toBeGreaterThanOrEqual(44);
});

test('@claim:demo-isolation loads, resets, and exits sample data without touching real storage', async ({ page }) => {
  await page.goto('/');
  const action = page.getByRole('link', { name: 'Try it with sample data' });
  const viewport = page.viewportSize();
  expect((await action.boundingBox())?.y).toBeLessThan(viewport?.height ?? 844);
  await action.click();
  await expect(page).toHaveTitle('Demo — Headset Cue Check');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.locator('.saved-list')).toContainText('Accessibility lab headset');
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: /Remove setup card/ }).click();
  await expect(page.locator('.saved-list')).toHaveCount(0);
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.locator('.saved-list')).toContainText('Accessibility lab headset');
  const databases = await page.evaluate(async () => (await indexedDB.databases()).map(item => item.name));
  expect(databases).toContain('headset-cue-check-demo');
  expect(databases).toContain('headset-cue-check');
  await page.getByRole('link', { name: 'Start for real' }).click();
  await expect(page.getByText('Demo — sample data, nothing is saved')).toHaveCount(0);
  await expect(page.locator('.saved-list')).toHaveCount(0);
});

test('@claim:local-privacy keeps a complete demo flow same-origin and out of web storage', async ({ page, context }) => {
  const requests: { url: string; method: string }[] = [];
  page.on('request', request => requests.push({ url: request.url(), method: request.method() }));
  await page.goto('/demo');
  await completeCheck(page, 'Private lab headset');
  expect(requests.length).toBeGreaterThan(0);
  expect(requests.every(request => new URL(request.url).origin === 'http://127.0.0.1:4173')).toBe(true);
  expect(requests.every(request => request.method === 'GET')).toBe(true);
  expect(await context.cookies()).toEqual([]);
  expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length }))).toEqual({ local: 0, session: 0 });
});

test('@claim:non-diagnostic-results keeps the check observational and shows its limits', async ({ page }) => {
  await page.goto('/demo');
  const notice = page.getByRole('note');
  await expect(notice).toContainText('not a hearing or audiology test');
  await expect(notice).toContainText('does not diagnose or certify hardware');
  await page.getByRole('button', { name: 'Open card' }).click();
  await expect(page.locator('.result-list li')).toHaveCount(6);
  await expect(page.locator('.card-limit')).toContainText('does not verify hardware routing or system settings');
  await expect(page.locator('.card-limit')).toContainText('not a hearing test');
  await expect(page.locator('main')).not.toContainText(/\bpass(?:ed)?\b|\bfail(?:ed)?\b/i);
});

test('@claim:manual-routing records settings entered by the user without identifying a device', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByRole('note')).toContainText('Audio follows the output selected in your operating system');
  await expect(page.getByRole('note')).toContainText('cannot identify that device or change its settings');
  await page.getByRole('button', { name: 'Start a sample check' }).click();
  await completeObservations(page);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Record the settings you can reproduce.');
  await expect(page.getByLabel('Headset name')).toHaveValue('');
  await page.getByLabel('Headset name').fill('User-selected USB headset');
  await page.locator('input[name="systemVolume"]').fill('27');
  await page.locator('input[name="screenReaderVolume"]').fill('63');
  await page.getByRole('button', { name: 'Create setup card' }).click();
  await expect(page.locator('.setup-card')).toContainText('User-selected USB headset');
  await expect(page.locator('.setting-values')).toContainText('27%');
  await expect(page.locator('.setting-values')).toContainText('63%');
});

test('@claim:free-use presents free use with no payment or account path', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Free to use.')).toBeVisible();
  await expect(page.locator('a[href*="checkout"], a[href*="billing"], a[href*="login"], a[href*="signup"]')).toHaveCount(0);
});

test('@claim:json-portability exports and imports a valid card', async ({ page }) => {
  await page.goto('/demo');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON' }).click();
  const download = await downloadPromise;
  const path = await download.path();
  expect(path).toBeTruthy();
  const exported = JSON.parse(await readFile(path!, 'utf8'));
  expect(exported).toMatchObject({ format: 'headset-cue-check', version: 1 });
  expect(exported.sessions).toHaveLength(1);
  exported.sessions[0].id = 'imported-lab-card';
  exported.sessions[0].updatedAt = '2026-08-28T10:31:00.000Z';
  exported.sessions[0].completedAt = '2026-08-28T10:31:00.000Z';
  exported.sessions[0].settings.deviceName = 'Imported lab headset';
  await page.locator('#import-file').setInputFiles({ name: 'cards.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(exported)) });
  await expect(page.locator('.saved-list')).toContainText('Imported lab headset');
});

test('@claim:copy-print copies a summary and invokes printing', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Open card' }).click();
  await page.getByRole('button', { name: 'Copy summary' }).click();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain('Accessibility lab headset');
  await page.evaluate(() => { (window as typeof window & { printCalled?: boolean }).print = () => { (window as typeof window & { printCalled?: boolean }).printCalled = true; }; });
  await page.getByRole('button', { name: 'Print card' }).click();
  expect(await page.evaluate(() => (window as typeof window & { printCalled?: boolean }).printCalled)).toBe(true);
});

test('@claim:remove-undo removes a card and restores it with undo', async ({ page }) => {
  await page.goto('/demo');
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: /Remove setup card/ }).click();
  await expect(page.locator('.saved-list')).toHaveCount(0);
  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(page.locator('.saved-list')).toContainText('Accessibility lab headset');
});

test('rejects the verifier corrupt import and recovers a corrupt stored row', async ({ page }) => {
  await page.goto('/');
  const corrupt = { id: 'corrupt-row', createdAt: '2026-08-28T09:20:00.000Z', updatedAt: '2026-08-28T09:21:00.000Z', currentStep: 0, answers: [], completedAt: 'not-a-date' };
  await page.locator('#import-file').setInputFiles({ name: 'corrupt.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ format: 'headset-cue-check', version: 1, sessions: [corrupt] })) });
  await expect(page.getByRole('alert')).toContainText('not a valid Headset Cue Check export');
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Check the headset cues');
  await page.evaluate(async row => new Promise<void>((resolve, reject) => {
    const open = indexedDB.open('headset-cue-check', 1);
    open.onsuccess = () => {
      const transaction = open.result.transaction('sessions', 'readwrite');
      transaction.objectStore('sessions').put(row);
      transaction.oncomplete = () => { open.result.close(); resolve(); };
      transaction.onerror = () => reject(transaction.error);
    };
    open.onerror = () => reject(open.error);
  }), corrupt);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Check the headset cues');
  await expect(page.getByRole('alert')).toContainText('damaged saved check was removed');
  await page.reload();
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('unknown routes render the designed 404 page', async ({ page }) => {
  await page.goto('/missing-listening-path');
  await expect(page).toHaveTitle('Page not found — Headset Cue Check');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('This page was not found');
  await expect(page.getByRole('link', { name: 'Return to Headset Cue Check' })).toBeVisible();
});
