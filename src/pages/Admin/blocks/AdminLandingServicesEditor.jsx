import { useTranslation } from "react-i18next";
import { LANDING_SERVICE_CARD_LAYOUT } from "../../../data/cases";

const panelStyle = {
  border: "1px solid transparent",
  background: `linear-gradient(var(--color-line-background), var(--color-line-background)) padding-box, linear-gradient(180deg, #1E1E20 0%, #101012 50%, #1E1E20 100%) border-box`,
};

const labelClass =
  "mb-1.5 block text-[13px] font-medium tracking-[-0.02em] text-[#8B8B8B]";

/**
 * Плитка «Услуги» на лендинге фиксирована; карточки портфолио — ниже (отдельно от кейсов).
 */
export default function AdminLandingServicesEditor({ serviceItem }) {
  const { t } = useTranslation();

  if (!serviceItem) {
    return (
      <p className="text-center text-[15px] text-[#8B8B8B]">
        {t("admin.servicesEmpty")}
      </p>
    );
  }

  const layout = LANDING_SERVICE_CARD_LAYOUT[serviceItem.key];

  return (
    <div className="rounded-[16px] p-5 sm:p-6" style={panelStyle}>
      <h2 className="mb-2 text-[18px] font-semibold tracking-[-0.02em] sm:text-[20px]">
        {t("admin.servicesSectionTitle")}
      </h2>
      <p className="mb-5 text-[14px] leading-[150%] text-[#8B8B8B]">
        {t("admin.servicesLinkIntro")}
      </p>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="sm:w-[200px]">
          <span className={labelClass}>{t("admin.servicesTilePreview")}</span>
          <div className="overflow-hidden rounded-xl border border-[#252526] bg-black/40">
            {layout ? (
              <img
                src={layout.img}
                alt=""
                className="aspect-216/260 w-full object-contain p-2"
              />
            ) : (
              <div className="flex aspect-216/260 items-center justify-center text-[13px] text-[#76767A]">
                {serviceItem.key}
              </div>
            )}
          </div>
          <p className="mt-2 text-[12px] leading-[150%] text-[#76767A]">
            {t("admin.servicesTileFixedHint")}
          </p>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[14px] leading-[150%] text-[#8B8B8B]">
            <span className="font-medium text-white">
              {t(`services.items.${serviceItem.key}.title`)}
            </span>{" "}
            <span className="text-[#76767A]">({serviceItem.key})</span>
          </p>
          <p className="mt-2 text-[13px] leading-[150%] text-[#76767A]">
            {t("admin.servicesPortfolioUrlPrefix")}{" "}
            <span className="text-white">/services/{serviceItem.key}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
