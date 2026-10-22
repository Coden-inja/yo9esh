---
title: 'Running a 4 GB AI stack from a potato laptop'
description: 'A no-card, no-hassle way to run heavy services: Codespaces + Colab + ngrok, with the laptop as just the frontend.'
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

**Backend:** SSH into a Codespace with the GitHub CLI and run any heavy service there. Tunnel its port out through ngrok.

**Model:** run Ollama in Colab and expose it through a second ngrok tunnel.

**Laptop:** just the frontend, pointed at both URLs.

Test it all, then switch to a persistent server later.

The heavy lifting goes to cloud providers, for free.
