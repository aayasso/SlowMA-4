import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      port: 3000,
      open: true,
      proxy: {
        '/proxy/artsearch': {
          target: 'https://api.artsearch.io',
          changeOrigin: true,
          // Some deployments expect "/api" prefix; keep rewriting to root so client can try both /v1 and /search paths.
          rewrite: (path) => path.replace(/^\/proxy\/artsearch/, ''),
          headers: (env.VITE_ARTSEARCH_API_KEY
            ? { 'X-API-KEY': env.VITE_ARTSEARCH_API_KEY }
            : undefined) as any
        },
        '/proxy/clarifai': {
          target: 'https://api.clarifai.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/proxy\/clarifai/, ''),
          headers: (env.VITE_CLARIFAI_API_KEY
            ? { Authorization: `Key ${env.VITE_CLARIFAI_API_KEY}` }
            : undefined) as any
        },
        '/proxy/met': {
          target: 'https://collectionapi.metmuseum.org',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/proxy\/met/, '')
        },
        '/proxy/allorigins': {
          target: 'https://api.allorigins.win',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/proxy\/allorigins/, '')
        }
      }
    }
  }
})
