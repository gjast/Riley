import { useRef } from "react";
import { useTranslation } from "react-i18next";

const panelStyle = {
  border: "1px solid transparent",
  background: `linear-gradient(var(--color-line-background), var(--color-line-background)) padding-box, linear-gradient(180deg, #1E1E20 0%, #101012 50%, #1E1E20 100%) border-box`,
};

const inputClass =
  "w-full rounded-xl border border-[#252526] bg-[#101012] px-3 py-2.5 text-[15px] leading-[150%] tracking-[-0.02em] text-white outline-none placeholder:text-[#76767A] focus:border-[#3a3a3c]";

const labelClass = "mb-1.5 block text-[13px] font-medium tracking-[-0.02em] text-[#8B8B8B]";

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
  const cardFileRefs = useRef({});

  if (!caseItem) {
    return (
      <p className="text-center text-[15px] text-[#8B8B8B]">{t("admin.emptyDraft")}</p>
    );
  }

  const setCardRef = (index, el) => {
    if (el) cardFileRefs.current[index] = el;
  };

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
              <label className={labelClass} htmlFor={`case-img-url-${caseIndex}`}>
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

      <section className="rounded-[16px] p-5 sm:p-6" style={panelStyle}>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-[18px] font-semibold tracking-[-0.02em] sm:text-[20px]">
            {t("admin.portfolioSectionTitle")}
          </h2>
          <button
            type="button"
            className="h-[42px] shrink-0 rounded-[10px] bg-white px-4 text-[14px] font-medium tracking-[-0.02em] text-black"
            onClick={onAddCard}
          >
            {t("admin.addBlock")}
          </button>
        </div>

        <div className="flex flex-col gap-6">
          {caseItem.cards.map((card, i) => (
            <div
              key={`${caseItem.id}-card-${i}`}
              className="rounded-xl border border-[#252526] bg-[#0a0a0b] p-4 sm:p-5"
            >
              <div className="mb-4 flex items-center justify-between gap-2">
                <span className="text-[14px] font-medium text-[#76767A]">
                  {t("admin.blockNumber", { n: i + 1 })}
                </span>
                <button
                  type="button"
                  className="text-[13px] font-medium text-[#8B8B8B] underline-offset-2 hover:text-white hover:underline"
                  onClick={() => onRemoveCard(i)}
                >
                  {t("admin.remove")}
                </button>
              </div>

              <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                <div className="lg:w-[180px]">
                  <span className={labelClass}>{t("admin.cardImage")}</span>
                  <div className="overflow-hidden rounded-xl border border-[#252526]">
                    <img
                      src={card.img || caseItem.img || "/imgs/case/1.png"}
                      alt=""
                      className="aspect-video w-full object-cover"
                    />
                  </div>
                  <input
                    ref={(el) => setCardRef(i, el)}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      e.target.value = "";
                      if (!f) return;
                      const url = await readFileAsDataUrl(f);
                      onChangeCard(i, { img: url });
                    }}
                  />
                  <button
                    type="button"
                    className="mt-2 w-full rounded-[10px] border border-[#252526] py-2 text-[13px] font-medium text-white hover:border-[#3a3a3c]"
                    onClick={() => cardFileRefs.current[i]?.click()}
                  >
                    {t("admin.upload")}
                  </button>
                </div>

                <div className="min-w-0 flex-1 space-y-3">
                  <div>
                    <label className={labelClass} htmlFor={`card-title-${caseIndex}-${i}`}>
                      {t("admin.title")}
                    </label>
                    <input
                      id={`card-title-${caseIndex}-${i}`}
                      className={inputClass}
                      value={card.title}
                      onChange={(e) => onChangeCard(i, { title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor={`card-desc-${caseIndex}-${i}`}>
                      {t("admin.description")}
                    </label>
                    <textarea
                      id={`card-desc-${caseIndex}-${i}`}
                      rows={4}
                      className={`${inputClass} resize-y min-h-[100px]`}
                      value={card.description}
                      onChange={(e) => onChangeCard(i, { description: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor={`card-href-${caseIndex}-${i}`}>
                      {t("admin.viewLinkLabel")}
                    </label>
                    <input
                      id={`card-href-${caseIndex}-${i}`}
                      className={inputClass}
                      value={card.href}
                      onChange={(e) => onChangeCard(i, { href: e.target.value })}
                      placeholder="#"
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor={`card-img-url-${caseIndex}-${i}`}>
                      {t("admin.cardImageUrl")}
                    </label>
                    <input
                      id={`card-img-url-${caseIndex}-${i}`}
                      className={inputClass}
                      value={card.img ?? ""}
                      onChange={(e) =>
                        onChangeCard(i, {
                          img: e.target.value.trim() ? e.target.value : undefined,
                        })
                      }
                      placeholder={t("admin.placeholderCardImageHint")}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
