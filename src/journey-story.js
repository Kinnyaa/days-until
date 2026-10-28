const svg = (body, box = '0 0 100 64') => `<svg viewBox="${box}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${body}</svg>`;
// Stable identities reused in each reunion, rather than alternating generic figures.
const people = {
  boyfriend: { scale: 1, shoulders: 8, hair: '<path class="hat" d="M-8 11V5Q0-1 8 5V11ZM-8 8V17H-5V9M8 8V17H5V9"/>', detail: '<path class="seam" d="M0 22V36M-6 27h4v4h-4ZM3 27h4v4H3ZM-6 34h4M3 34h4"/>' },
  girlfriend: { scale: .94, shoulders: 6, skirt: true, back: '<path class="hair" d="M-8 23Q-12 2 0 2Q12 2 9 26L5 30H-7Z"/>', hair: '<path class="hair" d="M-6 9Q-2 0 5 5L7 12L2 8L-6 12Z"/>', detail: '<path class="scarf" d="M-6 20Q0 24 6 20L5 25H-5ZM2 24H5V34H2Z"/><path class="seam" d="M-4 26L0 30L3 26"/>' },
  mother: { scale: .9, shoulders: 8, back: '<path class="soft-hair" d="M-8 18Q-12 2 0 2Q12 3 8 20L4 23H-5Z"/>', hair: '<path class="soft-hair" d="M-7 11Q-7 2 0 3Q7 3 7 9L1 7L-5 13Z"/>', detail: '<path class="scarf" d="M-7 20L0 24L7 20L4 27H-4Z"/><path class="seam" d="M0 27V36M-6 31h3M3 31h3"/><path class="handbag" d="M8 34h7v11H8ZM10 34v-4h3v4"/>' },
  father: { scale: 1.04, shoulders: 10, hair: '<path class="soft-hair" d="M-7 13L-8 7L-4 4L-3 11ZM7 13L8 7L4 4L3 11Z"/>', detail: '<path class="seam" d="M-7 22L-2 29L0 23L2 29L7 22M0 28V36M-7 32h4M4 32h4"/>', glasses: '<path class="seam" d="M-6 12h5v4h-5ZM1 12h5v4H1ZM-1 13H1"/>' },
  friend: { scale: .97, shoulders: 8, hair: '<path class="hair" d="M-7 11L-7 5L-3 2L0 4L4 1L8 6L7 12L3 7L-2 9Z"/>', detail: '<path class="hood" d="M-7 21Q0 29 7 21L4 28H-4Z"/><path class="seam" d="M-2 26v5M2 26v5M-5 32h10v4H-5Z"/>' },
  friendGirl: { scale: .91, shoulders: 6, skirt: true, back: '<path class="hair" d="M5 6Q15 3 12 13L14 23L9 25L7 11Z"/>', hair: '<path class="hair" d="M-7 10Q-8 2 0 3Q8 2 7 11L3 7L-6 10Z"/>', detail: '<path class="seam" d="M-5 23L0 28L5 23M0 28V36M-6 31h12"/><path class="scarf" d="M8 7h4v3H8Z"/>' },
};
const person = (x, role) => {
  const p = people[role], w = p.shoulders;
  return `<g class="family-person person-${role}" data-person="${role}" transform="translate(${x} ${56 * (1-p.scale)}) scale(${p.scale})">
    ${p.back || ''}
    <path class="trousers" d="M-7 35H-1L-2 52H-7ZM1 35H7V52H2Z"/>
    <path class="boot" d="M-7 50H-2V55H-10V53ZM2 50H7L10 53V55H2Z"/>
    ${p.skirt ? '<path class="skirt" d="M-6 33H6L10 44H-10Z"/><path class="seam" d="M-3 36L-4 42M3 36L4 42"/>' : ''}
    <path class="coat" d="M-${w} 22L-4 20H4L${w} 22L${w-1} 36H-${w-1}Z"/>
    <path class="sleeve" d="M-${w} 23L-${w+2} 35M${w} 23L${w+2} 34"/>
    <circle class="face" cx="-${w+2}" cy="37" r="2"/><circle class="face" cx="${w+2}" cy="36" r="2"/>
    <path class="face" d="M-2 17H2V22H-2Z"/><ellipse cx="0" cy="12" rx="6" ry="7" class="face"/>
    ${p.hair}${p.glasses || ''}${p.detail}
  </g>`;
};
const wheels = [22, 68].map(x => `<g class="wheel" style="transform-origin:${x}px 47px"><circle cx="${x}" cy="47" r="7"/><path d="M${x-4} 47h8M${x} 43v8"/></g>`).join('');
// Separate profile rig: trousers and boots rotate at the hip, arms at the shoulder.
const soldier = x => `<g class="marcher" transform="translate(${x} 0)">
  <g class="march-leg march-back"><path class="uniform" d="M-4 44H3L2 65H-5Z"/><path class="boot" d="M-5 62H2V71L8 73V76H-6Z"/><path class="seam" d="M-2 48L-2 60"/></g>
  <g class="march-arm march-back-arm"><path class="uniform" d="M-5 26H1L2 39L9 42L7 47L-4 42Z"/><circle class="face" cx="8" cy="44" r="2.5"/></g>
  <path class="face" d="M-3 12H6L7 18L10 20L7 22V26H-2Z"/>
  <path class="helmet" d="M-7 16Q-8 4 1 4Q10 4 10 15L5 17H-7Z"/><path class="seam" d="M-3 15L-1 24H5M-4 9H6"/>
  <path class="uniform" d="M-5 25L4 24L9 30L7 47H-7L-8 31Z"/>
  <path class="vest" d="M-5 28L4 27L6 42H-6Z"/>
  <path class="seam" d="M-4 30H3M-4 34H3M-4 38H3M-6 43H7"/>
  <rect class="buckle" x="0" y="43" width="4" height="3"/>
  <g class="march-leg march-front"><path class="uniform" d="M-3 45H4L3 64H-4Z"/><path class="boot" d="M-4 62H3V71L10 73V76H-5Z"/><path class="seam" d="M0 48V60M-3 68H3M-3 71H3"/></g>
  <g class="march-arm march-front-arm"><path class="uniform" d="M-3 27Q3 25 4 29L3 39L11 41L9 46L-3 42L-6 31Z"/><circle class="face" cx="10" cy="43" r="2.5"/><path class="seam" d="M0 29V37"/><path d="M-3 30h5" stroke="#e5e7e9"/><path d="M-3 32h5" stroke="#587abb"/><path d="M-3 34h5" stroke="#b35c6d"/></g>
</g>`;
const train = svg(`
  <path class="train-body" d="M4 20Q4 16 9 16H91Q96 16 96 20V43H4Z"/>
  <path class="train-roof" d="M4 21H96V25H4Z"/>
  ${Array.from({length: 8}, (_, i) => `<rect class="glass" x="${12+i*10}" y="26" width="6" height="8" rx="1"/>`).join('')}
  <path class="train-stripe" d="M4 36H96V40H4Z"/><path class="seam" d="M7 22V41M92 22V41M4 42H96"/>
  <path class="boot" d="M96 27h6v14h-6Z"/>
  <path class="train-body" d="M104 20L112 15H174L184 25L190 37V44H104Z"/>
  <path class="train-stripe" d="M104 20L113 16H174L184 25L187 33H169L158 24H104Z"/>
  <path class="glass" d="M170 20H175L182 28H172ZM161 20h6v9h-6Z"/>
  <path class="train-roof" d="M114 12H169V16H110ZM104 39H189V45H104Z"/>
  <path class="seam" d="M117 17V38M151 19V38M156 33h3M119 23h25M119 26h25M119 29h25M119 32h25M119 35h25M105 37h45"/>
  <path class="pantograph" d="M125 12L135 5L143 10L136 12M130 4h15M159 12L166 6L174 10M162 5h14"/>
  <path class="train-stripe" d="M179 39H190V47H181Z"/><path class="face" d="M184 33h4v3h-4Z"/>
  ${[16,74,111,138,164].map(x => `<g><rect class="boot" x="${x-4}" y="43" width="22" height="5" rx="2"/>${[x,x+11].map(c => `<g class="wheel" style="transform-origin:${c}px 49px"><circle cx="${c}" cy="49" r="4"/><circle cx="${c}" cy="49" r="1.3"/><path d="M${c-2} 49h4"/></g>`).join('')}</g>`).join('')}
  <path class="seam" d="M188 44h7M105 34h6v7h-6"/>`, '0 0 200 60');
