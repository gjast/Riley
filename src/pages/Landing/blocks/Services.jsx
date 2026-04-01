import React from 'react'
import Title from '../../../components/Title'
import Servic from '../../../components/Servic'


export default function Services() {
	return (
		<section id="services" className='flex flex-col gap-[48px] items-center justify-center w-[calc(100%-100px)] max-w-[1440px]'>
				<Title title="Services" description="Choose a service and provide your project details." />

				<div className="grid w-full grid-cols-1 justify-items-center gap-4 md:grid-cols-4 md:gap-[16px]">
						<Servic 
						title={'Web'} 
						price={'≥ $1.500'} 
						href={'#'} 
						position={'justify-start items-end'} 
						img={'./imgs/serv/web.png'}
						positionImg={'h-auto pb-[15px]'}
						/>
							<Servic 
						title={'Landing'} 
						price={'≥ $350'} 
						href={'#'} 
						position={'justify-end items-end'}
						positionImg={'h-full'} 
						img={'./imgs/serv/land.png'}
						/>
							<Servic 
						title={'Logotypes'} 
						price={'≥ $300'} 
						href={'#'} 
						position={'justify-end items-start'} 
						positionImg={'h-full'}
						img={'./imgs/serv/logo.png'}
						/>
							<Servic 
						title={'Illustrations'} 
						price={'≥ $300'} 
						href={'#'} 
						position={'justify-end items-start'} 
						positionImg={'h-full'}
						img={'./imgs/serv/pen.png'}
						/>
				</div>

				
		</section>
	)
}
