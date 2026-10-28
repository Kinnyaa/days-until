export const TARGET_TIME = Date.parse('2026-11-14T00:00:00+03:00');

export function remaining(now = Date.now()) {
  const delta = TARGET_TIME - now;
  let seconds = Math.max(0, Math.ceil(delta / 1000));
  const weeks = Math.floor(seconds / 604800);
  seconds %= 604800;
  const days = Math.floor(seconds / 86400);
  seconds %= 86400;
  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);
  seconds %= 60;
  return { finished: delta <= 0, weeks, days, hours, minutes, seconds };
}

export function plural(value, forms) {
  const n = Math.abs(value) % 100;
  if (n >= 11 && n <= 14) return forms[2];
  const last = n % 10;
  return forms[last === 1 ? 0 : last >= 2 && last <= 4 ? 1 : 2];
}

export const unitForms = {
  weeks: ['неделя', 'недели', 'недель'],
  days: ['день', 'дня', 'дней'],
  hours: ['час', 'часа', 'часов'],
  minutes: ['минута', 'минуты', 'минут'],
  seconds: ['секунда', 'секунды', 'секунд'],
};