const assets = {
  train,
  car: svg(`<path class="vehicle" d="M7 33L22 28L32 17H59L72 29L86 33V44H7Z"/><path class="glass" d="M29 28L36 21H46V28ZM51 21h6l9 7H51Z"/><path d="M48 31v11M34 33h6" class="seam"/>${wheels}<path d="M80 35h6" class="seam"/>`),
  soldiers: svg([21, 60, 99].map(soldier).join(''), '0 0 126 82'),
};
const family = count => {
  const roles = count === 2 ? ['boyfriend', 'girlfriend'] : ['mother', 'father', 'boyfriend', 'girlfriend', 'friend', 'friendGirl'].slice(0, count);
  return svg(roles.map((role, i) => person(16 + i * 29, role)).join(''), `0 0 ${count * 29 + 4} 60`);
};
const house = svg('<path class="vehicle" d="M21 30h58v29H21Z"/><path class="hat" d="M11 31L50 4L89 31Z"/><path class="glass" d="M29 36h13v12H29ZM60 36h12v12H60ZM46 41h10v18H46Z"/><path class="seam" d="M35 36v12M29 42h13M66 36v12M60 42h12"/>');
const kinds = ['train', 'soldiers', 'train', 'soldiers', 'car', 'soldiers', 'soldiers', 'car', 'soldiers', 'soldiers', 'soldiers', 'soldiers', 'train'];

