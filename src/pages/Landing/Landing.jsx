import Header from "../../components/Header";
import LineItem from "../../components/LineItem";
import Hero from "./blocks/Hero";
import LogoLoop from "./blocks/LogoLoop";

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
				speed={90}

				logoHeight={86}
				renderItem={(item) => (
					<LineItem img={item.img} width={item.width} height={item.height} />
				)}
			/>
		</div>
	);
}
