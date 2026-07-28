import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // GitHub Pages serves the site from /<repo>/, not the domain root. Only the
  // production build needs the prefix — `npm run dev` stays on `/`. Deploying
  // somewhere that serves from the root (Vercel, Netlify, a custom domain)?
  // Set BASE_PATH=/ in the build environment.
  base: command === 'build' ? (process.env.BASE_PATH ?? '/mba-university/') : '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Keep the WebGL payload in its own chunk — the hero is lazy-loaded, so
        // mobile and reduced-motion visitors never download it at all.
        manualChunks(id) {
          if (/node_modules[\\/](three|@react-three)[\\/]/.test(id)) return 'three'
          return undefined
        },
      },
    },
  },
}))
