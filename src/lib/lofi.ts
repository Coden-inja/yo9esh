// A lo-fi loop synthesized live with Web Audio: no audio files, no licensing.
// 76 BPM, swung 16ths, Dm9 → G13 → Cmaj9 → Am9 on a warm e-piano with tape wobble,
// sine bass, boom-bap drums, vinyl crackle. Dispatches `lofi:beat` on every quarter note.
import { audio, noiseBuffer } from './audio';

const BPM = 76;
const BEAT = 60 / BPM;
const STEP = BEAT / 4; // 16th note
const SWING = 0.2; // how late the off-beat 16ths land, as a fraction of a step
const BARS = 4;

// voicings as MIDI notes (low to high), and the bass root for each bar
const CHORDS = [
  [50, 53, 57, 60, 64], // Dm9   D F A C E
  [43, 53, 57, 59, 64], // G13   G F A B E
  [48, 52, 55, 59, 62], // Cmaj9 C E G B D
  [45, 52, 55, 60, 59], // Am9   A E G C B
];
const BASS = [38, 31, 36, 33];
const hz = (m: number) => 440 * 2 ** ((m - 69) / 12);

let master: GainNode | null = null;
let analyser: AnalyserNode | null = null;
let wobble: GainNode | null = null;
let crackle: AudioBufferSourceNode | null = null;
let timer = 0;
let next = 0;
let step = 0;
let playing = false;

export const isPlaying = () => playing;
export const getAnalyser = () => analyser;

function graph() {
  const c = audio();
  if (master) return c;
  master = c.createGain(); master.gain.value = 0;
  const tone = c.createBiquadFilter(); tone.type = 'lowpass'; tone.frequency.value = 3400; // dusty top end
  const comp = c.createDynamicsCompressor(); comp.threshold.value = -20; comp.ratio.value = 4;
  analyser = c.createAnalyser(); analyser.fftSize = 64; analyser.smoothingTimeConstant = 0.75;
  master.connect(tone).connect(comp).connect(analyser).connect(c.destination);
  // tape wow: a slow LFO on every note's pitch
  const lfo = c.createOscillator(); lfo.frequency.value = 0.55;
  wobble = c.createGain(); wobble.gain.value = 9; // cents
  lfo.connect(wobble); lfo.start();
  return c;
}

function keys(c: AudioContext, notes: number[], t: number, dur: number, vel: number) {
  const out = c.createGain();
  const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1500; lp.Q.value = 0.4;
  out.gain.setValueAtTime(0, t);
  out.gain.linearRampToValueAtTime(vel, t + 0.025);
  out.gain.exponentialRampToValueAtTime(vel * 0.45, t + 0.6);
  out.gain.setTargetAtTime(0.0001, t + dur, 0.25);
  out.connect(lp).connect(master!);
  for (const n of notes) {
    for (const [type, mul, g] of [['triangle', 1, 0.5], ['sine', 2, 0.12]] as const) {
      const o = c.createOscillator(); o.type = type; o.frequency.value = hz(n) * mul;
      o.detune.value = (Math.random() - 0.5) * 8; wobble!.connect(o.detune);
      const og = c.createGain(); og.gain.value = g / notes.length;
      o.connect(og).connect(out); o.start(t); o.stop(t + dur + 1.2);
    }
  }
}

function bass(c: AudioContext, note: number, t: number, dur: number) {
  const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = hz(note);
  const g = c.createGain();
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.42, t + 0.02); g.gain.setTargetAtTime(0.0001, t + dur, 0.08);
  o.connect(g).connect(master!); o.start(t); o.stop(t + dur + 0.5);
}

function kick(c: AudioContext, t: number) {
  const o = c.createOscillator(); o.frequency.setValueAtTime(115, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.14);
  const g = c.createGain(); g.gain.setValueAtTime(0.95, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
  o.connect(g).connect(master!); o.start(t); o.stop(t + 0.35);
}

function noiseHit(c: AudioContext, t: number, type: BiquadFilterType, freq: number, vol: number, decay: number) {
  const s = c.createBufferSource(); s.buffer = noiseBuffer();
  const f = c.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = 0.8;
  const g = c.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + decay);
  s.connect(f).connect(g).connect(master!); s.start(t, Math.random() * 0.8, decay + 0.05);
}

function snare(c: AudioContext, t: number) {
  noiseHit(c, t, 'bandpass', 1900, 0.32, 0.17);
  const o = c.createOscillator(); o.type = 'triangle'; o.frequency.value = 185;
  const g = c.createGain(); g.gain.setValueAtTime(0.18, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
  o.connect(g).connect(master!); o.start(t); o.stop(t + 0.1);
}

function vinyl(c: AudioContext) {
  // 3 s loop: a faint hiss bed plus sparse pops
  const len = c.sampleRate * 3;
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * 0.012 + (Math.random() < 0.0004 ? (Math.random() - 0.5) * 0.9 : 0);
  crackle = c.createBufferSource(); crackle.buffer = buf; crackle.loop = true;
  const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 900;
  const g = c.createGain(); g.gain.value = 0.55;
  crackle.connect(hp).connect(g).connect(master!); crackle.start();
}

function schedule() {
  const c = audio();
  while (next < c.currentTime + 0.15) {
    const s = step % 16, bar = Math.floor(step / 16) % BARS;
    const t = next + (s % 2 ? SWING * STEP : 0);
    if (s === 0) keys(c, CHORDS[bar], t, BEAT * 2.6, 0.5);
    if (s === 10) keys(c, CHORDS[bar].slice(2), t, BEAT * 1.2, 0.32); // a lighter stab on the "and" of 3
    if (s === 0) bass(c, BASS[bar], t, BEAT * 1.6);
    if (s === 10) bass(c, BASS[bar], t, BEAT * 0.6);
    if (s === 14) bass(c, BASS[(bar + 1) % BARS] + 2, t, BEAT * 0.4); // walk up into the next bar
    if (s === 0 || s === 10 || (s === 7 && bar % 2)) kick(c, t);
    if (s === 4 || s === 12) snare(c, t);
    if (s % 2 === 0) noiseHit(c, t, 'highpass', 7200, s % 4 ? 0.035 : 0.06, 0.035);
    if (s % 4 === 0) {
      const delay = Math.max(0, (t - c.currentTime) * 1000);
      const beat = s / 4;
      setTimeout(() => dispatchEvent(new CustomEvent('lofi:beat', { detail: { beat, bar } })), delay);
    }
    next += STEP;
    step++;
  }
}

export function play() {
  if (playing) return;
  const c = graph();
  playing = true;
  next = c.currentTime + 0.08; step = 0;
  vinyl(c);
  master!.gain.cancelScheduledValues(c.currentTime);
  master!.gain.setTargetAtTime(0.8, c.currentTime, 0.4);
  schedule();
  timer = window.setInterval(schedule, 25);
  dispatchEvent(new CustomEvent('lofi:change', { detail: true }));
}

export function stop() {
  if (!playing || !master) return;
  const c = audio();
  playing = false;
  master.gain.setTargetAtTime(0, c.currentTime, 0.15);
  window.clearInterval(timer);
  const cr = crackle; setTimeout(() => cr?.stop(), 700);
  dispatchEvent(new CustomEvent('lofi:change', { detail: false }));
}

export const toggle = () => (playing ? stop() : play());

// Stop the loop while the page is hidden (other tab, minimised, phone locked) and start it
// again on return, but only if it was playing when the visitor left.
let resumeOnShow = false;
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { resumeOnShow = playing; if (playing) stop(); }
  else if (resumeOnShow) { resumeOnShow = false; play(); }
});
