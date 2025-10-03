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
        '/proxy/openai': {
          target: 'https://api.openai.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/proxy\/openai/, ''),
          headers: (env.VITE_OPENAI_API_KEY
            ? { Authorization: `Bearer ${env.VITE_OPENAI_API_KEY}` }
            : undefined) as any
        },
        '/proxy/google': {
          target: 'https://vision.googleapis.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/proxy\/google/, '')
        },
        '/proxy/msvision': {
          // Endpoint must end with /
          target: env.VITE_MICROSOFT_VISION_ENDPOINT || 'https://example.invalid/',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/proxy\/msvision\/?/, ''),
          headers: (env.VITE_MICROSOFT_VISION_API_KEY
            ? { 'Ocp-Apim-Subscription-Key': env.VITE_MICROSOFT_VISION_API_KEY }
            : undefined) as any
        },
        '/proxy/harvard': {
          target: 'https://api.harvardartmuseums.org',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/proxy\/harvard/, '')
        },
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
