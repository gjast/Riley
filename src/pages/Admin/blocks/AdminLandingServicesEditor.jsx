import { useRef } from "react";
import { useTranslation } from "react-i18next";

const panelStyle = {
  border: "1px solid transparent",
  background: `linear-gradient(var(--color-line-background), var(--color-line-background)) padding-box, linear-gradient(180deg, #1E1E20 0%, #101012 50%, #1E1E20 100%) border-box`,
};

const inputClass =
  "w-full rounded-xl border border-[#252526] bg-[#101012] px-3 py-2.5 text-[15px] leading-[150%] tracking-[-0.02em] text-white outline-none placeholder:text-[#76767A] focus:border-[#3a3a3c]";

const labelClass =
  "mb-1.5 block text-[13px] font-medium tracking-[-0.02em] text-[#8B8B8B]";

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export default function AdminLandingServicesEditor({
  serviceItem,
  casesForSelect,
  onChange,
}) {
  const { t } = useTranslation();
  const fileRef = useRef(null);

  if (!serviceItem) {
    return (
      <p className="text-center text-[15px] text-[#8B8B8B]">
        {t("admin.servicesEmpty")}
      </p>
    );
  }

  return (
    <div className="rounded-[16px] p-5 sm:p-6" style={panelStyle}>
      <h2 className="mb-2 text-[18px] font-semibold tracking-[-0.02em] sm:text-[20px]">
        {t("admin.servicesSectionTitle")}
      </h2>
      <p className="mb-5 text-[14px] leading-[150%] text-[#8B8B8B]">
        {t("admin.servicesIntro")}
        <span className="text-white"> {serviceItem.key}</span>
      </p>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="sm:w-[200px]">
          <span className={labelClass}>{t("admin.preview")}</span>
          <div className="overflow-hidden rounded-xl border border-[#252526] bg-black/40">
            <img
              src={serviceItem.img || "/imgs/serv/web.png"}
              alt=""
              className="aspect-[216/260] w-full object-contain p-2"
            />
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (!f) return;
              const url = await readFileAsDataUrl(f);
              onChange({ img: url });
            }}
          />
          <button
            type="button"
            className="mt-2 w-full rounded-[10px] border border-[#252526] bg-transparent py-2 text-[14px] font-medium text-white transition-colors hover:border-[#3a3a3c]"
            onClick={() => fileRef.current?.click()}
          >
            {t("admin.uploadFile")}
          </button>
        </div>

        <div className="min-w-0 flex-1 space-y-4">
          <div>
            <label className={labelClass} htmlFor={`svc-title-${serviceItem.key}`}>
              {t("admin.servicesCardTitle")}
            </label>
            <input
              id={`svc-title-${serviceItem.key}`}
              className={inputClass}
              value={serviceItem.title}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder={t("admin.servicesTitlePlaceholder")}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor={`svc-price-${serviceItem.key}`}>
              {t("admin.servicesCardPrice")}
            </label>
            <input
              id={`svc-price-${serviceItem.key}`}
              className={inputClass}
              value={serviceItem.price}
              onChange={(e) => onChange({ price: e.target.value })}
              placeholder={t("admin.servicesPricePlaceholder")}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor={`svc-img-${serviceItem.key}`}>
              {t("admin.imageUrl")}
            </label>
            <input
              id={`svc-img-${serviceItem.key}`}
              className={inputClass}
              value={serviceItem.img}
              onChange={(e) => onChange({ img: e.target.value })}
              placeholder="/imgs/serv/web.png"
            />
          </div>
          <div>
            <label
              className={labelClass}
              htmlFor={`svc-portfolio-${serviceItem.key}`}
            >
              {t("admin.servicesPortfolioCase")}
            </label>
            <select
              id={`svc-portfolio-${serviceItem.key}`}
              className={inputClass}
              value={serviceItem.portfolioCaseId}
              onChange={(e) => onChange({ portfolioCaseId: e.target.value })}
            >
              {casesForSelect.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title || c.id}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-[12px] leading-[150%] text-[#76767A]">
              {t("admin.servicesPortfolioHint")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
