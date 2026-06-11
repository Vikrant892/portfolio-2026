import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const certifications = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "./src/content/certifications",
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string().min(1).max(120),
      issuer: z.string().min(1).max(80),
      issuedAt: z.coerce.date(),
      expiresAt: z.coerce.date().optional(),
      credentialId: z.string().optional(),
      verifyUrl: z.string().url().optional(),
      imageUrl: z.string().url().optional(),
      logo: z.object({ src: image(), alt: z.string() }).optional(),
      certImage: image().optional(),
      tags: z.array(z.string()).default([]),
      featured: z.boolean().default(false),
      order: z.number().int().default(100),
    }),
});

const awards = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/awards" }),
  schema: ({ image }) =>
    z.object({
      title: z.string().min(1).max(120),
      organisation: z.string().min(1).max(120),
      year: z.coerce.number().int(),
      tier: z
        .enum([
          "Winner",
          "Runner-up",
          "Podium",
          "Finalist",
          "Honourable Mention",
          "Other",
        ])
        .optional(),
      url: z.string().url().optional(),
      imageUrl: z.string().url().optional(),
      logo: z.object({ src: image(), alt: z.string() }).optional(),
      featured: z.boolean().default(false),
    }),
});

const projects = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/projects" }),
  schema: ({ image }) =>
    z.object({
      title: z.string().min(1).max(120),
      category: z.string().min(1).max(60),
      summary: z.string().min(20).max(280),
      stack: z.array(z.string()).min(1),
      highlights: z.array(z.string()).min(1).max(8),
      githubUrl: z.string().url().optional(),
      liveUrl: z.string().url().optional(),
      hero: z.object({ src: image(), alt: z.string() }).optional(),
      order: z.number().int().default(100),
      featured: z.boolean().default(false),
    }),
});

export const collections = { certifications, awards, projects };
