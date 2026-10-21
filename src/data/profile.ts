// Single source of truth for the site *and* the PDF resume.
// Edit here; both outputs update.

export type Node = { label: string; detail?: string; accent?: boolean };
export type Stage = { nodes: Node[]; via?: string }; // `via` labels the arrow INTO this stage
export type System = {
  id: string;
  title: string;
  kicker: string; // where/when, one line
  summary: string;
  metrics: { value: string; label: string }[];
  diagram: Stage[];
  constraint: string;
  decision: string;
  tradeoff: string;
  stack: string[];
  links: { label: string; href: string }[];
  resume: string[]; // bullet points used on the PDF
  name?: string; // plain project name for the PDF
  date?: string;
};

export const person = {
  name: 'Yogesh Kumar',
  role: 'Full-stack engineer',
  headline: 'I design how the pieces connect.',
  intro:
    'I build products end to end, and I care most about the parts in between: the pipelines, queues, tunnels and protocols that decide whether a product actually works. Lately I go deep on a small set of tools instead of skimming ten stacks.',
  location: 'Kolkata · from Gaya, Bihar',
  now: 'SDE intern at SystemStar Infotech · B.Tech CSE at Heritage Institute of Technology, ’28',
  email: 'fbyogesh111@gmail.com',
  phone: '+91-6204299438',
  showPhoneOnResume: true, // the website never shows the phone number
  links: {
    github: 'https://github.com/Coden-inja',
    linkedin: 'https://www.linkedin.com/in/yogesh-kumar-299298260/',
    x: 'https://x.com/Yoges_ai',
    peerlist: 'https://peerlist.io/yoges',
  },
};

export const education = {
  school: 'Heritage Institute of Technology, Kolkata',
  degree: 'B.Tech, Computer Science & Engineering',
  dates: '2024 – 2028',
  cgpa: null as string | null, // TODO: current CGPA (first-year YGPA was 9.02)
};

export const experience = [
  {
    company: 'SystemStar Infotech',
    role: 'Software Engineering Intern · 3D & Web',
    dates: 'Dec 2025 – Present',
    place: 'Remote',
    bullets: [
      'Built a 360° video web player in React and Three.js with camera controls and a modular component system.',
      'Built an FFmpeg pipeline that transcodes raw 4K footage into adaptive HLS streams.',
      'Cut segment length to 2 s (half the common 4 s default) to lower time-to-first-byte and start playback sooner.',
    ],
  },
];

