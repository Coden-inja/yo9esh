// Single source of truth for the site *and* the PDF resume.
// Edit here; both outputs update.

// Diagrams are graphs on a grid: col = step left→right, row = lane (0.5 = centred
// between two lanes). Phones transpose it to top→bottom. Icons: see src/lib/icons.ts.
export type GNode = { id: string; label: string; detail?: string; icon?: string; col: number; row: number; accent?: boolean };
export type Edge = { from: string; to: string; label?: string; dashed?: boolean; both?: boolean }; // both = request/response
export type Graph = { nodes: GNode[]; edges: Edge[] };
export type System = {
  id: string;
  title: string;
  kicker: string; // where/when, one line
  summary: string;
  metrics: { value: string; label: string }[];
  diagram: Graph;
  constraint: string;
  decision: string;
  tradeoff?: string; // only when Yogesh has stated one himself
  featured?: boolean; // shown before "View more"
  image?: { key: string; alt: string }; // key into src/assets/projects
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
    'I build products end to end, and I care most about the parts in between: the pipelines, tunnels and protocols that decide whether a product actually works. Lately I go deep on a small set of tools instead of skimming ten stacks.',
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
  // Source: resume (VRAM/cost/listings numbers) + Coden-inja/regex-script (MySQL properties →
  // Node sanitizer → tts_clean_overview). T3 → S3Gen is Chatterbox's own two-stage design.
  {
    id: 'tts',
    featured: true,
    name: 'Chatterbox TTS Pipeline',
    date: 'Jul 2026',
    title: 'From a 48 GB server GPU to an 8 GB gaming card',
    kicker: 'Chatterbox TTS pipeline · 2026',
    summary:
      'Automated voiceovers for 2,655+ real-estate listings. Listing text is cleaned into speakable text, then voiced by Chatterbox, whose memory grew with input length until it needed a 48 GB RTX A6000.',
    metrics: [
      { value: '16–80 → 5 GB', label: 'VRAM, any input length' },
      { value: '−87%', label: 'infra cost' },
      { value: '2,655+', label: 'listings, zero OOM' },
    ],
    diagram: {
      nodes: [
        { id: 'db', label: 'MySQL', detail: 'listing text', icon: 'si:mysql', col: 0, row: 0 },
        { id: 'clean', label: 'Text sanitizer', detail: 'Node.js · spoken form', icon: 'si:nodedotjs', col: 1, row: 0 },
        { id: 't3', label: 'Chatterbox T3', detail: 'text → speech tokens', icon: 'my:model', col: 2, row: 0 },
        { id: 's3', label: 'S3Gen', detail: 'chunked · ~5 GB VRAM', icon: 'my:waveform', col: 3, row: 0, accent: true },
        { id: 'gpu', label: 'RTX 3070 · RunPod', detail: 'consumer GPUs', icon: 'si:nvidia', col: 2.5, row: 1 },
        { id: 'cdn', label: 'BunnyCDN', detail: 'voiceover audio', icon: 'si:bunnydotnet', col: 4, row: 0 },
      ],
      edges: [
        { from: 'db', to: 'clean', label: 'overview' },
        { from: 'clean', to: 't3', label: '≤150 words' },
        { from: 't3', to: 's3', label: 'tokens' },
        { from: 's3', to: 'cdn', label: 'audio' },
        { from: 't3', to: 'gpu', dashed: true },
        { from: 's3', to: 'gpu', dashed: true },
      ],
    },
    constraint:
      'VRAM use was 16 GB at baseline and grew to 48–80 GB on long inputs, causing OOM crashes. Position overflows at token boundaries caused voice hallucinations.',
    decision:
      'Transformed S3Gen into bounded-memory chunked execution and patched the position overflows and token boundaries, so VRAM stays at ~5 GB at any length. Upstream, a Node.js sanitizer turns each listing into speakable text (house numbers, dimensions, currency, acronyms) capped at ~150 words.',
    stack: ['Python', 'PyTorch', 'CUDA', 'RunPod', 'Node.js', 'MySQL', 'BunnyCDN'],
    links: [],
    resume: [
      'Rewrote S3Gen inference as bounded-memory chunked execution: VRAM went from 16 GB (48–80 GB on long inputs) to a stable ~5 GB at any length.',
      'Patched position overflows and token-boundary bugs, eliminating OOM crashes and voice hallucinations across 2,655+ automated listings.',
      'Moved deployment from 48 GB RTX A6000 GPUs to 8 GB consumer RTX 3070s on RunPod, cutting infra cost by 87%.',
    ],
  },
  // Source: resume + Coden-inja/video-chunks abr_processor.py (probe, encoder pick, ladder,
  // hls_time=2, GOP = fps×2 with sc_threshold=0, master.m3u8).
  {
    id: 'hls',
    featured: true,
    title: 'A 360° player that starts fast',
    kicker: 'SystemStar Infotech · 2025–26',
    summary: 'A 360° video web player and the video pipeline that feeds it, built at SystemStar.',
    metrics: [
      { value: '4K', label: '360° source footage' },
      { value: '2 s', label: 'HLS segments (vs 4 s)' },
      { value: 'ABR', label: '720p → 4K ladder' },
    ],
    diagram: {
      nodes: [
        { id: 'raw', label: 'Raw 4K 360°', detail: 'equirectangular', icon: 'my:sphere', col: 0, row: 0 },
        { id: 'ff', label: 'FFmpeg', detail: 'probe · pick encoder', icon: 'si:ffmpeg', col: 1, row: 0 },
        { id: 'abr', label: 'ABR ladder', detail: '720p → 4K · 2 s segments', icon: 'my:segments', col: 2, row: 0, accent: true },
        { id: 'cdn', label: 'CDN', detail: 'master.m3u8 + .ts', icon: 'my:edge', col: 3, row: 0 },
        { id: 'player', label: '360° player', detail: 'React · Three.js', icon: 'si:threedotjs', col: 4, row: 0 },
      ],
      edges: [
        { from: 'raw', to: 'ff' },
        { from: 'ff', to: 'abr', label: 'transcode' },
        { from: 'abr', to: 'cdn', label: 'HLS' },
        { from: 'cdn', to: 'player', label: 'stream' },
      ],
    },
    constraint:
      'Generic CDN defaults use 4-second segments, which slows time-to-first-byte and playback start for heavy 4K footage.',
    decision:
      'FFmpeg probes each source, picks the fastest available encoder (GPU when present) and transcodes an adaptive ladder from 720p up to 4K into HLS with 2-second segments. A keyframe is forced every 2 seconds so every rendition switches on the same boundaries, and a master playlist feeds the React + Three.js player.',
    stack: ['React', 'Three.js', 'FFmpeg', 'HLS', 'Python', 'CDN'],
    links: [],
    resume: [],
  },
  // Source: LinkedIn "potato laptop" post + Coden-inja/Coral-Workspace code (Vercel → ngrok A → FastAPI on
  // Codespaces → ngrok B → Ollama on Colab; semantic engine with Coral CLI on Render).
  {
    id: 'laaf',
    featured: true,
    name: 'CoralTeams',
    date: 'May 2026',
    title: 'A 4 GB AI stack from a potato laptop',
    kicker: 'CoralTeams · Coral hackathon · 2026',
    summary:
      'CoralTeams is a self-hostable Teams interface I built for Coral, which connects tools like GitHub, Jira and Slack. It ships with a Docker image. The stack needed a 1 GB+ Rust engine and a 3 GB local LLM, and my laptop couldn’t run either.',
    metrics: [
      { value: '$0', label: 'per month' },
      { value: '4', label: 'free platforms, 2 tunnels' },
      { value: '4 GB+', label: 'stack, off-laptop' },
    ],
    diagram: {
      nodes: [
        { id: 'web', label: 'Next.js', detail: 'Vercel', icon: 'si:vercel', col: 0, row: 0.5 },
        { id: 'api', label: 'FastAPI', detail: 'GitHub Codespaces', icon: 'si:github', col: 1, row: 0.5, accent: true },
        { id: 'engine', label: 'Semantic engine', detail: 'Render · Coral (Rust)', icon: 'si:rust', col: 2, row: 0 },
        { id: 'llm', label: 'Ollama · Qwen 2.5', detail: 'Google Colab T4', icon: 'si:googlecolab', col: 2, row: 1 },
      ],
      edges: [
        { from: 'web', to: 'api', label: 'ngrok A' },
        { from: 'api', to: 'engine', label: 'HTTPS' },
        { from: 'api', to: 'llm', label: 'ngrok B' },
        { from: 'engine', to: 'llm', label: 'ngrok B' },
      ],
    },
    constraint:
      'No high-spec laptop, and cloud free tiers kept rejecting card verification. The stack couldn’t even be tested locally.',
    decision:
      'The FastAPI backend runs in GitHub Codespaces (reached over SSH with the GitHub CLI), the LLM runs on Google Colab’s GPU, and ngrok tunnels expose both. The frontend sits on Vercel and the semantic engine with Coral on Render.',
    tradeoff:
      'Colab sessions expire and tunnel URLs rotate, so it’s for building and testing. Once everything works, it moves to a persistent server.',
    stack: ['Next.js', 'FastAPI', 'Rust', 'Ollama', 'Docker', 'ngrok', 'ssh'],
    links: [
      { label: 'Demo video', href: 'https://youtu.be/c8SvU8hh4Xg' },
      { label: 'Code', href: 'https://github.com/Coden-inja/Coral-Workspace' },
      { label: 'Read the note', href: '/notes/laaf' },
    ],
    resume: [
      'Built CoralTeams, a self-hostable Teams interface for Coral with a Docker image, and ran its 4 GB+ AI stack at $0/month across Vercel, GitHub Codespaces, Render and a Colab GPU joined by ngrok tunnels.',
    ],
  },
  // Source: Coden-inja/cursor-for-n8n (extension with Context7 n8n-docs retrieval; agents.ipynb
  // RAG over n8n node DB + FAISS templates → Gemini) + Ideatex post + resume.
  {
    id: 'n8n',
    name: 'Cursor for n8n',
    date: 'Jul – Sep 2025',
    title: 'Cursor for n8n',
    kicker: '1st prize · Ideatex, GDG on Campus HIT · 2025',
    summary:
      'Describe an automation in plain English, get an n8n workflow. A Chrome extension built in five days with Soumyadeep Bhowmik.',
    metrics: [
      { value: 'First', label: 'of 400+ developers' },
      { value: '5 days', label: 'idea to pitch' },
      { value: 'RAG', label: 'prototype over n8n nodes' },
    ],
    diagram: {
      nodes: [
        { id: 'ext', label: 'Chrome extension', detail: 'your prompt', icon: 'si:googlechrome', col: 0, row: 0.5 },
        { id: 'c7', label: 'Context7', detail: 'relevant n8n docs', icon: 'my:docs', col: 1, row: 0, accent: true },
        { id: 'llm', label: 'LLM', detail: 'Gemini, OpenAI, Claude…', icon: 'my:model', col: 1, row: 1 },
        { id: 'out', label: 'n8n workflow', detail: 'JSON to import', icon: 'si:n8n', col: 2, row: 0.5 },
      ],
      edges: [
        { from: 'ext', to: 'c7', label: 'docs', both: true },
        { from: 'ext', to: 'llm', label: 'prompt', both: true },
        { from: 'ext', to: 'out' },
      ],
    },
    constraint: 'LLMs hallucinate n8n nodes and parameters, so AI-generated workflows can’t be trusted.',
    decision:
      'Ground the model before it writes: the extension fetches the relevant n8n docs through Context7, adds them to the prompt for the chosen LLM, and returns workflow JSON ready to import. A RAG prototype went further, searching n8n’s node database and workflow templates (FAISS) with Gemini.',
    stack: ['JavaScript', 'Chrome extension', 'Python', 'RAG', 'FAISS', 'SQLite', 'Gemini'],
    links: [{ label: 'Code', href: 'https://github.com/Coden-inja/cursor-for-n8n' }],
    resume: [
      'Won 1st prize at Ideatex, GDG-HITK (400+ developers) for a Chrome extension that turns natural language into n8n workflow JSON.',
      'Grounded generation in n8n docs via Context7, and prototyped RAG over n8n’s node database and workflow templates (FAISS + Gemini).',
    ],
  },
  // Source: Calcutta Hacks post + screenshot (dock: Analyze Code → Generate Audio → Integrate).
  {
    id: 'agentsfx',
    name: 'AgentSFX · Godot add-on',
    date: 'Dec 2025',
    title: 'One-click game audio for Godot',
    kicker: 'Track winner · Calcutta Hacks · Dec 2025',
    summary:
      'Searching for and creating sound effects is a tedious part of making a game. We built a Godot add-on that creates SFX, character voices, NPC dialogue and BGM with AI and integrates them in one click. Team 4bajesonewale, with Soumyadeep Bhowmik, Harsh Sinha and Amlan Roy.',
    metrics: [
      { value: 'Track winner', label: 'Calcutta Hacks' },
      { value: '1 click', label: 'generate + integrate' },
      { value: '4', label: 'person team' },
    ],
    diagram: {
      nodes: [
        { id: 'game', label: 'Godot project', detail: 'scripts + screenshot', icon: 'si:godotengine', col: 0, row: 0.5 },
        { id: 'addon', label: 'AgentSFX dock', detail: 'inside the Godot editor', icon: 'my:plug', col: 1, row: 0.5, accent: true },
        { id: 'llm', label: 'LLM', detail: 'list of sounds + prompts', icon: 'my:model', col: 2, row: 0 },
        { id: 'el', label: 'ElevenLabs', detail: 'SFX · voices · BGM', icon: 'si:elevenlabs', col: 2, row: 1 },
      ],
      edges: [
        { from: 'game', to: 'addon', label: 'read/write', both: true },
        { from: 'addon', to: 'llm', label: 'analyse', both: true },
        { from: 'addon', to: 'el', label: 'generate', both: true },
      ],
    },
    constraint: 'Searching for and creating sound effects for a game is tedious.',
    decision:
      'An add-on inside the Godot editor: an LLM analyses the game’s code and a screenshot to list the sounds it needs, ElevenLabs generates them, and the add-on integrates everything into the code in one click.',
    stack: ['Godot', 'ElevenLabs', 'LLM'],
    links: [{ label: 'Demo', href: 'https://lnkd.in/g-gS6XbD' }],
    image: { key: 'agentsfx', alt: 'The AgentSFX dock in Godot listing generated sounds, next to the running platformer game' },
    resume: [
      'Track winner at Calcutta Hacks: a Godot add-on where an LLM reads the game’s code and screenshot, ElevenLabs generates the needed SFX, voices and BGM, and everything is integrated in one click.',
    ],
  },
  // Source: Coden-inja/alchEmaiLyst code (React SPA → Google OAuth/Gmail API; Alchemyst AI
  // with Gemini fallback; Summarizer / Composer / Spam cards) + GitHub stats + resume.
  {
    id: 'alchemailyst',
    title: 'AlchEmaiLyst, and the community around it',
    kicker: 'Open source · GSSoC ’25 Project Admin',
    summary:
      'An email assistant with three agents: Summarizer, Composer and Spam. Then I opened it up through GirlScript Summer of Code and ran it as a project.',
    metrics: [
      { value: '{stars}★', label: 'GitHub stars' },
      { value: '30+', label: 'contributors onboarded' },
      { value: '#1', label: 'Alchemyst leaderboard' },
    ],
    diagram: {
      nodes: [
        { id: 'ui', label: 'React app', detail: 'TypeScript · Tailwind', icon: 'si:react', col: 0, row: 0.5 },
        { id: 'gmail', label: 'Gmail API', detail: 'read · send', icon: 'si:gmail', col: 1, row: 0 },
        { id: 'al', label: 'Alchemyst AI', detail: 'Gemini as fallback', icon: 'my:model', col: 1, row: 1, accent: true },
      ],
      edges: [
        { from: 'ui', to: 'gmail', label: 'OAuth 2.0', both: true },
        { from: 'ui', to: 'al', label: 'prompts', both: true },
      ],
    },
    constraint: 'Help people get through their inbox: summarise mail, draft and send replies, and clear spam from one screen.',
    decision:
      'A React app that signs in with Google OAuth 2.0, reads and sends mail through the Gmail API, and uses Alchemyst AI for summaries and drafts, falling back to Gemini.',
    stack: ['React', 'TypeScript', 'Google OAuth 2.0', 'Gmail API', 'Alchemyst AI', 'Gemini'],
    links: [
      { label: 'Live', href: 'https://alchemailyst.vercel.app' },
      { label: 'Code', href: 'https://github.com/Coden-inja/alchEmaiLyst' },
    ],
    resume: [],
  },
  // Source: Slack-scheduler code (Socket Mode → Python → Ollama llama3.2 JSON intent →
  // Apps Script web app → Calendar → reply in Slack) + LinkedIn post.
  {
    id: 'schedulo',
    name: 'Schedulo · local-AI Slack bot',
    date: 'Jan 2026',
    title: 'A Slack scheduler with local AI',
    kicker: 'Schedulo · Slack bot · Jan 2026',
    summary:
      'Most companies won’t let internal data touch ChatGPT or Gemini. So I built a Slack bot that schedules meetings right inside Slack, with the AI running fully locally on Ollama.',
    metrics: [
      { value: 'Local', label: 'Llama 3.2 on Ollama' },
      { value: '0', label: 'cloud LLM calls' },
      { value: '3 files', label: '+ config to set up' },
    ],
    diagram: {
      nodes: [
        { id: 'slack', label: 'Slack', detail: '@mention', icon: 'my:chat', col: 0, row: 0 },
        { id: 'py', label: 'Python agent', detail: 'slack_sdk', icon: 'si:python', col: 1, row: 0 },
        { id: 'llm', label: 'Ollama', detail: 'Llama 3.2 · local', icon: 'si:ollama', col: 1, row: 1, accent: true },
        { id: 'gas', label: 'Apps Script', detail: 'web app', icon: 'si:googleappsscript', col: 2, row: 0 },
        { id: 'cal', label: 'Google Calendar', detail: 'new event', icon: 'si:googlecalendar', col: 3, row: 0 },
      ],
      edges: [
        { from: 'slack', to: 'py', label: 'Socket Mode', both: true },
        { from: 'py', to: 'llm', label: 'intent JSON', both: true },
        { from: 'py', to: 'gas', label: 'POST' },
        { from: 'gas', to: 'cal' },
      ],
    },
    constraint: 'Internal company data can’t be sent to cloud LLMs like ChatGPT or Gemini.',
    decision:
      'Slack talks to a Python agent over Socket Mode. A local Llama 3.2 on Ollama reads each mention and returns the intent, a summary and the start time as JSON. A Google Apps Script web app creates the Calendar event, and the bot confirms in Slack.',
    stack: ['Python', 'Ollama', 'Slack', 'Google Apps Script'],
    links: [{ label: 'Code', href: 'https://github.com/Coden-inja/Slack-scheduler' }],
    resume: [],
  },
];

