// Playwright benchmark driver for the S3 A/B test. Usage (browser_run_code_unsafe, filename): exports an async (page) => {}.
// Reads the variant list from window.__BENCH_CASES (set before calling) or uses the defaults below.
async (outerPage) => {
  // fresh browser context: no leftover init scripts or cache from earlier tests
  const ctx = await outerPage.context().browser().newContext();
  const page = await ctx.newPage();
  const ONLY = 'B';
  const ALL = [
    // desktop 1440x900
    { name: 'A mp4', q: 'mode=a', vw: 1440, vh: 900, mobile: false },
    { name: 'B 8fps avif blend', q: 'mode=b&fps=8&fmt=avif&blend=1', vw: 1440, vh: 900, mobile: false },
    { name: 'B 12fps avif blend', q: 'mode=b&fps=12&fmt=avif&blend=1', vw: 1440, vh: 900, mobile: false },
    { name: 'B 15fps avif blend', q: 'mode=b&fps=15&fmt=avif&blend=1', vw: 1440, vh: 900, mobile: false },
    { name: 'B 12fps avif no blend', q: 'mode=b&fps=12&fmt=avif&blend=0', vw: 1440, vh: 900, mobile: false },
    { name: 'B 12fps webp blend', q: 'mode=b&fps=12&fmt=webp&blend=1', vw: 1440, vh: 900, mobile: false },
    // mobile emulation 390x844, touch, 4x CPU slowdown
    { name: 'A mp4', q: 'mode=a', vw: 390, vh: 844, mobile: true },
    { name: 'B 12fps avif blend', q: 'mode=b&fps=12&fmt=avif&blend=1', vw: 390, vh: 844, mobile: true },
    { name: 'B 15fps avif blend', q: 'mode=b&fps=15&fmt=avif&blend=1', vw: 390, vh: 844, mobile: true },
  ];
  const CASES = ONLY ? ALL.filter(c => c.name.startsWith(ONLY)) : ALL;
  const out = [];
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });

  async function sweep(dir, step, gap, n) {
    await page.mouse.move(Math.round(page.viewportSize().width / 2), Math.round(page.viewportSize().height / 2));
    const t0 = await page.evaluate(() => performance.now());
    for (let i = 0; i < n; i++) { await page.mouse.wheel(0, dir * step); await page.waitForTimeout(gap); }
    await page.waitForTimeout(900);
    const t1 = await page.evaluate(() => performance.now());
    return page.evaluate(([t0, t1]) => {
      const s = window.__bench.samples.filter(x => x.t >= t0 && x.t <= t1);
      const lag = s.map(x => Math.abs(x.disp - x.shown) * 100).sort((a, b) => a - b);
      const pct = p => lag.length ? lag[Math.min(lag.length - 1, Math.floor(p * lag.length))] : 0;
      // freeze: the scroll-driven position keeps moving but the picture does not change for > 100 ms
      let stalls = 0, stallMs = 0, since = null, lastDisp = null;
      for (let i = 1; i < s.length; i++) {
        const moving = Math.abs(s[i].shown - s[i - 1].shown) > 2e-4;
        const same = s[i].disp === lastDisp;
        if (moving && same) { if (since === null) since = s[i - 1].t; }
        else { if (since !== null && s[i].t - since > 100) { stalls++; stallMs += s[i].t - since; } since = null; }
        lastDisp = s[i].disp;
      }
      const span = (s.length ? s[s.length - 1].t - s[0].t : 1) / 1000;
      const changes = s.filter((x, i) => i && x.disp !== s[i - 1].disp).length;
      return { lagP50: +pct(.5).toFixed(2), lagP95: +pct(.95).toFixed(2), stalls, stallMs: Math.round(stallMs),
        pictureUpdatesPerSec: +(changes / span).toFixed(1), rafPerSec: +(s.length / span).toFixed(1) };
    }, [t0, t1]);
  }

  for (const c of CASES) {
    await page.setViewportSize({ width: c.vw, height: c.vh });
    await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: c.mobile, maxTouchPoints: 5 });
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: c.mobile ? 4 : 1 });
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 40, downloadThroughput: 10e6 / 8, uploadThroughput: 5e6 / 8 });
    await page.goto('http://127.0.0.1:8081/?' + c.q + (c.mobile ? '&v=p' : '&v=d'));
    await page.waitForTimeout(1500);
    // early sweep: visitor starts scrolling 1.5 s after arriving, while things are still loading
    const early = await sweep(1, 120, 60, 40);
    // wait for everything (cap 40 s), then measured sweeps at full availability
    for (let i = 0; i < 80; i++) { if (await page.evaluate(() => window.__bench.fullyLoadedMs !== null || (window.__bench.mode === 'b' && window.__bench.decodedFrames() >= window.__bench.frames))) break; await page.waitForTimeout(500); }
    await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(1200);
    const fwd = await sweep(1, 120, 40, 60);
    const rev = await sweep(-1, 120, 40, 60);
    const fast = await sweep(1, 360, 40, 25);
    const m = await page.evaluate(() => { const B = window.__bench; return {
      firstVisualMs: B.firstVisualMs && Math.round(B.firstVisualMs), fullyLoadedMs: B.fullyLoadedMs && Math.round(B.fullyLoadedMs),
      downloadedMB: +(window.__benchBytes() / 1048576).toFixed(2), frames: B.frames, decodedFrames: B.decodedFrames(),
      decodedMB: +B.decodedMB().toFixed(0), heapMB: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : null,
      longFrames: B.longFrames, misses: B.misses }; });
    out.push({ device: c.mobile ? 'mobile 390x844 (4x CPU)' : 'desktop 1440x900', name: c.name, ...m, early, fwd, rev, fast });
  }
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: false, maxTouchPoints: 5 });
  await ctx.close();
  return JSON.stringify(out, null, 1);
}
