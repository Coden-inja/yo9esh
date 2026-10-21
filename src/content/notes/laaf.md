---
title: 'LAAF: running a 4 GB AI stack from a potato laptop'
description: 'No GPU, no credit card, no problem. Codespaces + Colab + ngrok, and the laptop only renders the UI.'
order: 1
system: laaf
tag: infra
---

Our project for the Coral hackathon had two heavy parts:

- a backend built on the **Coral engine** (1 GB+, Rust)
- a **local LLM** (around 3 GB)

I couldn't deploy them. I couldn't even *test* them. My options were:

1. Own a laptop with giga specs. I don't. 🫠
2. Verify a credit card on a cloud provider for the free tier. That failed most times.
3. Stop treating the laptop as the computer.

## Remember "CNG"

- **C**olab (Google): free GPU, enough to run an LLM up to ~16 GB VRAM.
- **N**grok: tunnels that give a private port a public URL.
- **G**itHub Codespaces: a real Linux box with decent specs.

**Backend:** SSH into a Codespace with the GitHub CLI (`gh codespace ssh`) and run the heavy services there: FastAPI, the Coral engine, Postgres, Redis. Tunnel the port out through ngrok.

**Model:** run Ollama in Colab and expose it through a second ngrok tunnel.

**Laptop:** just the frontend, pointed at both URLs.

```text
 Codespaces ──ngrok A──┐
                       ├──▶ laptop (frontend only)
 Colab GPU  ──ngrok B──┘
```

I call it **LAAF: Laptop As A Frontend**. The heavy lifting goes to cloud providers, for free.

## What it's good for, and what it isn't

It's a **dev and test rig**. Colab sessions time out, tunnel URLs change unless you pin a static domain, and Codespaces sleep when idle. Once the system works end to end, the same services move to one persistent server.

The useful idea outlasts the hack: *where* a service runs is a deployment detail. If every piece talks over HTTP and nothing assumes `localhost`, you can move the pieces around freely.
