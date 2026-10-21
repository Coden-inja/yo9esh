import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const notes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number(),
    system: z.string().optional(), // key in profile.noteDiagrams; renders that diagram
    tag: z.string(),
  }),
});

export const collections = { notes };
