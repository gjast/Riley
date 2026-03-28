import React from 'react'

export default function CTA({ text, onClick }) {
	return (
		<button className="bg-white text-black px-[24px] h-[42px] rounded-[10px]
		text-[18px] font-medium tracking-[-0.02em] flex items-center justify-center
		cursor-pointer
		" onClick={onClick}>
			{text}
		</button>

	)
}
