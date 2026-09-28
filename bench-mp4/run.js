// MP4 startup benchmark driver (Playwright, run with browser_run_code_unsafe filename=bench-mp4/run.js)
async (outer) => {
  const CASES = [
    { name: 'CURRENT', q: 'mode=cur', vw: 1440, vh: 900, mobile: false },
    { name: 'STREAM (range)', q: 'mode=opt', vw: 1440, vh: 900, mobile: false },
    { name: 'PROGRESSIVE MEMORY (MSE)', q: 'mode=mse', vw: 1440, vh: 900, mobile: false },
    { name: 'CURRENT', q: 'mode=cur', vw: 390, vh: 844, mobile: true },
    { name: 'STREAM (range)', q: 'mode=opt', vw: 390, vh: 844, mobile: true },
    { name: 'PROGRESSIVE MEMORY (MSE)', q: 'mode=mse', vw: 390, vh: 844, mobile: true },
  ];
  const out = [];
  for (const c of CASES.filter(c => c.q === 'mode=mse')) {
    const ctx = await outer.context().browser().newContext({ viewport: { width: c.vw, height: c.vh }, hasTouch: c.mobile });
    const page = await ctx.newPage();
    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: c.mobile ? 4 : 1 });
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 40, downloadThroughput: 10e6 / 8, uploadThroughput: 5e6 / 8 });
    // byte counter with wall-clock timestamps
    const rx = []; let navWall = null;
    cdp.on('Network.requestWillBeSent', e => { if (navWall === null && e.type === 'Document') navWall = e.wallTime * 1000; });
    const urls = {};
    cdp.on('Network.requestWillBeSent', e => { urls[e.requestId] = e.request.url; });
    cdp.on('Network.dataReceived', e => { const u = urls[e.requestId] || ''; if (u.startsWith('http')) rx.push({ ts: Date.now(), bytes: e.encodedDataLength || 0 }); });
    const navStart = Date.now();
    await page.goto('http://127.0.0.1:8082/?' + c.q, { waitUntil: 'commit' });
    const bytesUntil = ms => rx.filter(r => r.ts - navStart <= ms).reduce((s, r) => s + r.bytes, 0);

    async function sweep(dir, step, gap, n) {
      await page.mouse.move(Math.round(c.vw / 2), Math.round(c.vh / 2));
      const t0 = await page.evaluate(() => performance.now());
      for (let i = 0; i < n; i++) { await page.mouse.wheel(0, dir * step); await page.waitForTimeout(gap); }
      await page.waitForTimeout(900);
      const t1 = await page.evaluate(() => performance.now());
      return page.evaluate(([t0, t1]) => {
        const s = window.__mb.samples.filter(x => x.t >= t0 && x.t <= t1 && x.ch === 'a');
        const lag = s.map(x => Math.abs(x.disp - x.shown) * 100).sort((a, b) => a - b);
        const pct = p => lag.length ? lag[Math.min(lag.length - 1, Math.floor(p * lag.length))] : 0;
        let stalls = 0, stallMs = 0, since = null;
        for (let i = 1; i < s.length; i++) {
          const moving = Math.abs(s[i].shown - s[i - 1].shown) > 2e-4, same = s[i].disp === s[i - 1].disp;
          if (moving && same) { if (since === null) since = s[i - 1].t; }
          else { if (since !== null && s[i].t - since > 100) { stalls++; stallMs += s[i].t - since; } since = null; }
        }
        const span = (s.length ? s[s.length - 1].t - s[0].t : 1) / 1000;
        const changes = s.filter((x, i) => i && x.disp !== s[i - 1].disp).length;
        return { lagP50: +pct(.5).toFixed(2), lagP95: +pct(.95).toFixed(2), stalls, stallMs: Math.round(stallMs), picturesPerSec: +(changes / span).toFixed(1) };
      }, [t0, t1]);
    }

    // a visitor who starts scrolling 1.5 s after arriving
    await page.waitForTimeout(1500);
    const early = await sweep(1, 120, 60, 30);
    // wait until chapter A is fully available (cap 45 s), then measured sweeps over A and into B
    // make sure B is requested too, then wait for both chapters (cap 60 s)
    await page.evaluate(() => scrollTo(0, document.getElementById('run').offsetHeight * 0.4)); await page.waitForTimeout(500);
    for (let i = 0; i < 120; i++) { if (await page.evaluate(() => window.__mb.smoothMs !== null && window.__mb.bSmoothMs !== null)) break; await page.waitForTimeout(500); }
    await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(1200);
    const aPx = await page.evaluate(() => Math.round(document.getElementById('run').offsetHeight * 0.6));
    const n = Math.floor(aPx / 120);
    const fwd = await sweep(1, 120, 40, n);
    const rev = await sweep(-1, 120, 40, n);
    const fast = await sweep(1, 360, 40, Math.floor(n / 3));
    await page.waitForTimeout(1500);
    const m = await page.evaluate(() => { const M = window.__mb; return { posterMs: M.posterMs, uiMs: M.uiMs, firstUsableMs: M.firstUsableMs, aSmoothMs: M.smoothMs, bRequestedAtMs: M.bRequestedAt ?? null, bSmoothMs: M.bSmoothMs, mse: M.mseSupported ?? null, heapMB: performance.memory ? +(performance.memory.usedJSHeapSize / 1048576).toFixed(1) : null }; });
    const r = x => x === null || x === undefined ? null : Math.round(x);
    out.push({
      device: c.mobile ? 'mobile 390x844 (4x CPU)' : 'desktop 1440x900', name: c.name,
      posterMs: r(m.posterMs), uiMs: r(m.uiMs), firstUsableMs: r(m.firstUsableMs), aSmoothMs: r(m.aSmoothMs), bRequestedAtMs: r(m.bRequestedAtMs), bSmoothMs: r(m.bSmoothMs),
      mse: m.mse, MBbeforeUsable: +(bytesUntil(m.firstUsableMs ?? 0) / 1048576).toFixed(2), MBtotal: +(bytesUntil(1e9) / 1048576).toFixed(2), heapMB: m.heapMB,
      early, fwd, rev, fast
    });
    await ctx.close();
  }
  return JSON.stringify(out, null, 1);
}
