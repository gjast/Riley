import { createWriteStream } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import busboy from "busboy";
import cors from "cors";
import express from "express";
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

const UPLOAD_URL_FILE_RE =
  /\/api\/uploads\/([a-f0-9]{32}\.(?:jpg|png|webp|gif|svg))(?:\?|#|$)/i;

const JSON_NO_CACHE = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

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

function headerFirst(req, name) {
  const v = req.headers[name];
  if (v == null) return "";
  if (Array.isArray(v)) return String(v[0] ?? "").trim();
  return String(v).trim();
}

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
      : "IP: не определён — за прокси нужны X-Forwarded-For / X-Real-IP.";

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

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function ensureUploadDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

function handleAdminUpload(req, res) {
  if (!validateToken(req.headers.authorization)) {
    return res.status(403).json({ error: "Unauthorized" });
  }
  const ct = req.headers["content-type"] || "";
  if (!ct.toLowerCase().includes("multipart/form-data")) {
    return res.status(400).json({ error: "Expected multipart/form-data" });
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

        const done = () => resolve();

        function respond(status, obj) {
          if (responded) return;
          responded = true;
          res.status(status).json(obj);
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

const app = express();
app.set("trust proxy", true);
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

const jsonSmall = express.json({ limit: "64kb" });
const jsonLarge = express.json({ limit: "50mb" });

app.post("/api/start", jsonSmall, async (req, res, next) => {
  try {
    const result = await sendTelegramStartForm(req.body ?? {}, getClientIp(req));
    if (!result.ok) {
      const payload = { error: result.error };
      if (result.detail) payload.detail = result.detail;
      return res.status(result.status).json(payload);
    }
    return res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

app.get("/api/cases", async (req, res, next) => {
  try {
    const stored = await readCasesFile();
    let payload;
    if (!stored) {
      payload = { cases: [], landingServices: [] };
    } else if (Array.isArray(stored)) {
      payload = { cases: stored, landingServices: [] };
    } else {
      payload = {
        cases: Array.isArray(stored.cases) ? stored.cases : [],
        landingServices: Array.isArray(stored.landingServices)
          ? stored.landingServices
          : [],
      };
    }
    res.set(JSON_NO_CACHE);
    return res.json(payload);
  } catch (e) {
    next(e);
  }
});

app.get("/api/uploads/:filename", async (req, res, next) => {
  try {
    const filename = decodeURIComponent(req.params.filename);
    if (!UPLOAD_FILENAME_RE.test(filename)) {
      return res.status(404).end();
    }
    const fp = path.join(UPLOAD_DIR, filename);
    const resolved = path.resolve(fp);
    const rootResolved = path.resolve(UPLOAD_DIR);
    if (!resolved.startsWith(rootResolved)) {
      return res.status(404).end();
    }
    try {
      await fs.stat(resolved);
    } catch {
      return res.status(404).end();
    }
    res.setHeader("Content-Type", mimeFromUploadName(filename));
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    return res.sendFile(resolved);
  } catch (e) {
    next(e);
  }
});

app.post("/api/admin/upload", (req, res, next) => {
  handleAdminUpload(req, res).catch(next);
});

app.post("/api/admin/login", express.json(), async (req, res, next) => {
  try {
    const pwd = process.env.ADMIN_PASSWORD?.trim();
    if (!pwd) {
      return res.status(503).json({
        error:
          "Server misconfigured: set ADMIN_PASSWORD in the project root .env (or pass it in Docker environment) and restart the API.",
      });
    }
    const body = req.body ?? {};
    if (body.password !== pwd) {
      return res.status(401).json({ error: "Invalid password" });
    }
    const token = mintAdminToken();
    if (!token) {
      return res.status(503).json({
        error:
          "Server misconfigured: set ADMIN_PASSWORD (or ADMIN_SESSION_SECRET) and restart.",
      });
    }
    return res.json({ token });
  } catch (e) {
    next(e);
  }
});

app.post("/api/cases", jsonLarge, async (req, res, next) => {
  try {
    if (!validateToken(req.headers.authorization)) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    const data = req.body;
    if (Array.isArray(data)) {
      if (casesArrayHasDataUrlImages(data)) {
        return res.status(400).json({
          error: "data_url_images_not_allowed",
          detail:
            "Replace data:image/… with uploaded files (/api/uploads/…) or HTTP URLs.",
        });
      }
      const existing = await readCasesFile();
      let landing = [];
      if (
        existing &&
        typeof existing === "object" &&
        !Array.isArray(existing) &&
        Array.isArray(existing.landingServices)
      ) {
        landing = existing.landingServices;
      }
      if (landingServicesHasDataUrlImages(landing)) {
        return res.status(400).json({
          error: "data_url_images_not_allowed",
          detail:
            "Replace data:image/… in landing service cards with /api/uploads/… URLs.",
        });
      }
      const saved = { cases: data, landingServices: landing };
      await writeCasesFile(saved);
      await pruneOrphanUploads(saved);
      return res.json({ ok: true });
    }
    if (!data || typeof data !== "object") {
      return res.status(400).json({ error: "Invalid JSON body" });
    }
    if (!Array.isArray(data.cases)) {
      return res.status(400).json({
        error:
          "Body must be a cases array (legacy) or { cases, landingServices }",
      });
    }
    const landing = Array.isArray(data.landingServices)
      ? data.landingServices
      : [];
    if (casesArrayHasDataUrlImages(data.cases)) {
      return res.status(400).json({
        error: "data_url_images_not_allowed",
        detail:
          "Replace data:image/… with uploaded files (/api/uploads/…) or HTTP URLs.",
      });
    }
    if (landingServicesHasDataUrlImages(landing)) {
      return res.status(400).json({
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
    return res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

app.use((req, res) => {
  res.status(404).end();
});

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Invalid JSON" });
  }
  if (err.type === "entity.too.large") {
    return res.status(413).json({ error: "Payload too large" });
  }
  console.error(err);
  if (res.headersSent) return next(err);
  return res.status(500).json({ error: "Server error" });
});

const server = app.listen(PORT, () => {
  console.log(`[relaylend-server] Express http://127.0.0.1:${PORT}`);
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
