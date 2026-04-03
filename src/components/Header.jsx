import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import logo from "../assets/logo.svg";
import LanguageSwitcher from "./LanguageSwitcher";
import CTA from "./CTA";

const NAV_IDS = ["about", "services", "cases", "process", "faq"];

export default function Header() {
	const { t } = useTranslation();
	const [menuOpen, setMenuOpen] = useState(false);

	const closeMenu = useCallback(() => setMenuOpen(false), []);

	useEffect(() => {
		if (!menuOpen) return;
		const onKey = (e) => {
			if (e.key === "Escape") closeMenu();
		};
		document.addEventListener("keydown", onKey);
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", onKey);
			document.body.style.overflow = "";
		};
	}, [menuOpen, closeMenu]);

	return (
		<header
			data-site-header
			className="fixed left-1/2 top-3 z-20 w-[calc(100%-2rem)] max-w-[1440px] -translate-x-1/2 sm:top-4 sm:w-[calc(100%-3rem)] lg:top-6 lg:w-[calc(100%-100px)]"
		>
			<div className="flex items-center justify-between gap-3 rounded-2xl bg-[--color-hero-background]/50 px-3 py-2.5 backdrop-blur-[62px] sm:px-4 sm:py-3 lg:rounded-[24px] lg:px-4">
				<div className="flex min-w-0 items-center gap-2">
					<img src={logo} alt="" width={32} height={32} className="h-7 w-7 shrink-0 sm:h-8 sm:w-8" />
					<h1 className="truncate text-[16px] font-semibold sm:text-[17px] lg:text-[18px]">
						{t("header.brand")}
					</h1>
				</div>

				<nav
					className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:block"
					aria-label={t("header.navLabel")}
				>
					<ul className="flex items-center gap-5 xl:gap-[28px]">
						{NAV_IDS.map((id) => (
							<li key={id}>
								<a
									href={`#${id}`}
									className="text-[15px] font-medium text-(--color-gray) transition-colors duration-300 hover:text-white xl:text-[16px] 2xl:text-[18px]"
								>
									{t(`header.nav.${id}`)}
								</a>
							</li>
						))}
					</ul>
				</nav>

				<div className="flex shrink-0 items-center gap-2 sm:gap-3">
					<div className="relative hidden h-[42px] w-[42px] lg:block">
						<LanguageSwitcher />
					</div>
					<CTA
						text={t("header.CTA")}
						onClick={() => {}}
						className="hidden px-4 text-[14px] sm:px-5 lg:flex lg:text-[16px]"
					/>

					<button
						type="button"
						className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#1E1E20] bg-[#101012]/80 lg:hidden"
						aria-expanded={menuOpen}
						aria-controls="mobile-nav"
						aria-label={menuOpen ? t("header.closeMenu") : t("header.openMenu")}
						onClick={() => setMenuOpen((o) => !o)}
					>
						<span
							className={`absolute block h-0.5 w-5 rounded-full bg-white transition-transform duration-200 ${menuOpen ? "translate-y-0 rotate-45" : "-translate-y-1.5"}`}
						/>
						<span
							className={`absolute block h-0.5 w-5 rounded-full bg-white transition-opacity duration-200 ${menuOpen ? "opacity-0" : ""}`}
						/>
						<span
							className={`absolute block h-0.5 w-5 rounded-full bg-white transition-transform duration-200 ${menuOpen ? "translate-y-0 -rotate-45" : "translate-y-1.5"}`}
						/>
					</button>
				</div>
			</div>

			{menuOpen ? (
				<>
					<button
						type="button"
						className="fixed inset-0 z-18 bg-black/55 lg:hidden"
						aria-hidden
						tabIndex={-1}
						onClick={closeMenu}
					/>
					<div
						id="mobile-nav"
						className="absolute left-0 right-0 top-[calc(100%+8px)] z-19 flex flex-col gap-1 rounded-2xl border border-[#1E1E20] bg-[#101012] p-4 shadow-xl lg:hidden"
						role="dialog"
						aria-modal="true"
						aria-label={t("header.navLabel")}
					>
						<ul className="flex flex-col">
							{NAV_IDS.map((id) => (
								<li key={id} className="border-b border-white/5 last:border-0">
									<a
										href={`#${id}`}
										className="block py-3.5 text-[16px] font-medium text-(--color-gray) transition-colors hover:text-white"
										onClick={closeMenu}
									>
										{t(`header.nav.${id}`)}
									</a>
								</li>
							))}
						</ul>

						<div className="mt-2 flex flex-col gap-3 border-t border-white/10 pt-4">
							
							<CTA
								text={t("header.CTA")}
								onClick={() => {
									closeMenu();
								}}
								className="w-full text-[15px]"
							/>
							<div className="flex justify-between items-center gap-1">
							<p className="text-center text-xs font-medium uppercase tracking-wide text-[#76767A]">
								{t("language.switcherLabel")}
							</p>
							<div className="flex justify-center py-1">
								<LanguageSwitcher inline mode="toggle" />
							</div>
							</div>
						</div>
					</div>
				</>
			) : null}
		</header>
	);
}
