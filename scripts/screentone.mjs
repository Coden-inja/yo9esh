// Turns a background-removed photo (PNG with alpha) into a manga-screentone figure:
// solid ink in shadows, 45° halftone dots in mid-tones, paper in highlights, plus an ink
// outline around the silhouette. Usage: node scripts/screentone.mjs <cutout.png> <out.png>
import sharp from 'sharp';

const [, , input, output, heightArg = '1400'] = process.argv;
const INK = [18, 17, 16];
const PAPER = [243, 236, 224];
const CELL = 6; // halftone cell, px
const OUTLINE = 5; // ink outline thickness, px
const SHADOW = 0.2; // below → solid ink
const LIGHT = 0.74; // above → paper

const base = sharp(input).trim().resize({ height: Number(heightArg) });
const { data, info } = await base.clone().ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;

// luminance with a contrast stretch so faces keep their features
// CLAHE (local contrast) on a greyscale copy so faces in shadow keep their features
const grey = await base.clone().flatten({ background: '#808080' }).greyscale()
  .clahe({ width: 48, height: 48, maxSlope: 4 }).raw().toBuffer();
const lum = new Float32Array(W * H);
for (let i = 0; i < W * H; i++) lum[i] = Math.min(1, Math.max(0, (grey[i] / 255 - 0.08) / 0.84));

// outline mask: the silhouette grown by OUTLINE px (separable max filter, plain JS)
const alphaRaw = await base.clone().ensureAlpha().extractChannel(3).raw().toBuffer();
// hard mask: the cutout's edges carry soft matte values that would otherwise become ink
const alpha = Uint8Array.from(alphaRaw, (v) => (v > 128 ? 255 : 0));
const rows = new Uint8Array(W * H);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    let m = 0;
    for (let k = Math.max(0, x - OUTLINE); k <= Math.min(W - 1, x + OUTLINE) && !m; k++) m = alpha[y * W + k];
    rows[y * W + x] = m;
  }
}
const grown = new Uint8Array(W * H);
for (let x = 0; x < W; x++) {
  for (let y = 0; y < H; y++) {
    let m = 0;
    for (let k = Math.max(0, y - OUTLINE); k <= Math.min(H - 1, y + OUTLINE) && !m; k++) m = rows[k * W + x];
    grown[y * W + x] = m;
  }
}

const out = Buffer.alloc(W * H * 4);
const c = Math.SQRT1_2;
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = y * W + x, o = i * 4;
    const a = alpha[i] / 255;
    if (a < 0.5) {
      if (grown[i] > 0) { out.set(INK, o); out[o + 3] = 255; } // outline
      continue;
    }
    const l = lum[i];
    let ink;
    if (l < SHADOW) ink = true;
    else if (l > LIGHT) ink = false;
    else {
      // rotated grid: distance to the nearest dot centre vs. a radius that shrinks as it gets lighter
      const u = x * c - y * c, v = x * c + y * c;
      const fu = ((u % CELL) + CELL) % CELL - CELL / 2, fv = ((v % CELL) + CELL) % CELL - CELL / 2;
      const t = (l - SHADOW) / (LIGHT - SHADOW);
      ink = Math.hypot(fu, fv) < CELL * 0.62 * Math.sqrt(1 - t);
    }
    out.set(ink ? INK : PAPER, o);
    out[o + 3] = 255;
  }
}

await sharp(out, { raw: { width: W, height: H, channels: 4 } }).png({ compressionLevel: 9 }).toFile(output);
console.log(`✓ ${output} ${W}×${H}`);
