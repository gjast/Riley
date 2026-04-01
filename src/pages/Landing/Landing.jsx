import Header from "../../components/Header";
import LineItem from "../../components/LineItem";
import Hero from "./blocks/Hero";
import LogoLoop from "./blocks/LogoLoop";
import Services from "./blocks/Services";
import Cases from "./blocks/Cases";
import Start from "./blocks/Start";
import Faq from "./blocks/Faq";
import Footer from "./blocks/Footer";
const LINE_ITEMS = [
	{
		img: '/imgs/coop/1.png',
		width: '144px',
		height: '52px',
	},
	{
		img: '/imgs/coop/1.png',
		width: '144px',
		height: '52px',
	},

	{
		img: '/imgs/coop/1.png',
		width: '144px',
		height: '52px',
	},
	{
		img: '/imgs/coop/1.png',
		width: '144px',
		height: '52px',
	},
	{
		img: '/imgs/coop/1.png',
		width: '144px',
		height: '52px',
	},
	{
		img: "/imgs/coop/1.png",
		width: "144px",
		height: "52px",
	},
];

export default function Landing() {
	return (
		<div className="flex flex-col items-center">
			<Header />
			<Hero />
			<LogoLoop
				logos={LINE_ITEMS}
				gap={16}
				speed={30}

				logoHeight={86}
				renderItem={(item) => (
					<LineItem img={item.img} width={item.width} height={item.height} />
				)}
			/>
			<div className='w-full flex flex-col mt-[96px] mb-[64px] gap-[96px] items-center justify-center'>
			<Services/>
			<Cases/>
			<Start/>
			<Faq/>
			<Footer/>
			</div>
		</div>
	);
}
