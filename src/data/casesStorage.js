import { DEFAULT_CASES } from "./casesDefaults.js";
import { apiUrl } from "./apiBase.js";

const listeners = new Set();

/** После hydrate всегда задано; до hydrate — null (getCases отдаёт дефолты). */
let memoryCases = null;

function cloneCases(source) {
  return structuredClone(source);
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
  };
}

export function migrateCasesPayload(parsed) {
  if (!Array.isArray(parsed)) return null;
  const normalized = parsed.map(normalizeCase).filter((c) => c.id);
  return normalized.length ? normalized : null;
}

export function getCases() {
  const source = memoryCases ?? DEFAULT_CASES;
  return cloneCases(source);
}

export async function hydrateCasesFromServer() {
  try {
    const res = await fetch(apiUrl("/api/cases"));
    if (!res.ok) throw new Error("cases fetch failed");
    const data = await res.json();
    const migrated = migrateCasesPayload(data);
    memoryCases = migrated ?? cloneCases(DEFAULT_CASES);
  } catch {
    memoryCases = cloneCases(DEFAULT_CASES);
  }
  notifyListeners();
}

/**
 * Сохранение на сервер. Нужен токен из POST /api/admin/login.
 * @returns {Promise<{ ok: boolean; status: number; error?: string }>}
 */
export async function saveCasesRemote(cases, token) {
  const migrated = migrateCasesPayload(cases);
  if (!migrated) {
    return { ok: false, status: 0, error: "Invalid cases payload" };
  }
  try {
    const res = await fetch(apiUrl("/api/cases"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(migrated),
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
    memoryCases = migrated;
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
  return saveCasesRemote(cloneCases(DEFAULT_CASES), token);
}

export function subscribeCases(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getCaseById(id) {
  return getCases().find((c) => c.id === id) ?? null;
}
