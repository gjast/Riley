import { useRef } from "react";
import { useTranslation } from "react-i18next";
import AdminPortfolioCardsSection from "./AdminPortfolioCardsSection";

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

export default function AdminCaseEditor({
  caseItem,
  caseIndex,
  onChangeCase,
  onChangeCard,
  onAddCard,
  onRemoveCard,
}) {
  const { t } = useTranslation();
  const landingFileRef = useRef(null);

  if (!caseItem) {
    return (
      <p className="text-center text-[15px] text-[#8B8B8B]">
        {t("admin.emptyDraft")}
      </p>
    );
  }

  const idPrefix = `case-${caseIndex}`;

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-[16px] p-5 sm:p-6" style={panelStyle}>
        <h2 className="mb-5 text-[18px] font-semibold tracking-[-0.02em] sm:text-[20px]">
          {t("admin.landingSectionTitle")}
        </h2>
        <p className="mb-4 text-[14px] leading-[150%] text-[#8B8B8B]">
          {t("admin.landingHintPrefix")}{" "}
          <span className="text-white">/portfolio/{caseItem.id}</span>
        </p>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="sm:w-[200px]">
            <span className={labelClass}>{t("admin.preview")}</span>
            <div className="overflow-hidden rounded-xl border border-[#252526] bg-black/40">
              <img
                src={caseItem.img || "/imgs/case/1.png"}
                alt=""
                className="aspect-4/3 w-full object-cover"
              />
            </div>
            <input
              ref={landingFileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (!f) return;
                const url = await readFileAsDataUrl(f);
                onChangeCase({ img: url });
              }}
            />
            <button
              type="button"
              className="mt-2 w-full rounded-[10px] border border-[#252526] bg-transparent py-2 text-[14px] font-medium text-white transition-colors hover:border-[#3a3a3c]"
              onClick={() => landingFileRef.current?.click()}
            >
              {t("admin.uploadFile")}
            </button>
          </div>

          <div className="min-w-0 flex-1 space-y-4">
            <div>
              <label className={labelClass} htmlFor={`case-title-${caseIndex}`}>
                {t("admin.title")}
              </label>
              <input
                id={`case-title-${caseIndex}`}
                className={inputClass}
                value={caseItem.title}
                onChange={(e) => onChangeCase({ title: e.target.value })}
              />
            </div>
            <div>
              <label
                className={labelClass}
                htmlFor={`case-img-url-${caseIndex}`}
              >
                {t("admin.imageUrl")}
              </label>
              <input
                id={`case-img-url-${caseIndex}`}
                className={inputClass}
                value={caseItem.img}
                onChange={(e) => onChangeCase({ img: e.target.value })}
                placeholder={t("admin.placeholderCaseImage")}
              />
            </div>
          </div>
        </div>
      </section>

      <AdminPortfolioCardsSection
        listKey={caseItem.id}
        cards={caseItem.cards}
        idPrefix={idPrefix}
        fallbackImage={caseItem.img || "/imgs/case/1.png"}
        onChangeCard={onChangeCard}
        onAddCard={onAddCard}
        onRemoveCard={onRemoveCard}
      />
    </div>
  );
}
