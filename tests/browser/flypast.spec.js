import { test, expect } from '@playwright/test';

test('preview flies once, cleans up and leaves the final state', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-28T12:00:00+03:00') });
  await page.goto('/?preview=finish');
  await page.clock.runFor(4600);
  await expect(page.locator('.flypast')).toHaveCount(1);
  await expect(page.locator('.flypast')).toHaveCSS('pointer-events', 'none');
  await page.clock.runFor(5000);
  await expect(page.locator('.flypast')).toHaveCount(0);
  await expect(page.locator('.today')).toBeVisible();
});

test('reduced motion skips the flypast', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.clock.install({ time: new Date('2026-10-28T12:00:00+03:00') });
  await page.goto('/?preview=finish');
  await page.clock.runFor(4500);
  await expect(page.locator('.flypast')).toHaveCount(0);
  await expect(page.locator('.today')).toBeVisible();
});
