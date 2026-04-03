import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

gsap.registerPlugin(MotionPathPlugin);

/**
 * Широкая наклонная дуга: старт снизу-справа, обход сверху, уход слева (как на референсе).
 * Две кубики — плавная «орбита» вокруг звезды.
 */
const ORBIT_D =
	"M 21.2 17.1 C 24.2 9.5 17.2 2.8 12 3.4 C 6.6 4 1.4 10.2 3.9 16.8";

const STAR_PATH =
	"M12.0512 5.26972C11.9264 4.77225 11.8194 4.5 11.7393 4.5C11.659 4.5 11.5788 4.70651 11.5075 5.08199C11.4451 5.41054 11.3024 6.11451 11.1865 6.65895C11.0617 7.2034 10.8656 7.93558 10.7408 8.30167C10.616 8.6677 10.3932 9.19338 10.2506 9.47496C10.1079 9.75659 9.85831 10.1414 9.69785 10.3198C9.53738 10.4982 9.23429 10.7797 9.01147 10.9393C8.7886 11.0989 8.33396 11.3429 7.98629 11.4932C7.64758 11.6339 6.82743 11.9062 6.17671 12.0939C5.16937 12.3849 5 12.46 5 12.6195C5 12.7791 5.09806 12.826 5.64184 12.9293C5.99841 13.0044 6.67588 13.164 7.13944 13.286C7.603 13.4174 8.20915 13.6333 8.47659 13.7741C8.76186 13.9149 9.21646 14.2904 9.57304 14.6565C9.90288 15.0131 10.2773 15.52 10.4021 15.7828C10.5358 16.0551 10.7141 16.4869 10.7943 16.7497C10.8745 17.0031 11.0439 17.7353 11.1598 18.3736C11.2757 19.0025 11.4094 19.5094 11.454 19.5C11.4986 19.4812 11.6234 19.1151 11.7303 18.674C11.8462 18.2328 12.0245 17.6039 12.1314 17.266C12.2384 16.928 12.4969 16.2804 12.702 15.811C12.9159 15.3417 13.2546 14.7409 13.4508 14.4687C13.6558 14.2059 14.0391 13.8304 14.2977 13.6521C14.5472 13.4644 15.1445 13.1921 15.6081 13.0419C16.0716 12.8824 16.9006 12.6571 17.4355 12.5257C17.9793 12.3942 18.4874 12.291 18.5765 12.291C18.6567 12.291 18.728 12.2253 18.728 12.1502C18.728 12.0751 18.6032 11.9718 18.4428 11.9249C18.2824 11.8686 17.6672 11.6997 17.0789 11.5307C16.4906 11.3711 15.7864 11.1364 15.5189 11.005C15.2515 10.883 14.8949 10.6765 14.7433 10.5451C14.5829 10.423 14.2442 10.0382 14.0035 9.68146C13.7539 9.33419 13.3705 8.69591 13.1566 8.2547C12.9427 7.81353 12.6485 7.13771 12.5059 6.75285C12.3632 6.36799 12.1582 5.7015 12.0512 5.26972Z";

const DURATION = 0.72;
const EASE_OPEN = "power2.inOut";
const EASE_CLOSE = "power2.inOut";

const ORBIT_BASE_OPACITY = 0.92;
const TAIL_LEN = 36;
/** Доля pathLength (0–100): плавное затухание хвоста у старта пути (открытие/закрытие). */
const TAIL_EDGE_FADE = 16;

function motionPathVars(pathEl, end) {
	return {
		motionPath: {
			path: pathEl,
			align: pathEl,
			alignOrigin: [0.5, 0.5],
			autoRotate: -105,
			end,
		},
	};
}

function setStarAt(star, pathEl, end, scale = 1) {
	gsap.set(star, {
		...motionPathVars(pathEl, end),
		scale,
		x: -2,
		transformOrigin: "50% 50%",
	});
}

function setTrailBehind(trail, progress01) {
	const head = Math.min(100, Math.max(0, progress01 * 100));
	if (head <= 0) {
		gsap.set(trail, { strokeDasharray: "0 100", strokeDashoffset: 0, opacity: 0 });
		return;
	}
	const tailStart = Math.max(0, head - TAIL_LEN);
	const visible = Math.max(0.01, head - tailStart);
	const rest = Math.max(0.01, 100 - head);
	const alpha = 0.72 + 0.28 * Math.min(1, head / 45);
	const edgeFade = Math.min(1, head / TAIL_EDGE_FADE);
	gsap.set(trail, {
		strokeDasharray: `0 ${tailStart} ${visible} ${rest}`,
		strokeDashoffset: 0,
		opacity: alpha * edgeFade,
	});
}

