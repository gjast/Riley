import http from "node:http";
import { createReadStream, createWriteStream } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import busboy from "busboy";
import {
  DEFAULT_CASES,
  DEFAULT_LANDING_SERVICES,
} from "../src/data/casesDefaults.js";
import { createCasesStore } from "./casesDb.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "data");
const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

const ALLOWED_IMAGE_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

const UPLOAD_FILENAME_RE = /^[a-f0-9]{32}\.(jpg|png|webp|gif|svg)$/;

/** Любой URL с нашим путём /api/uploads/<hex>.<ext> (относительный или с доменом). */
const UPLOAD_URL_FILE_RE =
  /\/api\/uploads\/([a-f0-9]{32}\.(?:jpg|png|webp|gif|svg))(?:\?|#|$)/i;

function extFromMime(mime) {
  const m = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/svg+xml": ".svg",
  };
  return m[mime] || ".bin";
}

function mimeFromUploadName(filename) {
  const ext = path.extname(filename).toLowerCase();
  const map = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
  };
  return map[ext] || "application/octet-stream";
}

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
        console.warn(
          `[relaylend-server] Could not read ${envPath}:`,
          e.message,
        );
      }
    }
  }
  if (loadedPaths.length === 0) {
    console.warn(
      `[relaylend-server] No .env file found. Tried:\n  ${paths.join("\n  ")}`,
    );
  } else {
    console.log(
      `[relaylend-server] Loaded .env from: ${loadedPaths.join(", ")}`,
    );
  }
}

await loadDotEnv();

const _port = Number(process.env.PORT) || Number(process.env.API_PORT);
const PORT = Number.isFinite(_port) && _port > 0 ? _port : 4000;

if (!process.env.ADMIN_PASSWORD?.trim()) {
  console.warn(
    "[relaylend-server] ADMIN_PASSWORD is not set. Add it to the project root .env or Docker env, then restart.",
  );
}

/** Stateless admin JWT-like token: не теряется при рестарте процесса / другом инстансе (Docker). */
function adminSessionSecret() {
  const extra = process.env.ADMIN_SESSION_SECRET?.trim();
  if (extra) return extra;
  const pwd = process.env.ADMIN_PASSWORD?.trim();
  if (pwd) return `${pwd}\nrelaylend-admin-v1`;
  return "";
}

