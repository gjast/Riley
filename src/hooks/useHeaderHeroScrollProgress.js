import { useLayoutEffect, useState } from "react";

function clamp(v, lo, hi) {
	return Math.min(hi, Math.max(lo, v));
}

/**
 * Прогресс 0→1 для фона хедера: пока Hero (#about) ещё «в кадре» — прозрачно,
 * плавно к 1, когда нижний край Hero уходит выше зоны под фиксированной шапкой.
 *
 * @param {object} [options]
 * @param {string} [options.heroId='about'] — id секции Hero на лендинге
 * @param {string} [options.headerSelector='[data-site-header]']
 */
export function useHeaderHeroScrollProgress(options = {}) {
	const { heroId = "about", headerSelector = "[data-site-header]" } = options;
	const [progress, setProgress] = useState(0);

	useLayoutEffect(() => {
		const compute = () => {
			const hero = document.getElementById(heroId);
			const header = document.querySelector(headerSelector);
			if (!hero) {
				setProgress(0);
				return;
			}

			const rect = hero.getBoundingClientRect();
			const headerPad =
				(header?.getBoundingClientRect().height ?? 72) + 16;
			const bottom = rect.bottom;

			const reduced = window.matchMedia(
				"(prefers-reduced-motion: reduce)",
			).matches;

			// Полный фон, когда нижний край Hero прошёл зону под шапкой
			const fadeEnd = headerPad;
			// Начинаем плавный переход только когда Hero почти ушёл: не от % vh (рано),
			// а от небольшой полосы над fadeEnd (конец секции)
			const blendPx = 200;
			const fadeStart = fadeEnd + blendPx;

			let p;
			if (bottom >= fadeStart) {
				p = 0;
			} else if (bottom <= fadeEnd) {
				p = 1;
			} else {
				p = clamp(
					(fadeStart - bottom) / Math.max(1, fadeStart - fadeEnd),
					0,
					1,
				);
			}

			if (reduced) {
				p = p >= 0.5 ? 1 : 0;
			}
			setProgress(p);
		};

		compute();
		window.addEventListener("scroll", compute, { passive: true });
		window.addEventListener("resize", compute);
		return () => {
			window.removeEventListener("scroll", compute);
			window.removeEventListener("resize", compute);
		};
	}, [heroId, headerSelector]);

	return progress;
}
