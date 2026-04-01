import React from 'react'

export default function StartItem({img, title, active, position}) {
	return (
		<div>
			<div className='2xl:h-[136px] flex-1 bg-[#101012] border border-[#252526] cursor-pointer rounded-[12px] relative overflow-hidden '>
				<img src={img} alt={title} className={`z-10 absolute ${position} h-[112px] object-cover`} />
				<img 
					src='./imgs/gradient.svg' 
					alt='gradient' 
					className={`
						w-full h-full z-0 object-cover 
						transition-opacity duration-300
						${active ? 'opacity-100' : 'opacity-0'}
					`}
				/>
			</div>
			<p 
				className={`
					font-medium text-[18px] leading-[150%] tracking-[-0.02em] mt-[12px]
					transition-colors duration-300
					${active ? 'text-white' : 'text-[#6A6A6D]'}
				`}
			>
				{title}
			</p>
		</div>
	)
}