export const systems: System[] = [
  {
    id: 'tts',
    name: 'Chatterbox TTS Pipeline',
    date: 'Jul 2026',
    title: 'Fitting a 48 GB voice model into 5 GB',
    kicker: 'Chatterbox TTS pipeline · 2026',
    summary:
      'Turning thousands of real-estate listings into AI voiceovers. The speech model’s memory grew with input length, so long listings crashed or hallucinated, and it needed 48 GB-class GPUs to survive.',
    metrics: [
      { value: '16–80 → 5 GB', label: 'VRAM, any input length' },
      { value: '−87%', label: 'infra cost' },
      { value: '2,655+', label: 'listings, zero OOM' },
    ],
    diagram: [
      { nodes: [{ label: 'MySQL', detail: 'listings' }] },
      { via: 'text', nodes: [{ label: 'Cleaner', detail: 'regex normalise' }] },
      { via: 'tokens', nodes: [{ label: 'Chatterbox T3', detail: 'text → speech tokens' }] },
      { via: 'chunks', nodes: [{ label: 'S3Gen', detail: 'bounded-memory chunks', accent: true }] },
      { via: 'audio', nodes: [{ label: 'BunnyCDN', detail: 'serve' }] },
    ],
    constraint:
      'S3Gen held the whole sequence in memory: 16 GB at baseline, 48–80 GB on long inputs. Position overflows at token boundaries also produced garbled “hallucinated” audio.',
    decision:
      'Rewrote S3Gen to run in bounded-memory chunks and patched the position and token-boundary handling, so memory stays flat regardless of length.',
    tradeoff:
      'Chunking adds stitching logic at the boundaries, but it gives memory a hard ceiling, and that ceiling is what moved inference from 48 GB accelerators to an RTX 3070.',
    stack: ['Python', 'PyTorch', 'CUDA', 'RunPod', 'MySQL', 'BunnyCDN'],
    links: [],
    resume: [
      'Rewrote S3Gen inference as bounded-memory chunked execution: VRAM went from 16 GB (48–80 GB on long inputs) to a stable ~5 GB at any length.',
      'Patched position overflows and token-boundary bugs, eliminating OOM crashes and voice hallucinations across 2,655+ automated listings.',
      'Moved deployment from 48 GB accelerators to consumer GPUs (RTX 3070, RunPod), cutting infra cost by 87%.',
    ],
  },
  {
    id: 'hls',
    title: 'A 360° player that starts fast',
    kicker: 'SystemStar Infotech · 2025–26',
    summary:
      '4K 360° video is heavy, and every second before the first frame loses a viewer. I built the player and the pipeline behind it.',
    metrics: [
      { value: '4K', label: '360° source footage' },
      { value: '2 s', label: 'HLS segments (vs 4 s)' },
      { value: 'ABR', label: 'adaptive bitrate ladder' },
    ],
    diagram: [
      { nodes: [{ label: 'Raw 4K', detail: '360° footage' }] },
      { via: 'transcode', nodes: [{ label: 'FFmpeg', detail: 'bitrate ladder' }] },
      { via: 'segment', nodes: [{ label: 'HLS', detail: '2 s chunks', accent: true }] },
      { via: 'cache', nodes: [{ label: 'CDN', detail: 'edge' }] },
      { via: 'stream', nodes: [{ label: 'Three.js player', detail: 'React · sphere' }] },
    ],
    constraint:
      'Generic CDN presets use ~4 s segments, so the player waits for a big first chunk of an already huge 4K stream before showing anything.',
    decision:
      'Custom preprocessing that segments streams into 2 s chunks across an adaptive bitrate ladder, played on a Three.js sphere with modular camera controls.',
    tradeoff:
      'Shorter segments mean more files and more playlist requests. In return, the first frame arrives sooner and quality switches react faster.',
    stack: ['React', 'Three.js', 'FFmpeg', 'HLS', 'CDN'],
    links: [], // TODO: add 3dnative.vercel.app if SystemStar is OK with it
    resume: [],
  },
  {
    id: 'laaf',
    name: 'CoralTeams · LAAF dev infra',
    date: 'May 2026',
    title: 'LAAF: infra from a potato laptop',
    kicker: 'CoralTeams · Coral hackathon · 2026',
    summary:
      'A self-hosted workspace search across GitHub, Jira, Slack and Docs. It needed a 1 GB+ Rust engine plus a 3 GB local LLM, and my laptop couldn’t run either.',
    metrics: [
      { value: '$0', label: 'per month' },
      { value: '3', label: 'free clouds, 2 tunnels' },
      { value: '4 GB+', label: 'stack, off-laptop' },
    ],
    diagram: [
      { nodes: [{ label: 'Laptop', detail: 'just the frontend', accent: true }] },
      { via: 'https', nodes: [{ label: 'ngrok', detail: 'tunnel A' }, { label: 'ngrok', detail: 'tunnel B' }] },
      {
        nodes: [
          { label: 'Codespaces', detail: 'FastAPI · Coral (Rust) · Postgres · Redis' },
          { label: 'Colab T4', detail: 'Ollama · Qwen 2.5' },
        ],
      },
    ],
    constraint:
      'No high-spec laptop, and cloud free tiers kept rejecting card verification. The stack couldn’t even be tested locally.',
    decision:
      'What I call CNG: SSH into GitHub Codespaces for the backend, run the LLM on Google Colab’s GPU, and expose both through ngrok. The laptop only renders the UI.',
    tradeoff:
      'Colab sessions expire and tunnel URLs rotate, so it’s a dev and test rig, not production. The same containers move to one persistent server later.',
    stack: ['Next.js', 'FastAPI', 'Rust', 'Postgres', 'Redis', 'Ollama', 'ngrok', 'ssh'],
    links: [
      { label: 'Demo video', href: 'https://youtu.be/c8SvU8hh4Xg' },
      { label: 'Code', href: 'https://github.com/Coden-inja/Coral-Workspace' },
      { label: 'Read the note', href: '/notes/laaf' },
    ],
    resume: [
      'Ran a 4 GB+ AI stack at $0/month by splitting it across GitHub Codespaces (FastAPI, Rust engine, Postgres, Redis) and a Colab GPU (Ollama), joined by ngrok tunnels.',
    ],
  },
  {
    id: 'n8n',
    name: 'Cursor for n8n',
    date: 'Jul – Sep 2025',
    title: 'Cursor for n8n',
    kicker: '1st prize · Ideatex, GDG on Campus HIT · 2025',
    summary:
      'Describe an automation in plain English, get a working n8n workflow. Built in five days with Soumyadeep Bhowmik.',
    metrics: [
      { value: 'First', label: 'of 400+ developers' },
      { value: '5 days', label: 'idea to pitch' },
      { value: 'RAG', label: 'over real node specs' },
    ],
    diagram: [
      { nodes: [{ label: 'Chrome ext', detail: 'prompt' }] },
      { via: 'MCP', nodes: [{ label: 'MCP server', detail: 'TypeScript' }] },
      { via: 'retrieve', nodes: [{ label: 'SQLite KB', detail: 'official n8n nodes', accent: true }] },
      { via: 'context', nodes: [{ label: 'LLM', detail: 'any provider' }] },
      { via: 'json', nodes: [{ label: 'n8n', detail: 'verified workflow' }] },
    ],
    constraint:
      'LLMs invent n8n node names and parameters, so the generated JSON looks right and fails on import.',
    decision:
      'An MCP server that retrieves real node definitions from n8n’s own SQLite knowledge base and grounds the model before it writes a single field.',
    tradeoff:
      'Grounding costs a retrieval step on every request. In exchange, workflows import and run on the first try.',
    stack: ['TypeScript', 'Node.js', 'MCP', 'RAG', 'SQLite'],
    links: [{ label: 'Code', href: 'https://github.com/Coden-inja/cursor-for-n8n' }],
    resume: [
      'Won 1st prize at Ideatex, GDG-HITK (400+ developers) for a Chrome extension that turns natural language into verified n8n workflow JSON.',
      'Grounded the LLM with an MCP server doing RAG over n8n’s official SQLite node knowledge base to eliminate hallucinated nodes.',
    ],
  },
  {
    id: 'alchemailyst',
    title: 'AlchEmaiLyst, and the community around it',
    kicker: 'Open source · GSSoC ’25 Project Admin',
    summary:
      'A three-agent email assistant that summarises, composes and sends. Then I opened it up through GirlScript Summer of Code and ran it as a project.',
    metrics: [
      { value: '{stars}★', label: 'GitHub stars' },
      { value: '30+', label: 'contributors onboarded' },
      { value: '#1', label: 'Alchemyst leaderboard' },
    ],
    diagram: [
      { nodes: [{ label: 'React UI', detail: 'Tailwind · shadcn' }] },
      { via: 'session', nodes: [{ label: 'Express proxy', detail: 'keys stay server-side', accent: true }] },
      { via: 'OAuth 2.0', nodes: [{ label: 'Gmail API' }, { label: 'LLM agents', detail: 'summarise · compose · send' }] },
    ],
    constraint:
      'Reading someone’s inbox means OAuth tokens and LLM API keys. Neither can ever reach the browser.',
    decision:
      'A thin Express proxy owns Google OAuth 2.0 and every LLM call. The UI only ever talks to the proxy.',
    tradeoff:
      'One more service to run, in exchange for a single place to secure, rate-limit and swap model providers.',
    stack: ['React', 'Express', 'OAuth 2.0', 'LLM agents'],
    links: [
      { label: 'Live', href: 'https://alchemailyst.vercel.app' },
      { label: 'Code', href: 'https://github.com/Coden-inja/alchEmaiLyst' },
    ],
    resume: [],
  },
];

