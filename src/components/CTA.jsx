import React from 'react'

export default function CTA({ text, onClick, className = "" }) {
	return (
		<button
			className={`flex h-[42px] cursor-pointer items-center justify-center rounded-[10px] bg-white px-[24px] text-center text-[16px] font-medium tracking-[-0.02em] text-black 2xl:text-[18px] ${className}`}
			onClick={onClick}
		>
			{text}
		</button>

	)
}
