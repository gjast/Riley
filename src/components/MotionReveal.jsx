import { motion, useReducedMotion } from "motion/react";

const easeSlide = [0.22, 1, 0.36, 1];
const easeFade = [0.4, 0, 0.2, 1];

/**
 * Scroll-reveal: slides up from below (translateY). Opacity is shorter so motion reads clearly.
 */
export default function MotionReveal({
	children,
	className,
	delay = 0,
	/** Start offset below final position (px) — larger = stronger “from bottom” */
	y = 80,
	/** Fraction of the element that must intersect the viewport before starting (0–1). 0.1 = 10% of block height. */
	amount = 0.1,
	as,
	...rest
}) {
	const reduced = useReducedMotion();
	const Tag = as ?? motion.div;

	return (
		<Tag
			className={className}
			initial={reduced ? false : { opacity: 0, y }}
			whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
			viewport={{
				once: true,
				amount,
				margin: "0px",
			}}
			transition={
				reduced
					? { duration: 0 }
					: {
							delay,
							opacity: { duration: 0.38, ease: easeFade },
							y: { duration: 0.78, ease: easeSlide },
						}
			}
			{...rest}
		>
			{children}
		</Tag>
	);
}
