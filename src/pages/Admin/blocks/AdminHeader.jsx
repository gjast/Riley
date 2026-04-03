import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import logo from "../../../assets/logo.svg";

export default function AdminHeader({ onLogout }) {
  const { t } = useTranslation();

  return (
    <header className="fixed inset-x-0 top-3 z-20 mx-auto w-[calc(100%-2rem)] max-w-[1440px] sm:top-4 sm:w-[calc(100%-3rem)] lg:top-6 lg:w-[calc(100%-100px)]">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#1E1E20] bg-black/80 px-3 py-2.5 backdrop-blur-[196px] sm:px-4 sm:py-3 lg:rounded-[24px] lg:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <img src={logo} alt="" width={32} height={32} className="h-7 w-7 shrink-0 sm:h-8 sm:w-8" />
          <span className="truncate text-[16px] font-semibold sm:text-[17px] lg:text-[18px]">
            {t("admin.headerTitle")}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-4 sm:gap-5">
          {onLogout ? (
            <button
              type="button"
              onClick={onLogout}
              className="text-[15px] font-medium text-(--color-gray) transition-colors duration-300 hover:text-white"
            >
              {t("admin.logout")}
            </button>
          ) : null}
          <Link
            to="/"
            className="text-[15px] font-medium text-(--color-gray) transition-colors duration-300 hover:text-white"
          >
            {t("admin.toSite")}
          </Link>
        </div>
      </div>
    </header>
  );
}
