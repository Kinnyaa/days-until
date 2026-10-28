import { test } from 'node:test';
import assert from 'node:assert/strict';
import { milestones, moscowDay, dayLabel } from '../src/journey.js';

test('journey has thirteen monthly stops and the meeting finish', () => {
  assert.equal(milestones.length, 14);
  assert.equal(new Date(milestones[0]).toISOString(), '2025-11-10T21:00:00.000Z');
  assert.equal(new Date(milestones[12]).toISOString(), '2026-11-10T21:00:00.000Z');
  assert.equal(new Date(milestones[13]).toISOString(), '2026-11-13T21:00:00.000Z');
});
test('relative dates use Moscow calendar days, not elapsed 24-hour periods', () => {
  const now = Date.parse('2026-10-28T00:01:00+03:00');
  assert.equal(dayLabel(Date.parse('2026-10-27T23:59:00+03:00'), now), '1 день назад');
  assert.equal(dayLabel(Date.parse('2026-10-28T23:59:00+03:00'), now), 'Сегодня');
  assert.equal(dayLabel(Date.parse('2026-11-11T00:00:00+03:00'), now), 'через 14 дней');
  assert.equal(moscowDay(now), moscowDay(Date.parse('2026-10-28T23:59:00+03:00')));
});
