import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    ssr: 'src/index.tsx',
    rollupOptions: {
      output: {
        entryFileNames: '_worker.js'
      }
    }
  },
  server: {
    port: 3000
  }
})
