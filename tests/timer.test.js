import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TARGET_TIME, remaining, plural, unitForms } from '../src/timer.js';

test('deadline is midnight Moscow, independent of machine timezone', () => {
  assert.equal(new Date(TARGET_TIME).toISOString(), '2026-11-13T21:00:00.000Z');
});
test('decomposes full weeks and remaining days', () => {
  const offset = (((2 * 7 + 3) * 24 + 4) * 60 * 60 + 5 * 60 + 6) * 1000;
  assert.deepEqual(remaining(TARGET_TIME - offset), { finished: false, weeks: 2, days: 3, hours: 4, minutes: 5, seconds: 6 });
});
test('never shows zero before the deadline and never becomes negative', () => {
  assert.equal(remaining(TARGET_TIME - 1).seconds, 1);
  assert.equal(remaining(TARGET_TIME - 1).finished, false);
  for (const now of [TARGET_TIME, TARGET_TIME + 86400000]) {
    assert.deepEqual(remaining(now), { finished: true, weeks: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });
  }
});
test('Russian plural forms handle teens and twenties', () => {
  for (const [value, label] of [[0, 'дней'], [1, 'день'], [2, 'дня'], [5, 'дней'], [11, 'дней'], [14, 'дней'], [21, 'день'], [22, 'дня'], [111, 'дней']]) assert.equal(plural(value, unitForms.days), label);
});
