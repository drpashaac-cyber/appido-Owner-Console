import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// APPIDO owner console — modular SPA build.
export default defineConfig({
  plugins: [react()],
  base: "/",
  build: {
    target: "es2020",
    outDir: "dist",
    sourcemap: false,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1200,
  },
  server: { port: 5173 },
  preview: { port: 4173 },
});