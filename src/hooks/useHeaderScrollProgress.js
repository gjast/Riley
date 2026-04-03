import { useEffect, useState } from "react";

function progressFromScroll(y, fadeEndPx, reducedMotion) {
  if (reducedMotion) {
    return y > 8 ? 1 : 0;
  }
  const end = Math.max(1, fadeEndPx);
  return Math.min(1, Math.max(0, y / end));
}

/**
 * 0 у верха страницы, 1 после fadeEndPx — для плавного фона и blur как у bg-black/80 + blur 96px.
 */
export function useHeaderScrollProgress(fadeEndPx = 72) {
  const [progress, setProgress] = useState(() =>
    typeof window === "undefined"
      ? 0
      : progressFromScroll(
          window.scrollY,
          fadeEndPx,
          window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        ),
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");

    const compute = () => {
      setProgress(
        progressFromScroll(window.scrollY, fadeEndPx, media.matches),
      );
    };

    compute();
    window.addEventListener("scroll", compute, { passive: true });
    return () => window.removeEventListener("scroll", compute);
  }, [fadeEndPx]);

  return progress;
}
