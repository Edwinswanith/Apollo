// Verifies the progressive-memory loader on the real preview site (http://127.0.0.1:8080/).
// Run with browser_run_code_unsafe filename=bench-mp4/site-check.js
async (outer) => {
  const SITE = 'http://127.0.0.1:8080/';
  const results = [];

  // Injected before the page scripts: records when the walk becomes usable, and samples what is on screen.
  const probe = () => {
    window.__probe = { t0: performance.now(), readyMs: null, failedMs: null, bad: 0, flips: 0, samples: 0, blank: 0 };
    const watch = () => {
      const st = document.querySelector('.stage');
      if (!st) return requestAnimationFrame(watch);
      new MutationObserver(() => {
        if (st.classList.contains('video-ready') && window.__probe.readyMs === null) window.__probe.readyMs = performance.now();
        if (st.classList.contains('video-failed') && window.__probe.failedMs === null) window.__probe.failedMs = performance.now();
      }).observe(st, { attributes: true, attributeFilter: ['class'] });
      let lastLayer = '';
      const sample = () => {
        if (document.documentElement.classList.contains('static-journey')) return;
        const vids = [...document.querySelectorAll('.media video.on')];
        const stillsOn = [...document.querySelectorAll('.stills img')].filter(i => +i.style.opacity > 0.5 && i.complete && i.naturalWidth);
        const v = vids[0];
        const P = window.__probe; P.samples++;
        if (v && v.readyState < 2 && !v.seeking) P.bad++;         // a video layer shown with no decoded frame (Chrome keeps the old frame while seeking)
        if (!v && !stillsOn.length) P.blank++;                    // nothing covering the stage
        const layer = v ? 'v' : 's';
        const inWalk = document.querySelector('.area-name');
        if (layer !== lastLayer) { P.flips++; lastLayer = layer; }
        requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    };
    watch();
  };

  async function scenario(name, { vw = 1440, vh = 900, mobile = false, init = null, reduce = false, act }) {
    const ctx = await outer.context().browser().newContext({ viewport: { width: vw, height: vh }, hasTouch: mobile, reducedMotion: reduce ? 'reduce' : 'no-preference' });
    const page = await ctx.newPage();
    await page.addInitScript(probe);
    if (init) await page.addInitScript(init);
    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: mobile ? 4 : 1 });
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 40, downloadThroughput: 10e6 / 8, uploadThroughput: 5e6 / 8 });
    const req = {}; const t0 = Date.now(); const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', e => errors.push('pageerror: ' + e.message));
    cdp.on('Network.requestWillBeSent', e => { req[e.requestId] = { url: e.request.url, start: Date.now() - t0, bytes: 0, range: e.request.headers.Range || e.request.headers.range || '' }; });
    cdp.on('Network.dataReceived', e => { if (req[e.requestId]) req[e.requestId].bytes += e.encodedDataLength || 0; });
    cdp.on('Network.loadingFinished', e => { if (req[e.requestId]) req[e.requestId].end = Date.now() - t0; });
    cdp.on('Network.loadingFailed', e => { if (req[e.requestId]) req[e.requestId].failed = e.errorText + (e.canceled ? ' (cancelled)' : ''); });
    await page.goto(SITE, { waitUntil: 'commit' });
    await page.waitForSelector('#journey', { state: 'attached' });
    const extra = await act(page);
    const probeOut = await page.evaluate(() => {
      const P = window.__probe;
      const poster = performance.getEntriesByType('resource').find(r => r.name.includes('stills/arrival'));
      return { posterMs: poster ? Math.round(poster.responseEnd) : null, walkReadyMs: P.readyMs && Math.round(P.readyMs), failedMs: P.failedMs && Math.round(P.failedMs),
        badFrames: P.bad, blankFrames: P.blank, layerFlips: P.flips, samples: P.samples,
        heapMB: performance.memory ? +(performance.memory.usedJSHeapSize / 1048576).toFixed(1) : null,
        videos: [...document.querySelectorAll('.media video')].map(v => ({ rs: v.readyState, src: v.src ? v.src.slice(0, 5) : '' })) };
    });
    const media = Object.values(req).filter(r => /\.mp4/.test(r.url)).map(r => ({ file: r.url.split('/').pop(), startMs: r.start, endMs: r.end ?? null, MB: +(r.bytes / 1048576).toFixed(2), range: r.range, failed: r.failed || '' }));
    const allBytes = Object.values(req).filter(r => r.url.startsWith('http')).reduce((s, r) => s + r.bytes, 0);
    const beforeReady = probeOut.walkReadyMs ? Object.values(req).filter(r => r.url.startsWith('http')).reduce((s, r) => s + (r.start < probeOut.walkReadyMs ? Math.min(r.bytes, r.bytes) : 0), 0) : null;
    results.push({ name, ...probeOut, totalMB: +(allBytes / 1048576).toFixed(2), media, errors: errors.filter(e => !/favicon/.test(e)), ...extra });
    await ctx.close();
  }

  const scrollTo = (page, p) => page.evaluate(p => { const j = document.getElementById('journey'); const r = j.offsetHeight - document.querySelector('.stage').offsetHeight; scrollTo(0, j.getBoundingClientRect().top + scrollY - 64 + p * r); }, p);
  const wheel = async (page, dir, step, gap, n) => { await page.mouse.move(500, 450); for (let i = 0; i < n; i++) { await page.mouse.wheel(0, dir * step); await page.waitForTimeout(gap); } };

  // 1. Idle visitor: what loads, in what order, and when does it stop
  await scenario('desktop idle (arrives, waits 40 s)', { act: async page => { await page.waitForTimeout(40000); return {}; } });
  // 2. Impatient visitor: starts scrolling after 1.5 s straight through the journey
  await scenario('desktop impatient (scrolls from 1.5 s)', { act: async page => {
    await page.waitForTimeout(1500);
    for (let k = 0; k < 4; k++) { await wheel(page, 1, 120, 50, 45); await page.screenshot({ path: `bench-mp4/impatient-${k}.jpg`, type: 'jpeg', quality: 60 }); }
    await wheel(page, 1, 120, 50, 80); await page.waitForTimeout(3000); return {}; } });
  // 3. Everything loaded: full forward, backward, fast, and a jump back to an earlier chapter
  await scenario('desktop after load (fwd, back, fast, return)', { act: async page => {
    for (const p of [0.05, 0.3, 0.5, 0.7]) { await scrollTo(page, p); await page.waitForTimeout(9000); }
    await scrollTo(page, 0); await page.waitForTimeout(1500);
    await wheel(page, 1, 120, 40, 230); await wheel(page, -1, 120, 40, 230); await wheel(page, 1, 360, 40, 80);
    await page.click('.rail a[data-go="arrival"]'); await page.waitForTimeout(2500);
    const back = await page.evaluate(() => { const v = document.querySelector('.media video.on'); return v ? { ch: v.src.slice(0, 5), t: +v.currentTime.toFixed(2), rs: v.readyState } : 'still'; });
    return { returnToArrival: back };
  } });
  // 4. Fallback: no MediaSource at all (capability missing)
  await scenario('desktop fallback: MediaSource unavailable', { init: () => { delete window.MediaSource; delete window.ManagedMediaSource; window.MediaSource = undefined; window.ManagedMediaSource = undefined; },
    act: async page => { await page.waitForTimeout(25000); await wheel(page, 1, 120, 40, 60); await page.waitForTimeout(1500); return {}; } });
  // 5. Fallback: MediaSource present but broken (addSourceBuffer throws)
  await scenario('desktop fallback: MediaSource init fails', { init: () => { if (window.MediaSource) MediaSource.prototype.addSourceBuffer = function () { throw new Error('simulated'); }; },
    act: async page => { await page.waitForTimeout(25000); await wheel(page, 1, 120, 40, 60); await page.waitForTimeout(1500); return {}; } });
  // 6. Reduced motion: static version, no video
  await scenario('desktop reduced motion', { reduce: true, act: async page => { await page.waitForTimeout(5000); return { staticClass: await page.evaluate(() => document.documentElement.classList.contains('static-journey')) }; } });
  // 7. Mobile: portrait set, idle then impatient
  await scenario('mobile 390x844 idle (waits 25 s)', { vw: 390, vh: 844, mobile: true, act: async page => { await page.waitForTimeout(25000); return {}; } });
  await scenario('mobile 390x844 impatient (scrolls from 1.5 s)', { vw: 390, vh: 844, mobile: true, act: async page => { await page.waitForTimeout(1500); await wheel(page, 1, 120, 50, 200); await page.waitForTimeout(3000); return {}; } });

  return JSON.stringify(results, null, 1);
}
