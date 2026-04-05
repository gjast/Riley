import {
  DEFAULT_CASES,
  DEFAULT_LANDING_SERVICES,
} from "./casesDefaults.js";
import { apiUrl } from "./apiBase.js";

const listeners = new Set();

/** @type {{ cases: object[], landingServices: object[] } | null} */
let memoryPayload = null;

/** После первого hydrateCasesFromServer — не подставляем встроенные кейсы до ответа API. */
let casesHydrated = false;

export function getCasesHydrated() {
  return casesHydrated;
}

function cloneCases(source) {
  return structuredClone(source);
}

function cloneLanding(source) {
  return structuredClone(source);
}

function getDefaultsPayload() {
  return {
    cases: cloneCases(DEFAULT_CASES),
    landingServices: cloneLanding(DEFAULT_LANDING_SERVICES),
  };
}

function notifyListeners() {
  listeners.forEach((fn) => fn());
}

function normalizeCard(card) {
  const out = {
    title: String(card?.title ?? ""),
    description: String(card?.description ?? ""),
    href: String(card?.href ?? "#"),
  };
  if (card?.img && String(card.img).trim()) {
    out.img = String(card.img);
  }
  return out;
}

function normalizeCase(c) {
  return {
    id: String(c?.id ?? ""),
    img: String(c?.img ?? ""),
    title: String(c?.title ?? ""),
    cards: Array.isArray(c?.cards) ? c.cards.map(normalizeCard) : [],
    excludeFromCasesGrid: Boolean(c?.excludeFromCasesGrid),
  };
}

function normalizeLandingItem(s) {
  const key = String(s?.key ?? "");
  const portfolioCards = Array.isArray(s?.portfolioCards)
    ? s.portfolioCards.map(normalizeCard)
    : [];
  const legacyCaseId = String(s?.portfolioCaseId ?? "").trim();
  return { key, portfolioCards, portfolioCaseId: legacyCaseId };
}

/** Убираем старые псевдо-кейсы service-* (карточки перенесены в landingServices). */
export function stripLegacyServiceCases(cases) {
  return cases.filter((c) => !/^service-/.test(String(c?.id ?? "")));
}

export function migrateCasesPayload(parsed) {
  if (!Array.isArray(parsed)) return null;
  const normalized = parsed.map(normalizeCase).filter((c) => c.id);
  return normalized.length ? normalized : null;
}

/**
 * Сливает landingServices с дефолтами. legacyCases — сырой массив кейсов из того же JSON
 * (до strip), чтобы один раз перенести карточки со старого portfolioCaseId.
 */
export function migrateLandingServicesPayload(parsed, legacyCases = null) {
  if (!Array.isArray(parsed)) return null;
  const byKey = new Map(
    parsed.map((s) => {
      const n = normalizeLandingItem(s);
      return n.key ? [n.key, n] : null;
    }).filter(Boolean),
  );
  const merged = DEFAULT_LANDING_SERVICES.map((def) => {
    const saved = byKey.get(def.key);
    let portfolioCards = saved?.portfolioCards?.length
      ? saved.portfolioCards.map(normalizeCard)
      : [];

    if (
      !portfolioCards.length &&
      saved?.portfolioCaseId &&
      Array.isArray(legacyCases)
    ) {
      const linked = legacyCases.find(
        (c) => String(c?.id ?? "") === saved.portfolioCaseId,
      );
      if (linked?.cards?.length) {
        portfolioCards = linked.cards.map(normalizeCard);
      }
    }

    if (!portfolioCards.length) {
      portfolioCards = def.portfolioCards.map(normalizeCard);
    }

    return {
      key: def.key,
      portfolioCards,
    };
  });
  return merged;
}

/**
 * Для админки: все услуги с лендинга (фиксированные ключи), portfolioCards с API или из дефолтов.
 */
export function mergeLandingServicesWithDefaults(apiList) {
  const list = Array.isArray(apiList) ? apiList : [];
  const byKey = new Map();
  for (const s of list) {
    const n = normalizeLandingItem(s);
    if (n.key) byKey.set(n.key, n);
  }
  return DEFAULT_LANDING_SERVICES.map((def) => {
    const saved = byKey.get(def.key);
    const portfolioCards =
      saved?.portfolioCards?.length
        ? saved.portfolioCards.map(normalizeCard)
        : def.portfolioCards.map(normalizeCard);
    return { key: def.key, portfolioCards };
  });
}

/** Только данные с API, без встроенных DEFAULT_CASES / DEFAULT_LANDING_SERVICES. */
function normalizeApiPayloadFromServer(data) {
  if (data == null) {
    return { cases: [], landingServices: [] };
  }
  if (Array.isArray(data)) {
    const migrated = migrateCasesPayload(data);
    const raw = migrated ?? [];
    return {
      cases: stripLegacyServiceCases(raw),
      landingServices: [],
    };
  }
  if (typeof data !== "object") {
    return { cases: [], landingServices: [] };
  }
  const rawCases = Array.isArray(data.cases)
    ? data.cases.map(normalizeCase).filter((c) => c.id)
    : [];
  const cases = stripLegacyServiceCases(rawCases);
  const landingServices = landingServicesFromApiOnly(
    data.landingServices,
    rawCases,
  );
  return { cases, landingServices };
}

