import { animate, stagger } from 'animejs';
import { plural, TARGET_TIME } from './timer.js';

const DAY = 86400000;
const calendar = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Moscow', year: 'numeric', month: '2-digit', day: '2-digit' });
const dateLabel = new Intl.DateTimeFormat('ru-RU', { timeZone: 'Europe/Moscow', day: 'numeric', month: 'long' });
export function moscowDay(time) {
  const parts = Object.fromEntries(calendar.formatToParts(new Date(time)).map(p => [p.type, p.value]));
  return Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)) / DAY;
}
export function dayLabel(time, now = Date.now()) {
  const difference = moscowDay(time) - moscowDay(now);
  if (!difference) return 'Сегодня';
  const n = Math.abs(difference);
  const label = `${n} ${plural(n, ['день', 'дня', 'дней'])}`;
  return difference < 0 ? `${label} назад` : `через ${label}`;
}
export const milestones = Array.from({ length: 13 }, (_, index) => Date.parse(`${2025 + Math.floor((10 + index) / 12)}-${String((10 + index) % 12 + 1).padStart(2, '0')}-11T00:00:00+03:00`)).concat(TARGET_TIME);

function point(t, vertical = false) {
  return vertical
    ? { x: 195 - Math.cos(t * Math.PI * 13) * 60, y: 88 + 1584 * t }
    : { x: 66 + 1308 * t, y: 260 + Math.sin(t * Math.PI * 4) * 108 };
}

export function setupJourney() {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const vertical = matchMedia('(max-width: 600px)');
  const board = document.querySelector('.board');
  const viewport = document.querySelector('.board-viewport');
  const stops = document.querySelector('.stops');
  const panels = [...document.querySelectorAll('.panel')];
  const progress = document.querySelector('.road-progress');
  let length;
  let distances;
  let width;
  let height;
  stops.innerHTML = milestones.map((time, i) => {
    const date = dateLabel.format(new Date(time));
    return `<li class="stop ${i % 2 ? 'label-below' : 'label-above'} ${i === 13 ? 'finish-stop' : ''}"><span class="island" aria-hidden="true"><span class="island-dot"></span></span><div class="stop-caption"><time datetime="${new Date(time).toISOString()}">${date}</time><span class="days-relative"></span>${i === 13 ? '<span class="finish-label">Встреча</span>' : ''}</div></li>`;
  }).join('');
  function layout() {
    width = vertical.matches ? 390 : 1440;
    height = vertical.matches ? 1760 : 520;
    document.querySelector('.road').setAttribute('viewBox', `0 0 ${width} ${height}`);
    const samples = Array.from({ length: 261 }, (_, i) => point(i / 260, vertical.matches));
    const path = samples.map((p, i) => `${i ? 'L' : 'M'}${p.x},${p.y}`).join(' ');
    for (const road of document.querySelectorAll('.road path')) road.setAttribute('d', path);
    length = progress.getTotalLength();
    distances = [0];
    for (let i = 1; i < samples.length; i++) distances.push(distances[i - 1] + Math.hypot(samples[i].x - samples[i - 1].x, samples[i].y - samples[i - 1].y));
    [...stops.children].forEach((stop, i) => {
      const position = point(i / (milestones.length - 1), vertical.matches);
      stop.style.left = `${position.x / width * 100}%`;
      stop.style.top = `${position.y / height * 100}%`;
      stop.classList.toggle('caption-left', position.x >= width / 2);
    });
    viewport.setAttribute('aria-label', vertical.matches ? 'Дорожка дат. Начало сверху; прокручивайте вниз к встрече.' : 'Дорожка дат. Начало слева; прокручивайте вправо к встрече.');
    document.querySelector('.journey-hint').textContent = vertical.matches ? 'Листай дорожку вниз' : 'Листай дорожку вправо';
    viewport.scrollLeft = 0;
    viewport.scrollTop = 0;
    lastDay = undefined;
    update();
  }
  let lastDay;
  function update() {
    const now = Date.now();
    const day = moscowDay(now);
    if (day === lastDay) return;
    lastDay = day;
    [...stops.children].forEach((stop, i) => {
      const difference = moscowDay(milestones[i]) - day;
      stop.classList.toggle('passed', difference < 0);
      stop.classList.toggle('on-date', difference === 0);
      stop.querySelector('.days-relative').textContent = dayLabel(milestones[i], now);
    });
    let segment = milestones.findIndex(time => time > now) - 1;
    let t = 0;
    if (now >= milestones.at(-1)) t = 1;
    else if (now >= milestones[0]) {
      segment = Math.max(0, segment);
      t = (segment + (now - milestones[segment]) / (milestones[segment + 1] - milestones[segment])) / (milestones.length - 1);
    }
    const position = point(t, vertical.matches);
    const marker = board.querySelector('.traveler');
    marker.style.left = `${position.x / width * 100}%`;
    marker.style.top = `${position.y / height * 100}%`;
    const index = Math.min(259, Math.floor(t * 260));
    const traveled = distances[index] + (distances[index + 1] - distances[index]) * (t * 260 - index);
    progress.style.strokeDasharray = `${length} ${length}`;
    progress.style.strokeDashoffset = `${length - traveled}`;
  }
  layout();
  vertical.addEventListener('change', layout);
  const refresh = setInterval(update, 30000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) update(); });
  window.addEventListener('pageshow', update);
  let seen = false;
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting || entry.intersectionRatio < .55) continue;
      for (const panel of panels) panel.classList.toggle('is-active', panel === entry.target);
      if (entry.target.id === 'journey' && !seen) {
        seen = true;
        viewport.scrollLeft = 0; viewport.scrollTop = 0;
        if (!motion.matches) animate('.stop', { opacity: [0, 1], y: [6, 0], duration: 650, delay: stagger(45), ease: 'outCubic' });
      }
    }
  }, { root: document.querySelector('.pages'), threshold: [.55, .75] });
  panels.forEach(panel => observer.observe(panel));
  // Start at the beginning: left on desktop, top on mobile.
  viewport.scrollLeft = 0; viewport.scrollTop = 0;
  window.addEventListener('pagehide', event => { if (!event.persisted) clearInterval(refresh); });
}
