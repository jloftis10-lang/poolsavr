import { defineCollection } from 'astro:content';
import { z } from 'zod';
import { glob } from 'astro/loaders';
import { DEFAULT_AUTHOR } from './data/authors';

/**
 * Typed frontmatter is what stops page forty shipping without a meta
 * description. The limits mirror the spec: title ≤ 60, description ≤ 155.
 */
const editorialBase = z.object({
  title: z.string().max(60),
  description: z.string().max(155),
  /** The query this page exists to answer. One per page. */
  targetKeyword: z.string(),
  publishDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  author: z.string().default(DEFAULT_AUTHOR),
  /** Rendered as the snippet-bait paragraph under the H1. */
  answer: z.string().max(400),
  sources: z
    .array(
      z.object({
        title: z.string(),
        publisher: z.string(),
        url: z.string().url(),
        accessed: z.string().optional(),
      }),
    )
    .default([]),
  draft: z.boolean().default(false),
});

const costs = defineCollection({
  loader: glob({ base: './src/content/costs', pattern: '**/*.{md,mdx}' }),
  schema: editorialBase.extend({
    /** Drives the "the number, immediately" block and the meta description. */
    priceLow: z.number(),
    priceHigh: z.number(),
    priceUnit: z.string().default('for most pools'),
    costTable: z
      .array(
        z.object({
          size: z.string(),
          squareFeet: z.string().optional(),
          low: z.number(),
          high: z.number(),
        }),
      )
      .default([]),
  }),
});

const guides = defineCollection({
  loader: glob({ base: './src/content/guides', pattern: '**/*.{md,mdx}' }),
  schema: editorialBase.extend({
    /** care | remodeling — which pillar this belongs to. */
    pillar: z.enum(['care', 'remodeling']),
    /** Populates HowTo schema when the guide is step-based. */
    steps: z
      .array(z.object({ name: z.string(), text: z.string() }))
      .default([]),
    relatedCalculator: z.string().optional(),
  }),
});

const metros = defineCollection({
  loader: glob({ base: './src/content/metros', pattern: '**/*.{md,mdx}' }),
  schema: editorialBase.extend({
    city: z.string(),
    state: z.string(),
    stateCode: z.string().length(2),
    /** Must differ from the national range, or the page is a doorway page. */
    localPriceLow: z.number(),
    localPriceHigh: z.number(),
    swimSeasonMonths: z.number(),
    waterHardness: z.string(),
    typicalPoolAge: z.string(),
    permitNotes: z.string(),
    nearbyMetros: z.array(z.string()).default([]),
  }),
});

export const collections = { costs, guides, metros };
