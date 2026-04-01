import { useState } from "react";
import { useTranslation } from "react-i18next";
import enFlag from "../assets/flags/en.svg";
import ruFlag from "../assets/flags/ru.svg";

const FLAGS = { en: enFlag, ru: ruFlag };

export default function LanguageSwitcher({ inline = false }) {
	const { i18n, t } = useTranslation();
	const [open, setOpen] = useState(false);
	const current = i18n.resolvedLanguage?.startsWith("ru") ? "ru" : "en";
	const other = current === "ru" ? "en" : "ru";

	const handlePickOther = (e) => {
		void i18n.changeLanguage(other);
		setOpen(false);
		e.currentTarget.blur();
	};

	return (
		<div
			className={`w-[42px] ${inline ? "relative mx-auto" : "absolute top-0 right-0"}`}
			role="group"
			aria-label={t("language.switcherLabel")}
			aria-expanded={open}
			onMouseEnter={() => setOpen(true)}
			onMouseLeave={() => setOpen(false)}
		>
			<div className="flex flex-col overflow-hidden rounded-[10px] border border-[#1E1E20] bg-[#101012]">
				<div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center">
					<span
						className="flex h-[24px] w-[24px] items-center justify-center"
						aria-hidden
					>
						<img src={FLAGS[current]} alt="" width={24} height={24} />
					</span>
				</div>

				<div
					className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
				>
					<div className="min-h-0 overflow-hidden">
						<div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center">
							<button
								type="button"
								onClick={handlePickOther}
								className="flex h-[24px] w-[24px] cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-white/40"
								aria-label={t(`language.${other}`)}
							>
								<img src={FLAGS[other]} alt="" width={24} height={24} />
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
