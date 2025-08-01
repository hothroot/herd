// @ts-check
import { defineConfig, envField } from 'astro/config';

import tailwindcss from "@tailwindcss/vite";

import react from "@astrojs/react";

import netlify from "@astrojs/netlify";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  integrations: [react(), sitemap()],
  site: "https://herdonthehill.com/",

  vite: {
    plugins: [tailwindcss()],
  },
  
  prefetch: {
    defaultStrategy: 'viewport',
  },

  env: {
    schema: {
      STAGING: envField.boolean({ context: "server", access:"public", default: false }),
      FIVECALLS_API: envField.string({ context: "server", access:"secret" }),
      SERVICE_KEY: envField.string({ context: "server", access:"secret" }),
      DRIVE_ID: envField.string({ context: "server", access:"secret" }),
      // random, generate with `openssl rand -hex N`, or use any string for dev
      ENVELOPE_KEY: envField.string({ context: "server", access:"secret" }),
    }
  },

  adapter: netlify(),
});