import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

const SRC_CLOSED = "/stars/closed.svg";
const SRC_OPENED = "/stars/opened.svg";

const DURATION_IN = 0.28;
const DURATION_OUT_SHRINK = 0.16;
const DURATION_OUT_FADE = 0.12;
const SPIN_OUT = 220;
const SPIN_IN = -220;

/** После img.src = … — decode или кадр, чтобы не стартовать «вход» на пустом кадре. */
function afterSrcSet(img, onReady) {
	const run = () => requestAnimationFrame(onReady);
	queueMicrotask(() => {
		if (typeof img.decode === "function") {
			img.decode().then(run).catch(run);
			return;
		}
		if (img.complete && img.naturalWidth > 0) {
			run();
			return;
		}
		img.addEventListener("load", run, { once: true });
		img.addEventListener("error", run, { once: true });
		window.setTimeout(run, 400);
	});
}

/**
 * Иконка аккордеона: closed.svg ↔ opened.svg.
 * Трансформы на обёртке (у img анимация часто не работает).
 */
export default function AccordionIcon({ isOpen }) {
	const wrapRef = useRef(null);
	const imgRef = useRef(null);
	const initRef = useRef(false);
	const isOpenRef = useRef(isOpen);

	useLayoutEffect(() => {
		const wrap = wrapRef.current;
		const img = imgRef.current;
		if (!wrap || !img) return;

		const targetSrc = isOpen ? SRC_OPENED : SRC_CLOSED;

		if (!initRef.current) {
			initRef.current = true;
			isOpenRef.current = isOpen;
			img.src = targetSrc;
			gsap.set(wrap, {
				rotation: 0,
				scale: 1,
				opacity: 1,
				transformOrigin: "50% 50%",
				force3D: true,
			});
			return;
		}

		if (isOpenRef.current === isOpen) return;
		isOpenRef.current = isOpen;

		gsap.killTweensOf(wrap);

		const spinOut = isOpen ? SPIN_OUT : -SPIN_OUT;
		const spinInFrom = isOpen ? SPIN_IN : -SPIN_IN;

		gsap.set(wrap, {
			rotation: 0,
			scale: 1,
			opacity: 1,
			transformOrigin: "50% 50%",
			force3D: true,
		});

		let inTween = null;

		const outEndScale = 0.06;
		const outEndOpacity = 0;
		/** Промежуточная прозрачность: уменьшение и fade идут вместе по обеим фазам. */
		const outMidOpacity = 0.45;

		const outTl = gsap.timeline({
			onComplete: () => {
				gsap.set(wrap, {
					opacity: 0,
					scale: outEndScale,
					rotation: spinOut,
					transformOrigin: "50% 50%",
					force3D: true,
				});
				img.src = targetSrc;
				afterSrcSet(img, () => {
					inTween = gsap.fromTo(
						wrap,
						{
							rotation: spinInFrom,
							scale: outEndScale,
							opacity: outEndOpacity,
							transformOrigin: "50% 50%",
							force3D: true,
						},
						{
							rotation: 0,
							scale: 1,
							opacity: 1,
							duration: DURATION_IN,
							ease: "power2.out",
						},
					);
				});
			},
		});

		outTl
			.to(wrap, {
				scale: 0.22,
				rotation: spinOut * 0.5,
				opacity: outMidOpacity,
				duration: DURATION_OUT_SHRINK,
				ease: "power2.out",
				transformOrigin: "50% 50%",
				force3D: true,
			})
			.to(wrap, {
				scale: outEndScale,
				opacity: 0,
				rotation: spinOut,
				duration: DURATION_OUT_FADE,
				ease: "power2.in",
				transformOrigin: "50% 50%",
				force3D: true,
			});

		return () => {
			outTl.kill();
			inTween?.kill();
		};
	}, [isOpen]);

	return (
		<span
			className="inline-flex h-6 w-6 shrink-0 items-center justify-center overflow-visible"
			aria-hidden
		>
			<div
				ref={wrapRef}
				className="flex h-6 w-6 items-center justify-center will-change-[transform,opacity]"
			>
				<img
					ref={imgRef}
					alt=""
					width={24}
					height={24}
					draggable={false}
					className="pointer-events-none block h-6 w-6 max-h-6 max-w-6 select-none"
				/>
			</div>
		</span>
	);
}
