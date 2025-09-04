import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import cloudflare from '@hono/vite-cloudflare-pages'

export default defineConfig({
  plugins: [
    react(),
    cloudflare()
  ],
  build: {
    outDir: 'dist'
  }
})
