import { Link } from "react-router-dom";

export default function Case({ img, title, to, eager }) {
  return (
    <Link to={to} className="flex flex-1 flex-col gap-3 sm:gap-4 md:gap-[16px]">
      <img
        src={img}
        alt=""
        draggable={false}
        decoding="async"
        loading={eager ? "eager" : "lazy"}
        onDragStart={(e) => e.preventDefault()}
        className="w-full h-full aspect-square select-none rounded-xl border border-[#252526] object-cover sm:rounded-2xl md:rounded-[16px]"
      />
      <p className="text-[15px] font-medium leading-snug sm:text-[16px] md:text-[18px]">
        {title}
      </p>
    </Link>
  );
}
