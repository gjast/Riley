import React, { useState, useRef, useEffect } from "react";

export default function Dropdown({
  label,
  value,
  onChange,
  options = [],
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="flex flex-col justify-center w-full">
      {label && (
        <label className="text-[#6A6A6D] text-[18px] leading-[150%] tracking-[-0.02em] mb-[12px]">
          {label}
        </label>
      )}

      <div className="relative w-full" ref={dropdownRef}>
        {/* кнопка */}
        <div
          onClick={() => setOpen(!open)}
          className="
            w-full
            bg-(--color-line-background)
            text-white
            px-[16px]
            rounded-[12px]
            border border-[#252526]
            cursor-pointer
            flex items-center justify-between
            hover:border-[#2a2f38]
            transition
            h-[56px]
          "
        >
          <span>{value}</span>

          {/* стрелка */}
          <span
            className={`transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
            >
              <path
                d="M14.9386 6.7124L10.0486 11.6024C9.47109 12.1799 8.52609 12.1799 7.94859 11.6024L3.05859 6.7124"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>

        {/* список */}
        {open && (
          <div
            className="
              absolute
              mt-2
              w-full
              bg-(--color-line-background)
              border border-[#252526]
              rounded-[12px]
              overflow-hidden
              shadow-lg
              z-50
            "
          >
            {options.map((option) => (
              <div
                key={option}
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
                className="
                  px-4 py-3
                  text-white
                  cursor-pointer
                  hover:bg-[#1a1f27]
                  transition
                "
              >
                {option}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}