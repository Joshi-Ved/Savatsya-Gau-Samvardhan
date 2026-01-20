import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";


export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5000'
    },
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
    }
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
});
