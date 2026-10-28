import { test, expect } from '@playwright/test';

test('drums roll only changed digits and handle the minute rollover', async ({ page }) => {
  const now = Date.parse('2026-11-14T00:00:00+03:00') - 61000;
  await page.clock.install({ time: now - 60000 });
  await page.clock.pauseAt(now);
  await page.goto('/');
  const seconds = page.locator('[data-unit="seconds"] .number');
  const tens = seconds.locator('.digit-window').nth(0);
  const ones = seconds.locator('.digit-window').nth(1);
  await expect(seconds).toHaveText('01');
  await page.clock.runFor(1150);
  await expect(seconds).toHaveText('00');
  await expect(tens.locator('.digit-face')).toHaveCount(1);
  await expect(ones.locator('.digit-face')).toHaveCount(2);
  await expect(ones.locator('.digit-face').first()).toHaveAttribute('data-digit', '1');
  await expect(ones.locator('.digit-face').last()).toHaveAttribute('data-digit', '0');
  await page.clock.runFor(1000);
  await expect(seconds).toHaveText('59');
  await expect(page.locator('[data-unit="minutes"] .number')).toHaveText('00');
  await expect(tens.locator('.digit-face')).toHaveCount(2);
  await expect(ones.locator('.digit-face')).toHaveCount(2);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(tens.locator('.digit-face')).toHaveCount(1);
  await expect(ones.locator('.digit-face')).toHaveCount(1);
  await expect(ones.locator('.digit-face')).toHaveAttribute('data-digit', '9');
  await expect(ones.locator('.digit-strip')).toHaveCSS('transform', 'none');
});