function mintAdminToken() {
  const secret = adminSessionSecret();
  if (!secret) return null;
  const exp = Date.now() + 24 * 60 * 60 * 1000;
  const payload = Buffer.from(JSON.stringify({ exp }), "utf8").toString(
    "base64url",
  );
  const sig = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

function validateToken(authHeader) {
  if (!authHeader?.startsWith("Bearer ")) return false;
  const raw = authHeader.slice(7).trim();
  const dot = raw.lastIndexOf(".");
  if (dot <= 0) return false;
  const payloadB64 = raw.slice(0, dot);
  const sig = raw.slice(dot + 1);
  const secret = adminSessionSecret();
  if (!secret) return false;
  const expected = createHmac("sha256", secret)
    .update(payloadB64)
    .digest("base64url");
  if (sig.length !== expected.length) return false;
  try {
    if (
      !timingSafeEqual(Buffer.from(sig, "utf8"), Buffer.from(expected, "utf8"))
    ) {
      return false;
    }
  } catch {
    return false;
  }
  try {
    const { exp } = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8"),
    );
    if (
      typeof exp !== "number" ||
      !Number.isFinite(exp) ||
      exp < Date.now()
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
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
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
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

/** Первое значение заголовка (Node иногда отдаёт string | string[]). */
function headerFirst(req, name) {
  const v = req.headers[name];
  if (v == null) return "";
  if (Array.isArray(v)) return String(v[0] ?? "").trim();
  return String(v).trim();
}

/**
 * IP клиента: Cloudflare / прокси / прямое подключение.
 * Порядок: CF-Connecting-IP → True-Client-IP → X-Forwarded-For (первый) → X-Real-IP → socket.
 */
function getClientIp(req) {
  const cf = headerFirst(req, "cf-connecting-ip");
  if (cf) return normalizeClientIp(cf);
  const trueClient = headerFirst(req, "true-client-ip");
  if (trueClient) return normalizeClientIp(trueClient);
  const xff = headerFirst(req, "x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return normalizeClientIp(first);
  }
  const real = headerFirst(req, "x-real-ip");
  if (real) return normalizeClientIp(real);
  const ra = req.socket?.remoteAddress;
  if (ra) return normalizeClientIp(ra);
  return "";
}

function normalizeClientIp(ip) {
  const s = String(ip).trim();
  if (s.startsWith("::ffff:")) return s.slice(7);
  return s;
}

async function sendTelegramStartForm(body, clientIp) {
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

  const ipLine =
    clientIp && clientIp.trim()
      ? `IP: <code>${escapeHtml(clientIp.trim())}</code>`
      : "IP: не определён — обновите API (server/index.mjs) на сервере и перезапустите Node; за прокси нужны X-Forwarded-For / X-Real-IP.";

  const text = [
    "",
    `Услуга: ${escapeHtml(service)}`,
    `Бюджет: ${escapeHtml(budget)}`,
    `Срок: ${escapeHtml(deadline)}`,
    `Контакт: <code>${escapeHtml(contact)}</code>`,
    ipLine,
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
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
}

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function ensureUploadDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

function handleAdminUpload(req, res) {
  if (!validateToken(req.headers.authorization)) {
    sendJson(res, 403, { error: "Unauthorized" });
    return Promise.resolve();
  }
  const ct = req.headers["content-type"] || "";
  if (!ct.toLowerCase().includes("multipart/form-data")) {
    sendJson(res, 400, { error: "Expected multipart/form-data" });
    return Promise.resolve();
  }

  return ensureUploadDir().then(
    () =>
      new Promise((resolve) => {
        const bb = busboy({
          headers: req.headers,
          limits: { fileSize: 8 * 1024 * 1024 },
        });
        let responded = false;
        let sawFile = false;

        const done = () => {
          resolve();
        };

        function respond(status, obj) {
          if (responded) return;
          responded = true;
          sendJson(res, status, obj);
          done();
        }

        bb.on("file", (name, file, info) => {
          if (name !== "file") {
            file.resume();
            return;
          }
          if (sawFile) {
            file.resume();
            return;
          }
          sawFile = true;
          file.on("error", (err) => {
            console.error("[relaylend-server] upload file stream:", err);
            respond(500, { error: "Upload failed" });
          });
          void (async () => {
            try {
              const mime = String(info.mimeType || "").toLowerCase();
              if (!ALLOWED_IMAGE_MIME.has(mime)) {
                file.resume();
                respond(400, { error: "Invalid image type" });
                return;
              }
              const fname = `${randomBytes(16).toString("hex")}${extFromMime(mime)}`;
              const fp = path.join(UPLOAD_DIR, fname);
              await pipeline(file, createWriteStream(fp));
              respond(200, { url: `/api/uploads/${fname}` });
            } catch (e) {
              console.error("[relaylend-server] upload:", e);
              respond(500, { error: "Upload failed" });
            }
          })();
        });

        bb.on("error", (err) => {
          console.error("[relaylend-server] multipart:", err);
          respond(400, { error: "Malformed multipart" });
        });

        // Не вызывать done(), пока файл ещё пишется: иначе Promise завершится без ответа → прокси 502.
        bb.on("finish", () => {
          if (!responded && !sawFile) {
            respond(400, { error: "No file" });
            return;
          }
          if (responded) {
            done();
          }
        });

        req.pipe(bb);
      }),
  );
}

async function serveUploadFile(req, res, filename) {
  if (!UPLOAD_FILENAME_RE.test(filename)) {
    res.writeHead(404);
    res.end();
    return;
  }
  const fp = path.join(UPLOAD_DIR, filename);
  const resolved = path.resolve(fp);
  const rootResolved = path.resolve(UPLOAD_DIR);
  if (!resolved.startsWith(rootResolved)) {
    res.writeHead(404);
    res.end();
    return;
  }
  try {
    await fs.stat(resolved);
  } catch {
    res.writeHead(404);
    res.end();
    return;
  }
  res.writeHead(200, {
    "Content-Type": mimeFromUploadName(filename),
    // Имена файлов — случайный hex; после загрузки не меняются → долгий кэш.
    "Cache-Control": "public, max-age=31536000, immutable",
  });
  createReadStream(resolved).pipe(res);
}

await ensureDataDir();
const casesStore = createCasesStore(DATA_DIR);

async function readCasesFile() {
  return casesStore.read();
}

async function writeCasesFile(data) {
  await ensureDataDir();
  casesStore.write(data);
}

function imgLooksLikeDataUrl(s) {
  return /^data:/i.test(String(s ?? "").trimStart());
}

function casesArrayHasDataUrlImages(cases) {
  if (!Array.isArray(cases)) return false;
  for (const c of cases) {
    if (imgLooksLikeDataUrl(c?.img)) return true;
    if (!Array.isArray(c?.cards)) continue;
    for (const card of c.cards) {
      if (imgLooksLikeDataUrl(card?.img)) return true;
    }
  }
  return false;
}

function landingServicesHasDataUrlImages(landing) {
  if (!Array.isArray(landing)) return false;
  for (const s of landing) {
    if (!Array.isArray(s?.portfolioCards)) continue;
    for (const card of s.portfolioCards) {
      if (imgLooksLikeDataUrl(card?.img)) return true;
    }
  }
  return false;
}

/** Имена файлов в uploads/, на которые есть ссылки в сохранённом payload. */
function collectReferencedUploadFilenames(payload) {
  const names = new Set();
  const scan = (u) => {
    if (typeof u !== "string") return;
    const m = u.match(UPLOAD_URL_FILE_RE);
    if (!m) return;
    const fn = m[1].toLowerCase();
    if (UPLOAD_FILENAME_RE.test(fn)) names.add(fn);
  };
  if (!payload || typeof payload !== "object") return names;
  if (Array.isArray(payload.cases)) {
    for (const c of payload.cases) {
      scan(c?.img);
      if (Array.isArray(c?.cards))
        for (const card of c.cards) scan(card?.img);
    }
  }
  if (Array.isArray(payload.landingServices)) {
    for (const s of payload.landingServices) {
      if (Array.isArray(s?.portfolioCards))
        for (const card of s.portfolioCards) scan(card?.img);
    }
  }
  return names;
}

/** Удаляет файлы из uploads/, которых нет в сохранённых ссылках (замена картинки в админке). */
async function pruneOrphanUploads(savedPayload) {
  await ensureUploadDir();
  const referenced = collectReferencedUploadFilenames(savedPayload);
  let entries;
  try {
    entries = await fs.readdir(UPLOAD_DIR);
  } catch {
    return;
  }
  for (const fname of entries) {
    if (!UPLOAD_FILENAME_RE.test(fname)) continue;
    if (referenced.has(fname.toLowerCase())) continue;
    try {
      await fs.unlink(path.join(UPLOAD_DIR, fname));
      console.log(`[relaylend-server] Removed unused upload: ${fname}`);
    } catch (e) {
      console.warn(
        `[relaylend-server] Could not remove upload ${fname}:`,
        e?.message || e,
      );
    }
  }
}

function requestPathname(req) {
  let p = req.url?.split("?")[0] || "";
  if (p.length > 1 && p.endsWith("/")) {
    p = p.replace(/\/+$/, "");
  }
  return p;
}

const server = http.createServer(async (req, res) => {
  cors(res);
  const url = requestPathname(req);

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
      const result = await sendTelegramStartForm(body, getClientIp(req));
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

    if (url.startsWith("/api/uploads/") && req.method === "GET") {
      const name = decodeURIComponent(url.slice("/api/uploads/".length));
      await serveUploadFile(req, res, name);
      return;
    }

    if (url === "/api/admin/upload" && req.method === "POST") {
      await handleAdminUpload(req, res);
      return;
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
      const token = mintAdminToken();
      if (!token) {
        return sendJson(res, 503, {
          error:
            "Server misconfigured: set ADMIN_PASSWORD (or ADMIN_SESSION_SECRET) and restart.",
        });
      }
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
        if (casesArrayHasDataUrlImages(data)) {
          return sendJson(res, 400, {
            error: "data_url_images_not_allowed",
            detail:
              "Replace data:image/… with uploaded files (/api/uploads/…) or HTTP URLs.",
          });
        }
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
        if (landingServicesHasDataUrlImages(landing)) {
          return sendJson(res, 400, {
            error: "data_url_images_not_allowed",
            detail:
              "Replace data:image/… in landing service cards with /api/uploads/… URLs.",
          });
        }
        const saved = { cases: data, landingServices: landing };
        await writeCasesFile(saved);
        await pruneOrphanUploads(saved);
        return sendJson(res, 200, { ok: true });
      }
      if (!data || typeof data !== "object") {
        return sendJson(res, 400, { error: "Invalid JSON body" });
      }
      if (!Array.isArray(data.cases)) {
        return sendJson(res, 400, {
          error:
            "Body must be a cases array (legacy) or { cases, landingServices }",
        });
      }
      const landing = Array.isArray(data.landingServices)
        ? data.landingServices
        : DEFAULT_LANDING_SERVICES;
      if (casesArrayHasDataUrlImages(data.cases)) {
        return sendJson(res, 400, {
          error: "data_url_images_not_allowed",
          detail:
            "Replace data:image/… with uploaded files (/api/uploads/…) or HTTP URLs.",
        });
      }
      if (landingServicesHasDataUrlImages(landing)) {
        return sendJson(res, 400, {
          error: "data_url_images_not_allowed",
          detail:
            "Replace data:image/… in landing service cards with /api/uploads/… URLs.",
        });
      }
      const saved = {
        cases: data.cases,
        landingServices: landing,
      };
      await writeCasesFile(saved);
      await pruneOrphanUploads(saved);
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
  console.log(`[relaylend-server] cases DB: ${casesStore.dbPath}`);
  console.log(`[relaylend-server] uploads dir: ${UPLOAD_DIR}`);
  console.log(
    `[relaylend-server] ADMIN_PASSWORD: ${process.env.ADMIN_PASSWORD?.trim() ? "set" : "MISSING (login will return 503)"}`,
  );
  const tg = telegramConfig();
  console.log(
    `[relaylend-server] Telegram (форма «Начать»): ${tg.token && tg.chatId ? "BOT_TOKEN + TG_ID (или TELEGRAM_*) заданы" : "не настроено — POST /api/start вернёт 503"}`,
  );
});
