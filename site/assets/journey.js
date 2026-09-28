/* Walk Through Apollo: the scroll-driven journey */
(() => {
  'use strict';

  // The animated walk runs on every device. Only visitors who asked their device for
  // reduced motion or data saving get the still-photo version (html.static-journey).
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)');
  const saveData = !!(navigator.connection && navigator.connection.saveData);
  const wantsStatic = () => REDUCE.matches || saveData;

  // The walk, as four chapter videos encoded from the full-quality masters.
  // They load in order (a first, behind the ring); each has its own seek gate.
  // Three sets of the same four chapters, cut from the same masters with identical frame timing:
  //   hd = 1920x1080 (laptops, desktops, large landscape tablets)
  //   l  = 1280x720  (landscape phones and small landscape tablets)
  //   p  = 608x1080 exact centre crop (portrait phones and tablets; matches the stills' cover crop)
  const CHAPTERS = { a: {}, b: {}, c: {}, d: {} };          // a gate to lobby, b lobby to reception, c hall to corridor, d into the room
  const SETS = {
    hd: { suffix: '',   bytes: { a: 23679197, b: 9736807, c: 15613557, d: 7203572 } },
    l:  { suffix: '-l', bytes: { a: 11410453, b: 4520181, c: 8093640,  d: 2765950 } },
    p:  { suffix: '-p', bytes: { a: 7657697,  b: 3319329, c: 6137682,  d: 2608456 } }
  };
  // The portrait set is an exact 9:16 centre crop, so it only matches the stills' cover crop when
  // the stage is 9:16 or narrower (phones). Upright tablets are wider than that and get the full frame.
  function pickSet() {
    const aspect = innerWidth / Math.max(1, innerHeight - 64);
    if (aspect <= 0.5625) return 'p';
    if (innerHeight > innerWidth) return 'hd';
    return innerWidth <= 1100 ? 'l' : 'hd';
  }
  const CH_ORDER = ['a', 'b', 'c', 'd'];

  // The journey, in scroll order. len is in viewport heights (a starting point).
  // hold: camera still (ch + v = chapter video time, still = matching image). video: walk t0..t1 in chapter ch.
  // fade / glide / turn / light / match: designed code transitions between stills.
  const SEG = [
    { type: 'hold',  ch: 'a', v: 0,      still: 'arrival',    len: 110, stop: 'arrival', first: true },
    { type: 'video', id: 'walkA', ch: 'a', t0: 0, t1: 14.458, from: 'arrival',    to: 'lobby',     len: 480 },
    { type: 'hold',  ch: 'a', v: 14.458, still: 'lobby',      len: 40 },
    { type: 'fade',  from: 'lobby', to: 'lobby-desk', len: 80 },
    { type: 'hold',  still: 'lobby-desk', len: 120, stop: 'lobby' },
    { type: 'video', id: 'walkB', ch: 'b', t0: 0, t1: 7.958,  from: 'lobby-desk', to: 'reception', len: 260 },
    { type: 'hold',  ch: 'b', v: 7.958,  still: 'reception',  len: 130, stop: 'reception' },
    { type: 'glide', from: 'reception', to: 'waiting', len: 110 },
    { type: 'hold',  still: 'waiting', len: 120, stop: 'visit' },
    { type: 'video', id: 'walkC', ch: 'c', t0: 0, t1: 15.708, from: 'waiting',    to: 'corridor',  len: 470 },
    { type: 'hold',  ch: 'c', v: 15.708, still: 'corridor',   len: 130, stop: 'doctors' },
    { type: 'turn',  from: 'corridor', to: 'doorway', len: 100 },
    { type: 'video', id: 'walkD', ch: 'd', t0: 0, t1: 5.792,  from: 'doorway',   to: 'room',      len: 180 },
    { type: 'hold',  ch: 'd', v: 5.792,  still: 'room',       len: 130, stop: 'room' },
    { type: 'light', from: 'room', to: 'bedside', len: 120 },
    { type: 'hold',  still: 'bedside', push: true,   len: 130, stop: 'care' },
    { type: 'match', id: 'match', from: 'bedside', to: 'team', len: 110 },
    { type: 'hold',  still: 'team',                  len: 130, stop: 'visit-us' },
    { type: 'fade',  from: 'team', to: 'logo-wall', bloom: true, len: 110 },
    { type: 'hold',  still: 'logo-wall',             len: 110, stop: 'book', last: true }
  ];
  // Every non-walk segment pre-seeks the next walk under the stills, so it starts on its first frame.
  SEG.forEach((g, n) => {
    if (g.type !== 'video') g.upcoming = SEG.slice(n + 1).find(x => x.type === 'video') || null;
  });
  const TOTAL = SEG.reduce((s, g) => s + g.len, 0);
  let acc = 0;
  for (const g of SEG) { g.a = acc / TOTAL; acc += g.len; g.b = acc / TOTAL; }
  const RAMP = 18 / TOTAL;                 // text ramps: about 18vh at each edge

  const journey = document.getElementById('journey');
  if (!journey) return;
  const stage = journey.querySelector('.stage');
  const glow = stage.querySelector('.glow');
  const ringFill = stage.querySelector('.loader .fill');
  const railEl = stage.querySelector('.rail');
  const railLinks = [...stage.querySelectorAll('.rail a')];
  const stills = {};
  stage.querySelectorAll('.stills img').forEach(img => { stills[img.dataset.still] = { el: img, o: -1, tf: '' }; });
  const stops = {};
  stage.querySelectorAll('.stop').forEach(el => { stops[el.dataset.stop] = { el, o: -1, k: -1, on: null }; });
  const stopOrder = SEG.filter(g => g.stop);

  // Where the visitor is, per segment (the live "you are in" label).
  const AREAS = ['Main gate', 'Entrance', 'Lobby', 'Lobby', 'Lobby', 'Lobby', 'Reception', 'Reception',
    'Waiting hall', 'Corridor', 'Corridor', 'Corridor', 'Patient room', 'Patient room', 'Patient room',
    'Bedside', 'Front desk', 'Front desk', 'Front desk', 'Reception'];
  const areaName = stage.querySelector('.area-name');
  let lastArea = '';

  // Walk captions: each lives inside one segment between data-in and data-out (0..1 of that segment).
  const segById = {};
  SEG.forEach(g => { if (g.id) segById[g.id] = g; });
  const beats = [...stage.querySelectorAll('.beat')].map(el => ({
    el, seg: segById[el.dataset.seg], a: +el.dataset.in, b: +el.dataset.out, o: -1, k: -1, u: -1
  }));

  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const smooth = (x, e0, e1) => { const t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };
  const ease = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  /* ---------- chapter videos: streamed Blobs, gated seeks ---------- */
  let heroInit = false;
  const media = stage.querySelector('.media');
  const stillsBox = media.querySelector('.stills');
  CH_ORDER.forEach(id => {
    const c = CHAPTERS[id];
    const v = document.createElement('video');
    v.muted = true; v.playsInline = true; v.preload = 'none'; v.tabIndex = -1;
    v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('webkit-playsinline', '');
    v.disablePictureInPicture = true;
    v.setAttribute('aria-hidden', 'true');
    v.className = 'walk';
    media.insertBefore(v, stillsBox);
    Object.assign(c, { id, el: v, ready: false, failed: false, busy: false, pending: null, on: false });
    v.addEventListener('seeked', () => {
      c.busy = false;
      if (c.pending !== null) { const t = c.pending; c.pending = null; requestSeek(id, t); }
      kick();                                  // re-evaluate which layer should show
    });
    v.addEventListener('error', () => { c.busy = false; c.pending = null; });
  });

  function requestSeek(id, t) {
    const c = CHAPTERS[id];
    if (!c.ready || !c.el.duration) return;
    t = clamp(t, 0, c.el.duration - 0.02);
    if (!c.busy && Math.abs(c.el.currentTime - t) < 0.01) return;
    if (c.busy) { c.pending = t; return; }
    c.busy = true;
    c.el.currentTime = t;
  }
  const anyBusy = () => CH_ORDER.some(id => CHAPTERS[id].busy);

  let loadGen = 0, currentSet = null, activeCtrl = null;

  async function loadChapter(c, gen) {
    const ctrl = new AbortController();
    activeCtrl = ctrl;
    let watchdog = setTimeout(() => ctrl.abort(), 20000);
    const res = await fetch(c.url, { priority: 'low', signal: ctrl.signal });
    if (!res.ok || !res.body) throw new Error('video ' + res.status);
    const total = Number(res.headers.get('Content-Length')) || c.bytes;
    const reader = res.body.getReader();
    const chunks = [];
    let got = 0, lastRing = 0;
    const showRing = c.id === 'a';             // the ring only covers the first walk
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      clearTimeout(watchdog);
      watchdog = setTimeout(() => ctrl.abort(), 20000);
      chunks.push(value);
      got += value.length;
      const frac = Math.min(1, got / total);
      const now = performance.now();
      if (showRing && (now - lastRing > 100 || frac === 1)) {
        lastRing = now;
        ringFill.style.setProperty('--ld', Math.round(126 * (1 - frac)));
      }
    }
    clearTimeout(watchdog);
    if (gen !== loadGen) return;                // the screen changed shape mid-load; a newer set is loading
    if (showRing) ringFill.style.setProperty('--ld', 0);
    c.objectUrl = URL.createObjectURL(new Blob(chunks, { type: 'video/mp4' }));
    c.el.src = c.objectUrl;
    c.el.load();
    await new Promise((resolve, reject) => {
      c.el.addEventListener('canplay', resolve, { once: true });
      c.el.addEventListener('error', reject, { once: true });
    });
    // iPhones and iPads only paint seeked frames of a muted inline video after it has played once.
    try { await c.el.play(); } catch (_) {}
    c.el.pause();
    if (gen !== loadGen) return;
    c.ready = true;
    if (c.id === 'a') stage.classList.add('video-ready');
    kick();
  }

  async function loadChapterDirect(c, gen) {
    c.el.preload = 'auto';
    c.el.src = c.url;
    c.el.load();
    await new Promise((resolve, reject) => {
      const t = setTimeout(() => reject(new Error('timeout')), 30000);
      c.el.addEventListener('canplaythrough', () => { clearTimeout(t); resolve(); }, { once: true });
      c.el.addEventListener('error', () => { clearTimeout(t); reject(new Error('error')); }, { once: true });
    });
    try { await c.el.play(); } catch (_) {}
    c.el.pause();
    if (gen !== loadGen) return;
    if (c.id === 'a') ringFill.style.setProperty('--ld', 0);
    c.ready = true;
    if (c.id === 'a') stage.classList.add('video-ready');
    kick();
  }

  async function loadAllChapters() {
    const gen = ++loadGen;
    const set = SETS[currentSet];
    CH_ORDER.forEach(id => {
      const c = CHAPTERS[id];
      c.url = 'assets/video/walk-' + id + set.suffix + '.mp4';
      c.bytes = set.bytes[id];
    });
    for (const id of CH_ORDER) {
      if (gen !== loadGen) return;
      const c = CHAPTERS[id];
      try { await loadChapter(c, gen); }
      catch (_) {
        if (gen !== loadGen) return;
        // fetch is blocked when the page is opened straight from disk (file://) or by some
        // previews and proxies; the video element can still load the file directly.
        try { await loadChapterDirect(c, gen); continue; } catch (_) {}
        if (gen !== loadGen) return;
        c.failed = true;                        // this walk falls back to crossfading stills
        if (id === 'a') stage.classList.add('video-failed');
        kick();
      }
    }
  }

  // Rotating a phone or resizing a window across a set boundary swaps to the matching set.
  function switchSetIfNeeded() {
    const want = pickSet();
    if (!heroInit || want === currentSet) return;
    currentSet = want;
    if (activeCtrl) activeCtrl.abort();
    CH_ORDER.forEach(id => {
      const c = CHAPTERS[id];
      c.ready = false; c.failed = false; c.busy = false; c.pending = null;
      c.el.removeAttribute('src'); c.el.load();
      if (c.objectUrl) { URL.revokeObjectURL(c.objectUrl); c.objectUrl = null; }
    });
    stage.classList.remove('video-ready', 'video-failed');
    ringFill.style.setProperty('--ld', 126);
    loadAllChapters();
    kick();
  }

  function initHeroOnce() {
    if (heroInit) return;
    heroInit = true;
    // Stills first (the arrival frame wins the bandwidth race), then the walks in order.
    const order = ['arrival', 'lobby', 'lobby-desk', 'reception', 'waiting', 'corridor', 'doorway', 'room', 'bedside', 'team', 'logo-wall'];
    let started = false;
    const start = () => { if (started) return; started = true; currentSet = pickSet(); loadAllChapters(); };
    order.forEach((id, i) => {
      const img = stills[id].el;
      if (i === 0) { img.onload = start; img.onerror = start; }
      img.src = img.dataset.src;
    });
    setTimeout(start, 4000);
  }

  /* ---------- scroll to progress ---------- */
  let target = 0, shown = 0, rafId = null, lastTick = 0, onScreen = true, scrubOn = false;
  let range = 1, headerH = 64, loadK = 0, loadStart = 0;

  let measuredW = 0, measuredH = 0;
  function measure(force) {
    // Mobile browsers change innerHeight as the address bar slides; only a width change or a
    // large height change (rotation, real resize) re-maps the journey, so the page never jumps.
    if (!force && innerWidth === measuredW && Math.abs(innerHeight - measuredH) < 160) return false;
    measuredW = innerWidth; measuredH = innerHeight;
    headerH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 64;
    const stageH = stage.offsetHeight || (innerHeight - headerH);
    range = Math.round(TOTAL * innerHeight / 100);
    journey.style.height = (range + stageH) + 'px';
    return true;
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
    const settled = Math.abs(target - shown) < 0.00002 && loadK >= 1 && !anyBusy();
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

  const videoAt = (id, t) => CHAPTERS[id].ready && Math.abs(CHAPTERS[id].el.currentTime - t) < 0.6;
  let activeCh;
  function showChapter(id) {
    if (id === activeCh) return;
    activeCh = id;
    CH_ORDER.forEach(k => {
      const c = CHAPTERS[k], on = k === id;
      if (c.on !== on) { c.on = on; c.el.classList.toggle('on', on); }
    });
  }

  function render(p) {
    const i = Math.max(0, SEG.findIndex(g => p <= g.b));
    const g = SEG[i];
    const u = clamp((p - g.a) / (g.b - g.a), 0, 1);
    const want = {};                               // still id -> [opacity, transform, origin]
    showChapter(g.type === 'video' || g.v !== undefined ? g.ch : null);
    let glowWant = 0;

    if (g.upcoming) requestSeek(g.upcoming.ch, g.upcoming.t0);   // pre-seek the next walk under the stills
    if (g.type === 'hold') {
      if (g.v !== undefined) {
        requestSeek(g.ch, g.v);
        if (!videoAt(g.ch, g.v)) want[g.still] = [1];
      } else {
        const tf = g.push ? `scale(${(1 + 0.04 * u).toFixed(4)})` : '';
        want[g.still] = [1, tf, g.push ? '41% 40%' : ''];
      }
    } else if (g.type === 'video') {
      const t = g.t0 + (g.t1 - g.t0) * u;
      requestSeek(g.ch, t);
      if (!CHAPTERS[g.ch].ready) {                 // complete without video: crossfade the stills
        want[g.from] = [1];
        want[g.to] = [smooth(u, 0.35, 0.65)];
      } else if (!videoAt(g.ch, t)) {
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
    renderBeats(p);
    let area = AREAS[i] || '';
    if (g.id === 'walkA') area = u < 0.55 ? 'Main gate' : 'Entrance';        // S1 ends at the doors
    if (g.id === 'walkC') area = u < 0.5 ? 'Waiting hall' : 'Corridor';     // S4 ends at the corridor mouth
    if (area !== lastArea) { lastArea = area; areaName.textContent = area; }
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
  function renderBeats(p) {
    for (const bt of beats) {
      const g = bt.seg;
      const u = clamp((p - g.a) / (g.b - g.a), 0, 1);
      const r = Math.min(0.04, (bt.b - bt.a) / 3);
      let o = smooth(u, bt.a, bt.a + r) * (1 - smooth(u, bt.b - r, bt.b));
      let k = clamp((u - bt.a) / (r * 2.2), 0, 1);
      let w = clamp((u - bt.a) / (bt.b - bt.a), 0, 1);
      o = Math.round(o * 1000) / 1000;
      k = Math.round(k * 125) / 125;
      w = Math.round(w * 500) / 500;
      if (bt.o !== o) { bt.el.style.opacity = o; bt.o = o; }
      if (bt.k !== k) { bt.el.style.setProperty('--k', k); bt.k = k; }
      if (bt.u !== w) { bt.el.style.setProperty('--u', w); bt.u = w; }
    }
  }

  function unpinStops() {
    beats.forEach(bt => { bt.o = -1; bt.k = -1; bt.u = -1; });
    lastArea = '';
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
    measure(true);
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
    const stat = wantsStatic();
    document.documentElement.classList.toggle('static-journey', stat);
    if (stat) disableScrub(); else enableScrub();
  }
  REDUCE.addEventListener('change', applyMode);

  addEventListener('resize', () => {
    if (!scrubOn) return;
    switchSetIfNeeded();
    const p = progress();                       // keep the visitor at the same point of the walk
    if (measure(false)) {
      scrollTo(0, journey.getBoundingClientRect().top + scrollY - headerH + p * range);
      onScroll(true);
    }
  });
  new IntersectionObserver(([en]) => { onScreen = en.isIntersecting; if (onScreen) onScroll(); }).observe(journey);

  pinToFinalStates();
  applyMode();
})();
