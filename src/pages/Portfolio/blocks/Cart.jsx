import React from "react";
import { useTranslation } from "react-i18next";

export default function Cart({ img, title, description, href }) {
  const { t } = useTranslation();
  return (
    <div className="flex-1 flex flex-col gap-[24px]">
      <div
        className="overflow-hidden max-h-[555px] rounded-[16px]"
        style={{
          border: "1px solid transparent",
          background: `linear-gradient(var(--color-line-background), var(--color-line-background)) padding-box, linear-gradient(180deg, #1E1E20 0%, #101012 50%, #1E1E20 100%) border-box`,
        }}
      >
        <div className="w-full aspect-square relative">
          <img
            className="absolute inset-0 w-full h-full object-cover"
            src={img}
            alt={title}
          />
        </div>
      </div>

      <div className="flex flex-col sm:px-[64px] px-[24px] pb-[24px]">

        <h3 className="text-[24px] leading-[150%] tracking-[-0.02em] font-semibold mt-0 sm:mt-[24px]">
          {title}
        </h3>
        <p className="text-[16px] leading-[150%] tracking-[-0.02em] mt-[14px] mb-[24px] text-[#8B8B8B] text-balance">
          {description}
        </p>
        <a
          href={href}
          className="text-[16px] leading-[150%] font-medium tracking-[-0.02em] text-white flex items-center gap-[4px] cursor-pointer group"
        >
          {t("portfolio.viewLink")}{" "}
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="transition-transform duration-200 ease-in-out group-hover:translate-x-[5px]"
          >
            <path
              d="M6.68359 14.9401L11.5736 10.0501C12.1511 9.47256 12.1511 8.52756 11.5736 7.95006L6.68359 3.06006"
              stroke="white"
              strokeWidth="1.5"
              strokeMiterlimit="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
        </div>
      </div>
  );
}
