import { useCallback } from "react";

/**
 * Плавный скролл к секции по id (с # или без), с отступом под фиксированный хедер.
 *
 * @param {object} [options]
 * @param {number} [options.gap=12] — доп. отступ под хедер, px
 * @param {string} [options.headerSelector='[data-site-header]'] — селектор элемента, высоту которого вычитаем
 */
export function useScrollToSection(options = {}) {
	const { gap = 12, headerSelector = "[data-site-header]" } = options;

	return useCallback(
		(hashOrId) => {
			const id = String(hashOrId).replace(/^#/, "");
			const el = document.getElementById(id);
			if (!el) return;
			const header = document.querySelector(headerSelector);
			const offset =
				(header?.getBoundingClientRect().height ?? 0) + gap;
			const top = el.getBoundingClientRect().top + window.scrollY - offset;
			window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
		},
		[gap, headerSelector],
	);
}
