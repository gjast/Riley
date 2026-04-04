import process from 'node:process'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// Прокси должен совпадать с портом API: PORT или API_PORT из корневого .env (как у `node server/index.mjs`).
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const p =
    Number(process.env.PORT) ||
    Number(process.env.API_PORT) ||
    Number(env.PORT) ||
    Number(env.API_PORT)
  const apiPort = Number.isFinite(p) && p > 0 ? p : 8787
  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': {
          target: `http://127.0.0.1:${apiPort}`,
          changeOrigin: true,
        },
      },
    },
  }
})
