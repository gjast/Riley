import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import CTA from "../../../components/CTA";
import { useScrollToSection } from "../../../hooks/useScrollToSection";

/** Из `#process`, `/#process` или пути — id секции на главной. */
function footerSectionId(hrefProp) {
  const s = String(hrefProp ?? "").trim();
  if (!s) return "process";
  const i = s.indexOf("#");
  if (i !== -1) {
    const rest = s.slice(i + 1).trim();
    return rest.replace(/^\/+/, "") || "process";
  }
  return s.replace(/^\/+/, "").replace(/\/$/, "").trim() || "process";
}

/** Порядок: Lolzteam → Exploit → Pinterest → Behance */
const FOOTER_SOCIAL_LINKS = [
	{
		src: "/imgs/footer/Group-3.svg",
		href: "https://lolz.live/relay/",
		label: "Lolzteam",
	},
	{
		src: "/imgs/footer/Group-2.svg",
		href: "https://t.me/relayportfolio_lzt",
		label: "Telegram",
	},
	{
		src: "/imgs/footer/Group-4.svg",
		href: "https://forum.exploit.in/profile/201094-relay/",
		label: "Exploit",
	},
	{
		src: "/imgs/footer/Group-1.svg",
		href: "https://ro.pinterest.com/relayhell/",
		label: "Pinterest",
	},
	{
		src: "/imgs/footer/Group.svg",
		href: "https://www.behance.net/relayhell",
		label: "Behance",
	},
];

export default function Footer({ href = "#process" }) {
	const { t } = useTranslation();
	const location = useLocation();
	const navigate = useNavigate();
	const scrollToSection = useScrollToSection();

	const onCta = useCallback(() => {
		const id = footerSectionId(href);
		if (location.pathname === "/") {
			scrollToSection(id);
			return;
		}
		navigate({ pathname: "/", hash: `#${id}` });
	}, [href, location.pathname, navigate, scrollToSection]);

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
				<div className="flex sm:items-start items-center max-w-[414px] flex-col gap-3 sm:gap-[14px]">
					<h4 className="text-xl font-medium leading-[150%] tracking-[-0.02em] sm:text-[22px] md:text-[24px]">
						{t("footer.heading")}
					</h4>
					<p className="text-base text-balance sm:text-left font-medium leading-[150%] tracking-[-0.02em] text-[#A1A1AA] md:text-[18px]">
						{t("footer.body")}
					</p>
				</div>
				<p className="shrink-0 sm:self-end self-center text-sm font-medium leading-[150%] tracking-[-0.02em] text-[#ffffff]/20 sm:text-[15px] md:self-auto md:text-[16px]">
					2021-2026
				</p>
			</div>

			<div className="relative z-10 flex flex-col gap-8 px-4 pb-8 pt-0 sm:px-6 sm:pb-10 md:flex-row md:items-end md:justify-between md:gap-6 md:px-10 md:pb-12 lg:px-12 lg:pb-[51px]">
				<div className="flex items-center  flex-row gap-3 mx-auto sm:mx-0 rounded-[10px] bg-[#1D1E20] w-max h-[42px] sm:items-center">
					
					<div className="flex justify-center sm:justify-start sm:pr-1">
						<CTA text={t("footer.viewPortfolio")} onClick={onCta} />
					</div>
				</div>

				<div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start md:justify-end md:gap-4">
					{FOOTER_SOCIAL_LINKS.map(({ src, href, label }) => (
						<a
							key={href}
							href={href}
							target="_blank"
							rel="noopener noreferrer"
							aria-label={label}
							className="inline-flex rounded-full outline-none ring-offset-2 ring-offset-(--color-line-background) transition-all duration-300 hover:scale-105 focus-visible:ring-2 focus-visible:ring-white/40"
						>
							<img
								src={src}
								alt=""
								className="h-9 w-9 object-contain sm:h-10 sm:w-10 md:h-11 md:w-11 lg:h-12 lg:w-12"
							/>
						</a>
					))}
				</div>
			</div>
		</div>
	);
}
