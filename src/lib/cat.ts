// Pixel cat for the browser tab (Yogesh's favourite animal). 16×10 grids drawn as SVG:
// X = body (red so it reads on light and dark tab bars), o = eye, c = collar.
const INK = '#121110';
const RED = '#e1261c';
const PAPER = '#f3ece0';

const FRAMES = {
  sit: [
    '................',
    '.....X.X........',
    '.....XXX........',
    '....XXXXX.......',
    '....XoXXXc......',
    '.....XXXXX...X..',
    '.....XXXXXX..X..',
    '....XXXXXXXX.X..',
    '....XXXXXXXXXX..',
    '....XX.XX.......',
  ],
  sitBlink: [
    '................',
    '.....X.X........',
    '.....XXX........',
    '....XXXXX.......',
    '....XXXXXc......',
    '.....XXXXX...X..',
    '.....XXXXXX..X..',
    '....XXXXXXXX.X..',
    '....XXXXXXXXXX..',
    '....XX.XX.......',
  ],
  runA: [
    '................',
    '...X.X..........',
    '...XXX..........',
    '..XXXXX.......XX',
    '..XoXXXc.....X..',
    '...XXXXXXXXXXX..',
    '....XXXXXXXXXX..',
    '...XX......XX...',
    '..X..........XX.',
    '................',
  ],
  runB: [
    '................',
    '................',
    '...X.X..........',
    '...XXX........X.',
    '..XXXXX......X..',
    '..XoXXXcXXXXXX..',
    '...XXXXXXXXXXX..',
    '....XX.XX.XX....',
    '.....X.X..X.X...',
    '................',
  ],
  sleep: [
    '................',
    '................',
    '................',
    '......XX.X......',
    '....XXXXXXX.....',
    '...XXXXXXXXX....',
    '..XXXXXXXXXXX...',
    '..XXXXXXXXXXXX..',
    '...XXXXXXXXXXX..',
    '................',
  ],
};
export type CatFrame = keyof typeof FRAMES;

/** One frame as an SVG string. `x` slides it sideways, `y` bobs it, `flip` faces it right, `zz` draws sleep z's, `note` a music note. */
export function cat(frame: CatFrame, { x = 0, y = 0, flip = false, zz = 0, note = false } = {}): string {
  const px = 4, top = 20 + y;
  const cells = FRAMES[frame]
    .flatMap((row, r) => [...row].map((ch, c) => ({ ch, cx: (flip ? 60 - c * px : c * px) + x, cy: r * px + top })))
    .filter((p) => p.ch !== '.');
  // ink outline under the pixels keeps the shape on any tab colour
  const outline = cells.map((p) => `<rect x="${p.cx - 1}" y="${p.cy - 1}" width="${px + 2}" height="${px + 2}" fill="${INK}"/>`).join('');
  const body = cells.map((p) => `<rect x="${p.cx}" y="${p.cy}" width="${px}" height="${px}" fill="${p.ch === 'X' ? RED : PAPER}"/>`).join('');
  const z = zz
    ? `<g font-family="Arial Black,Arial,sans-serif" font-weight="900" fill="${RED}" stroke="${PAPER}" stroke-width="1" paint-order="stroke" shape-rendering="auto"><text x="44" y="${22 - zz}" font-size="14">z</text>${zz > 2 ? `<text x="53" y="${13 - zz / 2}" font-size="11">z</text>` : ''}</g>`
    : '';
  const n = note
    ? `<path d="M50 4 v10.5 a3 3 0 1 1 -2 -2.8 v-5.7 l7 -2 v7.5 a3 3 0 1 1 -2 -2.8 v-3.7z" fill="${RED}" stroke="${PAPER}" stroke-width="1.2" stroke-linejoin="round" shape-rendering="auto"/>`
    : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" shape-rendering="crispEdges">${outline}${body}${z}${n}</svg>`;
}

