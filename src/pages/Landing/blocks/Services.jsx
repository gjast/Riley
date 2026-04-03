import Title from "../../../components/Title";
import Servic from "../../../components/Servic";

const items = [
	{
		title: "Web",
		price: "≥ $1.500",
		position: "justify-start items-end",
		img: "./imgs/serv/web.png",
		positionImg: "h-auto pb-[15px]",
	},
	{
		title: "Landing",
		price: "≥ $350",
		position: "justify-end items-end",
		positionImg: "h-full",
		img: "./imgs/serv/land.png",
	},
	{
		title: "Logotypes",
		price: "≥ $300",
		position: "justify-end items-start",
		positionImg: "h-full",
		img: "./imgs/serv/logo.png",
	},
	{
		title: "Illustrations",
		price: "≥ $300",
		position: "justify-end items-start",
		positionImg: "h-full",
		img: "./imgs/serv/pen.png",
	},
];

export default function Services() {
	return (
		<section
			id="services"
			className="flex w-[calc(100%-100px)] max-w-[1440px] flex-col items-center justify-center gap-[48px]"
		>
			<Title title="Services" description="Choose a service and provide your project details." />

			<div className="grid w-full grid-cols-1 justify-items-center gap-4 md:grid-cols-4 md:gap-[16px]">
				{items.map((item) => (
					<div key={item.title} className="w-full max-md:flex max-md:justify-center">
						<Servic
							title={item.title}
							price={item.price}
							position={item.position}
							img={item.img}
							positionImg={item.positionImg}
						/>
					</div>
				))}
			</div>
		</section>
	);
}
