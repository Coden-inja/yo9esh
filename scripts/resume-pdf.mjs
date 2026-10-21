// Builds the site, serves it, and prints /resume to public/yogesh-kumar-resume.pdf
// with headless Chrome (or Edge). Re-run whenever src/data/profile.ts changes.
import { spawn, execFileSync } from 'node:child_process';
import { existsSync, copyFileSync } from 'node:fs';
import { resolve } from 'node:path';

const PORT = 4329;
const OUT = resolve('public/yogesh-kumar-resume.pdf');

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
try {
  const url = `http://localhost:${PORT}/resume`;
  for (let i = 0; i < 50; i++) {
    try { if ((await fetch(url)).ok) break; } catch {}
    await new Promise((r) => setTimeout(r, 300));
  }
  execFileSync(browser, [
    '--headless=new', '--disable-gpu', '--no-pdf-header-footer',
    `--print-to-pdf=${OUT}`, '--virtual-time-budget=4000', url,
  ], { stdio: 'inherit' });
  // keep dist in sync so the next deploy ships the fresh PDF without a rebuild
  copyFileSync(OUT, resolve('dist/yogesh-kumar-resume.pdf'));
  console.log(`✓ ${OUT}`);
} finally {
  if (process.platform === 'win32') {
    try { execFileSync('taskkill', ['/pid', String(server.pid), '/T', '/F'], { stdio: 'ignore' }); } catch {}
  } else server.kill();
}
