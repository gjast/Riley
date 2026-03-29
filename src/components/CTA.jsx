import React from 'react'

export default function CTA({ text, onClick }) {
	return (
		<button className="bg-white text-black px-[24px] h-[42px] rounded-[10px]
		2xl:text-[18px] text-[16px] font-medium tracking-[-0.02em] flex items-center justify-center
		cursor-pointer
		hover:tra
		" onClick={onClick}>
			{text}
		</button>

	)
}