export const openSource = {
  title: 'GirlScript Summer of Code ’25 · AlchEmaiLyst',
  role: 'Project Admin & community organiser',
  dates: 'Jul – Oct 2025',
  href: 'https://github.com/Coden-inja/alchEmaiLyst',
  bullets: [
    'Ran code reviews, untangled merge conflicts and onboarded 30+ contributors ({stars}★, 36 forks).',
    'Took the project from Top 10 to Rank 1 on the Alchemyst AI contributor leaderboard after opening it up via GSSoC.',
    'Built the Express backend with Google OAuth 2.0 for Gmail; grew a 1,000+ member developer Discord.',
  ],
};

// Smaller builds: shown as a compact list, not case studies.
export const builds = [
  { name: 'Fullstack Odyssey', what: 'Interactive simulators for the event loop, SQL joins, JWT rotation, Redis queues and Git’s DAG.', href: 'https://fullstack-odyssey.vercel.app' },
  { name: 'Lost & Found', what: 'Campus lost-and-found with Gemini auto-tagging and a scored matching engine. Built in 2 hours; won.', href: 'https://lost-and-found-pearl-theta.vercel.app' },
  { name: 'Receipts.sh', what: 'Telegram bot that logs promises in group chats, nudges before deadlines and deletes leaked API keys.', href: 'https://github.com/Coden-inja/whodidwhat' },
  { name: 'Moot Spiral Studio', what: 'Photos + music → 60 FPS Fibonacci-spiral video, rendered entirely in the browser.', href: 'https://fibo-anim.vercel.app' },
  { name: '3dWebImg', what: 'Any 2D image into a 360° panorama, fully client-side.', href: 'https://3dwebimg.vercel.app' },
  { name: 'ClimaVisor', what: 'Climate forecasts and history on an interactive 3D globe.', href: 'https://clima-visor.vercel.app' },
];

