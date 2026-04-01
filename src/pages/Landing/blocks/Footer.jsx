import CTA from "../../../components/CTA";

const FOOTER_IMAGES = [
	"/imgs/footer/Group.svg",
	"/imgs/footer/Group-1.svg",
	"/imgs/footer/Group-2.svg",
	"/imgs/footer/Group-3.svg",
	"/imgs/footer/Group-4.svg",
	"/imgs/footer/Group-5.svg",
];

export default function Footer() {
	return (
		<div
			className="relative mx-auto flex w-[calc(100%-2rem)] max-w-[1440px] flex-col justify-between gap-10 overflow-hidden rounded-2xl sm:w-[calc(100%-3rem)] sm:gap-12 md:gap-14 lg:w-[calc(100%-100px)] lg:gap-16"
			style={{
				border: "1px solid transparent",
				background:
					"linear-gradient(var(--color-line-background), var(--color-line-background)) padding-box, linear-gradient(180deg, #1E1E20 0%, #101012 50%, #1E1E20 100%) border-box",
			}}
		>
			<img
				src="/imgs/footer/footer-bg.png"
				alt=""
				className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
			/>

			<div className="relative z-10 flex flex-col gap-6 px-4 pb-0 pt-8 sm:px-6 sm:pt-10 md:flex-row md:items-start md:justify-between md:gap-8 md:px-10 md:pt-12 lg:px-12 lg:pt-[51px]">
				<div className="flex max-w-[414px] flex-col gap-3 sm:gap-[14px]">
					<h4 className="text-xl font-medium leading-[150%] tracking-[-0.02em] sm:text-[22px] md:text-[24px]">
						Ready to transform your product?
					</h4>
					<p className="text-base font-medium leading-[150%] tracking-[-0.02em] text-[#A1A1AA] md:text-[18px]">
						From wireframes to high-fidelity UI. Clean, scalable, and developer-ready
						designs.
					</p>
				</div>
				<p className="shrink-0 self-end text-sm font-medium leading-[150%] tracking-[-0.02em] text-[#ffffff]/20 sm:text-[15px] md:self-auto md:text-[16px]">
					2021-2026
				</p>
			</div>

			<div className="relative z-10 flex flex-col gap-8 px-4 pb-8 pt-0 sm:px-6 sm:pb-10 md:flex-row md:items-end md:justify-between md:gap-6 md:px-10 md:pb-12 lg:px-12 lg:pb-[51px]">
				<div className="flex items-center  flex-row gap-3 mx-auto sm:mx-0 rounded-[10px] bg-[#1D1E20] w-max h-[42px] sm:items-center">
					<p className="px-4 py-3 text-center text-base font-medium leading-[150%] tracking-[-0.02em] text-[#A2A2A2] sm:px-6 sm:py-0 sm:text-left md:px-[24px] md:text-[18px]">
						Get Started
					</p>
					<div className="flex justify-center sm:justify-start sm:pr-1">
						<CTA text="View Portfolio" onClick={() => {}} />
					</div>
				</div>

				<div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start md:justify-end md:gap-4">
					{FOOTER_IMAGES.map((src) => (
						<img
							key={src}
							src={src}
							alt=""
							className="h-9 w-9 cursor-pointer object-contain transition-all duration-300 hover:scale-105 sm:h-10 sm:w-10 md:h-11 md:w-11 lg:h-12 lg:w-12"
						/>
					))}
				</div>
			</div>
		</div>
	);
}
