import { motion, useReducedMotion } from "motion/react";
import { useTranslation } from "react-i18next";
import CTA from "../../../components/CTA";
import StarfieldBackground from "../../../components/StarfieldBackground";
import { useScrollToSection } from "../../../hooks/useScrollToSection";

const M = motion;
const ease = [0.16, 1, 0.3, 1];

export default function Hero() {
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion();
  const scrollToSection = useScrollToSection();

  const textContainer = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reducedMotion ? 0 : 0.09,
        delayChildren: reducedMotion ? 0 : 0.06,
      },
    },
  };

  const textItem = {
    hidden: reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reducedMotion ? 0 : 0.58, ease },
    },
  };

  return (
    <section
      id="about"
      className="relative mb-[26px] flex
      min-h-[calc(100vh-211px)]
      sm:min-h-[calc(100vh-111px)] w-full sm:w-[calc(100%-50px)] justify-center overflow-hidden rounded-b-[24px] border-t-0 bg-[--color-hero-background]"
      style={{
        boxShadow: "inset 0 0 0 1px #1E1E20, inset 0 -1px 0 0 #1E1E20",
      }}
    >
      <StarfieldBackground
        angle={-32} // направление дрейфа в градусах (0° — вправо, 90° — вниз)
        count={10} // сколько «звёзд» одновременно
        driftDistance={150} // длина одного цикла движения в vmin (насколько далеко уезжает за проход)
        medianScale={0.64} // средний масштаб SVG; вместе с scaleJitter задаёт размер
        scaleJitter={0.9} // разброс масштаба вокруг medianScale (±)
        scaleMax={0.8} // максимальный размер звезды (clamp после случайного масштаба)
        spawnLeftMin={-52} // левая граница зоны спавна, % ширины секции (можно < 0 — за левым краем)
        spawnLeftMax={58} // правая граница зоны спавна по горизонтали, %
        spawnTopMin={93} // верхняя граница зоны спавна по вертикали, %
        spawnTopMax={124} // нижняя граница зоны спавна, % (>100 — ниже блока)
        speedCurve={1} // 0 — линейно; 1 — сначала быстро, в конце медленно; 2 — сначала медленно, в конце быстро; 3 — медленно → быстро в середине → медленно
        starBlur={false}
starOpacityMode="size"
starOpacitySmall={0.4}
starOpacityLarge={0.8}
        // По умолчанию без этих пропсов — как раньше (blur вкл., случайная яркость).
        // starBlur={false} — без размытия у звезды в SVG
        // starOpacityMode="uniform" starOpacityUniform={0.36} — все одной яркости (белые)
        // starOpacityMode="size" — чем меньше звезда, тем тусклее (границы: starOpacitySmall / starOpacityLarge)
      />

      <M.div
        className="relative z-10 mt-[15vh] sm:mt-[20vh] flex h-max max-w-[650px] flex-col items-center gap-[12px]"
        variants={textContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1, margin: "0px" }}
      >
        <M.h1
          variants={textItem}
          className="text-center text-[26px] font-semibold leading-[1.2] tracking-[-0.02em] sm:text-[32px] md:text-[38px] lg:text-[42px] 2xl:text-[56px]"
        >
          {t("hero.titleLine1")}
          <br />
          {t("hero.titleLine2")}
        </M.h1>
        <M.h2
          variants={textItem}
          className="mb-[12px] text-center text-[14px] font-medium leading-normal tracking-[-0.02em] text-white/40 sm:text-[15px] md:text-[16px] 2xl:text-[18px]"
        >
          {t("hero.subtitleLine1")} <br />
          {t("hero.subtitleLine2")}
        </M.h2>

        <M.div variants={textItem}>
          <CTA text={t("header.CTA")} onClick={() => scrollToSection("process")} />
        </M.div>
      </M.div>

      <M.img
        className="absolute bottom-0 right-1/2 z-1 translate-x-1/2 object-cover"
        src="/imgs/Hero.png"
        alt=""
        initial={reducedMotion ? false : { opacity: 0, y: 36 }}
        whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1, margin: "0px" }}
        transition={{ duration: reducedMotion ? 0 : 0.65, ease, delay: 0.12 }}
      />
    </section>
  );
}
