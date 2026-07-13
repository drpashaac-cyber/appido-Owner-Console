import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/os",
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