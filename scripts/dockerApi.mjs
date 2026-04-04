import { spawnSync } from "node:child_process";
import process from "node:process";

/**
 * Если на хосте уже слушает 4000 (npm run dev, старый контейнер и т.д.),
 * публикуем Docker на PUBLISH_PORT=4001, не меняя API_PORT в .env.
 */
function hostPort4000InUse() {
  if (process.platform === "win32") return false;
  try {
    const r = spawnSync("lsof", ["-nP", "-iTCP:4000", "-sTCP:LISTEN"], {
      encoding: "utf8",
    });
    return r.status === 0 && Boolean(r.stdout?.trim());
  } catch {
    return false;
  }
}

const env = { ...process.env };
if (!env.PUBLISH_PORT && hostPort4000InUse()) {
  env.PUBLISH_PORT = "4001";
  console.log(
    "[relaylend-docker] Порт 4000 занят на хосте — контейнер на http://127.0.0.1:4001 (внутри по-прежнему PORT из .env). Чтобы занять 4000: остановите процесс на 4000 или задайте PUBLISH_PORT сами.",
  );
}

const r = spawnSync("docker", ["compose", "up", "--build"], {
  stdio: "inherit",
  env,
});
process.exit(r.status === null ? 1 : r.status);
