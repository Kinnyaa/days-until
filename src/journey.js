import { animate, createTimeline } from 'animejs';
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

export function point(t, vertical = false) {
  return vertical
    ? { x: 195 - Math.cos(t * Math.PI * 13) * 60, y: 88 + 1584 * t }
    : { x: 66 + 1308 * t, y: 260 + Math.sin(t * Math.PI * 4) * 108 };
}

export function journeyPosition(now = Date.now()) {
  if (now < milestones[0]) return 0;
  if (now >= milestones.at(-1)) return 1;
  const segment = Math.max(0, milestones.findIndex(time => time > now) - 1);
  return (segment + (now - milestones[segment]) / (milestones[segment + 1] - milestones[segment])) / 13;
}

export function setupJourney() {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const vertical = matchMedia('(max-width: 600px)');
  const board = document.querySelector('.board');
  const viewport = document.querySelector('.board-viewport');
  const stops = document.querySelector('.stops');
  const section = document.querySelector('#journey');
  const panels = [...document.querySelectorAll('.panel')];
  const progress = document.querySelector('.road-progress');
  const marker = board.querySelector('.traveler');
  const halo = document.createElement('i');
  halo.className = 'traveler-halo';
  halo.setAttribute('aria-hidden', 'true');
  marker.prepend(halo);
  let length = 0, traveled = 0, width, height;
  let sectionVisible = false, markerVisible = false, started = false, complete = motion.matches;
  let intro, breathing, selected, emphasisTimer;
  const reveal = { amount: complete ? 1 : 0 };
  const visibleCaptions = new Set();
  const seenCaptions = new Set();
  const captionAnimations = new Map();
  const feedback = new Set();
  const cleanups = [];
  function listen(target, type, callback, options) {
    target.addEventListener(type, callback, options);
    cleanups.push(() => target.removeEventListener(type, callback, options));
  }
  stops.innerHTML = milestones.map((time, i) => {
    const date = dateLabel.format(new Date(time));
    const accessibleDate = new Intl.DateTimeFormat('ru-RU', { timeZone: 'Europe/Moscow', day: 'numeric', month: 'long', year: 'numeric' }).format(time);
    return `<li class="stop ${i % 2 ? 'label-below' : 'label-above'} ${i === 13 ? 'finish-stop' : ''}"><button class="date-button" type="button" aria-label="${accessibleDate}" aria-pressed="false"><span class="island" aria-hidden="true"><span class="island-dot"></span></span><span class="date-ring" aria-hidden="true"></span></button><div class="stop-caption"><time datetime="${new Date(time).toISOString()}">${date}</time><span class="days-relative"></span>${i === 13 ? '<span class="finish-label">Встреча</span>' : ''}</div></li>`;
  }).join('');
  const captions = [...stops.querySelectorAll('.stop-caption')];
  // This is the sole writer of strokeDashoffset. Time and layout only change its inputs.
  function paintProgress() {
    progress.style.strokeDasharray = `${length} ${length}`;
    progress.style.strokeDashoffset = `${length - traveled * reveal.amount}`;
  }
  function update() {
    const now = Date.now();
    const day = moscowDay(now);
    const next = milestones.findIndex(time => moscowDay(time) >= day);
    [...stops.children].forEach((stop, i) => {
      const difference = moscowDay(milestones[i]) - day;
      stop.classList.toggle('passed', difference < 0);
      stop.classList.toggle('on-date', difference === 0);
      stop.classList.toggle('next-date', i === next);
      stop.querySelector('.days-relative').textContent = dayLabel(milestones[i], now);
    });
    const t = journeyPosition(now);
    const position = point(t, vertical.matches);
    marker.style.left = `${position.x / width * 100}%`;
    marker.style.top = `${position.y / height * 100}%`;
    // The polyline uses the same samples as point(); include its exact final endpoint.
    const sample = Math.min(259, Math.floor(t * 260));
    traveled = distances[sample] + (distances[sample + 1] - distances[sample]) * (t * 260 - sample);
    paintProgress();
  }
  let distances = [];
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
    // Normalize to the browser's real SVG length, avoiding accumulated float error.
    const ratio = length / distances.at(-1);
    distances = distances.map(distance => distance * ratio);
    [...stops.children].forEach((stop, i) => {
      const position = point(i / (milestones.length - 1), vertical.matches);
      stop.style.left = `${position.x / width * 100}%`;
      stop.style.top = `${position.y / height * 100}%`;
      stop.classList.toggle('caption-left', position.x >= width / 2);
    });
    viewport.setAttribute('aria-label', vertical.matches ? 'Дорожка дат. Начало сверху; прокручивайте вниз к встрече.' : 'Дорожка дат. Начало слева; прокручивайте вправо к встрече.');
    document.querySelector('.journey-hint').textContent = vertical.matches ? 'Листай дорожку вниз' : 'Листай дорожку вправо';
    update();
  }
  function revealCaptions() {
    if (!sectionVisible || document.hidden || (!complete && (!intro || intro.currentTime < 250))) return;
    let delay = 0;
    for (const caption of visibleCaptions) {
      if (seenCaptions.has(caption)) continue;
      seenCaptions.add(caption);
      if (motion.matches) continue;
      const animation = animate(caption, {
        opacity: [0, 1], y: [5, 0], duration: 480, delay,
        ease: 'outCubic', onComplete: () => captionAnimations.delete(caption),
      });
      captionAnimations.set(caption, animation);
      delay += 55;
    }
  }
  function syncMotion() {
    const active = sectionVisible && !document.hidden && !motion.matches;
    if (active && !started && !complete) {
      started = true;
      intro = createTimeline({ autoplay: false, onRender: paintProgress, onComplete: () => {
        complete = true;
        reveal.amount = 1;
        paintProgress();
        syncMotion();
      } }).add(reveal, { amount: [0, 1], duration: 1600, ease: 'inOutSine' }, 250)
        .call(revealCaptions, 250);
    }
    if (intro && !complete) active ? intro.resume() : intro.pause();
    for (const animation of captionAnimations.values()) active ? animation.resume() : animation.pause();
    if (active) revealCaptions();
    if (active && complete && markerVisible) {
      breathing ??= animate(halo, { opacity: [.35, .6, .35], scale: [.95, 1.12, .95], duration: 3600, loop: true, ease: 'inOutSine' });
      breathing.resume();
    } else breathing?.pause();
    if (!active) settleFeedback();
  }
  function settleFeedback() {
    for (const animation of feedback) animation.cancel();
    feedback.clear();
    for (const button of stops.querySelectorAll('.date-button')) {
      button.querySelector('.island').style.transform = '';
      button.querySelector('.date-ring').style.opacity = '0';
    }
  }
  function selectDate(button) {
    settleFeedback();
    clearTimeout(emphasisTimer);
    selected?.setAttribute('aria-pressed', 'false');
    selected?.closest('.stop').classList.remove('date-emphasis');
    selected = button;
    button.setAttribute('aria-pressed', 'true');
    button.closest('.stop').classList.add('date-emphasis');
    emphasisTimer = setTimeout(() => button.closest('.stop').classList.remove('date-emphasis'), 1600);
    if (motion.matches || document.hidden) return;
    const keep = (target, parameters) => {
      const animation = animate(target, { ...parameters, onComplete: () => feedback.delete(animation) });
      feedback.add(animation);
    };
    keep(button.querySelector('.island'), { scale: [1, .96, 1], duration: 300, ease: 'inOutSine' });
    keep(button.querySelector('.date-ring'), { scale: [.8, 1.7], opacity: [.45, 0], duration: 520, ease: 'outCubic' });
  }
  let gesture;
  listen(stops, 'pointerdown', event => { gesture = { x: event.clientX, y: event.clientY, moved: false }; });
  listen(stops, 'pointermove', event => {
    if (gesture && Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) > 8) gesture.moved = true;
  }, { passive: true });
  listen(viewport, 'scroll', () => { if (gesture) gesture.moved = true; }, { passive: true });
  listen(stops, 'pointercancel', () => { if (gesture) gesture.moved = true; });
  listen(stops, 'click', event => {
    const button = event.target.closest('.date-button');
    if (button && (event.detail === 0 || !gesture?.moved)) selectDate(button);
    gesture = undefined;
  });
  layout();
  const resize = new ResizeObserver(layout);
  resize.observe(viewport);
  const captionObserver = new IntersectionObserver(entries => {
    for (const entry of entries) entry.isIntersecting ? visibleCaptions.add(entry.target) : visibleCaptions.delete(entry.target);
    if (started || complete) revealCaptions();
  }, { root: viewport, threshold: .5 });
  captions.forEach(caption => captionObserver.observe(caption));
  const markerObserver = new IntersectionObserver(([entry]) => {
    markerVisible = entry.isIntersecting && entry.intersectionRatio >= .95;
    syncMotion();
  }, { root: viewport, threshold: [0, .95, 1] });
  markerObserver.observe(marker);
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.target === section) sectionVisible = entry.isIntersecting && entry.intersectionRatio >= .5;
      if (entry.intersectionRatio >= .5) {
        for (const panel of panels) panel.classList.toggle('is-active', panel === entry.target);
      }
    }
    syncMotion();
  }, { root: document.querySelector('.pages'), threshold: [0, .5, .75] });
  panels.forEach(panel => observer.observe(panel));
  listen(motion, 'change', () => {
    if (motion.matches) {
      intro?.cancel();
      breathing?.cancel(); breathing = undefined;
      complete = true; reveal.amount = 1; paintProgress();
      halo.style.opacity = '.35'; halo.style.transform = '';
      for (const animation of captionAnimations.values()) animation.cancel();
      captionAnimations.clear();
      for (const caption of captions) { caption.style.opacity = '1'; caption.style.transform = ''; }
    }
    syncMotion();
  });
  listen(document, 'visibilitychange', () => { if (!document.hidden) update(); syncMotion(); });
  listen(window, 'pageshow', () => { update(); syncMotion(); });
  const refresh = setInterval(() => { if (!document.hidden) update(); }, 30000);
  listen(window, 'pagehide', event => {
    if (event.persisted) return;
    clearInterval(refresh); clearTimeout(emphasisTimer);
    intro?.cancel(); breathing?.cancel(); settleFeedback();
    for (const animation of captionAnimations.values()) animation.cancel();
    resize.disconnect(); observer.disconnect(); captionObserver.disconnect(); markerObserver.disconnect();
    cleanups.forEach(cleanup => cleanup());
  });
}
