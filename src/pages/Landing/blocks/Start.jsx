import React from 'react'
import Title from '../../../components/Title'
import StartItem from '../../../components/StartItem'
export default function Start() {
	return (
		<div className='flex flex-col gap-[48px] items-center justify-center w-[calc(100%-100px)] max-w-[812px]'>
			<Title title="Start a Project" description="Choose a service and provide your project details." />


			{(() => {
				const [activeIndex, setActiveIndex] = React.useState(0);
				const items = [
					{
						img: './imgs/starts/i1.svg',
						title: 'Web',
						position: 'bottom-0 right-0 w-[231px] h-[112px]'
					},
					{
						img: './imgs/starts/i2.svg',
						title: 'Logotype',
						position: 'bottom-0 right-[50%] translate-x-[50%] w-[212px] h-[112px]'
					},
					{
						img: './imgs/starts/i3.svg',
						title: 'Landing',
						position: 'bottom-0 left-[50%] translate-x-[-50%] w-[196px] h-[113px]'
					}
				];

				return (
					<div className='grid gap-[12px] items-center justify-center md:grid-cols-3 grid-cols-1 w-full'>
						{items.map((item, idx) => (
							<div key={item.title} onClick={() => setActiveIndex(idx)} style={{cursor: 'pointer'}}>
								<StartItem
									img={item.img}
									title={item.title}
									active={activeIndex === idx}
									position={item.position}
								/>
							</div>
						))}
					</div>
				);
			})()}
		</div>
	)
}