export function setupJourneyStory({ board, point, journeyPosition, milestones }) {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const vertical = matchMedia('(max-width: 600px)');
  const layer = document.createElement('div');
  layer.className = 'journey-story'; layer.setAttribute('aria-hidden', 'true');
  const actor = document.createElement('div'); actor.className = 'story-actor'; layer.append(actor);
  const departure = document.createElement('div');
  departure.className = 'story-departure'; departure.innerHTML = house; layer.append(departure);
  const events = [[3, family(2)], [5, family(4)], [8, family(6)], [13, house]].map(([stop, art]) => {
    const node = document.createElement('div'); node.className = 'story-event'; node.dataset.stop = stop;
    node.innerHTML = art; layer.append(node); return { stop, node };
  });
  board.append(layer);
  let visible = false, started = false, finished = motion.matches, elapsed = 0, previousTime = 0, frame = 0, delay = 0, kind;
  let position = 0;
  const place = (node, t) => {
    const p = point(t, vertical.matches);
    node.style.left = `${p.x / (vertical.matches ? 390 : 1440) * 100}%`;
    node.style.top = `${p.y / (vertical.matches ? 1760 : 520) * 100}%`;
  };
  function render(t, moving) {
    position = t;
    const segment = Math.min(12, Math.floor(t * 13 + 1e-9));
    const nextKind = kinds[segment];
    if (kind !== nextKind) { kind = nextKind; actor.innerHTML = assets[kind]; actor.dataset.kind = kind; }
    actor.classList.toggle('moving', moving);
    actor.hidden = Date.now() < milestones[0] || t >= 1;
    place(actor, t);
    const a = point(Math.max(0, t - .001), vertical.matches), b = point(Math.min(1, t + .001), vertical.matches);
    const dx = (b.x - a.x) * board.clientWidth / (vertical.matches ? 390 : 1440);
    const dy = (b.y - a.y) * board.clientHeight / (vertical.matches ? 1760 : 520);
    actor.style.setProperty('--bearing', `${kind === 'soldiers' ? 0 : Math.atan2(dy, dx) * 180 / Math.PI}deg`);
    actor.dataset.position = String(t);
    const departureProgress = Math.max(0, t * 13 - segment);
    const leavingHome = (kind === 'train' || kind === 'car') && !finished && !motion.matches && Date.now() >= milestones[0];
    place(departure, segment / 13);
    // The house stays at the origin while the vehicle emerges along the road.
    departure.hidden = !leavingHome || departureProgress >= .65;
    departure.style.opacity = String(Math.max(0, Math.min(1, (.65 - departureProgress) / .35)));
    actor.style.setProperty('--departure-cover', `${leavingHome ? Math.max(0, 100 - departureProgress * 240) : 0}%`);
    for (const { stop, node } of events) {
      place(node, stop / 13);
      node.classList.toggle('revealed', t * 13 + 1e-8 >= stop && Date.now() >= milestones[stop]);
      node.classList.toggle('event-below', stop % 2 === 0);
    }
    board.classList.toggle('story-started', started || motion.matches);
    layer.dataset.state = finished ? 'finished' : started ? moving ? 'playing' : 'paused' : 'waiting';
  }
  function draw(now) {
    if (!visible || document.hidden) { previousTime = 0; return; }
    if (previousTime) elapsed += (now - previousTime) / 1000;
    previousTime = now;
    const beat = elapsed / 2;
    const step = Math.floor(beat);
    const fraction = Math.min(1, (beat - step) / .82);
    const target = journeyPosition();
    const t = Math.min(target, (step + fraction) / 13);
    finished = t >= target;
    render(t, !finished && fraction < 1);
    if (!finished) frame = requestAnimationFrame(draw);
  }
  function pause() { clearTimeout(delay); cancelAnimationFrame(frame); previousTime = 0; render(position, false); }
  function resume() {
    pause();
    if (!visible || document.hidden) return;
    if (motion.matches || finished) { finished = true; render(journeyPosition(), false); return; }
    if (started) frame = requestAnimationFrame(draw);
    else delay = setTimeout(() => { started = true; frame = requestAnimationFrame(draw); }, 1000);
  }
  const observer = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting && entries[0].intersectionRatio >= .55; resume();
  }, { root: document.querySelector('.pages'), threshold: [0, .55] });
  observer.observe(document.querySelector('#journey'));
  const resize = new ResizeObserver(() => render(finished ? journeyPosition() : position, false)); resize.observe(board);
  const change = () => { if (motion.matches) finished = true; resume(); };
  motion.addEventListener('change', change);
  document.addEventListener('visibilitychange', resume);
  const refresh = setInterval(() => { if (finished) render(journeyPosition(), false); }, 30000);
  render(motion.matches ? journeyPosition() : 0, false);
  window.addEventListener('pagehide', event => {
    if (event.persisted) { pause(); return; }
    pause(); observer.disconnect(); resize.disconnect(); clearInterval(refresh);
    motion.removeEventListener('change', change); document.removeEventListener('visibilitychange', resume);
  });
  window.addEventListener('pageshow', resume);
}
