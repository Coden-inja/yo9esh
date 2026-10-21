import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const notes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number(),
    system: z.string().optional(), // id from profile.systems; renders its diagram
    tag: z.string(),
  }),
});

export const collections = { notes };
