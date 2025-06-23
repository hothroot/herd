// @ts-check
import { defineConfig, envField } from 'astro/config';

import tailwindcss from "@tailwindcss/vite";

import react from "@astrojs/react";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  site: "https://astroherd.netlify.app/",

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      // Use react-dom/server.edge instead of react-dom/server.browser for React 19.
      // Without this, MessageChannel from node:worker_threads needs to be polyfilled.
      // https://github.com/withastro/astro/issues/12824
      alias: import.meta.env.PROD && {
        "react-dom/server": "react-dom/server.edge",
      },
    }
  },

  env: {
    schema: {
      STAGING: envField.boolean({ context: "server", access:"public", default: false }),
      FIVECALLS_API: envField.string({ context: "server", access:"secret" }),
      GOOGLE_TOKEN: envField.string({ context: "server", access:"secret" }),
    }
  },

  adapter: cloudflare(),
  
});