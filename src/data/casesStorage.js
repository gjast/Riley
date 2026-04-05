import {
  DEFAULT_CASES,
  DEFAULT_LANDING_SERVICES,
} from "./casesDefaults.js";
import { apiUrl } from "./apiBase.js";

const listeners = new Set();

/** @type {{ cases: object[], landingServices: object[] } | null} */
let memoryPayload = null;

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

function normalizeApiPayload(stored) {
  if (!stored) {
    return getDefaultsPayload();
  }
  if (Array.isArray(stored)) {
    const raw = migrateCasesPayload(stored) ?? cloneCases(DEFAULT_CASES);
    const cases = stripLegacyServiceCases(raw);
    return {
      cases,
      landingServices: cloneLanding(DEFAULT_LANDING_SERVICES),
    };
  }
  const rawCases =
    migrateCasesPayload(stored.cases) ?? cloneCases(DEFAULT_CASES);
  const landingServices =
    migrateLandingServicesPayload(stored.landingServices, rawCases) ??
    cloneLanding(DEFAULT_LANDING_SERVICES);
  const cases = stripLegacyServiceCases(rawCases);
  return { cases, landingServices };
}

export function getCases() {
  const p = memoryPayload ?? getDefaultsPayload();
  return cloneCases(p.cases);
}

export function getCasesForLandingGrid() {
  return getCases().filter((c) => !c.excludeFromCasesGrid);
}

export function getLandingServices() {
  const p = memoryPayload ?? getDefaultsPayload();
  return cloneLanding(p.landingServices);
}

export function getLandingServiceByKey(key) {
  const p = memoryPayload ?? getDefaultsPayload();
  return p.landingServices.find((s) => s.key === key) ?? null;
}

export function getCaseById(id) {
  return getCases().find((c) => c.id === id) ?? null;
}

export async function hydrateCasesFromServer() {
  try {
    const res = await fetch(apiUrl("/api/cases"));
    if (!res.ok) throw new Error("cases fetch failed");
    const data = await res.json();
    memoryPayload = normalizeApiPayload(data);
  } catch {
    memoryPayload = getDefaultsPayload();
  }
  notifyListeners();
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
    const raw = migrateCasesPayload(payload);
    if (!raw) {
      return { ok: false, status: 0, error: "Invalid cases payload" };
    }
    const cases = stripLegacyServiceCases(raw);
    body = {
      cases,
      landingServices: memoryPayload?.landingServices
        ? cloneLanding(memoryPayload.landingServices)
        : cloneLanding(DEFAULT_LANDING_SERVICES),
    };
  } else {
    const rawCases = migrateCasesPayload(payload?.cases);
    if (!rawCases) {
      return { ok: false, status: 0, error: "Invalid payload" };
    }
    const landingServices = migrateLandingServicesPayload(
      payload?.landingServices,
      rawCases,
    );
    if (!landingServices) {
      return { ok: false, status: 0, error: "Invalid payload" };
    }
    const cases = stripLegacyServiceCases(rawCases);
    body = { cases, landingServices };
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
