import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";
import { DEFAULT_CASES } from "../src/data/casesDefaults.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "cases.json");

function applyEnvLine(t) {
  if (!t || t.startsWith("#")) return;
  let line = t;
  if (/^export\s+/i.test(line)) {
    line = line.replace(/^export\s+/i, "").trim();
  }
  const i = line.indexOf("=");
  if (i === -1) return;
  const key = line.slice(0, i).trim();
  if (!key) return;
  let val = line.slice(i + 1).trim();
  if (
    (val.startsWith('"') && val.endsWith('"')) ||
    (val.startsWith("'") && val.endsWith("'"))
  ) {
    val = val.slice(1, -1);
  }
  const cur = process.env[key];
  if (cur === undefined || String(cur).trim() === "") {
    process.env[key] = val;
  }
}

async function loadDotEnv() {
  const paths = [
    ...new Set(
      [
        path.join(__dirname, "..", ".env"),
        path.join(process.cwd(), ".env"),
        path.join(__dirname, ".env"),
      ].map((p) => path.resolve(p)),
    ),
  ];
  const loadedPaths = [];
  for (const envPath of paths) {
    try {
      const txt = await fs.readFile(envPath, "utf8");
      loadedPaths.push(envPath);
      const cleaned = txt.replace(/^\uFEFF/, "");
      for (const raw of cleaned.split(/\r?\n/)) {
        applyEnvLine(raw.trim());
      }
    } catch (e) {
      if (e?.code !== "ENOENT") {
        console.warn(`[relaylend-server] Could not read ${envPath}:`, e.message);
      }
    }
  }
  if (loadedPaths.length === 0) {
    console.warn(
      `[relaylend-server] No .env file found. Tried:\n  ${paths.join("\n  ")}`,
    );
  } else {
    console.log(`[relaylend-server] Loaded .env from: ${loadedPaths.join(", ")}`);
  }
}

await loadDotEnv();

const _port = Number(process.env.PORT) || Number(process.env.API_PORT);
const PORT = Number.isFinite(_port) && _port > 0 ? _port : 8787;

if (!process.env.ADMIN_PASSWORD?.trim()) {
  console.warn(
    "[relaylend-server] ADMIN_PASSWORD is not set. Add it to the project root .env or Docker env, then restart.",
  );
}

/** token -> expiry ms */
const sessions = new Map();

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () =>
      resolve(Buffer.concat(chunks).toString("utf8")),
    );
    req.on("error", reject);
  });
}

function sendJson(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
  });
  res.end(body);
}

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization",
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
}

function validateToken(authHeader) {
  if (!authHeader?.startsWith("Bearer ")) return false;
  const token = authHeader.slice(7).trim();
  const exp = sessions.get(token);
  if (!exp || exp < Date.now()) {
    if (token) sessions.delete(token);
    return false;
  }
  return true;
}

function pruneSessions() {
  const now = Date.now();
  for (const [t, exp] of sessions) {
    if (exp < now) sessions.delete(t);
  }
}

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readCasesFile() {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function writeCasesFile(data) {
  await ensureDataDir();
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

const server = http.createServer(async (req, res) => {
  cors(res);
  const url = req.url?.split("?")[0] || "";

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  try {
    if (url === "/api/cases" && req.method === "GET") {
      const stored = await readCasesFile();
      const payload = Array.isArray(stored) ? stored : DEFAULT_CASES;
      return sendJson(res, 200, payload);
    }

    if (url === "/api/admin/login" && req.method === "POST") {
      const pwd = process.env.ADMIN_PASSWORD?.trim();
      if (!pwd) {
        return sendJson(res, 503, {
          error:
            "Server misconfigured: set ADMIN_PASSWORD in the project root .env (or pass it in Docker environment) and restart the API.",
        });
      }
      const raw = await readBody(req);
      let body;
      try {
        body = JSON.parse(raw || "{}");
      } catch {
        return sendJson(res, 400, { error: "Invalid JSON" });
      }
      if (body.password !== pwd) {
        return sendJson(res, 401, { error: "Invalid password" });
      }
      pruneSessions();
      const token = randomBytes(32).toString("hex");
      const ttlMs = 24 * 60 * 60 * 1000;
      sessions.set(token, Date.now() + ttlMs);
      return sendJson(res, 200, { token });
    }

    if (url === "/api/cases" && req.method === "POST") {
      if (!validateToken(req.headers.authorization)) {
        return sendJson(res, 403, { error: "Unauthorized" });
      }
      const raw = await readBody(req);
      let data;
      try {
        data = JSON.parse(raw || "null");
      } catch {
        return sendJson(res, 400, { error: "Invalid JSON" });
      }
      if (!Array.isArray(data)) {
        return sendJson(res, 400, { error: "Body must be a JSON array" });
      }
      await writeCasesFile(data);
      return sendJson(res, 200, { ok: true });
    }

    res.writeHead(404);
    res.end();
  } catch (e) {
    console.error(e);
    sendJson(res, 500, { error: "Server error" });
  }
});

server.listen(PORT, () => {
  console.log(`[relaylend-server] http://127.0.0.1:${PORT}`);
  console.log(`[relaylend-server] cases file: ${DATA_FILE}`);
  console.log(
    `[relaylend-server] ADMIN_PASSWORD: ${process.env.ADMIN_PASSWORD?.trim() ? "set" : "MISSING (login will return 503)"}`,
  );
});
