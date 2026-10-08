// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import { SITE } from "./src/config.ts";

// https://astro.build/config
export default defineConfig({
  site: SITE.url,
  integrations: [
    sitemap({
      // The thank-you page is only reached after a form submission.
      filter: (page) => !page.includes("/thanks/"),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
