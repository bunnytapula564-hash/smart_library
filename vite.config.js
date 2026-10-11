import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Dev-only proxy: the browser calls /ollama-api/* on localhost, Vite forwards it
// to https://ollama.com/api/*. Same origin => no CORS problem while developing.
// In production the same path is handled by the rewrite in netlify.toml.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    proxy: {
      "/ollama-api": {
        target: "https://ollama.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ollama-api/, "/api")
      }
    }
  },
  preview: { port: 4173 },
  build: { outDir: "dist", sourcemap: false }
});
