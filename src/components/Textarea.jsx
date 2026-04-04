import { useLayoutEffect, useRef } from "react";

const MIN_HEIGHT_PX = 80;

export default function Textarea({
  label,
  value,
  onChange,
  placeholder = "",
}) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(MIN_HEIGHT_PX, el.scrollHeight)}px`;
  }, [value]);

  return (
    <div className="flex w-full flex-col justify-center">
      {label && (
        <label className="mb-[12px] text-[18px] leading-[150%] tracking-[-0.02em] text-[#6A6A6D]">
          {label}
        </label>
      )}

      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          w-full
          min-h-[80px]
          resize-none
          overflow-hidden
          rounded-[12px]
          border border-[#252526]
          bg-(--color-line-background)
          px-[16px]
          py-[16px]
          text-white
          outline-none
          transition-[border-color]
          placeholder:text-[#6A6A6D]
          focus:border-[#2a2f38]
        "
      />
    </div>
  );
}
