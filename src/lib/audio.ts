// One AudioContext for the whole site (key clicks + lo-fi player). Browsers only allow
// audio after a user gesture, so everything here is created lazily on first use.
let ctx: AudioContext | null = null;
let noise: AudioBuffer | null = null;

export function audio(): AudioContext {
  // 'interactive' asks the OS for the smallest output buffer, so a key sound lands with the key
  ctx ??= new AudioContext({ latencyHint: 'interactive' });
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

/** Resolves once the audio clock is actually running (it starts only after a user gesture). */
export async function ready(): Promise<AudioContext> {
  const c = audio();
  if (c.state !== 'running') await c.resume();
  return c;
}

/** 1 s of white noise, shared by clicks, drums and vinyl texture. */
export function noiseBuffer(): AudioBuffer {
  const c = audio();
  if (!noise) {
    noise = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  return noise;
}

// ---- key-click sound setting, persisted per browser ----
let clicks = true;
try { clicks = localStorage.getItem('sound') !== 'off'; } catch {}
export const clicksOn = () => clicks;
export function setClicks(on: boolean) {
  clicks = on;
  try { localStorage.setItem('sound', on ? 'on' : 'off'); } catch {}
  dispatchEvent(new CustomEvent('clicks:change', { detail: on }));
}

/** Rising air "whoosh" (filtered noise sweep), for the title-screen entrance. */
export function whoosh(when = 0, dur = 0.7) {
  const c = audio();
  const t = c.currentTime + when;
  const src = c.createBufferSource(); src.buffer = noiseBuffer(); src.loop = true;
  const f = c.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 1.2;
  f.frequency.setValueAtTime(300, t); f.frequency.exponentialRampToValueAtTime(5200, t + dur);
  const g = c.createGain(); g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.35, t + dur * 0.8); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(c.destination); src.start(t); src.stop(t + dur + 0.05);
}

/** Anime "impact frame" hit: a sub boom plus a noise crack. */
export function impact(when = 0, power = 1) {
  const c = audio();
  const t = c.currentTime + when;
  const o = c.createOscillator(); o.type = 'sine';
  o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(38, t + 0.45);
  const og = c.createGain(); og.gain.setValueAtTime(0.9 * power, t); og.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
  o.connect(og).connect(c.destination); o.start(t); o.stop(t + 0.65);
  const s = c.createBufferSource(); s.buffer = noiseBuffer();
  const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 2400;
  const g = c.createGain(); g.gain.setValueAtTime(0.5 * power, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
  s.connect(f).connect(g).connect(c.destination); s.start(t, 0.2, 0.3);
}

// A mechanical key makes two sounds: the clack as it bottoms out (keydown) and a lighter
// click as it springs back (keyup). Each part is a short filtered-noise transient plus a
// tiny pitched body; small random variation keeps fast typing from sounding robotic.
function keySound(t: number, { freq, q, vol, body, bodyVol, len }: { freq: number; q: number; vol: number; body: number; bodyVol: number; len: number }) {
  const c = audio();
  const src = c.createBufferSource(); src.buffer = noiseBuffer();
  const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = freq * (0.9 + Math.random() * 0.2); bp.Q.value = q;
  const g = c.createGain();
  g.gain.setValueAtTime(vol * (0.85 + Math.random() * 0.3), t);
  g.gain.exponentialRampToValueAtTime(0.0008, t + len);
  src.connect(bp).connect(g).connect(c.destination);
  src.start(t, Math.random() * 0.9, len + 0.02);
  if (bodyVol > 0) {
    const o = c.createOscillator(); o.type = 'triangle';
    o.frequency.setValueAtTime(body * (0.95 + Math.random() * 0.1), t); o.frequency.exponentialRampToValueAtTime(body * 0.55, t + len);
    const og = c.createGain(); og.gain.setValueAtTime(bodyVol, t); og.gain.exponentialRampToValueAtTime(0.0008, t + len * 1.2);
    o.connect(og).connect(c.destination); o.start(t); o.stop(t + len * 1.3);
  }
}

/** Keydown: the clack. `heavy` = space bar / modifier keys, deeper and longer with a little rattle. */
export function click(heavy = false) {
  if (!clicks) return;
  const t = audio().currentTime;
  if (heavy) {
    keySound(t, { freq: 1700, q: 1.1, vol: 0.55, body: 210, bodyVol: 0.3, len: 0.075 });
    keySound(t + 0.012, { freq: 3600, q: 3, vol: 0.12, body: 0, bodyVol: 0, len: 0.03 }); // stabilizer rattle
  } else {
    keySound(t, { freq: 3300, q: 1.6, vol: 0.42, body: 330, bodyVol: 0.16, len: 0.045 });
  }
}

/** Keyup: the softer, higher click of the switch returning. */
export function release(heavy = false) {
  if (!clicks) return;
  const t = audio().currentTime;
  keySound(t, { freq: heavy ? 2600 : 4300, q: 2.2, vol: heavy ? 0.2 : 0.14, body: heavy ? 260 : 520, bodyVol: 0.05, len: 0.03 });
}

// Keys that played a press sound, so their keyup can play the matching release.
const held = new Set<string>();
/** Press sound tied to a physical key (ignores auto-repeat while the key is held). */
export function keyDown(e: KeyboardEvent, heavy = e.key === ' ') {
  if (e.repeat) return;
  held.add(e.code || e.key);
  click(heavy);
}
/** Release sound, only for keys that played a press. */
export function keyUp(e: KeyboardEvent) {
  if (held.delete(e.code || e.key)) release(e.key === ' ');
}

/** Short bright arpeggio (C–E–G–C) for finishing the typing test. Plays even with key clicks off. */
export function chime() {
  const c = audio();
  const t = c.currentTime;
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
    const o = c.createOscillator(); o.type = 'triangle'; o.frequency.value = f;
    const g = c.createGain(); const s = t + i * 0.075;
    g.gain.setValueAtTime(0.0001, s); g.gain.exponentialRampToValueAtTime(0.18, s + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, s + 0.5);
    o.connect(g).connect(c.destination); o.start(s); o.stop(s + 0.55);
  });
}
