import React from "react";

const Input = React.forwardRef(function Input(
  { label, value, onChange, placeholder = "", onFocus, ...rest },
  ref,
) {
  return (
    <div className="flex flex-col justify-center w-full">
      {label && (
        <label className="text-[#6A6A6D] text-[18px] leading-[150%] tracking-[-0.02em] mb-[12px]">
          {label}
        </label>
      )}

      <input
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        placeholder={placeholder}
        className="
          w-full
          bg-(--color-line-background)
          text-white
          px-[16px]
          rounded-[12px]
          border border-[#252526]
          h-[56px]
          outline-none
          transition
          placeholder:text-[#6A6A6D]
          focus:border-[#2a2f38]
        "
        {...rest}
      />
    </div>
  );
});

Input.displayName = "Input";

export default Input;