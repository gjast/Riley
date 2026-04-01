export default function Title({ title, description }) {
	return (
		<div className="flex flex-col gap-1 sm:gap-[4px]">
			<h2 className="text-center text-[26px] font-semibold leading-[150%] tracking-[-0.02em] sm:text-[29px] md:text-[32px]">
				{title}
			</h2>
			{description ? (
				<p className="mx-auto w-full max-w-[min(100%,260px)] text-center text-[15px] font-normal leading-[130%] tracking-[-0.02em] text-balance text-[#8B8B8B] sm:max-w-[280px] sm:text-base md:max-w-[320px] md:text-[18px]">
					{description}
				</p>
			) : null}
		</div>
	);
}
