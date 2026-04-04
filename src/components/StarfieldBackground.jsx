import { useId, useMemo } from "react";

function StarGraphic({ idSuffix, blur = true }) {
	const filterId = `star-soft-${idSuffix}`;
	const gradientId = `star-grad-${idSuffix}`;

	return (
		<svg
			width="240"
			height="240"
			viewBox="0 0 240 240"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className="block size-full"
			aria-hidden
		>
			<path
				d="M15.0177 224.328L209.31 30.0354"
				stroke={`url(#${gradientId})`}
				strokeWidth="2"
				strokeLinecap="round"
			/>
			<g filter={blur ? `url(#${filterId})` : undefined}>
				<path
					d="M216.297 15.0182L216.495 27.0882L224.596 36.4474L212.219 36.2792L202.859 43.9028L202.661 31.8328L194.56 22.4735L206.937 22.6417L216.297 15.0182Z"
					fill="white"
				/>
			</g>
			<defs>
				{blur ? (
					<filter
						id={filterId}
						x="186.56"
						y="7.01807"
						width="46.0352"
						height="44.8848"
						filterUnits="userSpaceOnUse"
						colorInterpolationFilters="sRGB"
					>
						<feGaussianBlur in="SourceGraphic" stdDeviation="1.25" />
					</filter>
				) : null}
				<linearGradient
					id={gradientId}
					x1="209.664"
					y1="30.389"
					x2="15.3713"
					y2="224.681"
					gradientUnits="userSpaceOnUse"
				>
					<stop stopColor="white" />
					<stop offset="1" stopColor="white" stopOpacity="0" />
				</linearGradient>
			</defs>
		</svg>
	);
}

function rand(min, max) {
	return min + Math.random() * (max - min);
}

function clamp(v, lo, hi) {
	return Math.min(hi, Math.max(lo, v));
}

/** 0 — linear; 1 — быстро в начале, медленно в конце; 2 — медленно в начале, быстро в конце; 3 — медленно–быстро–медленно */
const SPEED_CURVE_EASING = [
	"linear",
	"ease-out",
	"ease-in",
	"ease-in-out",
];

function speedCurveToEasing(speedCurve) {
	const n = Math.floor(Number(speedCurve));
	if (n < 0 || n > 3 || Number.isNaN(n)) return SPEED_CURVE_EASING[0];
	return SPEED_CURVE_EASING[n];
}

/**
 * @param {number} angle — направление дрейфа, градусы
 * @param {number} [medianScale=0.26] — средний масштаб SVG (размер «звезды»)
 * @param {number} [scaleJitter=0.1] — разброс масштаба вокруг medianScale
 * @param {number} [scaleMin=0.06] — нижняя граница масштаба после случайного выбора
 * @param {number} [scaleMax=2.5] — верхняя граница масштаба (макс. размер звезды)
 * @param {number} spawnLeftMin / spawnLeftMax — горизонталь зоны спавна (% от контейнера; можно за 0–100, в т.ч. отриц.)
 * @param {number} spawnTopMin / spawnTopMax — вертикаль зоны спавна (%)
 * @param {0|1|2|3} [speedCurve=0] — характер скорости по времени одного цикла
 * @param {boolean} [starBlur=true] — размытие «хвоста» звезды в SVG
 * @param {"default"|"uniform"|"size"} [starOpacityMode="default"] — прозрачность: как сейчас; все одной яркости; меньше звезда — тусклее
 * @param {number} [starOpacityUniform=0.36] — при mode uniform — пик opacity у всех звёзд (анимация 0→peak→0)
 * @param {number} [starOpacitySmall=0.14] — при mode size — пик у минимального масштаба
 * @param {number} [starOpacityLarge=0.48] — при mode size — пик у максимального масштаба
 */
export default function StarfieldBackground({
	angle = -28,
	count = 10,
	driftDistance = 110,
	medianScale = 0.26,
	scaleJitter = 0.1,
	scaleMin = 0.06,
	scaleMax = 2.5,
	spawnLeftMin = -48,
	spawnLeftMax = 52,
	spawnTopMin = 96,
	spawnTopMax = 118,
	speedCurve = 0,
	starBlur = true,
	starOpacityMode = "default",
	starOpacityUniform = 0.36,
	starOpacitySmall = 0.14,
	starOpacityLarge = 0.48,
	className = "",
}) {
	const instanceId = useId().replace(/:/g, "");
	const starEasing = speedCurveToEasing(speedCurve);
	const rad = (angle * Math.PI) / 180;
	const cos = Math.cos(rad);
	const sin = Math.sin(rad);

	const lo = medianScale - scaleJitter;
	const hi = medianScale + scaleJitter;
	const opacityMode = String(starOpacityMode || "default").toLowerCase();

	const stars = useMemo(() => {
		const leftA = Math.min(spawnLeftMin, spawnLeftMax);
		const leftB = Math.max(spawnLeftMin, spawnLeftMax);
		const topA = Math.min(spawnTopMin, spawnTopMax);
		const topB = Math.max(spawnTopMin, spawnTopMax);

		const sMin = Math.min(scaleMin, scaleMax);
		const sMax = Math.max(scaleMin, scaleMax);

		const loSmall = Math.min(starOpacitySmall, starOpacityLarge);
		const hiLarge = Math.max(starOpacitySmall, starOpacityLarge);

		return Array.from({ length: count }, (_, i) => {
			const scale = clamp(rand(lo, hi), sMin, sMax);

			let opacityPeak;
			if (opacityMode === "uniform") {
				opacityPeak = clamp(starOpacityUniform, 0.02, 1);
			} else if (opacityMode === "size") {
				const t =
					sMax > sMin ? clamp((scale - sMin) / (sMax - sMin), 0, 1) : 1;
				opacityPeak = clamp(loSmall + t * (hiLarge - loSmall), 0.02, 1);
			} else {
				opacityPeak = rand(0.14, 0.48);
			}

			return {
				key: i,
				left: rand(leftA, leftB),
				top: rand(topA, topB),
				scale,
				opacityPeak,
				duration: rand(12, 48),
				delay: -rand(0, 55),
			};
		});
	}, [
		count,
		lo,
		hi,
		opacityMode,
		scaleMin,
		scaleMax,
		spawnLeftMin,
		spawnLeftMax,
		spawnTopMin,
		spawnTopMax,
		starOpacityUniform,
		starOpacitySmall,
		starOpacityLarge,
	]);

	return (
		<div
			className={`pointer-events-none absolute inset-0 z-0 overflow-hidden ${className}`}
			style={{
				"--drift-cos": cos,
				"--drift-sin": sin,
				"--drift-distance": `${driftDistance}vmin`,
				"--star-easing": starEasing,
			}}
		>
			{stars.map((s) => (
				<div
					key={s.key}
					className="absolute"
					style={{
						left: `${s.left}%`,
						top: `${s.top}%`,
						transform: "translate(-50%, -50%)",
					}}
				>
					<div
						className="starfield-star-inner h-[200px] w-[200px]"
						style={{
							"--star-scale": s.scale,
							"--star-opacity-peak": s.opacityPeak,
							"--drift-duration": `${s.duration}s`,
							"--drift-delay": `${s.delay}s`,
						}}
					>
						<StarGraphic idSuffix={`${instanceId}-${s.key}`} blur={starBlur} />
					</div>
				</div>
			))}
		</div>
	);
}