export const recognition = [
  { date: 'Jul 2026', event: 'TCS hackathon', result: 'Winner', note: 'Lost & Found, end to end in 2 hours' },
  { date: '2025', event: 'e-Summit ’25, EDC HITK', result: '1st runner-up ×2', note: 'Ideathon (Optiq) + Marketing Gimmick' },
  { date: 'Jul 2025', event: 'Ideatex, GDG on Campus HIT', result: '1st prize', note: 'Cursor for n8n · 400+ developers' },
  { date: 'Feb 2025', event: 'ACM Brainstorm quiz', result: '2nd runner-up', note: '' },
  { date: 'Dec 2024', event: 'Smart India Hackathon', result: 'Grand Finalist', note: 'Top 0.2% of 50k+ teams · team KrishiSahayak' },
  { date: 'Sep 2024', event: 'HackHeritage', result: '3rd of 200', note: 'SIH college prelims' },
];

export const moments = [
  { photo: 'sih', caption: 'SIH 2024 Grand Finale', sub: 'KrishiSahayak · Ministry of Fisheries, Animal Husbandry & Dairying', position: '50% 30%' },
  { photo: 'ideatex', caption: 'Ideatex, 1st prize', sub: 'GDG on Campus HIT · Session Zero 2025', position: '50% 55%' },
  { photo: 'esummit', caption: 'e-Summit ’25: two podiums', sub: 'EDC, Heritage Institute of Technology', position: '50% 40%' },
  { photo: 'tcs', caption: 'TCS hackathon win', sub: 'A two-hour build, after 8+ tries with the same partner', position: '50% 40%' },
];

// "Go deep, not wide": each tool earns its place with proof.
export const toolbelt = [
  { tool: 'ssh', proof: 'Remote dev in Codespaces over `gh codespace ssh`; port forwarding to reach services on remote boxes.' },
  { tool: 'ngrok / tunnels', proof: 'Joined three free clouds into one dev stack for LAAF.' },
  { tool: 'curl & HTTP', proof: 'Debugging APIs from the terminal; the timing card at the top of this page is the same idea.' },
  { tool: 'FFmpeg + HLS', proof: 'The 4K → adaptive-stream pipeline at SystemStar.' },
  { tool: 'TypeScript · Node', proof: 'MCP servers, Express proxies, OAuth flows.' },
  { tool: 'Python · PyTorch · CUDA', proof: 'Rewrote model inference to fit an 8 GB GPU.' },
  { tool: 'Postgres · MySQL · Redis', proof: 'Data and queues behind CoralTeams and the TTS pipeline.' },
  { tool: 'React · Three.js', proof: 'The 360° player; most of the interfaces above.' },
];

export const learning =
  'Right now: running my own VPS end to end (systemd, Caddy, Docker), Postgres internals, queues with retries and idempotency, and reading Designing Data-Intensive Applications.';

export const skillsForResume = [
  { k: 'Languages', v: 'TypeScript, Python, JavaScript, SQL, C, Java' },
  { k: 'Systems', v: 'Linux, ssh, ngrok, FFmpeg, HLS streaming, WebSockets, Git' },
  { k: 'Backend & data', v: 'Node.js, Express, FastAPI, Postgres, MySQL, Redis, SQLite' },
  { k: 'Frontend', v: 'React, Next.js, Three.js' },
  { k: 'AI infra', v: 'PyTorch, CUDA, RunPod, RAG, MCP, LLM agents' },
];
