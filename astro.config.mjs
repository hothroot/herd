// @ts-check
import { defineConfig, envField } from 'astro/config';

import tailwindcss from "@tailwindcss/vite";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  site: "https://astroherd.netlify.app/",
  vite: {
    plugins: [tailwindcss()],
  },
  env: {
    schema: {
      STAGING: envField.boolean({ context: "server", access:"public", default: false }),
      FIVECALLS_API: envField.string({ context: "server", access:"secret" }),
    }
  },
});