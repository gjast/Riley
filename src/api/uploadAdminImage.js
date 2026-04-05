import { apiUrl } from "../data/apiBase.js";

/**
 * Загрузка изображения на сервер (multipart). Требуется Bearer-токен админки.
 * Возвращает публичный URL вида /api/uploads/….
 */
export async function uploadAdminImage(file, token) {
  if (!token?.trim()) {
    return { ok: false, status: 0, error: "no_token" };
  }
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(apiUrl("/api/admin/upload"), {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* ignore */
  }
  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      error: data?.error || res.statusText || "upload_failed",
    };
  }
  const url = data?.url;
  if (!url || typeof url !== "string") {
    return { ok: false, status: 502, error: "bad_response" };
  }
  return { ok: true, url };
}
