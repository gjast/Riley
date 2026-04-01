import React from "react";

export default function Textarea({
  label,
  value,
  onChange,
  placeholder = "",
}) {
  return (
    <div className="flex flex-col justify-center w-full">
      {label && (
        <label className="text-[#6A6A6D] text-[18px] leading-[150%] tracking-[-0.02em] mb-[12px]">
          {label}
        </label>
      )}

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          w-full
          bg-(--color-line-background)
          text-white
          px-[16px]
          py-[16px]
          rounded-[12px]
          border border-[#252526]
          min-h-[80px]
          resize-none
          outline-none
          transition
          placeholder:text-[#6A6A6D]
          focus:border-[#2a2f38]
        "
      />
    </div>
  );
}