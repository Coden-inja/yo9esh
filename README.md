# yo9esh

Portfolio of Yogesh Kumar: full-stack engineer who designs how the pieces connect.

Astro, static output, no client framework. The only JavaScript is the theme toggle and the live load-timing card.

## Edit content

Everything lives in **`src/data/profile.ts`**: case studies, diagrams, recognition, tools, resume bullets. The site and the PDF resume both read from it.

- **Case study diagram:** `diagram` is a list of stages; each stage has one or more nodes. `via` labels the arrow into that stage. Set `accent: true` on the node that holds the key decision.
- **Notes:** add a Markdown file to `src/content/notes/`. Set `system: <id>` to show that case study's diagram on top.
- **Photos:** `src/assets/photos/`. They're optimised to WebP at build time.

## Commands

```sh
npm run dev      # localhost:4321
npm run build    # → dist/
npm run assets   # rebuilds, then renders with headless Chrome:
                 #   /resume → public/yogesh-kumar-resume.pdf
                 #   /og     → public/og.jpg (1200×630 link-preview card)
                 #   favicon → public/apple-touch-icon.png
```

Run `assets` after changing `profile.ts` or the card in `src/pages/og.astro`, and commit `public/`.

## SEO and link previews

`src/layouts/Base.astro` sets the canonical URL, Open Graph and Twitter tags (image: `og.jpg`), and Person structured data on the home page. `@astrojs/sitemap` writes `sitemap-index.xml`, and `public/robots.txt` points to it.

WhatsApp and LinkedIn cache previews. After changing the card, refresh it with the [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/). WhatsApp picks up the change for new shares after a while.

## Deploy

Vercel, imported from GitHub (Astro is auto-detected). Live at **https://yo9esh.tech**. If the domain changes, update `site` in `astro.config.mjs` and re-run `resume:pdf`.
