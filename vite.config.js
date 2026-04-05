import process from "node:process";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
// Прокси должен совпадать с портом API: PORT или API_PORT из корневого .env (как у `node server/index.mjs`).
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const p =
    Number(process.env.PORT) ||
    Number(process.env.API_PORT) ||
    Number(env.PORT) ||
    Number(env.API_PORT);
  // Как в .env.example (API_PORT=4000). 8787 давал рассинхрон с локальным API → прокси бил в пустоту / 404.
  const apiPort = Number.isFinite(p) && p > 0 ? p : 4000;
  if (mode === "development") {
    console.info(`[vite] dev proxy: /api -> http://127.0.0.1:${apiPort}`);
  }
  return {
    plugins: [react(), tailwindcss()],
    build: {
      chunkSizeWarningLimit: 700,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes("node_modules")) return;
            if (id.includes("motion") || id.includes("framer-motion"))
              return "motion";
            if (id.includes("gsap")) return "gsap";
            if (
              id.includes("i18next") ||
              id.includes("react-i18next") ||
              id.includes("i18next-browser-languagedetector")
            )
              return "i18n";
            if (id.includes("react-dom")) return "react-dom";
            if (id.includes("react-router")) return "react-router";
          },
        },
      },
    },
    server: {
      proxy: {
        "/api": {
          target: `http://127.0.0.1:${apiPort}`,
          changeOrigin: true,
          timeout: 120_000,
        },
      },
    },
  };
});
