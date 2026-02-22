import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // When deployed to GitHub Pages the site lives at /watermark/
  base: process.env.GITHUB_ACTIONS ? "/watermark/" : "/",
  plugins: [react()],
  build: {
    target: "es2020",
    outDir: "dist",
    sourcemap: false,
  },
});
