import { useState, useRef, useEffect } from "react";

export default function PresetTextField({
  label,
  value,
  onChange,
  presets = [],
  /** Подсказка в поле (серым): последний выбранный пресет или дефолт */
  hintPlaceholder = "",
  /** Выбор из списка: только меняет подсказку, значение ввода сбрасывает родитель */
  onPresetPick,
  inputMode,
  autoComplete = "off",
}) {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const hasValue = value.length > 0;

  return (
    <div className="flex flex-col justify-center w-full">
      {label ? (
        <label className="mb-[12px] text-[18px] leading-[150%] tracking-[-0.02em] text-[#6A6A6D]">
          {label}
        </label>
      ) : null}

      <div className="relative w-full" ref={rootRef}>
        <div
          onClick={() => setOpen((o) => !o)}
          className="
            flex h-[56px] w-full cursor-pointer items-center justify-between
            rounded-[12px] border border-[#252526] bg-(--color-line-background)
            px-[16px] transition hover:border-[#2a2f38]
          "
        >
          <input
            type="text"
            inputMode={inputMode}
            autoComplete={autoComplete}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={hintPlaceholder}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={`
              min-w-0 flex-1 cursor-text bg-transparent text-[16px] outline-none
              placeholder:text-[#6A6A6D]
              ${
                !hasValue
                  ? "text-[#6A6A6D]"
                  : focused
                    ? "text-white"
                    : "text-[#6A6A6D]"
              }
            `}
          />

          <span
            className={`ml-2 shrink-0 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
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

        {open ? (
          <div
            className="
              absolute z-50 mt-2 w-full overflow-hidden rounded-[12px]
              border border-[#252526] bg-(--color-line-background) shadow-lg
            "
          >
            {presets.map((option) => (
              <div
                key={option}
                onClick={() => {
                  onPresetPick(option);
                  setOpen(false);
                }}
                className="
                  cursor-pointer px-4 py-3 text-white transition
                  hover:bg-[#1a1f27]
                "
              >
                {option}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
