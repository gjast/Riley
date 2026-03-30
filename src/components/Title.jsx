import React from 'react'

export default function Title({ title, description }) {
	return (
		<div className='flex flex-col gap-[4px]'>
			<h2 className='text-[32px] font-semibold leading-[150%] tracking-[-0.02em] text-center'>{title}</h2>
			<p className='text-[18px] font-regular leading-[130%] tracking-[-0.02em] text-center text-[#8B8B8B] text-balance max-w-[260px] mx-auto'>{description}</p>
		</div>
	)
}
