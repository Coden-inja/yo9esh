// One AudioContext for the whole site (key clicks + lo-fi player). Browsers only allow
// audio after a user gesture, so everything here is created lazily on first use.
let ctx: AudioContext | null = null;
let noise: AudioBuffer | null = null;

export function audio(): AudioContext {
  ctx ??= new AudioContext();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
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

/** Mechanical key click: a filtered noise "tick" plus a low "thock" as the key bottoms out. */
export function click(heavy = false) {
  if (!clicks) return;
  const c = audio();
  const t = c.currentTime;
  const src = c.createBufferSource();
  src.buffer = noiseBuffer();
  const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2600 + Math.random() * 900; bp.Q.value = 1.4;
  const g = c.createGain(); g.gain.setValueAtTime(heavy ? 0.5 : 0.32, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
  src.connect(bp).connect(g).connect(c.destination);
  src.start(t, Math.random() * 0.9, 0.06);
  const o = c.createOscillator();
  o.frequency.setValueAtTime(heavy ? 120 : 160, t); o.frequency.exponentialRampToValueAtTime(60, t + 0.05);
  const og = c.createGain(); og.gain.setValueAtTime(heavy ? 0.22 : 0.12, t); og.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
  o.connect(og).connect(c.destination); o.start(t); o.stop(t + 0.07);
}
