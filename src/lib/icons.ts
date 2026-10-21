// Build-time icon lookup → inline SVG string. Zero runtime JS.
//   'si:mysql'  → real brand logo from Simple Icons (CC0)
//   'my:laptop' → this site's own icon set, drawn below: 1.6px rounded ink
//                 strokes with one marigold accent (classes styled in global.css)
import * as si from 'simple-icons';

type SimpleIcon = { slug: string; path: string };
const brands = new Map<string, SimpleIcon>();
for (const v of Object.values(si) as unknown[]) {
  const icon = v as SimpleIcon;
  if (icon && typeof icon === 'object' && icon.slug) brands.set(icon.slug, icon);
}

// .a = accent fill, .af = accent fill + ink stroke, .as = accent stroke,
// .s = soft accent fill, .bg = surface fill (hides lines behind a shape)
const own: Record<string, string> = {
  // laptop with a terminal prompt on screen
  laptop: `<rect x="4.5" y="5" width="15" height="10.5" rx="1.5" class="s"/><path d="M2.5 19h19l-1.6-3.5H4.1z"/><path d="M8 8.7l2.2 1.6L8 11.9" class="as"/><path d="M12 12h3.5"/>`,
  // two rack units with status LEDs
  server: `<rect x="4" y="4" width="16" height="7" rx="1.5" class="bg"/><rect x="4" y="13" width="16" height="7" rx="1.5" class="bg"/><circle cx="7.5" cy="7.5" r="1.2" class="a"/><circle cx="7.5" cy="16.5" r="1.2" class="a"/><path d="M11 7.5h5.5M11 16.5h5.5"/>`,
  // speech waveform, loudest bars in accent
  waveform: `<path d="M3.5 10.5v3M7 7.5v9M17 6.5v11M20.5 10v4"/><path d="M10.4 4v16M13.7 8v8" class="as"/>`,
  // 360° footage: sphere with an accent equator
  sphere: `<circle cx="12" cy="12" r="8.5"/><ellipse cx="12" cy="12" rx="8.5" ry="3.2" class="as"/><path d="M12 3.5c2.4 2.5 3.4 5.3 3.4 8.5s-1 6-3.4 8.5" opacity=".45"/>`,
  // HLS: a stream cut into segments, one highlighted
  segments: `<rect x="2.5" y="7.5" width="4.3" height="9" rx="1"/><rect x="7.6" y="7.5" width="4.3" height="9" rx="1" class="af"/><rect x="12.7" y="7.5" width="4.3" height="9" rx="1"/><rect x="17.8" y="7.5" width="3.7" height="9" rx="1" opacity=".5"/>`,
  // edge network: globe with two accent PoPs
  edge: `<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.6 2.4 3.8 5.2 3.8 8.5s-1.2 6.1-3.8 8.5c-2.6-2.4-3.8-5.2-3.8-8.5S9.4 5.9 12 3.5z"/><circle cx="6.2" cy="8" r="1.7" class="a"/><circle cx="17.6" cy="15.6" r="1.7" class="a"/>`,
  // a model as a tiny node graph, centre node lit
  model: `<path d="M6 6.5l6 5.5M6 17.5l6-5.5M12 12h6.5"/><circle cx="6" cy="6.5" r="2.3" class="bg"/><circle cx="6" cy="17.5" r="2.3" class="bg"/><circle cx="18.5" cy="12" r="2.3" class="bg"/><circle cx="12" cy="12" r="2.6" class="af"/>`,
  // add-on: a plug
  plug: `<path d="M9 3v4M15 3v4M12 16v5"/><path d="M6.5 7h11v3.5a5.5 5.5 0 0 1-11 0z" class="s"/><circle cx="12" cy="10.6" r="1.3" class="a"/>`,
  // team chat: bubble with a channel #
  chat: `<path d="M4 5h16a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 20 17h-9.5l-4.5 3.5V17H4a1.5 1.5 0 0 1-1.5-1.5v-9A1.5 1.5 0 0 1 4 5z" class="s"/><path d="M10.6 8.2l-1 6.3M14.4 8.2l-1 6.3M8.3 10h7.4M7.9 12.7h7.4" class="as"/>`,
  // documentation: a page with a folded corner and an accent heading line
  docs: `<path d="M6 3h8.5L19 7.5V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" class="bg"/><path d="M14.5 3v4.5H19"/><path d="M8.5 11h7" class="as"/><path d="M8.5 14.5h7M8.5 17.5h4.5"/>`,
  // LinkedIn isn't in Simple Icons, so a plain "in" mark in the same style
  linkedin: `<rect x="3" y="3" width="18" height="18" rx="3.5"/><path d="M8 10.5V16M8 7.6v.1M11.5 16v-5.5M11.5 13c0-1.7 1-2.6 2.3-2.6s2.2.9 2.2 2.6V16"/>`,
};

export function icon(name: string): string {
  const [set, id] = name.split(':');
  if (set === 'si') {
    const b = brands.get(id);
    if (!b) throw new Error(`Unknown Simple Icon: ${id}`);
    return `<svg viewBox="0 0 24 24" class="ic" fill="currentColor" aria-hidden="true"><path d="${b.path}"/></svg>`;
  }
  if (set === 'my') {
    const body = own[id];
    if (!body) throw new Error(`Unknown site icon: ${id}`);
    return `<svg viewBox="0 0 24 24" class="ic own" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
  }
  throw new Error(`Icon must be si:<slug> or my:<name>, got ${name}`);
}
