import { animate, stagger } from 'animejs';
import './style.css';
import { remaining, plural, unitForms, TARGET_TIME } from './timer.js';
import { setupJourney } from './journey.js';
import { setupTimerDepth } from './depth.js';
import { renderNumber, settleRolls } from './drum.js';
import { playFlypast } from './flypast.js';

const root = document.documentElement;
const heading = document.querySelector('h1');
const countdown = document.querySelector('.countdown');
const today = document.querySelector('.today');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const previewFinish = new URLSearchParams(location.search).get('preview') === 'finish';
const finishSeenKey = `arrival-timer:final-seen:${TARGET_TIME}`;
let seenInMemory = false;
let pendingFinal;
let sceneVisible = false;
function hasSeenFinal() {
  try { return seenInMemory || localStorage.getItem(finishSeenKey) === '1'; }
  catch { return seenInMemory; }
}
function rememberFinal() {
  seenInMemory = true;
  try { localStorage.setItem(finishSeenKey, '1'); } catch { /* Storage may be disabled. */ }
}
function launchPendingFinal() {
  if (document.hidden || !sceneVisible || !pendingFinal) return;
  const launch = pendingFinal;
  pendingFinal = undefined;
  launch();
}
const sceneObserver = new IntersectionObserver(([entry]) => {
  sceneVisible = entry.isIntersecting && entry.intersectionRatio >= .5;
  launchPendingFinal();
}, { root: document.querySelector('.pages'), threshold: [0, .5] });
sceneObserver.observe(document.querySelector('.scene'));
let ended = false;
let tickId;
const atmosphereAnimations = [];
const compact = matchMedia('(max-width: 600px)');
let pointerAnimation;
let previous = {};
const transientAnimations = new Set();
function transition(target, parameters) {
  const onComplete = parameters.onComplete;
  const animation = animate(target, { ...parameters, onComplete: (...args) => {
    transientAnimations.delete(animation);
    onComplete?.(...args);
  } });
  transientAnimations.add(animation);
  return animation;
}

function setupAtmosphere() {
  for (const animation of atmosphereAnimations) animation.cancel();
  atmosphereAnimations.length = 0;
  for (const element of document.querySelectorAll('.halo, .light-ribbon')) {
    element.style.removeProperty('transform');
    element.style.removeProperty('opacity');
  }
  if (motion.matches) return;
  const layers = [
    ['.halo-one', 24000, compact.matches ? '.7vw' : '1.5vw', compact.matches ? '.6vh' : '1vh', [.8, .85, .8]],
    ...(!compact.matches ? [
      ['.halo-two', 26000, '-1.5vw', '-1vh', [.7, .75, .7]],
      ['.halo-three', 28000, '1vw', '-1vh', [.5, .54, .5]],
    ] : []),
    ['.light-ribbon', 30000, compact.matches ? '.5vw' : '1vw', compact.matches ? '-.5vh' : '-1vh', compact.matches ? [.38, .4, .38] : [.55, .59, .55]],
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

function finish() {
  if (ended) return;
  ended = true;
  clearTimeout(tickId);
  settleRolls();
  document.querySelector('#announcement').textContent = 'Время до встречи — сегодня';
  const reveal = () => {
    countdown.hidden = true;
    today.hidden = false;
    heading.textContent = 'Время до встречи';
    document.body.classList.add('finished');
    if (animateFinal && !motion.matches) transition(today, { opacity: [0, 1], rotateX: [-30, 0], z: [80, 40], y: [12, 0], duration: 1200, ease: 'outCubic' });
  };
  const colors = { '--surface': '#E9F6E9', '--accent': '#203C25', '--glow': 'rgba(101,186,116,.28)', '--edge-shade': 'rgba(32,60,37,.06)' };
  document.querySelector('meta[name="theme-color"]').content = '#E9F6E9';
  let animateFinal = false;
  const showStaticFinal = () => {
    for (const [key, value] of Object.entries(colors)) root.style.setProperty(key, value);
    reveal();
  };
  if (!previewFinish && hasSeenFinal()) { showStaticFinal(); return; }
  pendingFinal = () => {
    // Recheck when foregrounded: another tab may already have shown the final.
    if (!previewFinish && hasSeenFinal()) { showStaticFinal(); return; }
    if (!previewFinish) rememberFinal();
    if (motion.matches) { showStaticFinal(); return; }
    animateFinal = true;
    playFlypast();
    transition(root, { ...colors, duration: motion.matches ? 180 : 2800, ease: 'inOutSine' });
    transition(countdown, { opacity: 0, duration: motion.matches ? 100 : 450, onComplete: reveal });
    if (!motion.matches) transition('.wave', { scale: [.05, 1.2], opacity: [{ to: .85, duration: 900 }, { to: 0, duration: 2100 }], duration: 3000, ease: 'outSine' });
  };
  launchPendingFinal();
}

function tick(initial = false) {
  const state = remaining();
  if (state.finished) { if (!previewFinish) finish(); return; }
  for (const [key, forms] of Object.entries(unitForms)) {
    const group = document.querySelector(`[data-unit="${key}"]`);
    if (previous[key] !== state[key]) {
      const number = group.querySelector('.number');
      const text = String(state[key]).padStart(2, '0');
      renderNumber(number, text, !initial && !motion.matches && !document.hidden);
      group.querySelector('.label').textContent = plural(state[key], forms);
    }
  }
  previous = state;
  clearTimeout(tickId);
  tickId = setTimeout(() => tick(), Math.min(1000 - Date.now() % 1000 + 5, 1000));
}

if (!previewFinish || !remaining().finished) tick(true);
setupJourney();
setupTimerDepth();
// Explicit, repeatable preview; does not change the deadline or save state.
let previewId;
if (previewFinish && !ended) {
  previewId = setTimeout(finish, 4000);
}
document.body.classList.add('ready');
if (!motion.matches) {
  transition('.composition', { opacity: [0, 1], y: [10, 0], duration: 900, ease: 'outCubic' });
  if (!ended) {
    transition('.unit', { opacity: [0, 1], y: [8, 0], delay: stagger(65, { start: 100 }), duration: 750, ease: 'outCubic' });
  }
}
setupAtmosphere();
compact.addEventListener('change', setupAtmosphere);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    clearTimeout(tickId);
    settleRolls();
    for (const animation of atmosphereAnimations) animation.pause();
  } else {
    if (!ended) tick();
    launchPendingFinal();
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
    settleRolls();
    for (const animation of [...transientAnimations]) animation.complete();
  }
});
window.addEventListener('pagehide', event => {
  if (event.persisted) return;
  clearTimeout(previewId);
  sceneObserver.disconnect();
  clearTimeout(tickId);
  pointerAnimation?.cancel();
  for (const animation of atmosphereAnimations) animation.cancel();
  for (const animation of transientAnimations) animation.cancel();
  transientAnimations.clear();
});

