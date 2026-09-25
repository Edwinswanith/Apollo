// Veo 3.1 first/last-frame generator for the Walk Through Apollo build.
// Reads the key from the GEMINI_API_KEY environment variable, or from the
// project-root .env file (GEMINI_API_KEY=...) when the variable is unset. The key is
// never printed, logged, written to disk, or sent anywhere except Google's API.
//
//   node tools/veo.mjs list
//   node tools/veo.mjs generate --first a.jpg --last b.jpg --prompt p.txt --out clip.mp4 [--model id] [--resolution 1080p] [--duration 8] [--dry-run]

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = 'https://generativelanguage.googleapis.com/v1beta';

// Fallback: the project-root .env (outside the website folder, never shipped).
function keyFromDotEnv() {
  const file = join(dirname(fileURLToPath(import.meta.url)), '..', '.env');
  if (!existsSync(file)) return '';
  const line = readFileSync(file, 'utf8').split(/\r?\n/).find((l) => /^\s*GEMINI_API_KEY\s*=/.test(l));
  return line ? line.replace(/^\s*GEMINI_API_KEY\s*=\s*/, '').trim().replace(/^["']|["']$/g, '') : '';
}
const KEY = process.env.GEMINI_API_KEY || keyFromDotEnv();

const scrub = (s) => (KEY ? String(s).split(KEY).join('[redacted]') : String(s));
const die = (msg) => { console.error(scrub(msg)); process.exit(1); };

function args(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const k = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) out[k] = true;
      else { out[k] = next; i++; }
    } else out._.push(a);
  }
  return out;
}

async function api(path, init = {}) {
  const res = await fetch(`${BASE}/${path}`, {
    ...init,
    headers: { 'x-goog-api-key': KEY, 'Content-Type': 'application/json', ...(init.headers || {}) },
  });
  const text = await res.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  return { ok: res.ok, status: res.status, body };
}

function imagePart(file) {
  const mime = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png' }[extname(file).toLowerCase()];
  if (!mime) die(`Unsupported image type: ${file}`);
  const data = readFileSync(file).toString('base64');
  return { bytesBase64Encoded: data, mimeType: mime };   // Veo predictLongRunning rejects inlineData
}

async function list() {
  const models = [];
  let page = '';
  do {
    const r = await api(`models?pageSize=200${page ? `&pageToken=${page}` : ''}`);
    if (!r.ok) die(`List failed (${r.status}): ${JSON.stringify(r.body)}`);
    models.push(...(r.body.models || []));
    page = r.body.nextPageToken || '';
  } while (page);
  const veo = models.filter((m) => /veo/i.test(m.name));
  for (const m of veo) console.log(`${m.name}  |  ${m.displayName || ''}  |  ${(m.supportedGenerationMethods || []).join(',')}`);
  if (!veo.length) console.log('No Veo models visible to this key.');
}

async function generate(o) {
  for (const k of ['first', 'last', 'prompt', 'out']) if (!o[k]) die(`Missing --${k}`);
  const model = o.model || 'veo-3.1-generate-preview';
  const prompt = readFileSync(o.prompt, 'utf8').trim();
  const parameters = {
    aspectRatio: '16:9',
    resolution: o.resolution || '1080p',
    durationSeconds: Number(o.duration || 8),
    personGeneration: 'allow_adult',
  };
  const body = { instances: [{ prompt, image: imagePart(o.first), lastFrame: imagePart(o.last) }], parameters };

  const summary = {
    model, parameters, prompt,
    first: o.first, last: o.last, out: o.out,
    firstBytes: readFileSync(o.first).length, lastBytes: readFileSync(o.last).length,
  };
  if (o['dry-run']) { console.log(JSON.stringify(summary, null, 2)); return; }
  if (!KEY) die('GEMINI_API_KEY is not set in this environment.');

  const t0 = Date.now();
  const r = await api(`models/${model}:predictLongRunning`, { method: 'POST', body: JSON.stringify(body) });
  if (!r.ok) die(`Submit failed (${r.status}): ${JSON.stringify(r.body)}`);
  const opName = r.body.name;
  console.log(`Submitted. Operation: ${opName}`);

  const logPath = o.out.replace(/\.mp4$/i, '') + '.job.json';
  mkdirSync(dirname(o.out), { recursive: true });
  writeFileSync(logPath, JSON.stringify({ ...summary, operation: opName, submittedAt: new Date().toISOString() }, null, 2));

  let op;
  for (;;) {
    await new Promise((res) => setTimeout(res, 10000));
    const p = await api(opName);
    if (!p.ok) die(`Poll failed (${p.status}): ${JSON.stringify(p.body)}`);
    op = p.body;
    const secs = Math.round((Date.now() - t0) / 1000);
    if (op.done) { console.log(`Done after ${secs}s.`); break; }
    console.log(`Rendering... ${secs}s`);
    if (secs > 1200) die(`Still not done after 20 minutes. Operation: ${opName}`);
  }
  if (op.error) die(`Generation failed: ${JSON.stringify(op.error)}`);

  const sample = op.response?.generateVideoResponse?.generatedSamples?.[0];
  const uri = sample?.video?.uri;
  if (!uri) die(`No video in response: ${JSON.stringify(op.response)}`);

  const dl = await fetch(uri, { headers: { 'x-goog-api-key': KEY }, redirect: 'follow' });
  if (!dl.ok) die(`Download failed (${dl.status})`);
  const buf = Buffer.from(await dl.arrayBuffer());
  writeFileSync(o.out, buf);
  writeFileSync(logPath, JSON.stringify({ ...summary, operation: opName, finishedAt: new Date().toISOString(), seconds: Math.round((Date.now() - t0) / 1000), bytes: buf.length }, null, 2));
  console.log(`Saved ${o.out} (${(buf.length / 1048576).toFixed(1)} MB)`);
}

const o = args(process.argv.slice(2));
const cmd = o._[0];
try {
  if (cmd === 'list') { if (!KEY) die('GEMINI_API_KEY is not set in this environment.'); await list(); }
  else if (cmd === 'generate') await generate(o);
  else die('Usage: node tools/veo.mjs list | generate --first a --last b --prompt p.txt --out clip.mp4 [--dry-run]');
} catch (e) {
  die(`Error: ${e && e.message ? e.message : e}`);
}
