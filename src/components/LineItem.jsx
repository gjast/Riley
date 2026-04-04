const boxStyle = {
	background:
		"linear-gradient(var(--color-line-background), var(--color-line-background)) padding-box, linear-gradient(180deg, #1E1E20 0%, #101012 50%, #1E1E20 100%) border-box",
	border: "1px solid transparent",
};

const boxClass =
	"flex h-[86px] w-[216px] shrink-0 items-center justify-center rounded-[12px]";

/** Ссылка визуально как карточка: без подчёркивания и без выделения фокуса */
const linkClass = `${boxClass} cursor-pointer no-underline text-inherit outline-none visited:text-inherit focus:outline-none focus-visible:outline-none`;

export default function LineItem({ img, width, height, href, ariaLabel }) {
	const inner = (
		<img
			src={img}
			alt=""
			className="max-h-full max-w-full object-contain"
			style={{ width, height }}
		/>
	);

	if (href) {
		return (
			<a
				href={href}
				target="_blank"
				rel="noopener noreferrer"
				className={linkClass}
				style={boxStyle}
				aria-label={ariaLabel || "Partner website"}
			>
				{inner}
			</a>
		);
	}

	return (
		<div className={boxClass} style={boxStyle}>
			{inner}
		</div>
	);
}
