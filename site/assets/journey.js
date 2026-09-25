/* Walk Through Apollo: the scroll-driven journey */
(() => {
  'use strict';

  // The five static-journey gates. Identical strings live in journey.css.
  const GATES = [
    '(max-width: 720px)',
    '(orientation: portrait) and (max-width: 1024px)',
    '(orientation: portrait) and (pointer: coarse)',
    '(orientation: landscape) and (pointer: coarse) and (max-height: 560px)',
    '(prefers-reduced-motion: reduce)'
  ];

  const VIDEO_URL = 'assets/video/journey.mp4';
  const VIDEO_BYTES = 22766195;

  // The journey, in scroll order. len is in viewport heights (a starting point).
  // hold: camera still (v = video time, still = matching image). video: walk t0..t1.
  // fade / glide / turn / light / match: designed code transitions between stills.
  const SEG = [
    { type: 'hold',  v: 0,      still: 'arrival',    len: 110, stop: 'arrival', first: true },
    { type: 'video', t0: 0,     t1: 14.458, from: 'arrival',    to: 'lobby',     len: 480 },
    { type: 'hold',  v: 14.458, still: 'lobby',      len: 40 },
    { type: 'fade',  from: 'lobby', to: 'lobby-desk', len: 80 },
    { type: 'hold',  still: 'lobby-desk', next: 14.5, len: 120, stop: 'lobby' },
    { type: 'video', t0: 14.5,  t1: 22.458, from: 'lobby-desk', to: 'reception', len: 260 },
    { type: 'hold',  v: 22.458, still: 'reception',  len: 130, stop: 'reception' },
    { type: 'glide', from: 'reception', to: 'waiting', len: 110 },
    { type: 'hold',  still: 'waiting', next: 22.5, len: 120, stop: 'visit' },
    { type: 'video', t0: 22.5,  t1: 34.625, from: 'waiting',    to: 'corridor',  len: 380 },
    { type: 'hold',  v: 34.625, still: 'corridor',   len: 130, stop: 'doctors' },
    { type: 'turn',  from: 'corridor', to: 'doorway', len: 100 },
    { type: 'video', t0: 34.667, t1: 40.458, from: 'doorway',   to: 'room',      len: 180 },
    { type: 'hold',  v: 40.458, still: 'room',       len: 130, stop: 'room' },
    { type: 'light', from: 'room', to: 'bedside', len: 120 },
    { type: 'hold',  still: 'bedside', push: true,   len: 130, stop: 'care' },
    { type: 'match', from: 'bedside', to: 'team', len: 110 },
    { type: 'hold',  still: 'team',                  len: 130, stop: 'visit-us' },
    { type: 'fade',  from: 'team', to: 'logo-wall', bloom: true, len: 110 },
    { type: 'hold',  still: 'logo-wall',             len: 110, stop: 'book', last: true }
  ];
  const TOTAL = SEG.reduce((s, g) => s + g.len, 0);
  let acc = 0;
  for (const g of SEG) { g.a = acc / TOTAL; acc += g.len; g.b = acc / TOTAL; }
  const RAMP = 18 / TOTAL;                 // text ramps: about 18vh at each edge

  const journey = document.getElementById('journey');
  if (!journey) return;
  const stage = journey.querySelector('.stage');
  const video = document.getElementById('hero');
  const glow = stage.querySelector('.glow');
  const ringFill = stage.querySelector('.loader .fill');
  const railEl = stage.querySelector('.rail');
  const railLinks = [...stage.querySelectorAll('.rail a')];
  const stills = {};
  stage.querySelectorAll('.stills img').forEach(img => { stills[img.dataset.still] = { el: img, o: -1, tf: '' }; });
  const stops = {};
  stage.querySelectorAll('.stop').forEach(el => { stops[el.dataset.stop] = { el, o: -1, k: -1, on: null }; });
  const stopOrder = SEG.filter(g => g.stop);

  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const smooth = (x, e0, e1) => { const t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };
  const ease = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  /* ---------- video: streamed Blob, gated seeks ---------- */
  let videoReady = false, videoFailed = false, heroInit = false;
  let seekBusy = false, pendingTime = null;

  function requestSeek(t) {
    if (!videoReady || !video.duration) return;
    t = clamp(t, 0, video.duration - 0.02);
    if (Math.abs(video.currentTime - t) < 0.01 && !seekBusy) return;
    if (seekBusy) { pendingTime = t; return; }
    seekBusy = true;
    video.currentTime = t;
  }
  video.addEventListener('seeked', () => {
    seekBusy = false;
    if (pendingTime !== null) { const t = pendingTime; pendingTime = null; requestSeek(t); }
    kick();                                    // re-evaluate which layer should show
  });
  video.addEventListener('error', () => { seekBusy = false; pendingTime = null; });

  function failVideo() {
    videoFailed = true;
    stage.classList.add('video-failed');
    kick();
  }

  async function loadHeroBlob() {
    const ctrl = new AbortController();
    let watchdog = setTimeout(() => ctrl.abort(), 20000);
    const res = await fetch(VIDEO_URL, { priority: 'low', signal: ctrl.signal });
    if (!res.ok || !res.body) throw new Error('video ' + res.status);
    const total = Number(res.headers.get('Content-Length')) || VIDEO_BYTES;
    const reader = res.body.getReader();
    const chunks = [];
    let got = 0, lastRing = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      clearTimeout(watchdog);
      watchdog = setTimeout(() => ctrl.abort(), 20000);
      chunks.push(value);
      got += value.length;
      const frac = Math.min(1, got / total);
      const now = performance.now();
      if (now - lastRing > 100 || frac === 1) {
        lastRing = now;
        ringFill.style.setProperty('--ld', Math.round(126 * (1 - frac)));
      }
    }
    clearTimeout(watchdog);
    ringFill.style.setProperty('--ld', 0);
    video.src = URL.createObjectURL(new Blob(chunks, { type: 'video/mp4' }));
    video.load();
    video.addEventListener('canplay', () => {
      videoReady = true;
      stage.classList.add('video-ready');
      onScroll(true);
    }, { once: true });
  }

  function initHeroOnce() {
    if (heroInit) return;
    heroInit = true;
    // Stills first (the arrival frame wins the bandwidth race), then the video.
    const order = ['arrival', 'lobby', 'lobby-desk', 'reception', 'waiting', 'corridor', 'doorway', 'room', 'bedside', 'team', 'logo-wall'];
    let started = false;
    const startBlob = () => { if (started) return; started = true; loadHeroBlob().catch(failVideo); };
    order.forEach((id, i) => {
      const img = stills[id].el;
      if (i === 0) { img.onload = startBlob; img.onerror = startBlob; }
      img.src = img.dataset.src;
    });
    setTimeout(startBlob, 4000);
  }

  /* ---------- scroll to progress ---------- */
  let target = 0, shown = 0, rafId = null, lastTick = 0, onScreen = true, scrubOn = false;
  let range = 1, headerH = 64, loadK = 0, loadStart = 0;

  function measure() {
    headerH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 64;
    const stageH = stage.offsetHeight || (innerHeight - headerH);
    range = Math.round(TOTAL * innerHeight / 100);
    journey.style.height = (range + stageH) + 'px';
  }
  function progress() {
    const top = journey.getBoundingClientRect().top;
    return clamp((headerH - top) / range, 0, 1);
  }
  function kick() {
    if (scrubOn && rafId === null) rafId = requestAnimationFrame(tick);
  }
  function onScroll(force) {
    target = progress();
    if (force === true) shown = target;
    if (onScreen) kick();
  }
  function tick(now) {
    const dt = Math.min(100, now - (lastTick || now));
    lastTick = now;
    const k = 0.14;
    shown += (target - shown) * (1 - Math.pow(1 - k, dt / 16.667));
    if (loadK < 1) loadK = clamp((now - loadStart) / 900, 0, 1);
    const settled = Math.abs(target - shown) < 0.00002 && loadK >= 1 && !seekBusy;
    if (settled) shown = target;
    render(shown);
    if (settled) { rafId = null; lastTick = 0; } else rafId = requestAnimationFrame(tick);
  }

  /* ---------- rendering (every write is delta-gated) ---------- */
  function setStill(id, o, tf, origin) {
    const s = stills[id];
    o = Math.round(o * 1000) / 1000;
    if (s.o !== o) { s.el.style.opacity = o; s.o = o; }
    tf = tf || '';
    if (s.tf !== tf) { s.el.style.transform = tf; s.tf = tf; }
    origin = origin || '';
    if (s.origin !== origin) { s.el.style.transformOrigin = origin; s.origin = origin; }
  }
  let glowO = -1;
  function setGlow(o) { o = Math.round(o * 1000) / 1000; if (o !== glowO) { glow.style.opacity = o; glowO = o; } }

  const videoAt = t => videoReady && Math.abs(video.currentTime - t) < 0.6;

  function render(p) {
    const i = Math.max(0, SEG.findIndex(g => p <= g.b));
    const g = SEG[i];
    const u = clamp((p - g.a) / (g.b - g.a), 0, 1);
    const want = {};                               // still id -> [opacity, transform, origin]
    let glowWant = 0;

    if (g.type === 'hold') {
      if (g.v !== undefined) {
        requestSeek(g.v);
        if (!videoAt(g.v)) want[g.still] = [1];
      } else {
        const tf = g.push ? `scale(${(1 + 0.04 * u).toFixed(4)})` : '';
        want[g.still] = [1, tf, g.push ? '41% 40%' : ''];
        if (g.next !== undefined) requestSeek(g.next);   // pre-seek the next walk under the still
      }
    } else if (g.type === 'video') {
      const t = g.t0 + (g.t1 - g.t0) * u;
      requestSeek(t);
      if (!videoReady) {                           // complete without video: crossfade the stills
        want[g.from] = [1];
        want[g.to] = [smooth(u, 0.35, 0.65)];
      } else if (!videoAt(t)) {
        want[u < 0.5 ? g.from : g.to] = [1];       // hold a still while a far seek lands
      }
    } else if (g.type === 'fade') {
      want[g.from] = [1];
      if (g.bloom) {                               // busy-to-busy: cross over quickly behind soft light
        want[g.to] = [smooth(u, 0.44, 0.56)];
        glowWant = 0.72 * smooth(u, 0.18, 0.47) * (1 - smooth(u, 0.53, 0.82));
      } else {
        want[g.to] = [ease(u)];
      }
    } else if (g.type === 'glide' || g.type === 'turn') {
      const e = ease(u), d = g.type === 'turn' ? 16 : 7, s = g.type === 'turn' ? 0.1 : 0.08;
      want[g.from] = [1 - smooth(u, 0.3, 0.72), `translate3d(${(-d * e).toFixed(3)}%,0,0) scale(${(1 + s * e).toFixed(4)})`];
      want[g.to] = [smooth(u, 0.28, 0.7), `translate3d(${(d * (1 - e)).toFixed(3)}%,0,0) scale(${(1 + s * (1 - e)).toFixed(4)})`];
    } else if (g.type === 'light') {
      want[g.from] = [1, `scale(${(1 + 0.03 * u).toFixed(4)})`];
      want[g.to] = [smooth(u, 0.42, 0.58)];
      glowWant = 0.9 * smooth(u, 0, 0.46) * (1 - smooth(u, 0.54, 1));
    } else if (g.type === 'match') {
      const e = ease(u);
      want[g.from] = [1 - smooth(u, 0.44, 0.56), `translate3d(${(5 * e).toFixed(3)}%,0,0) scale(${(1.04 + 0.14 * e).toFixed(4)})`, '41% 40%'];
      want[g.to] = [smooth(u, 0.44, 0.56), `translate3d(${(-5 * (1 - e)).toFixed(3)}%,0,0) scale(${(1 + 0.12 * (1 - e)).toFixed(4)})`, '46% 32%'];
      glowWant = 0.72 * smooth(u, 0.18, 0.47) * (1 - smooth(u, 0.53, 0.82));
    }

    for (const id in stills) {
      const w = want[id];
      if (w) setStill(id, w[0], w[1], w[2]); else setStill(id, 0);
    }
    setGlow(glowWant);
    renderStops(p);
    renderRail(p);
  }

  function renderStops(p) {
    for (const g of stopOrder) {
      const s = stops[g.stop];
      let o = g.first ? 1 : smooth(p, g.a, g.a + RAMP);
      if (!g.last) o *= 1 - smooth(p, g.b - RAMP, g.b);
      let k = clamp((p - g.a) / (RAMP * 1.6), 0, 1);
      if (g.first) k = Math.max(k, loadK);
      if (g.last) k = Math.max(k, o);
      o = Math.round(o * 1000) / 1000;
      k = Math.round(k * 125) / 125;               // delta gate at 0.008
      if (s.o !== o) { s.el.style.opacity = o; s.o = o; }
      if (s.k !== k) { s.el.style.setProperty('--k', k); s.k = k; }
      const on = o > 0.02;
      if (s.on !== on) {
        s.on = on;
        s.el.classList.toggle('on', on);
        if (on) s.el.removeAttribute('inert'); else s.el.setAttribute('inert', '');
      }
    }
  }

  let railFill = -1, railHere = -2;
  function renderRail(p) {
    const f = Math.round(p * 500) / 500;
    if (f !== railFill) { railEl.style.setProperty('--railp', f); railFill = f; }
    let here = 0;
    stopOrder.forEach((g, n) => { if (p >= g.a - 0.004) here = n; });
    if (here !== railHere) {
      railHere = here;
      railLinks.forEach((a, n) => {
        a.classList.toggle('here', n === here);
        a.classList.toggle('passed', n < here);
        if (n === here) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current');
      });
    }
  }

  // Rail clicks: land on the stop with its text fully settled.
  railLinks.forEach(a => a.addEventListener('click', e => {
    if (!scrubOn) return;                         // static mode: plain anchors
    const g = stopOrder.find(s => s.stop === a.dataset.go);
    if (!g) return;
    e.preventDefault();
    const p = g.first ? 0 : Math.min(g.b - RAMP * 1.2, g.a + RAMP * 2.2);
    const y = journey.getBoundingClientRect().top + scrollY - headerH + p * range;
    scrollTo({ top: y, behavior: 'smooth' });
  }));

  /* ---------- the specialty picker (the one interactive moment) ---------- */
  const picked = document.querySelector('.picked');
  const note = document.querySelector('.filter-note');
  const chips = [...document.querySelectorAll('.chip')];
  function applyChoice(choice) {
    chips.forEach(c => c.setAttribute('aria-pressed', String(c.dataset.choice === choice)));
    const docs = [...document.querySelectorAll('.docs li')];
    const hits = docs.filter(li => li.dataset.spec === choice);
    docs.forEach(li => { li.hidden = !!choice && hits.length > 0 && !hits.includes(li); });
    if (!choice) { picked.textContent = ''; note.hidden = true; return; }
    picked.textContent = `Noted. Doctors for ${choice} are waiting in the corridor ahead.`;
    note.textContent = hits.length ? `Showing doctors for ${choice}` : `Showing all doctors. See the full list for ${choice}.`;
    note.hidden = false;
  }
  chips.forEach(c => c.addEventListener('click', () => {
    const choice = c.getAttribute('aria-pressed') === 'true' ? '' : c.dataset.choice;
    applyChoice(choice);
    try { sessionStorage.setItem('apollo-choice', choice); } catch (_) {}
  }));
  try { const saved = sessionStorage.getItem('apollo-choice'); if (saved) applyChoice(saved); } catch (_) {}

  /* ---------- live gates: scrub on / off ---------- */
  function unpinStops() {
    for (const id in stops) { const s = stops[id]; s.o = -1; s.k = -1; s.on = null; }
    for (const id in stills) { const s = stills[id]; s.o = -1; s.tf = null; s.origin = null; }
    glowO = -1; railFill = -1; railHere = -2;
  }
  function pinToFinalStates() {
    for (const id in stops) {
      const s = stops[id];
      s.el.removeAttribute('inert');
      s.el.style.removeProperty('opacity');
      s.el.style.setProperty('--k', 1);
      s.el.classList.add('on');
    }
    journey.style.removeProperty('height');
  }
  function enableScrub() {
    if (scrubOn) return;
    scrubOn = true;
    initHeroOnce();
    measure();
    unpinStops();
    loadStart = performance.now();
    addEventListener('scroll', onScroll, { passive: true });
    onScroll(true);
    kick();
  }
  function disableScrub() {
    if (!scrubOn) return;
    scrubOn = false;
    removeEventListener('scroll', onScroll);
    if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
    pinToFinalStates();
  }
  function applyMode() {
    if (MQLS.some(m => m.matches)) disableScrub(); else enableScrub();
  }
  const MQLS = GATES.map(q => matchMedia(q));
  MQLS.forEach(m => m.addEventListener('change', applyMode));

  addEventListener('resize', () => { if (scrubOn) { measure(); onScroll(true); } });
  new IntersectionObserver(([en]) => { onScreen = en.isIntersecting; if (onScreen) onScroll(); }).observe(journey);

  pinToFinalStates();
  applyMode();
})();
