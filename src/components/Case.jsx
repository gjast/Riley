import { Link } from "react-router-dom";

export default function Case({ img, title, to }) {
  return (
    <Link to={to} className="flex flex-1 flex-col gap-3 sm:gap-4 md:gap-[16px]">
      <img
        src={img}
        alt=""
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
        className="aspect-4/3 w-full select-none rounded-xl border border-[#252526] object-cover sm:rounded-2xl md:rounded-[16px]"
      />
      <p className="text-[15px] font-medium leading-snug sm:text-[16px] md:text-[18px]">
        {title}
      </p>
    </Link>
  );
}