// Diagrams for notes, keyed by the note's `system` frontmatter.
// laaf: the dev setup exactly as described in the LinkedIn post (laptop → 2 tunnels → 2 clouds).
export const noteDiagrams: Record<string, Graph> = {
  laaf: {
    nodes: [
      { id: 'laptop', label: 'Laptop', detail: 'frontend only', icon: 'my:laptop', col: 0, row: 0.5, accent: true },
      { id: 'ta', label: 'ngrok', detail: 'tunnel A', icon: 'si:ngrok', col: 1, row: 0 },
      { id: 'tb', label: 'ngrok', detail: 'tunnel B', icon: 'si:ngrok', col: 1, row: 1 },
      { id: 'cs', label: 'GitHub Codespaces', detail: 'heavy services', icon: 'si:github', col: 2, row: 0 },
      { id: 'colab', label: 'Google Colab', detail: 'LLM, up to ~16 GB VRAM', icon: 'si:googlecolab', col: 2, row: 1 },
    ],
    edges: [
      { from: 'laptop', to: 'ta' },
      { from: 'laptop', to: 'tb' },
      { from: 'ta', to: 'cs' },
      { from: 'tb', to: 'colab' },
    ],
  },
};

export const openSource = {
  title: 'GirlScript Summer of Code ’25 · AlchEmaiLyst',
  role: 'Project Admin & community organiser',
  dates: 'Jul – Oct 2025',
  href: 'https://github.com/Coden-inja/alchEmaiLyst',
  bullets: [
    'Ran code reviews, untangled merge conflicts and onboarded 30+ contributors ({stars}★, 36 forks).',
    'Took the project from Top 10 to Rank 1 on the Alchemyst AI contributor leaderboard after opening it up via GSSoC.',
    'Built the Gmail integration with Google OAuth 2.0 and the Alchemyst AI layer with a Gemini fallback; grew a 1,000+ member developer Discord.',
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
  { date: 'Dec 2025', event: 'Calcutta Hacks', result: 'Track winner', note: 'AgentSFX, AI game audio for Godot' },
  { date: 'Nov 2025', event: 'e-Summit ’25, EDC HITK', result: '1st runner-up ×2', note: 'Ideathon (Optiq) + Marketing Gimmick' },
  { date: 'Jul 2025', event: 'Ideatex, GDG on Campus HIT', result: '1st prize', note: 'Cursor for n8n · 400+ developers' },
  { date: 'Feb 2025', event: 'ACM Brainstorm quiz', result: '2nd runner-up', note: '', resume: false },
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
  { tool: 'ssh', proof: 'SSH into GitHub Codespaces with the GitHub CLI to run heavy services remotely.' },
  { tool: 'ngrok / tunnels', proof: 'Joined free clouds into one dev stack for CoralTeams.' },
  { tool: 'FFmpeg + HLS', proof: 'The 4K → adaptive-stream pipeline at SystemStar.' },
  { tool: 'TypeScript · Node', proof: 'The listing-text sanitizer behind the TTS pipeline; AlchEmaiLyst’s OAuth and Gmail flows.' },
  { tool: 'Python · PyTorch · CUDA', proof: 'Rewrote model inference to fit an 8 GB GPU.' },
  { tool: 'MySQL · SQLite', proof: 'MySQL in the TTS pipeline; the SQLite node knowledge base behind Cursor for n8n.' },
  { tool: 'React · Three.js', proof: 'The 360° player at SystemStar, ClimaVisor, 3dWebImg.' },
];

export const learning =
  'Right now: going deep on ssh, curl, ngrok and system design.';

export const skillsForResume = [
  { k: 'Languages', v: 'TypeScript, Python, JavaScript, SQL, C, Java' },
  { k: 'Systems', v: 'ssh, ngrok, FFmpeg, HLS streaming, WebSockets, Git, GCP, self-hosting' },
  { k: 'Backend & data', v: 'Node.js, Express, MySQL, SQLite, Firebase, BunnyCDN' },
  { k: 'Frontend', v: 'React, Next.js, Three.js' },
  { k: 'AI & compute', v: 'PyTorch, TensorFlow, CUDA, RunPod, RAG, MCP, LLM agents' },
];

// ---- anime redesign ----

// "Origin story" as anime episodes. Yogesh's own account (told 2026-10-22); dates from his
// resumes and posts. Keep each line short: these are title cards, not paragraphs.
export const episodes = [
  { ep: '01', title: 'Lockdown Boredom', jp: '退屈', when: 'Class 9', line: 'Started coding because the lockdown was boring. Quit after two months: too hard, no reason to keep going.' },
  { ep: '02', title: 'The Smartwatch', jp: '腕時計', when: 'Jan 2022', line: '78th of 400 at a GeeksforGeeks coding tournament. Won a smartwatch. Kept winning school contests, still built nothing.' },
  { ep: '03', title: 'The Finale', jp: '決勝', when: 'Dec 2024', line: 'First semester. Some luck, mostly groundwork: our team made the Smart India Hackathon Grand Finale. We lost, and I found a purpose: to win, and to build.', photo: 'sih' },
  { ep: '04', title: 'First Win', jp: '初勝利', when: 'Jul 2025', line: '1st prize at Ideatex with Cursor for n8n. Then Project Admin for AlchEmaiLyst in GSSoC.' },
  { ep: '05', title: 'Ship Before the Interview', jp: '先に作る', when: 'Dec 2025', line: 'Got an SDE internship at SystemStar by building a mock before the interview.', link: { label: 'Read it', href: '/notes/ship-before-the-interview' } },
  { ep: 'SP', title: 'Off the Keyboard', jp: '歌', when: 'Music', line: 'I sing, on stage whenever I get the chance.', photo: 'sing', special: true },
  { ep: '06', title: 'For the Love of Building', jp: '作る喜び', when: 'Now', line: '20+ hackathons later I stopped caring about winning.', quote: 'Building is the one thing I never get bored of.' },
];

// Interactive projects only, each bound to a key on the keyboard row.
export const sideQuests = [
  { key: 'q', name: '3dWebImg', what: 'Turn any photo into a 360° view', href: 'https://3dwebimg.vercel.app' },
  { key: 'w', name: 'Moot Spiral', what: 'Photos + a song → a Fibonacci-spiral video', href: 'https://fibo-anim.vercel.app' },
  { key: 'e', name: 'Fullstack Odyssey', what: 'Watch the event loop, SQL joins and Git move', href: 'https://fullstack-odyssey.vercel.app' },
  { key: 'r', name: 'ClimaVisor', what: 'Spin a 3D globe of climate data', href: 'https://clima-visor.vercel.app' },
  { key: 't', name: 'Lost & Found', what: 'Campus lost & found with a live map and AI auto-tagging', href: 'https://lost-and-found-pearl-theta.vercel.app' },
];

// Scrolling credits band under the hero.
export const achievements = [
  'SIH ’24 Grand Finalist', 'Ideatex 1st Prize', 'Calcutta Hacks Track Winner', 'TCS Hackathon Winner',
  'e-Summit ’25 · 2× Podium', 'GSSoC ’25 Project Admin', 'AlchEmaiLyst #1 · 42★', '20+ Hackathons', '120 WPM',
];