function setOrbitBase(orbit, open) {
	gsap.set(orbit, {
		opacity: open ? ORBIT_BASE_OPACITY : 0,
		strokeDashoffset: 0,
		strokeDasharray: "100 0",
	});
}

export default function AccordionIcon({ isOpen }) {
	const starRef = useRef(null);
	const orbitBaseRef = useRef(null);
	const trailRef = useRef(null);
	const pathForMotionRef = useRef(null);
	const readyRef = useRef(false);

	useLayoutEffect(() => {
		const star = starRef.current;
		const orbitBase = orbitBaseRef.current;
		const trail = trailRef.current;
		const pathEl = pathForMotionRef.current;
		if (!star || !orbitBase || !trail || !pathEl) return;

		/* Не трогаем star: killTweensOf сбрасывает MotionPath → резкий скачок при закрытии. */
		gsap.killTweensOf([orbitBase, trail]);

		if (!readyRef.current) {
			readyRef.current = true;
			if (isOpen) {
				setStarAt(star, pathEl, 1, 1.03);
				setOrbitBase(orbitBase, true);
				setTrailBehind(trail, 1);
			} else {
				setStarAt(star, pathEl, 0, 1);
				setOrbitBase(orbitBase, false);
				setTrailBehind(trail, 0);
			}
			return;
		}

		const proxy = { t: isOpen ? 0 : 1 };

		const applyFrame = () => {
			setTrailBehind(trail, proxy.t);
		};

		if (isOpen) {
			proxy.t = 0;
			applyFrame();

			gsap.set(orbitBase, {
				opacity: 0,
				strokeDashoffset: 0,
				strokeDasharray: "100 0",
			});

			gsap
				.timeline({
					defaults: { duration: DURATION, ease: EASE_OPEN, overwrite: "auto" },
				})
				.fromTo(
					orbitBase,
					{ opacity: 0 },
					{ opacity: ORBIT_BASE_OPACITY },
					0,
				)
				.fromTo(
					star,
					{
						...motionPathVars(pathEl, 0),
						scale: 1,
						x: -2,
						transformOrigin: "50% 50%",
					},
					{
						...motionPathVars(pathEl, 1),
						scale: 1.03,
						x: -2,
					},
					0,
				)
				.fromTo(
					proxy,
					{ t: 0 },
					{ t: 1, onUpdate: applyFrame },
					0,
				);
		} else {
			proxy.t = 1;
			applyFrame();

			gsap
				.timeline({
					defaults: { duration: DURATION, ease: EASE_CLOSE, overwrite: "auto" },
					onComplete: () => {
						setOrbitBase(orbitBase, false);
						gsap.set(trail, {
							strokeDasharray: "0 100",
							strokeDashoffset: 0,
							opacity: 0,
						});
					},
				})
				.fromTo(
					star,
					{
						...motionPathVars(pathEl, 1),
						scale: 1.03,
						x: -2,
						transformOrigin: "50% 50%",
					},
					{
						...motionPathVars(pathEl, 0),
						scale: 1,
						x: -2,
					},
					0,
				)
				.fromTo(
					proxy,
					{ t: 1 },
					{ t: 0, onUpdate: applyFrame },
					0,
				)
				.fromTo(
					orbitBase,
					{ opacity: ORBIT_BASE_OPACITY },
					{ opacity: 0 },
					0,
				);
		}
	}, [isOpen]);

	return (
		<svg
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			className="overflow-visible"
			aria-hidden
		>
			<path
				ref={pathForMotionRef}
				d={ORBIT_D}
				fill="none"
				stroke="none"
				strokeWidth="0"
				aria-hidden
			/>
			<path
				ref={orbitBaseRef}
				d={ORBIT_D}
				fill="none"
				stroke="rgba(255,255,255,0.62)"
				strokeWidth="1.55"
				strokeLinecap="round"
				pathLength={100}
				vectorEffect="non-scaling-stroke"
			/>
			<path
				ref={trailRef}
				d={ORBIT_D}
				fill="none"
				stroke="rgba(255,255,255,0.98)"
				strokeWidth="1.65"
				strokeLinecap="round"
				pathLength={100}
				vectorEffect="non-scaling-stroke"
			/>
			<g ref={starRef}>
				<path d={STAR_PATH} fill="white" />
			</g>
		</svg>
	);
}
