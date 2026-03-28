import { useTranslation } from "react-i18next";
import logo from "../assets/logo.svg";
import LanguageSwitcher from "./LanguageSwitcher";
import CTA from "./CTA";

const NAV_IDS = ["about", "services", "cases", "process", "faq"];

export default function Header() {
	const { t } = useTranslation();

	return (
		<div className="flex fixed top-[24px] left-1/2 -translate-x-1/2 w-[calc(100%-100px)] max-w-[1440px] items-center justify-between bg-[--color-hero-background]/50 backdrop-blur-[32px] z-10 rounded-[24px]">
			<div className="flex items-center gap-2">
				<img src={logo} alt="" width={32} height={32} />
				<h1 className="text-[18px] font-semibold">{t("header.brand")}</h1>
			</div>

			<div className="flex items-center gap-6 absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
				<nav aria-label={t("header.navLabel")}>
					<ul className="flex items-center gap-[28px]">
						{NAV_IDS.map((id) => (
							<a href={`#${id}`} className="text-[18px] font-medium text-(--color-gray) hover:text-white transition-colors duration-300" key={id}>{t(`header.nav.${id}`)}</a>
						))}
					</ul>
				</nav>
			</div>

			<div className="flex items-center gap-2">
				<div className="relative w-[42px] h-[42px]">
					<LanguageSwitcher />
				</div>
				<CTA text={t("header.CTA")} onClick={() => { }} />
			</div>
		</div>
	);
}
