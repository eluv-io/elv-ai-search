import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import {viteStaticCopy} from "vite-plugin-static-copy";
import {fileURLToPath, URL} from "url";

let base = {}

if (process.env.ELV_AI_SEARCH_BASE) {
  base["base"] = process.env.ELV_AI_SEARCH_BASE
}

export default defineConfig({
  ...base,
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: "configuration.js",
          dest: ""
        }
      ]
    })
  ],
  build: {
    manifest: true
  },
  server: {
    port: process.env.ELV_AI_SEARCH_PORT || 3001,
    host: true
  },
  resolve: {
    alias: {
      "@/components": fileURLToPath(new URL("./src/components", import.meta.url)),
      "@/assets": fileURLToPath(new URL("./src/assets", import.meta.url)),
      "@/pages": fileURLToPath(new URL("./src/pages", import.meta.url)),
      "@/stores": fileURLToPath(new URL("./src/stores", import.meta.url)),
      "@/utils": fileURLToPath(new URL("./src/utils", import.meta.url)),
      "@/hooks": fileURLToPath(new URL("./src/hooks", import.meta.url))
    }
  }
});
