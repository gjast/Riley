import CTA from "../../../components/CTA";
import StarfieldBackground from "../../../components/StarfieldBackground";

export default function Hero() {
	return (
		<div
			className="relative mb-[26px] flex min-h-[calc(100vh-111px)] w-[calc(100%-50px)] justify-center overflow-hidden rounded-b-[24px] border-t-0 bg-[--color-hero-background]"
			style={{
				boxShadow:
					"inset 0 0 0 1px #1E1E20, inset 0 -1px 0 0 #1E1E20",
			}}
		>
			<StarfieldBackground
				angle={-32} // направление дрейфа в градусах (0° — вправо, 90° — вниз)
				count={15} // сколько «звёзд» одновременно
				driftDistance={150} // длина одного цикла движения в vmin (насколько далеко уезжает за проход)
				medianScale={0.74} // средний масштаб SVG; вместе с scaleJitter задаёт размер
				scaleJitter={0.9} // разброс масштаба вокруг medianScale (±)
				spawnLeftMin={-52} // левая граница зоны спавна, % ширины секции (можно < 0 — за левым краем)
				spawnLeftMax={58} // правая граница зоны спавна по горизонтали, %
				spawnTopMin={93} // верхняя граница зоны спавна по вертикали, %
				spawnTopMax={124} // нижняя граница зоны спавна, % (>100 — ниже блока)
				speedCurve={2} // 0 — линейно; 1 — сначала быстро, в конце медленно; 2 — сначала медленно, в конце быстро; 3 — медленно → быстро в середине → медленно
			/>

			<div className="relative z-10 mt-[15vh] flex h-max max-w-[500px] flex-col items-center gap-[12px]">
				<h1 className='2xl:text-[56px] text-[42px] font-semibold leading-[1.2] tracking-[-0.02em] text-center'>A-Z development of<br/>
					full-fledged projects</h1>
				<h2 className='opacity-40 font-medium 2xl:text-[18px] text-[16px] leading-normal tracking-[-0.02em] mb-[12px] text-center'>A responsible approach to business, reliability in work, <br/>
					and your confidence in the final result.
				</h2>

				<CTA text='Make an order' onClick={() => { }} />
			</div>

			<img
				className="absolute bottom-0 right-1/2 z-1 translate-x-1/2 object-cover"
				src="/imgs/Hero.png"
				alt=""
			/>

		</div>
	)
}
