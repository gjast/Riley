import { Link } from "react-router-dom";

const BORDER_GRAD =
	"linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0) 48.56%, rgba(255, 255, 255, 0.04) 100%)";

export default function Servic({
	img,
	title,
	price,
	position,
	positionImg,
	to,
	eagerImage,
}) {
	return (
		<Link
			to={to}
			className="relative flex h-[442px] w-full min-w-0 flex-col justify-between overflow-hidden rounded-[16px] 2xl:h-[512px] text-inherit no-underline outline-none visited:text-inherit focus:outline-none focus-visible:outline-none"
			style={{
				border: "1px solid transparent",
				background: `linear-gradient(var(--color-line-background), var(--color-line-background)) padding-box, ${BORDER_GRAD} border-box`,
			}}
		>
			<p className="mx-[28px] mt-[28px] text-[18px] font-medium">{title}</p>

			<div
				className={`absolute top-0 left-0 w-full 2xl:h-[415px] h-[360px] select-none flex justify-end items-end ${position}`}
			>
				<img
					src={img}
					alt=""
					draggable={false}
					decoding="async"
					loading={eagerImage ? "eager" : "lazy"}
					onDragStart={(e) => e.preventDefault()}
					className={`absolute max-w-[85%] sm:max-w-[95%] select-none ${positionImg}`}
				/>
			</div>

			<div className="flex items-center justify-between px-[28px]  pb-[28px]
				group
			">
				<p className="text-[18px] font-medium">{price}</p>

				<svg
					width="18"
					height="18"
					viewBox="0 0 18 18"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					aria-hidden
					className="transition-transform duration-200 ease-in-out group-hover:translate-x-[5px]"
				>
					<path
						d="M6.68359 14.9401L11.5736 10.0501C12.1511 9.47256 12.1511 8.52756 11.5736 7.95006L6.68359 3.06006"
						stroke="white"
						strokeWidth="1.5"
						strokeMiterlimit="10"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			</div>
		</Link>
	);
}
