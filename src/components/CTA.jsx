import React from 'react'

export default function CTA({ text, onClick, className = "" }) {
	return (
		<button
			className={`flex h-[42px] cursor-pointer items-center justify-center rounded-[10px] bg-white px-[24px] text-center text-[16px] font-medium tracking-[-0.02em] text-black transition-all duration-300 hover:scale-105 hover:shadow-[0_0_10px_2px_rgba(255,255,255,0.3)] active:scale-95 2xl:text-[18px] ${className}`}
			onClick={onClick}
		>
			{text}
		</button>

	)
}
