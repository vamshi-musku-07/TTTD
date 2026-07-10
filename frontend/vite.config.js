import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: true,
      port: Number(env.VITE_DEV_PORT) || 5173,
      proxy: {
        '/api': {
          target: env.VITE_DEV_API_PROXY || 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    },
    preview: {
      host: true,
      port: Number(env.VITE_PREVIEW_PORT) || 4173,
      proxy: {
        '/api': {
          target: env.VITE_DEV_API_PROXY || 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: mode !== 'production',
      emptyOutDir: true,
    },
  }
})
