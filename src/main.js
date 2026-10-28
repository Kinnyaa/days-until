import { animate, stagger } from 'animejs';
import './style.css';
import { remaining, plural, unitForms } from './timer.js';
import { setupJourney } from './journey.js';

const root = document.documentElement;
const heading = document.querySelector('h1');
const countdown = document.querySelector('.countdown');
const today = document.querySelector('.today');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const active = new Map();
let ended = false;
let tickId;
const atmosphereAnimations = [];
const compact = matchMedia('(max-width: 600px)');
let pointerAnimation;
let previous = {};

function setupAtmosphere() {
  for (const animation of atmosphereAnimations) animation.cancel();
  atmosphereAnimations.length = 0;
  for (const element of document.querySelectorAll('.halo, .light-ribbon')) {
    element.style.removeProperty('transform');
    element.style.removeProperty('opacity');
  }
  if (motion.matches) return;
  const layers = [
    ['.halo-one', 18000, '3vw', '2vh', [.8, .98, .8]],
    ['.halo-two', 24000, '-3vw', '-3vh', [.7, .9, .7]],
    ...(!compact.matches ? [['.halo-three', 28000, '2vw', '-2vh', [.5, .72, .5]]] : []),
    ['.light-ribbon', 30000, '1.5vw', '-1.5vh', compact.matches ? [.38, .48, .38] : [.55, .7, .55]],
  ];
  for (const [selector, duration, x, y, opacity] of layers) {
    const animation = animate(selector, {
      x: ['0vw', x, '0vw'], y: ['0vh', y, '0vh'], opacity,
      duration, loop: true, ease: 'inOutSine',
    });
    atmosphereAnimations.push(animation);
    if (document.hidden) animation.pause();
  }
}

function changeNumber(element, text) {
  active.get(element)?.cancel();
  element.textContent = text;
  if (motion.matches) { element.style.opacity = '1'; element.style.transform = ''; return; }
  active.set(element, animate(element, { opacity: [.4, 1], y: [5, 0], duration: 230, ease: 'outCubic' }));
}

function finish(initial) {
  if (ended) return;
  ended = true;
  clearTimeout(tickId);
  document.querySelector('#announcement').textContent = 'Время до встречи — сегодня';
  const reveal = () => {
    countdown.hidden = true;
    today.hidden = false;
    heading.textContent = 'Время до встречи';
    document.body.classList.add('finished');
    if (!initial && !motion.matches) animate(today, { opacity: [0, 1], y: [12, 0], duration: 1000, ease: 'outCubic' });
  };
  const colors = { '--surface': '#5B2A5E', '--accent': '#B2F2D8', '--glow': 'rgba(178,242,216,.28)' };
  document.querySelector('meta[name="theme-color"]').content = '#5B2A5E';
  if (initial) {
    for (const [key, value] of Object.entries(colors)) root.style.setProperty(key, value);
    reveal();
  } else {
    animate(root, { ...colors, duration: motion.matches ? 180 : 2800, ease: 'inOutSine' });
    animate(countdown, { opacity: 0, duration: motion.matches ? 100 : 450, onComplete: reveal });
    if (!motion.matches) animate('.wave', { scale: [.05, 1.2], opacity: [{ to: .85, duration: 900 }, { to: 0, duration: 2100 }], duration: 3000, ease: 'outSine' });
  }
}

function tick(initial = false) {
  const state = remaining();
  if (state.finished) { finish(initial); return; }
  for (const [key, forms] of Object.entries(unitForms)) {
    const group = document.querySelector(`[data-unit="${key}"]`);
    if (previous[key] !== state[key]) {
      const number = group.querySelector('.number');
      const text = String(state[key]).padStart(2, '0');
      if (initial) number.textContent = text;
      else changeNumber(number, text);
      group.querySelector('.label').textContent = plural(state[key], forms);
    }
  }
  previous = state;
  clearTimeout(tickId);
  tickId = setTimeout(() => tick(), Math.min(1000 - Date.now() % 1000 + 5, 1000));
}

tick(true);
setupJourney();
// Explicit, repeatable preview; does not change the deadline or save state.
if (new URLSearchParams(location.search).get('preview') === 'finish' && !ended) {
  setTimeout(() => finish(false), 4000);
}
document.body.classList.add('ready');
if (!motion.matches) {
  animate('.composition', { opacity: [0, 1], y: [10, 0], duration: 900, ease: 'outCubic' });
  if (!ended) {
    animate('.unit', { opacity: [0, 1], y: [8, 0], delay: stagger(65, { start: 100 }), duration: 750, ease: 'outCubic' });
  }
}
setupAtmosphere();
compact.addEventListener('change', setupAtmosphere);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    clearTimeout(tickId);
    for (const animation of atmosphereAnimations) animation.pause();
  } else {
    if (!ended) tick();
    if (!motion.matches) for (const animation of atmosphereAnimations) animation.play();
  }
});
window.addEventListener('pageshow', () => { if (!ended) tick(); });
window.addEventListener('pointermove', (event) => {
  if (motion.matches || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  pointerAnimation?.cancel();
  pointerAnimation = animate('.photograph', { x: (event.clientX / innerWidth - .5) * 8, y: (event.clientY / innerHeight - .5) * 8, duration: 1200, ease: 'outCubic' });
});
motion.addEventListener('change', () => {
  setupAtmosphere();
  if (motion.matches) {
    pointerAnimation?.cancel();
    document.querySelector('.photograph').style.transform = 'scale(1.04)';
    for (const [element, animation] of active) { animation.cancel(); element.style.opacity = '1'; element.style.transform = ''; }
  }
});
