import React from 'react'
import Title from '../../../components/Title'
import Case from '../../../components/Case'
export default function Cases() {
	return (
		<div className='flex flex-col gap-[48px] items-center justify-center w-[calc(100%-100px)] max-w-[1440px]'>
			<Title title="Cases" description="Choose a service and provide your project details." />

			<div className='grid gap-[24px] items-center justify-center md:grid-cols-3 grid-cols-1 w-full'>
				<Case img={'./imgs/case/1.png'} title={'Gambler (WEB + Illustrations) '} href={'#'} />
				<Case img={'./imgs/case/1.png'} title={'Gambler (WEB + Illustrations) '} href={'#'} />
				<Case img={'./imgs/case/1.png'} title={'Gambler (WEB + Illustrations) '} href={'#'} />

				<Case img={'./imgs/case/1.png'} title={'Gambler (WEB + Illustrations) '} href={'#'} />
				<Case img={'./imgs/case/1.png'} title={'Gambler (WEB + Illustrations) '} href={'#'} />
				<Case img={'./imgs/case/1.png'} title={'Gambler (WEB + Illustrations) '} href={'#'} />

				<Case img={'./imgs/case/1.png'} title={'Gambler (WEB + Illustrations) '} href={'#'} />
				<Case img={'./imgs/case/1.png'} title={'Gambler (WEB + Illustrations) '} href={'#'} />
				<Case img={'./imgs/case/1.png'} title={'Gambler (WEB + Illustrations) '} href={'#'} />
			</div>
		</div>
	)
}
