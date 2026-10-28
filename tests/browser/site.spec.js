import { test, expect } from '@playwright/test';

const deadline = Date.parse('2026-11-14T00:00:00+03:00');
test('mobile layout, correct remaining time and image', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 320, height: 740 });
  await page.clock.install({ time: deadline - 90061000 });
  await page.clock.pauseAt(deadline - 90061000);
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText('Дней до приезда');
  await expect(page.locator('[data-unit="days"] .number')).toHaveText('01');
  await expect(page.locator('[data-unit="hours"] .number')).toHaveText('01');
  await expect(page.locator('[data-unit="minutes"] .number')).toHaveText('01');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await page.locator('.photograph').evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
  expect(errors).toEqual([]);
});
test('crossing midnight transitions once into final colors and text', async ({ page }) => {
  await page.clock.install({ time: deadline - 10000 });
  await page.clock.pauseAt(deadline - 10000);
  await page.goto('/');
  await expect(page.locator('[data-unit="seconds"] .number')).toHaveText('10');
  await page.clock.fastForward(10000);
  await page.clock.runFor(3500);
  await expect(page.locator('.today')).toBeVisible();
  await expect(page.locator('h1')).toHaveText('Время до встречи');
  await expect(page.locator('.countdown')).toBeHidden();
  await expect(page.locator('body')).toHaveCSS('color', 'rgb(178, 242, 216)');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(91, 42, 94)');
});
test('late visit and reduced motion immediately show the final state', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.clock.install({ time: deadline + 86400000 });
  await page.clock.pauseAt(deadline + 86400000);
  await page.goto('/');
  await expect(page.locator('.today')).toBeVisible();
  await expect(page.locator('body')).toHaveCSS('color', 'rgb(178, 242, 216)');
  await expect(page.locator('.wave')).toHaveCSS('opacity', '0');
});
test('resuming a suspended tab catches up from the actual clock', async ({ page }) => {
  await page.clock.install({ time: deadline - 86400000 });
  await page.clock.pauseAt(deadline - 86400000);
  await page.goto('/');
  await page.clock.setSystemTime(deadline - 3661000);
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  await expect(page.locator('[data-unit="hours"] .number')).toHaveText('01');
  await expect(page.locator('[data-unit="minutes"] .number')).toHaveText('01');
});
