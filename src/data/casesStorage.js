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
  return {
    key: String(s?.key ?? ""),
    title: String(s?.title ?? ""),
    price: String(s?.price ?? ""),
    img: String(s?.img ?? ""),
    portfolioCaseId: String(s?.portfolioCaseId ?? ""),
    position: String(s?.position ?? "justify-end items-end"),
    positionImg: String(s?.positionImg ?? "h-full"),
  };
}

export function migrateCasesPayload(parsed) {
  if (!Array.isArray(parsed)) return null;
  const normalized = parsed.map(normalizeCase).filter((c) => c.id);
  return normalized.length ? normalized : null;
}

/** Сливает сохранённые услуги с дефолтным порядком и ключами. */
export function migrateLandingServicesPayload(parsed) {
  if (!Array.isArray(parsed)) return null;
  const byKey = new Map(
    parsed.map((s) => {
      const n = normalizeLandingItem(s);
      return n.key ? [n.key, n] : null;
    }).filter(Boolean),
  );
  const merged = DEFAULT_LANDING_SERVICES.map((def) => ({
    ...normalizeLandingItem(def),
    ...byKey.get(def.key),
  }));
  return merged;
}

function normalizeApiPayload(stored) {
  if (!stored) {
    return getDefaultsPayload();
  }
  if (Array.isArray(stored)) {
    const cases = migrateCasesPayload(stored) ?? cloneCases(DEFAULT_CASES);
    return {
      cases,
      landingServices: cloneLanding(DEFAULT_LANDING_SERVICES),
    };
  }
  const cases =
    migrateCasesPayload(stored.cases) ?? cloneCases(DEFAULT_CASES);
  const landingServices =
    migrateLandingServicesPayload(stored.landingServices) ??
    cloneLanding(DEFAULT_LANDING_SERVICES);
  return { cases, landingServices };
}

export function getCases() {
  const p = memoryPayload ?? getDefaultsPayload();
  return cloneCases(p.cases);
}

/** Кейсы только для сетки Cases на главной. */
export function getCasesForLandingGrid() {
  return getCases().filter((c) => !c.excludeFromCasesGrid);
}

export function getLandingServices() {
  const p = memoryPayload ?? getDefaultsPayload();
  return cloneLanding(p.landingServices);
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

/**
 * Сохранение на сервер: объект { cases, landingServices } или устаревший массив кейсов.
 */
export async function saveCasesRemote(payload, token) {
  let body;
  if (Array.isArray(payload)) {
    const cases = migrateCasesPayload(payload);
    if (!cases) {
      return { ok: false, status: 0, error: "Invalid cases payload" };
    }
    body = {
      cases,
      landingServices: memoryPayload?.landingServices
        ? cloneLanding(memoryPayload.landingServices)
        : cloneLanding(DEFAULT_LANDING_SERVICES),
    };
  } else {
    const cases = migrateCasesPayload(payload?.cases);
    const landingServices = migrateLandingServicesPayload(
      payload?.landingServices,
    );
    if (!cases || !landingServices) {
      return { ok: false, status: 0, error: "Invalid payload" };
    }
    body = { cases, landingServices };
  }

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
    return { ok: true, status: res.status };
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
