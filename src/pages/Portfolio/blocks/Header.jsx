import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslation } from "react-i18next";
import logo from "../../../assets/logo.svg";
import { useHeaderScrollProgress } from "../../../hooks/useHeaderScrollProgress";

const MotionHeader = motion.header;

export default function Header() {
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion();
  const scrollP = useHeaderScrollProgress(80);

  return (
    <MotionHeader
      className="fixed left-1/2 top-[25px] z-20 w-[calc(100%-2rem)] max-w-[857px] -translate-x-1/2 sm:w-[calc(100%-3rem)] lg:w-[calc(100%-100px)]"
      initial={reducedMotion ? false : { opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reducedMotion ? 0 : 0.5,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <div
        className="flex h-[62px] w-full items-center justify-between gap-3 rounded-2xl px-3 sm:px-4 lg:rounded-[24px]"
        style={{
          backgroundColor: `rgba(0,0,0,${0.8 * scrollP})`,
          backdropFilter: `blur(${96 * scrollP}px)`,
          WebkitBackdropFilter: `blur(${96 * scrollP}px)`,
        }}
      >
        <div className="flex min-w-0 items-center gap-2">
          <img
            src={logo}
            alt=""
            width={32}
            height={32}
            className="h-7 w-7 shrink-0 sm:h-8 sm:w-8"
          />
          <h1 className="truncate text-[16px] font-semibold sm:text-[17px] lg:text-[18px]">
            {t("header.brand")}
          </h1>
        </div>

        <a
          href="/"
          className="flex h-[42px] cursor-pointer items-center gap-[10px] rounded-[10px] bg-white px-[16px] text-[16px] font-medium tracking-[-0.02em] text-black 2xl:text-[18px]"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11.3164 14.9401L6.42641 10.0501C5.84891 9.47256 5.84891 8.52756 6.42641 7.95006L11.3164 3.06006"
              stroke="black"
              strokeWidth="1.5"
              strokeMiterlimit="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {t("portfolio.back")}
        </a>
      </div>
    </MotionHeader>
  );
}
