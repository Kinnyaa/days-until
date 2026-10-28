import { animate } from 'animejs';

const rolls = new Map();
function face(digit) {
  const node = document.createElement('span');
  node.className = 'digit-face';
  node.dataset.digit = digit;
  return node;
}
function settle(window) {
  const roll = rolls.get(window);
  roll?.cancel();
  rolls.delete(window);
  const strip = window.querySelector('.digit-strip');
  strip.replaceChildren(face(window.dataset.digit));
  strip.style.removeProperty('transform');
}
export function settleRolls() {
  for (const window of [...rolls.keys()]) settle(window);
}

export function renderNumber(element, text, animated = true) {
  let windows = [...element.querySelectorAll('.digit-window')];
  if (windows.length !== text.length) {
    windows.forEach(settle);
    element.replaceChildren();
    const value = document.createElement('span');
    value.className = 'number-value sr-only';
    element.append(value);
    windows = [...text].map(digit => {
      const window = document.createElement('span');
      window.className = 'digit-window';
      window.setAttribute('aria-hidden', 'true');
      window.dataset.digit = digit;
      const strip = document.createElement('span');
      strip.className = 'digit-strip';
      strip.append(face(digit));
      window.append(strip);
      element.append(window);
      return window;
    });
  }
  element.querySelector('.number-value').textContent = text;
  windows.forEach((window, index) => {
    const next = text[index];
    const old = window.dataset.digit;
    if (old === next && animated) return;
    settle(window);
    window.dataset.digit = next;
    const strip = window.querySelector('.digit-strip');
    if (!animated || old === next) { strip.replaceChildren(face(next)); return; }
    strip.replaceChildren(face(old), face(next));
    const roll = animate(strip, {
      y: ['0%', '-50%'], duration: 620, delay: index * 35, ease: 'outQuint',
      onComplete: () => {
        // Only the current roll may settle this digit after an interruption.
        if (rolls.get(window) !== roll) return;
        rolls.delete(window);
        strip.replaceChildren(face(next));
        strip.style.removeProperty('transform');
      },
    });
    rolls.set(window, roll);
  });
}
