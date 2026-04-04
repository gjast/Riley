import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";
import {
  DEFAULT_CASES,
  DEFAULT_LANDING_SERVICES,
} from "../src/data/casesDefaults.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "cases.json");

/**
 * Применяет строку KEY=VAL из .env.
 * Всегда записывает в process.env (последний прочитанный файл побеждает), иначе
 * пустые BOT_TOKEN/TG_ID из окружения IDE/shell/Docker перекрывают реальные значения из файла.
 */
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
  if (key === "PORT" || key === "API_PORT") {
    const cur = process.env[key];
    if (cur !== undefined && String(cur).trim() !== "") return;
  }
  let val = line.slice(i + 1).trim();
  if (
    (val.startsWith('"') && val.endsWith('"')) ||
    (val.startsWith("'") && val.endsWith("'"))
  ) {
    val = val.slice(1, -1);
  }
  process.env[key] = val;
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

function readBodyLimited(req, maxBytes) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    req.on("data", (c) => {
      total += c.length;
      if (total > maxBytes) {
        req.destroy();
        reject(new Error("Body too large"));
        return;
      }
      chunks.push(c);
    });
    req.on("end", () =>
      resolve(Buffer.concat(chunks).toString("utf8")),
    );
    req.on("error", reject);
  });
}

function telegramConfig() {
  const token = (
    process.env.TELEGRAM_BOT_TOKEN ||
    process.env.BOT_TOKEN ||
    ""
  ).trim();
  const chatId = (
    process.env.TELEGRAM_CHAT_ID ||
    process.env.TG_ID ||
    ""
  ).trim();
  return { token, chatId };
}

/** Telegram ждёт chat_id числом (в т.ч. отрицательным для групп). */
function parseTelegramChatId(raw) {
  const s = String(raw ?? "").trim();
  if (/^-?\d+$/.test(s)) return Number(s);
  return s;
}

function clampStr(s, max) {
  const t = String(s ?? "").trim();
  return t.length > max ? t.slice(0, max) : t;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function sendTelegramStartForm(body) {
  const { token, chatId } = telegramConfig();
  if (!token || !chatId) {
    return { ok: false, status: 503, error: "telegram_not_configured" };
  }

  const service = clampStr(body.service, 120);
  const budget = clampStr(body.budget, 40);
  const deadline = clampStr(body.deadline, 40);
  const contact = clampStr(body.contact, 220);
  const comment = clampStr(body.comment, 3500);

  if (!service || !budget || !deadline || !contact || !comment) {
    return { ok: false, status: 400, error: "validation_failed" };
  }

  const text = [
    "",
    `Услуга: ${escapeHtml(service)}`,
    `Бюджет: ${escapeHtml(budget)}`,
    `Срок: ${escapeHtml(deadline)}`,
    `Контакт: <code>${escapeHtml(contact)}</code>`,
    "",
    "Комментарий:",
    escapeHtml(comment),
  ].join("\n");

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const chat_id = parseTelegramChatId(chatId);
  let tgRes;
  try {
    tgRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
  } catch (e) {
    console.error("[relaylend-server] Telegram fetch failed:", e?.message || e);
    return { ok: false, status: 502, error: "telegram_unreachable" };
  }

  let tgJson;
  try {
    tgJson = await tgRes.json();
  } catch {
    return { ok: false, status: 502, error: "telegram_bad_response" };
  }

  if (!tgJson.ok) {
    console.error(
      "[relaylend-server] Telegram API:",
      tgJson.description || tgJson.error_code || tgJson,
    );
    return {
      ok: false,
      status: 502,
      error: "telegram_api_error",
      detail: tgJson.description || String(tgJson.error_code || ""),
    };
  }

  return { ok: true, status: 200 };
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
    if (url === "/api/start" && req.method === "POST") {
      let raw;
      try {
        raw = await readBodyLimited(req, 64 * 1024);
      } catch {
        return sendJson(res, 413, { error: "Payload too large" });
      }
      let body;
      try {
        body = JSON.parse(raw || "{}");
      } catch {
        return sendJson(res, 400, { error: "Invalid JSON" });
      }
      const result = await sendTelegramStartForm(body);
      if (!result.ok) {
        const payload = { error: result.error };
        if (result.detail) payload.detail = result.detail;
        return sendJson(res, result.status, payload);
      }
      return sendJson(res, 200, { ok: true });
    }

    if (url === "/api/cases" && req.method === "GET") {
      const stored = await readCasesFile();
      let payload;
      if (!stored) {
        payload = {
          cases: DEFAULT_CASES,
          landingServices: DEFAULT_LANDING_SERVICES,
        };
      } else if (Array.isArray(stored)) {
        payload = {
          cases: stored,
          landingServices: DEFAULT_LANDING_SERVICES,
        };
      } else {
        payload = {
          cases: Array.isArray(stored.cases) ? stored.cases : DEFAULT_CASES,
          landingServices: Array.isArray(stored.landingServices)
            ? stored.landingServices
            : DEFAULT_LANDING_SERVICES,
        };
      }
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
      if (Array.isArray(data)) {
        const existing = await readCasesFile();
        let landing = DEFAULT_LANDING_SERVICES;
        if (
          existing &&
          typeof existing === "object" &&
          !Array.isArray(existing) &&
          Array.isArray(existing.landingServices)
        ) {
          landing = existing.landingServices;
        }
        await writeCasesFile({ cases: data, landingServices: landing });
        return sendJson(res, 200, { ok: true });
      }
      if (!data || typeof data !== "object") {
        return sendJson(res, 400, { error: "Invalid JSON body" });
      }
      if (!Array.isArray(data.cases)) {
        return sendJson(res, 400, {
          error: "Body must be a cases array (legacy) or { cases, landingServices }",
        });
      }
      const landing = Array.isArray(data.landingServices)
        ? data.landingServices
        : DEFAULT_LANDING_SERVICES;
      await writeCasesFile({
        cases: data.cases,
        landingServices: landing,
      });
      return sendJson(res, 200, { ok: true });
    }

    res.writeHead(404);
    res.end();
  } catch (e) {
    console.error(e);
    sendJson(res, 500, { error: "Server error" });
  }
});

server.on("error", (err) => {
  if (err?.code === "EADDRINUSE") {
    console.error(
      `[relaylend-server] Порт ${PORT} уже занят (EADDRINUSE). ` +
        `Освободите порт: например «lsof -i :${PORT}» и завершите процесс, либо остановите контейнер Docker, который слушает этот порт, затем снова «npm run dev».`,
    );
    process.exit(1);
  }
  throw err;
});

server.listen(PORT, () => {
  console.log(`[relaylend-server] http://127.0.0.1:${PORT}`);
  console.log(`[relaylend-server] cases file: ${DATA_FILE}`);
  console.log(
    `[relaylend-server] ADMIN_PASSWORD: ${process.env.ADMIN_PASSWORD?.trim() ? "set" : "MISSING (login will return 503)"}`,
  );
  const tg = telegramConfig();
  console.log(
    `[relaylend-server] Telegram (форма «Начать»): ${tg.token && tg.chatId ? "BOT_TOKEN + TG_ID (или TELEGRAM_*) заданы" : "не настроено — POST /api/start вернёт 503"}`,
  );
});
