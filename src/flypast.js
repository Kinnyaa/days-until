// Decorative, stylised Su-35 formation. All coordinates are CSS pixels.
export function playFlypast() {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  if (motion.matches) return;
  const host = document.querySelector('.scene');
  const canvas = document.createElement('canvas');
  canvas.className = 'flypast';
  canvas.setAttribute('aria-hidden', 'true');
  host.append(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) { canvas.remove(); return; }
  const hull = new Path2D('M 70 0 L 28 -7 L 10 -13 L -23 -48 L -36 -48 L -20 -12 L -45 -14 L -54 -29 L -64 -29 L -57 -7 L -64 -5 L -64 5 L -57 7 L -64 29 L -54 29 L -45 14 L -20 12 L -36 48 L -23 48 L 10 13 L 28 7 Z');
  let width, height, frame;
  const resize = () => {
    width = host.clientWidth; height = host.clientHeight;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  const start = performance.now();
  const colors = ['245,248,255', '48,112,225', '218,57,77'];
  const cleanup = () => {
    cancelAnimationFrame(frame); canvas.remove();
    window.removeEventListener('resize', resize);
    motion.removeEventListener('change', onMotion);
  };
  const onMotion = () => { if (motion.matches) cleanup(); };
  window.addEventListener('resize', resize);
  motion.addEventListener('change', onMotion);
  function draw(now) {
    const t = (now - start) / 1000;
    if (t >= 4.8) { cleanup(); return; }
    ctx.clearRect(0, 0, width, height);
    const scale = Math.min(.72, Math.max(.35, width / 1900));
    const spacing = Math.max(39, height * .058);
    const travel = (width + 420) / 3.3;
    const fade = Math.min(1, t * 3) * Math.max(0, Math.min(1, (4.8 - t) / 1.4));
    // Read the live animated tokens, rather than running a second colour clock.
    const theme = getComputedStyle(document.documentElement);
    const accent = theme.getPropertyValue('--accent').trim();
    const surface = theme.getPropertyValue('--surface').trim();
    const tint = amount => `color-mix(in srgb, ${accent} ${amount}%, ${surface})`;
    colors.forEach((color, i) => {
      const x = -170 + t * travel - Math.abs(i - 1) * 55;
      const y = height * .26 + (i - 1) * spacing - t * height * .018;
      // A tapered ribbon stays attached to the exhaust; its tail disperses.
      const tail = Math.min(width * 1.1, t * travel);
      const nose = x - 58 * scale;
      const gradient = ctx.createLinearGradient(nose - tail, 0, nose, 0);
      gradient.addColorStop(0, `rgba(${color},0)`);
      gradient.addColorStop(.5, `rgba(${color},${.22 * fade})`);
      gradient.addColorStop(1, `rgba(${color},${.65 * fade})`);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(nose, y - 2);
      ctx.bezierCurveTo(nose - tail * .3, y - 8, nose - tail * .65, y + 5 - spacing * .38, nose - tail, y - spacing * .45);
      ctx.lineTo(nose - tail, y + spacing * .65);
      ctx.bezierCurveTo(nose - tail * .65, y + spacing * .42, nose - tail * .3, y + 12, nose, y + 2);
      ctx.fill();
      ctx.save(); ctx.globalAlpha = fade;
      ctx.translate(x, y); ctx.rotate(-.035); ctx.scale(scale, scale);
      ctx.shadowColor = tint(15); ctx.shadowBlur = 9; ctx.shadowOffsetY = 5;
      const metal = ctx.createLinearGradient(0, -48, 0, 48);
      metal.addColorStop(0, tint(46)); metal.addColorStop(.46, tint(78));
      metal.addColorStop(.54, tint(50)); metal.addColorStop(1, tint(25));
      ctx.fillStyle = metal; ctx.fill(hull); ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
      ctx.strokeStyle = tint(88); ctx.lineWidth = .85; ctx.stroke(hull);
      for (const side of [-1, 1]) {
        ctx.save(); ctx.scale(1, side);
        // Wing flaps, leading-edge panels and the twin engine nacelles.
        ctx.fillStyle = tint(38);
        ctx.fill(new Path2D('M 5 12 L -25 43 L -31 43 L -17 16 Z'));
        ctx.strokeStyle = tint(63); ctx.lineWidth = .65;
        ctx.stroke(new Path2D('M 8 13 L -26 45 M -20 16 L -31 42 M -11 25 L -21 25 M -19 34 L -27 34 M -44 15 L -55 25 L -60 25'));
        const engine = ctx.createLinearGradient(0, 4, 0, 13);
        engine.addColorStop(0, tint(28)); engine.addColorStop(.45, tint(74)); engine.addColorStop(1, tint(22));
        ctx.fillStyle = engine;
        ctx.fill(new Path2D('M 8 5 L -4 4 L -58 5 L -58 12 L -8 12 Z'));
        ctx.strokeStyle = tint(80); ctx.lineWidth = .6;
        ctx.stroke(new Path2D('M 6 5 L -47 5 M -8 12 L -47 12'));
        // Intake lip and segmented exhaust nozzle.
        ctx.fillStyle = surface; ctx.fill(new Path2D('M 8 5 L 3 11 L -2 11 L 2 5 Z'));
        ctx.fillStyle = tint(30); ctx.fillRect(-62, 5, 9, 7);
        ctx.strokeStyle = tint(72);
        for (let rib = -60; rib <= -54; rib += 2) { ctx.beginPath(); ctx.moveTo(rib, 5); ctx.lineTo(rib, 12); ctx.stroke(); }
        // Paired fins and small maintenance panel outlines.
        ctx.fillStyle = tint(56); ctx.fill(new Path2D('M -27 8 L -45 20 L -51 20 L -45 8 Z'));
        ctx.strokeStyle = tint(84); ctx.stroke(new Path2D('M -27 8 L -45 20 L -51 20'));
        ctx.lineWidth = .5; ctx.strokeRect(-16, 6, 8, 3);
        ctx.restore();
      }
      // Raised spine, nose seam and a glazed canopy with a restrained highlight.
      ctx.fillStyle = tint(66);
      ctx.fill(new Path2D('M 57 0 Q 22 -5 -35 -3 L -48 0 L -35 3 Q 22 5 57 0 Z'));
      ctx.strokeStyle = tint(40); ctx.lineWidth = .65;
      ctx.stroke(new Path2D('M 48 -3 L 47 3 M -30 -3 L -30 3 M -12 -3 L -12 3'));
      const glass = ctx.createLinearGradient(0, -4, 0, 4);
      glass.addColorStop(0, accent); glass.addColorStop(.35, tint(22)); glass.addColorStop(1, surface);
      ctx.fillStyle = glass; ctx.beginPath(); ctx.ellipse(23, 0, 14, 3.8, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = tint(85); ctx.lineWidth = .7; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(19, -3.6); ctx.lineTo(19, 3.6); ctx.stroke();
      ctx.strokeStyle = tint(96); ctx.beginPath(); ctx.moveTo(24, -2); ctx.lineTo(32, -1.4); ctx.stroke();
      ['#fff', '#2865c5', '#cf3549'].forEach((c, stripe) => { ctx.fillStyle = c; ctx.fillRect(-52, -24 + stripe * 2, 7, 2); });
      ctx.restore();
    });
    frame = requestAnimationFrame(draw);
  }
  frame = requestAnimationFrame(draw);
}
