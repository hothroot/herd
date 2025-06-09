// @ts-check
import { defineConfig, envField } from 'astro/config';

import tailwindcss from "@tailwindcss/vite";

import react from "@astrojs/react";

import netlify from "@astrojs/netlify";

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
      DRIVE_CREDENTIALS: envField.string({ context: "server", access:"secret" }),
      GOOGLE_TOKEN: envField.string({ context: "server", access:"secret" }),
    }
  },

  adapter: netlify(),
});