/** Услуги с сервера как есть (+ перенос карточек с portfolioCaseId), без слияния с дефолтами. */
function landingServicesFromApiOnly(parsed, legacyCases) {
  if (!Array.isArray(parsed)) return [];
  return parsed
    .map((s) => {
      const n = normalizeLandingItem(s);
      if (!n.key) return null;
      let portfolioCards = Array.isArray(n.portfolioCards)
        ? n.portfolioCards.map(normalizeCard)
        : [];
      if (
        !portfolioCards.length &&
        n.portfolioCaseId &&
        Array.isArray(legacyCases)
      ) {
        const linked = legacyCases.find(
          (c) => String(c?.id ?? "") === n.portfolioCaseId,
        );
        if (linked?.cards?.length) {
          portfolioCards = linked.cards.map(normalizeCard);
        }
      }
      return { key: n.key, portfolioCards };
    })
    .filter(Boolean);
}

function landingServicesForSave(parsed, legacyCases) {
  return landingServicesFromApiOnly(parsed, legacyCases);
}

export function getCases() {
  if (!casesHydrated || !memoryPayload) return [];
  return cloneCases(memoryPayload.cases);
}

export function getCasesForLandingGrid() {
  return getCases().filter((c) => !c.excludeFromCasesGrid);
}

export function getLandingServices() {
  if (!casesHydrated || !memoryPayload) return [];
  return cloneLanding(memoryPayload.landingServices);
}

export function getLandingServiceByKey(key) {
  if (!casesHydrated || !memoryPayload) return null;
  const k = String(key ?? "");
  return memoryPayload.landingServices.find((s) => s.key === k) ?? null;
}

export function getCaseById(id) {
  return getCases().find((c) => c.id === id) ?? null;
}

export async function hydrateCasesFromServer() {
  try {
    const res = await fetch(apiUrl("/api/cases"), { cache: "no-store" });
    if (!res.ok) throw new Error("cases fetch failed");
    const data = await res.json();
    memoryPayload = normalizeApiPayloadFromServer(data);
  } catch {
    memoryPayload = { cases: [], landingServices: [] };
  } finally {
    casesHydrated = true;
    notifyListeners();
  }
}

/** Сервер не принимает data: в img; снимаем перед POST (наследие старых JSON). */
function stripDataUrlImagesForApi(body) {
  const out = structuredClone(body);
  let stripped = 0;
  const strip = (obj) => {
    if (!obj || typeof obj !== "object") return;
    if (
      typeof obj.img === "string" &&
      /^data:/i.test(obj.img.trimStart())
    ) {
      obj.img = "";
      stripped += 1;
    }
  };
  if (Array.isArray(out.cases)) {
    for (const c of out.cases) {
      strip(c);
      if (Array.isArray(c?.cards))
        for (const card of c.cards) strip(card);
    }
  }
  if (Array.isArray(out.landingServices)) {
    for (const s of out.landingServices) {
      if (Array.isArray(s?.portfolioCards))
        for (const card of s.portfolioCards) strip(card);
    }
  }
  return { payload: out, stripped };
}

export async function saveCasesRemote(payload, token) {
  let body;
  if (Array.isArray(payload)) {
    const raw = payload.map(normalizeCase).filter((c) => c.id);
    const cases = stripLegacyServiceCases(raw);
    body = {
      cases,
      landingServices: memoryPayload?.landingServices?.length
        ? cloneLanding(memoryPayload.landingServices)
        : [],
    };
  } else {
    if (!Array.isArray(payload?.cases)) {
      return { ok: false, status: 0, error: "Invalid payload" };
    }
    const rawCases = stripLegacyServiceCases(
      payload.cases.map(normalizeCase).filter((c) => c.id),
    );
    const landingServices = landingServicesForSave(
      payload?.landingServices,
      rawCases,
    );
    body = { cases: rawCases, landingServices };
  }

  const { payload: sanitizedBody, stripped: strippedDataUrls } =
    stripDataUrlImagesForApi(body);
  body = sanitizedBody;

  try {
    const res = await fetch(apiUrl("/api/cases"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      let err = res.statusText;
      try {
        const j = await res.json();
        if (j.error) err = j.error;
      } catch {
        /* ignore */
      }
      return { ok: false, status: res.status, error: err };
    }
    memoryPayload = { cases: body.cases, landingServices: body.landingServices };
    notifyListeners();
    return {
      ok: true,
      status: res.status,
      strippedDataUrlImages: strippedDataUrls,
    };
  } catch (e) {
    return {
      ok: false,
      status: 0,
      error: e instanceof Error ? e.message : "Network error",
    };
  }
}

export async function resetCasesRemote(token) {
  return saveCasesRemote(getDefaultsPayload(), token);
}

export function subscribeCases(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
