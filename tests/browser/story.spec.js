import { test, expect } from '@playwright/test';

test('journey story waits then stops exactly at the current marker', async ({ page }) => {
  test.setTimeout(90000);
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.clock.install({ time: new Date('2026-10-28T12:00:00+03:00') });
  await page.goto('/');
  await page.locator('.scroll-cue').click();
  await page.clock.runFor(500);
  await expect(page.locator('.journey-story')).toHaveAttribute('data-state', 'waiting');
  await page.clock.runFor(29000);
  await expect(page.locator('.journey-story')).toHaveAttribute('data-state', 'finished');
  await expect(page.locator('.story-actor')).toHaveAttribute('data-kind', 'soldiers');
  await expect(page.locator('.story-event.revealed')).toHaveCount(3);
  const positions = await page.evaluate(() => {
    const actor = document.querySelector('.story-actor'), marker = document.querySelector('.traveler');
    return [actor.style.left, marker.style.left, actor.style.top, marker.style.top];
  });
  expect(Math.abs(parseFloat(positions[0]) - parseFloat(positions[1]))).toBeLessThan(.001);
  expect(Math.abs(parseFloat(positions[2]) - parseFloat(positions[3]))).toBeLessThan(.001);
  expect(errors).toEqual([]);
  await page.screenshot({ path: 'test-results/story-desktop.png' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'test-results/story-mobile.png' });
});

test('reduced motion shows the reached events and home only at the end', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.clock.install({ time: new Date('2026-02-11T00:00:00+03:00') });
  await page.goto('/');
  await expect(page.locator('.story-event.revealed')).toHaveCount(1);
  await page.clock.setSystemTime(new Date('2026-11-14T00:00:00+03:00'));
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  await page.clock.runFor(31000);
  await expect(page.locator('.story-event.revealed')).toHaveCount(4);
  await expect(page.locator('.story-actor')).toBeHidden();
});
