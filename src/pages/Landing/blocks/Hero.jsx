import React from 'react'
import CTA from '../../../components/CTA'

export default function Hero() {
	return (
		<div
			className="w-[calc(100%-50px)] max-w-[1540px] bg-[--color-hero-background] rounded-b-[24px] border-t-0 overflow-hidden relative flex items-center justify-center mb-[26px]"
			style={{
				boxShadow: 'inset 0 0 0 1px #1E1E20, inset 0 -1px 0 0 #1E1E20',
			}}
		>
			<div className='flex max-w-[500px] flex-col items-center justify-center gap-[12px] mt-[240px] mb-[396px]'>
				<h1 className='text-[56px] font-semibold leading-[1.2] tracking-[-0.02em] text-center'>A-Z development of
					full-fledged projects</h1>
				<h2 className='opacity-40 font-medium text-[18px] leading-normal tracking-[-0.02em] mb-[12px] text-center'>A responsible approach to business, reliability in work,
					and your confidence in the final result.</h2>

				<CTA text='Make an order' onClick={() => { }} />
			</div>

			<img className='absolute right-1/2 translate-x-1/2 bottom-0 object-cover' src='./imgs/Hero.png' alt='hero' />

		</div>
	)
}
