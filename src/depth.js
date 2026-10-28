import { animate } from 'animejs';

export function setupTimerDepth() {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');
  const surface = document.querySelector('.time-surface');
  const stage = document.querySelector('.depth-stage');
  let float;
  let tilt;
  let frame;

  function reset() {
    float?.cancel();
    tilt?.cancel();
    cancelAnimationFrame(frame);
    stage.style.removeProperty('transform');
    surface.style.removeProperty('transform');
    if (motion.matches) return;
    float = animate(stage, { y: [0, -5, 0], duration: 14000, loop: true, ease: 'inOutSine' });
    if (document.hidden) float.pause();
  }
  surface.addEventListener('pointermove', event => {
    if (motion.matches || !pointer.matches) return;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const bounds = surface.getBoundingClientRect();
      const x = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
      const y = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
      tilt?.cancel();
      tilt = animate(surface, { rotateX: 5 - y * 3, rotateY: x * 5, duration: 850, ease: 'outCubic' });
    });
  });
  surface.addEventListener('pointerleave', () => {
    cancelAnimationFrame(frame);
    if (motion.matches) return;
    tilt?.cancel();
    tilt = animate(surface, { rotateX: 5, rotateY: -3, duration: 1100, ease: 'outCubic' });
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) float?.pause();
    else if (!motion.matches) float?.play();
  });
  motion.addEventListener('change', reset);
  reset();
}
