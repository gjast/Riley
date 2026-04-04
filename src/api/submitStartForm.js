import { apiUrl } from "../data/apiBase.js";

/**
 * Отправка формы «Начать проект» на сервер → Telegram.
 */
export async function submitStartForm(payload) {
	const res = await fetch(apiUrl("/api/start"), {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});
	let data = null;
	try {
		data = await res.json();
	} catch {
		/* ignore */
	}
	return { ok: res.ok, status: res.status, data };
}
