import React from 'react'

export default function Case({img, title, href}) {
	return (
		<a href={href} className='flex flex-col gap-[16px] flex-1'>
			<img src={img} alt={title} className='w-full h-full object-cover rounded-[16px] border border-[#252526]' />

			<p className='text-[18px] font-medium'>{title}</p>
		</a>
	)
}
