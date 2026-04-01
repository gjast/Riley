import React from "react";

export default function StartItem({ img, title, active, position }) {
	return (
		<div>
			<div className="relative flex-1 cursor-pointer overflow-hidden rounded-[12px] border border-[#252526] bg-[#101012] 2xl:h-[136px]">
				<img src={img} alt={title} className={`absolute z-10 h-[112px] object-cover ${position}`} />
				<img
					src="./imgs/gradient.svg"
					alt="gradient"
					className={`z-0 h-full w-full object-cover transition-opacity duration-300 ${active ? "opacity-100" : "opacity-0"}`}
				/>
			</div>
			<p
				className={`mt-[12px] text-[18px] font-medium leading-[150%] tracking-[-0.02em] transition-colors duration-300 ${active ? "text-white" : "text-[#6A6A6D]"}`}
			>
				{title}
			</p>
		</div>
	);
}
