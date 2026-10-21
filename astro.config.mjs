import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://yo9esh.tech',
  // /og is only the source for the link-preview image, not a real page
  integrations: [sitemap({ filter: (page) => !page.endsWith('/og/') })],
});
