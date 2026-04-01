// components/Accordion.jsx
import { useState, useCallback } from "react";
import AccordionIcon from "./AccordionIcon";

export default function Accordion({ items }) {
  const [openId, setOpenId] = useState(null);

  const toggle = useCallback((id) => {
    setOpenId((prev) => (prev === id ? null : id));
  }, []);

  return (
    <div className="flex w-full flex-col gap-3 sm:gap-4 md:gap-[16px]">
      {items.map((item) => (
        <AccordionItem
          key={item.id}
          item={item}
          isOpen={openId === item.id}
          onToggle={toggle}
        />
      ))}
    </div>
  );
}

function AccordionItem({ item, isOpen, onToggle }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#1E1E20] bg-(--color-line-background) transition-all duration-300 hover:border-[#2a2f38] md:rounded-[18px]">
      <button
        type="button"
        onClick={() => onToggle(item.id)}
        className="flex min-h-12 w-full cursor-pointer items-center justify-between gap-3 px-4 py-3.5 text-left sm:min-h-0 sm:px-5 sm:py-4 md:px-6 md:py-[18px]"
      >
        <span className="text-[16px] font-medium leading-[150%] tracking-[-0.02em] text-white sm:text-[17px] md:text-[18px]">
          {item.question}
        </span>
        <span className="inline-flex shrink-0">
          <AccordionIcon isOpen={isOpen} />
        </span>
      </button>

      <div
        className="transition-all duration-300 ease-in-out"
        style={{ display: "grid", gridTemplateRows: isOpen ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <p className="px-4 pb-3.5 text-[15px] leading-[150%] tracking-[-0.02em] text-[#A1A1AA] sm:px-5 sm:pb-4 sm:text-base md:px-6 md:pb-[18px] md:text-[18px]">
            {item.answer}
          </p>
        </div>
      </div>
    </div>
  );
}