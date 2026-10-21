// Builds the site, serves it, and renders the generated assets with headless Chrome:
//   /resume → public/yogesh-kumar-resume.pdf
//   /og     → public/og.jpg              (1200×630 link-preview card)
//   favicon → public/apple-touch-icon.png
// Re-run whenever src/data/profile.ts or the card design changes, then commit public/.
import { spawn, execFileSync } from 'node:child_process';
import { existsSync, copyFileSync, mkdtempSync, readFileSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import sharp from 'sharp';

const PORT = 4329;
const PDF = resolve('public/yogesh-kumar-resume.pdf');
const OG = resolve('public/og.jpg');
const TOUCH = resolve('public/apple-touch-icon.png');

const browsers = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);
const browser = browsers.find((p) => existsSync(p));
if (!browser) throw new Error('No Chrome/Edge found. Set CHROME_PATH.');

const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
execFileSync(npx, ['astro', 'build'], { stdio: 'inherit', shell: process.platform === 'win32' });

const server = spawn(npx, ['astro', 'preview', '--port', String(PORT)], { stdio: 'ignore', shell: process.platform === 'win32' });
const base = `http://localhost:${PORT}`;
const chrome = (...args) => execFileSync(browser, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--virtual-time-budget=4000', ...args], { stdio: 'ignore' });

try {
  for (let i = 0; i < 50; i++) {
    try { if ((await fetch(`${base}/resume`)).ok) break; } catch {}
    await new Promise((r) => setTimeout(r, 300));
  }

  chrome('--no-pdf-header-footer', `--print-to-pdf=${PDF}`, `${base}/resume`);
  console.log(`✓ ${PDF}`);

  const shot = join(mkdtempSync(join(tmpdir(), 'og-')), 'og.png');
  chrome('--window-size=1200,630', '--force-device-scale-factor=1', `--screenshot=${shot}`, `${base}/og`);
  // JPEG keeps it well under WhatsApp's ~300 KB preview limit
  await sharp(shot).resize(1200, 630).jpeg({ quality: 86, mozjpeg: true }).toFile(OG);
  console.log(`✓ ${OG} (${Math.round(statSync(OG).size / 1024)} KB)`);

  await sharp(readFileSync(resolve('public/favicon.svg')), { density: 600 }).resize(180, 180).png().toFile(TOUCH);
  console.log(`✓ ${TOUCH}`);

  // keep dist in sync so a deploy of this build ships the fresh files
  for (const f of [PDF, OG, TOUCH]) copyFileSync(f, resolve('dist', f.split(/[\\/]/).pop()));
} finally {
  if (process.platform === 'win32') {
    try { execFileSync('taskkill', ['/pid', String(server.pid), '/T', '/F'], { stdio: 'ignore' }); } catch {}
  } else server.kill();
}
