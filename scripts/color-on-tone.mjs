// Person in full colour over a screentone background, with a thin ink outline.
// Usage: node scripts/color-on-tone.mjs <colour.png> <tone.png> <cutout.png> <out.png>
//   colour  = the original crop, tone = the same crop run through screentone.mjs,
//   cutout  = the same crop with its background removed (alpha = the person).
import sharp from 'sharp';

const [, , colourPath, tonePath, cutPath, out] = process.argv;
const OUTLINE = 3; // px of ink around the person

const { width: W, height: H } = await sharp(colourPath).metadata();
const colour = await sharp(colourPath).ensureAlpha().raw().toBuffer();
const tone = await sharp(tonePath).resize(W, H).ensureAlpha().raw().toBuffer();
const alpha = await sharp(cutPath).resize(W, H).ensureAlpha().extractChannel(3).raw().toBuffer();

// mask = person, softened slightly at the edge; ring = mask grown by OUTLINE (separable max)
const mask = Uint8Array.from(alpha, (a) => (a < 90 ? 0 : a > 200 ? 255 : Math.round(((a - 90) / 110) * 255)));
const rows = new Uint8Array(W * H), ring = new Uint8Array(W * H);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  let m = 0;
  for (let k = Math.max(0, x - OUTLINE); k <= Math.min(W - 1, x + OUTLINE) && m < 255; k++) m = Math.max(m, mask[y * W + k]);
  rows[y * W + x] = m;
}
for (let x = 0; x < W; x++) for (let y = 0; y < H; y++) {
  let m = 0;
  for (let k = Math.max(0, y - OUTLINE); k <= Math.min(H - 1, y + OUTLINE) && m < 255; k++) m = Math.max(m, rows[k * W + x]);
  ring[y * W + x] = m;
}

const INK = [18, 17, 16];
const px = Buffer.alloc(W * H * 4);
for (let i = 0; i < W * H; i++) {
  const o = i * 4, a = mask[i] / 255, r = ring[i] > 128 ? 1 : 0;
  for (let c = 0; c < 3; c++) {
    const base = r ? INK[c] : tone[o + c];          // tone background, ink where the outline is
    px[o + c] = Math.round(colour[o + c] * a + base * (1 - a));
  }
  px[o + 3] = 255;
}
await sharp(px, { raw: { width: W, height: H, channels: 4 } }).removeAlpha().png({ compressionLevel: 9 }).toFile(out);
console.log(`✓ ${out} ${W}×${H}`);
