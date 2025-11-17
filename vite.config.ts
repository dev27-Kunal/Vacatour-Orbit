import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  root: "client",
  plugins: [
    react({
      babel: {
        parserOpts: {
          plugins: ["decorators-legacy", "classProperties"],
        },
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  server: {
    allowedHosts: true, // allow all external hosts
    host: true,
    port: 5174,
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false,
    minify: false,
    rollupOptions: {
      onwarn(warning, warn) {
        // Ignore all warnings for design mode
        return;
      },
      external: [],
      output: {
        manualChunks: undefined,
      },
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom"],
    force: true,
  },
});