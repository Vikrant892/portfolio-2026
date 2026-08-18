// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://vikrantsharma.info",
  trailingSlash: "never",
  output: "static",
  build: {
    format: "file",
  },
  integrations: [
    react(),
    mdx(),
    sitemap({
      filter: (page) => !page.includes("/404"),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: [
        "@fontsource-variable/inter",
        "@fontsource-variable/space-grotesk",
        "@fontsource-variable/jetbrains-mono",
      ],
    },
  },
});
