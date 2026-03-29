import React from 'react'

export default function CTA({ text, onClick }) {
	return (
		<button className="bg-white text-black px-[24px] h-[42px] rounded-[10px]
		2xl:text-[18px] text-[16px] text-center font-medium tracking-[-0.02em] flex items-center justify-center
		cursor-pointer 
		transition-all duration-300
		hover:scale-105 hover:shadow-[0_0_10px_2px_rgba(255,255,255,0.3)]
		active:scale-95
		" onClick={onClick}>
			{text}
		</button>

	)
}
