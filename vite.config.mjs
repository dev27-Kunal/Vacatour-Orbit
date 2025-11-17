import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// Design mode configuration - zeer permissief
export default defineConfig({
  root: 'client',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve('./client/src'),
      '@shared': path.resolve('./shared'),
    },
  },
  server: {
    port: 5174,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    minify: false,
    target: 'esnext',
    rollupOptions: {
      onwarn() {
        // Suppress all warnings
      },
      output: {
        manualChunks: undefined,
      }
    }
  },
  esbuild: {
    jsx: 'automatic',
    jsxDev: false,
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
})