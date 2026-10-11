# Vikrant Sharma — Portfolio

Portfolio source for [vikrantsharma.info](https://vikrantsharma.info), with project case studies, credentials, a resume, and contact links.

## Stack

Astro 5, React 19, TypeScript, and Tailwind CSS 4. The site builds to static files for Cloudflare Pages.

## Local development

Use Node.js 20 or later and npm 10 or later.

```bash
npm ci
npm run dev
```

Astro serves the local preview at http://localhost:4321.

## Build and checks

```bash
npm run typecheck
npm run lint
npm run build
npm run preview
```

The production output is written to `dist/`. Development and build commands do not require a production database. Deployment configuration is in `wrangler.toml`; production credentials belong in the hosting provider's settings.

## Repository layout

- `src/pages/`: page routes and project case studies
- `src/components/`: shared site components
- `src/content/`: credentials and awards
- `src/styles/`: site styles
- `public/`: public assets, resumes, and hosting headers
