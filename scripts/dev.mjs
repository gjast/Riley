import { spawn } from "node:child_process";
import net from "node:net";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function parseEnvFile(filePath) {
  const out = {};
  try {
    const txt = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
    for (const raw of txt.split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || line.startsWith("#")) continue;
      let l = line.replace(/^export\s+/i, "").trim();
      const i = l.indexOf("=");
      if (i === -1) continue;
      const key = l.slice(0, i).trim();
      let val = l.slice(i + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      out[key] = val;
    }
  } catch (e) {
    if (e?.code !== "ENOENT") throw e;
  }
  return out;
}

function preferredListenPort() {
  const rootEnv = parseEnvFile(path.join(root, ".env"));
  const serverEnv = parseEnvFile(path.join(root, "server", ".env"));
  const merged = { ...rootEnv, ...serverEnv };
  const p = Number(merged.PORT) || Number(merged.API_PORT);
  return Number.isFinite(p) && p > 0 ? p : 8787;
}

function isPortFree(port) {
  return new Promise((resolve) => {
    const s = net.createServer();
    s.unref();
    s.once("error", () => resolve(false));
    // Без host — как http.Server.listen(port), иначе 127.0.0.1 может быть «свободен»,
    // а 0.0.0.0:port уже занят (Docker и т.п.).
    s.listen(port, () => {
      s.close(() => resolve(true));
    });
  });
}

async function findFreePort(start, maxTries = 50) {
  for (let p = start; p < start + maxTries; p++) {
    if (await isPortFree(p)) return p;
  }
  throw new Error(
    `Не найден свободный TCP-порт в диапазоне ${start}–${start + maxTries - 1}`,
  );
}

const preferred = preferredListenPort();
const chosen = await findFreePort(preferred);

if (chosen !== preferred) {
  console.log(
    `[relaylend-dev] Порт ${preferred} занят — API и прокси Vite на http://127.0.0.1:${chosen} (в .env по-прежнему ${preferred}; это нормально для одной сессии).`,
  );
}

const childEnv = {
  ...process.env,
  PORT: String(chosen),
  API_PORT: String(chosen),
};

const api = spawn(process.execPath, ["server/index.mjs"], {
  cwd: root,
  env: childEnv,
  stdio: "inherit",
});

const viteJs = path.join(root, "node_modules", "vite", "bin", "vite.js");
const web = spawn(process.execPath, [viteJs], {
  cwd: root,
  env: childEnv,
  stdio: "inherit",
});

let shuttingDown = false;
let exitedAfterShutdown = 0;

function forwardSignal(sig) {
  shuttingDown = true;
  api.kill(sig);
  web.kill(sig);
}

process.on("SIGINT", () => forwardSignal("SIGINT"));
process.on("SIGTERM", () => forwardSignal("SIGTERM"));

function onChildExit(other, code, signal) {
  if (shuttingDown) {
    exitedAfterShutdown++;
    if (exitedAfterShutdown >= 2) process.exit(0);
    return;
  }
  shuttingDown = true;
  other.kill("SIGTERM");
  const exitCode =
    signal != null ? 1 : code === null || code === undefined ? 1 : code;
  process.exit(exitCode);
}

api.on("exit", (code, signal) => onChildExit(web, code, signal));
web.on("exit", (code, signal) => onChildExit(api, code, signal));
