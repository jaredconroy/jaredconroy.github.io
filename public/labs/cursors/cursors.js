(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const stage = $('stage'), canvas = $('canvas'), ctx = canvas.getContext('2d');
  const motion = $('motion'), preview = $('preview'), pause = $('pause'), inkDust = $('ink-dust');
  let brush = null, brushScale = 1;
  fetch('../../media/signature-brush.json').then(response => {if (!response.ok) throw new Error('Brush unavailable'); return response.json();}).then(value => {brush = value; measureBrush(); request();}).catch(() => {$('motion-note').textContent = 'The signature brush could not load. Reload to retry.';});
  function measureBrush() {
    if (!brush) return;
    const box = stage.querySelector('.signature').getBoundingClientRect();
    brushScale = Math.min(box.width / brush.viewBox[2], box.height / brush.viewBox[3]);
  }
  const effects = [
    { id: 'reveal', name: 'Underlayer reveal', tag: 'A second surface', description: 'A crisp pool of dark color follows you beneath the page. Closest to the hidden-layer idea, with a small footprint and no fluid simulation.', budget: '1 spotlight · local redraw' },
    { id: 'ring', name: 'Following ring', tag: 'Quiet and precise', description: 'A fine ring catches up to the native cursor. A restrained detail that leaves the artwork in charge.', budget: '1 ring · no particles' },
    { id: 'ink', name: 'Ink trail', tag: 'A drawn gesture', description: 'The signature’s exact smooth, angled nib, at the same displayed thickness. One continuous stroke replaces overlapping segments, so no point markers or dark joints show. Optionally add a little dust.', budget: '1 continuous brush stroke' },
    { id: 'wake', name: 'Soft wake', tag: 'Light and atmospheric', description: 'A few translucent circles spread and dissolve behind your movement. Soft edges come from gradients, without a blur filter.', budget: '9 marks maximum' },
    { id: 'dust', name: 'Dust scatter', tag: 'Small playful sparks', description: 'Tiny flecks drift out of your path, then disappear. A livelier option, kept local and sparse.', budget: '72 particles maximum' },
    { id: 'constellation', name: 'Constellation', tag: 'A responsive field', description: 'A quiet dot field bends away from the cursor and springs back. Short connections appear only around your hand.', budget: '48 dots · local links' },
    { id: 'ripples', name: 'Ripples', tag: 'A little resonance', description: 'Your motion leaves expanding rings; a click makes a larger ripple. A graphic effect with a clear beginning and end.', budget: '14 rings maximum' },
    { id: 'grid', name: 'Magnetic grid', tag: 'Order with a pulse', description: 'A small field of crosses leans toward the cursor, then returns to its grid. Deliberate and structured, with no physics library.', budget: '54 spring points' },
  ];
  const palettes = {
    base: { surface: '#ffffff', ink: '#173458', accent: '#00a99d' },
    foul: { surface: '#f7f0e7', ink: '#30243d', accent: '#846393' },
    sleds: { surface: '#b6d3e9', ink: '#19364d', accent: '#514238' },
    afroman: { surface: '#faf6ef', ink: '#2c2621', accent: '#ef8216' },
  };
  let effect = effects[0], palette = palettes.base, intensity = .8;
  let width = 1, height = 1, dpr = 1, frame = 0, lastFrame = 0, idleSince = 0;
  let particles = [], trail = [], nodes = [], waveAt = 0, spawnAt = 0;
  let paused = false, autoStart = 0, autoUntil = 0;
  const pointer = { x: 0, y: 0, fx: 0, fy: 0, inside: false, alpha: 0, moved: false };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  motion.checked = !reduced.matches && fine.matches;
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const rgba = (hex, alpha) => {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${alpha})`;
  };
  const circle = (x, y, r) => { ctx.beginPath(); ctx.arc(x, y, Math.max(0, r), 0, Math.PI * 2); };
  function cancel() { cancelAnimationFrame(frame); frame = 0; lastFrame = 0; }
  function request() {
    if (!frame && motion.checked && !paused && !document.hidden) frame = requestAnimationFrame(draw);
  }
  function makeNodes() {
    const columns = effect.id === 'grid' ? 9 : 8, rows = 6;
    nodes = Array.from({ length: columns * rows }, (_, i) => {
      const x = ((i % columns) + .5) * width / columns;
      const y = (Math.floor(i / columns) + .5) * height / rows;
      return { x, y, homeX: x, homeY: y, vx: 0, vy: 0 };
    });
  }
  function reset() {
    cancel(); particles = []; trail = []; waveAt = 0; spawnAt = 0; idleSince = 0;
    pointer.fx = pointer.x; pointer.fy = pointer.y;
    ctx.clearRect(0, 0, width, height); makeNodes(); request();
  }
  function stopPreview() { autoUntil = 0; preview.textContent = 'Play preview'; }
  function updateMotion() {
    preview.disabled = !motion.checked; pause.disabled = !motion.checked;
    stage.classList.toggle('touch-preview', motion.checked && !fine.matches);
    $('motion-note').textContent = reduced.matches
      ? 'Reduced motion detected. Effects start off; enabling previews is your choice.'
      : !fine.matches ? 'Touch device: opt in, then drag inside the specimen—or play an 8-second preview.'
        : 'Move inside the specimen. Animation settles when you leave and stops in hidden tabs.';
    if (!motion.checked) { stopPreview(); pointer.inside = false; pointer.alpha = 0; }
    reset();
  }
  effects.forEach((item, index) => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'effect'; button.dataset.effect = item.id;
    button.setAttribute('aria-pressed', String(index === 0));
    const number = document.createElement('small'); number.textContent = String(index + 1).padStart(2, '0');
    const name = document.createElement('strong'); name.textContent = item.name;
    const tag = document.createElement('span'); tag.textContent = item.tag;
    button.append(number, name, tag);
    button.addEventListener('click', () => select(item)); $('effects').append(button);
  });
  function select(item) {
    effect = item; stage.dataset.effect = item.id; history.replaceState(null,'','#'+item.id);
    $('study-title').textContent = item.name; $('description').textContent = item.description;
    $('budget').textContent = item.id === 'ink' && inkDust.checked ? '1 stroke + up to 36 flecks' : item.budget; inkDust.disabled = item.id !== 'ink';
    document.querySelectorAll('.effect').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.effect === item.id)));
    reset();
  }
  function move(event) {
    if (!motion.checked || (event.pointerType === 'touch' && event.type !== 'pointerdown' && !event.buttons)) return;
    stopPreview();
    const rect = stage.getBoundingClientRect();
    pointer.x = event.clientX - rect.left; pointer.y = event.clientY - rect.top;
    if (!pointer.inside) { pointer.fx = pointer.x; pointer.fy = pointer.y; }
    pointer.inside = true; pointer.moved = true; request();
  }
  stage.addEventListener('pointermove', move);
  stage.addEventListener('pointerdown', event => {
    move(event);
    if (motion.checked && effect.id === 'ripples') addRipple(performance.now(), true);
  });
  function leave() { pointer.inside = false; request(); }
  stage.addEventListener('pointerleave', leave);
  stage.addEventListener('pointercancel', leave);
  stage.addEventListener('pointerup', event => { if (event.pointerType === 'touch') leave(); });
  $('sample-link').addEventListener('click', event => {
    event.preventDefault(); $('interaction').textContent = 'Link works. The effect never intercepts it.';
  });
  $('sample-button').addEventListener('click', () => { $('interaction').textContent = 'Button works, too. Native controls stay native.'; });
  $('palette').addEventListener('change', event => {
    palette = palettes[event.target.value];
    Object.entries(palette).forEach(([key, value]) => stage.style.setProperty(`--${key}`, value));
    reset();
  });
  $('intensity').addEventListener('input', event => {
    intensity = Number(event.target.value);
    $('intensity-value').value = intensity < .65 ? 'Quiet' : intensity < 1.1 ? 'Subtle' : 'Expressive'; request();
  });
  inkDust.addEventListener('change', () => {particles = []; $('budget').textContent = inkDust.checked ? '1 stroke + up to 36 flecks' : effect.budget; request();});
  motion.addEventListener('change', updateMotion);
  pause.addEventListener('click', () => {
    paused = !paused; pause.textContent = paused ? 'Resume' : 'Pause'; pause.setAttribute('aria-pressed', String(paused));
    // End a timed preview rather than letting its clock run silently while frozen.
    if (paused) { stopPreview(); cancel(); } else request();
  });
  preview.addEventListener('click', () => {
    if (autoUntil) { stopPreview(); leave(); return; }
    paused = false; pause.textContent = 'Pause'; pause.setAttribute('aria-pressed', 'false');
    autoStart = performance.now(); autoUntil = autoStart + 8000; preview.textContent = 'Stop preview'; request();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { stopPreview(); pointer.inside = false; cancel(); }
    else request();
  });
  reduced.addEventListener('change', () => { if (reduced.matches) motion.checked = false; updateMotion(); });
  fine.addEventListener('change', () => { if (!fine.matches) motion.checked = false; updateMotion(); });
  new ResizeObserver(() => {
    const rect = stage.getBoundingClientRect(); width = rect.width; height = rect.height;
    dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); measureBrush(); reset();
  }).observe(stage);
  function addRipple(time, click = false) {
    particles.push({ x: pointer.x, y: pointer.y, born: time, life: click ? 1050 : 850, click });
    particles = particles.slice(-14); waveAt = time;
  }
  function paintReveal() {
    const radius = (65 + 55 * intensity) * pointer.alpha;
    ctx.save(); circle(pointer.fx, pointer.fy, radius); ctx.clip();
    ctx.fillStyle = rgba(palette.ink, .17); ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = rgba(palette.accent, .45); ctx.lineWidth = 1;
    for (let x = -height; x < width + height; x += 23) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + height, height); ctx.stroke();
    }
    ctx.restore();
  }
  function paintRing() {
    ctx.strokeStyle = rgba(palette.accent, pointer.alpha * .9); ctx.lineWidth = 1.4;
    circle(pointer.fx, pointer.fy, 14 + intensity * 12); ctx.stroke();
    ctx.fillStyle = rgba(palette.accent, pointer.alpha * .6); circle(pointer.x, pointer.y, 2); ctx.fill();
  }
  function paintTrail(time) {
    if (!brush) return;
    if (pointer.inside && (pointer.moved || autoUntil)) {
      const last = trail.at(-1);
      if (!last || Math.hypot(last.x - pointer.x, last.y - pointer.y) > 1.5) trail.push({ x: pointer.x, y: pointer.y, born: time });
    }
    const lifetime = 480 + intensity * 180;
    trail = trail.filter(p => time - p.born < lifetime).slice(-32);
    if (trail.length < 3) return;
    // In nib-normalized space, a round stroke sweeps exactly the same elliptical
    // nib as build-signature.py. A single draw avoids alpha buildup at samples.
    const angle = brush.angle * Math.PI / 180, co = Math.cos(angle), si = Math.sin(angle);
    const major = brush.major * brushScale, minor = brush.minor * brushScale;
    const points = trail.map(p => ({x:(co*p.x+si*p.y)/major,y:(-si*p.x+co*p.y)/minor}));
    const first = points[0], last = points.at(-1);
    const fade = Math.max(0, 1 - (time - trail.at(-1).born) / lifetime);
    ctx.save(); ctx.transform(major*co,major*si,-minor*si,minor*co,0,0);
    const gradient = ctx.createLinearGradient(first.x,first.y,last.x+.001,last.y+.001);
    gradient.addColorStop(0,rgba(palette.accent,0));
    gradient.addColorStop(.2,rgba(palette.accent,fade));
    gradient.addColorStop(1,rgba(palette.accent,fade));
    ctx.strokeStyle=gradient; ctx.lineWidth=2; ctx.lineCap='round'; ctx.lineJoin='round';
    ctx.beginPath(); ctx.moveTo(first.x,first.y);
    for(let i=1;i<points.length-1;i++) {
      const p=points[i],next=points[i+1]; ctx.quadraticCurveTo(p.x,p.y,(p.x+next.x)/2,(p.y+next.y)/2);
    }
    ctx.lineTo(last.x,last.y); ctx.stroke(); ctx.restore();
  }
  function paintWake(time) {
    if (pointer.inside && (pointer.moved || autoUntil) && time - spawnAt > 42) {
      particles.push({ x: pointer.x, y: pointer.y, born: time, life: 650 }); particles = particles.slice(-9); spawnAt = time;
    }
    particles = particles.filter(p => time - p.born < p.life);
    particles.forEach(p => {
      const life = (time - p.born) / p.life, radius = (18 + life * 26) * intensity;
      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
      gradient.addColorStop(0, rgba(palette.accent, .18 * (1 - life)));
      gradient.addColorStop(1, rgba(palette.accent, 0));
      ctx.fillStyle = gradient; circle(p.x, p.y, radius); ctx.fill();
    });
  }
  function paintDust(time, step) {
    if (pointer.inside && (pointer.moved || autoUntil) && time - spawnAt > (effect.id === 'ink' ? 40 : 22)) {
      for (let i = 0; i < (effect.id === 'ink' ? 1 : 2); i++) {
        const angle = Math.random() * Math.PI * 2, speed = (.4 + Math.random()) * intensity;
        particles.push({ x: pointer.x, y: pointer.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - .3, born: time, life: 600 + Math.random() * 300, size: .8 + Math.random() * 1.7 });
      }
      particles = particles.slice(effect.id === 'ink' ? -36 : -72); spawnAt = time;
    }
    particles = particles.filter(p => time - p.born < p.life);
    particles.forEach(p => {
      p.x += p.vx * step; p.y += p.vy * step; p.vy += .008 * step;
      ctx.fillStyle = rgba(palette.accent, .8 * (1 - (time - p.born) / p.life)); circle(p.x, p.y, p.size); ctx.fill();
    });
  }
  function paintField(step) {
    const grid = effect.id === 'grid', reach = 120 + intensity * 45;
    let moving = false;
    nodes.forEach(n => {
      const dx = n.homeX - pointer.x, dy = n.homeY - pointer.y, distance = Math.hypot(dx, dy);
      const force = pointer.inside ? Math.max(0, 1 - distance / reach) : 0;
      const direction = grid ? -1 : 1;
      const targetX = n.homeX + direction * dx / Math.max(distance, 1) * force * 35 * intensity;
      const targetY = n.homeY + direction * dy / Math.max(distance, 1) * force * 35 * intensity;
      n.vx = (n.vx + (targetX - n.x) * .035 * step) * Math.pow(.78, step);
      n.vy = (n.vy + (targetY - n.y) * .035 * step) * Math.pow(.78, step);
      n.x += n.vx * step; n.y += n.vy * step;
      if (Math.abs(n.vx) + Math.abs(n.vy) + Math.abs(n.x - targetX) + Math.abs(n.y - targetY) > .1) moving = true;
      ctx.fillStyle = rgba(palette.accent, .25 + force * .6);
      ctx.strokeStyle = rgba(palette.accent, .25 + force * .6); ctx.lineWidth = 1;
      if (grid) {
        const size = 2 + force * 2; ctx.beginPath(); ctx.moveTo(n.x - size, n.y); ctx.lineTo(n.x + size, n.y); ctx.moveTo(n.x, n.y - size); ctx.lineTo(n.x, n.y + size); ctx.stroke();
      } else {
        circle(n.x, n.y, 1.4 + force); ctx.fill();
        if (force > .12) { ctx.strokeStyle = rgba(palette.accent, force * .25); ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(pointer.fx, pointer.fy); ctx.stroke(); }
      }
    });
    return moving;
  }
  function paintRipples(time) {
    if (pointer.inside && (pointer.moved || autoUntil) && time - waveAt > 110) addRipple(time);
    particles = particles.filter(p => time - p.born < p.life);
    particles.forEach(p => {
      const t = (time - p.born) / p.life;
      ctx.strokeStyle = rgba(palette.accent, (1 - t) ** 2 * .55); ctx.lineWidth = p.click ? 1.6 : 1;
      circle(p.x, p.y, 3 + t * (p.click ? 100 : 56) * intensity); ctx.stroke();
    });
  }
  function draw(time) {
    frame = 0;
    if (!motion.checked || paused || document.hidden) return;
    // Bound high-refresh displays to ~60 updates/s; CSS-sized canvas, capped pixel ratio.
    if (lastFrame && time - lastFrame < 15) { request(); return; }
    const step = clamp((time - (lastFrame || time - 16.67)) / 16.67, .2, 2); lastFrame = time;
    if (autoUntil) {
      if (time >= autoUntil) { stopPreview(); pointer.inside = false; }
      else {
        const t = (time - autoStart) / 1000;
        pointer.x = width * (.5 + .31 * Math.sin(t * 1.05 - 1.5));
        pointer.y = height * (.5 + .27 * Math.sin(t * 1.7 + .3)); pointer.inside = true; pointer.moved = true;
      }
    }
    const smoothing = 1 - Math.pow(.78, step);
    pointer.fx += (pointer.x - pointer.fx) * smoothing; pointer.fy += (pointer.y - pointer.fy) * smoothing;
    pointer.alpha += ((pointer.inside ? 1 : 0) - pointer.alpha) * smoothing;
    ctx.clearRect(0, 0, width, height);
    let fieldMoving = false;
    switch (effect.id) {
      case 'reveal': if (pointer.alpha > .005) paintReveal(); break;
      case 'ring': if (pointer.alpha > .005) paintRing(); break;
      case 'ink': paintTrail(time); if (inkDust.checked) paintDust(time,step); break;
      case 'wake': paintWake(time); break;
      case 'dust': paintDust(time, step); break;
      case 'constellation': case 'grid': fieldMoving = paintField(step); break;
      case 'ripples': paintRipples(time); break;
    }
    pointer.moved = false;
    const following = Math.hypot(pointer.fx - pointer.x, pointer.fy - pointer.y) > .1;
    const unsettled = particles.length || trail.length || fieldMoving || following || (pointer.alpha > .005 && pointer.alpha < .995);
    const emitting = autoUntil || (pointer.inside && pointer.moved);
    if (unsettled || emitting) { idleSince = 0; request(); }
    else if (!idleSince) { idleSince = time; request(); }
    // Leave a stationary specimen on screen with zero ongoing redraws.
  }
  select(effects.find(item => item.id === location.hash.slice(1)) || effects[0]); updateMotion();
})();
