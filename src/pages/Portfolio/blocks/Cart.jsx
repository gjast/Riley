import React from "react";
import { useTranslation } from "react-i18next";

export default function Cart({ img, title, description, href }) {
  const { t } = useTranslation();
  return (
    <div className="flex-1 flex flex-col gap-[24px]">
      <div
        className="overflow-hidden  rounded-[16px] aspect-square"
        style={{
          border: "1px solid transparent",
          background: `linear-gradient(var(--color-line-background), var(--color-line-background)) padding-box, linear-gradient(180deg, #1E1E20 0%, #101012 50%, #1E1E20 100%) border-box`,
        }}
      >
        <div className="w-full h-full relative">
          <img
            className="absolute inset-0 w-full aspect-square object-cover"
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
        </div>
      </div>
  );
}
