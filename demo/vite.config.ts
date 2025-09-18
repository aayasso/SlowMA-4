import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/proxy/artsearch': {
        target: 'https://api.artsearch.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/artsearch/, ''),
        headers: (process.env.VITE_ARTSEARCH_API_KEY
          ? { 'X-API-KEY': process.env.VITE_ARTSEARCH_API_KEY }
          : undefined) as any
      },
      '/proxy/met': {
        target: 'https://collectionapi.metmuseum.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/met/, '')
      },
      '/proxy/rijks': {
        target: 'https://data.rijksmuseum.nl',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/rijks/, '')
      },
      '/proxy/allorigins': {
        target: 'https://api.allorigins.win',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/allorigins/, '')
      }
    }
  }
})
