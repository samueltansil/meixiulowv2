import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
console.log("Client Vite config loaded, __dirname:", __dirname);

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: [
      { find: "@", replacement: path.resolve(__dirname, "src") },
      { find: "@shared", replacement: path.resolve(__dirname, "../shared") },
      { find: "@assets", replacement: path.resolve(__dirname, "../attached_assets") },
    ],
  },
  css: {
    postcss: {
      plugins: [],
    },
  },
  root: __dirname,
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
    ssrManifest: true,
  },
  server: {
    host: "0.0.0.0",
    port: 5000,
    allowedHosts: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
