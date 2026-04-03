import { useTranslation } from "react-i18next";

export default function AdminToolbar({
  onSave,
  onReset,
  onExport,
  onImportClick,
  importInputRef,
  onImportFile,
  statusText,
}) {
  const { t } = useTranslation();

  return (
    <div
      className="flex flex-col gap-4 rounded-[16px] p-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3 sm:p-5"
      style={{
        border: "1px solid transparent",
        background: `linear-gradient(var(--color-line-background), var(--color-line-background)) padding-box, linear-gradient(180deg, #1E1E20 0%, #101012 50%, #1E1E20 100%) border-box`,
      }}
    >
      <div className="flex flex-wrap gap-2 sm:gap-3">
        <button
          type="button"
          className="h-[42px] rounded-[10px] bg-white px-5 text-[14px] font-medium tracking-[-0.02em] text-black"
          onClick={onSave}
        >
          {t("admin.save")}
        </button>
        <button
          type="button"
          className="h-[42px] rounded-[10px] border border-[#252526] bg-transparent px-5 text-[14px] font-medium text-white hover:border-[#3a3a3c]"
          onClick={onReset}
        >
          {t("admin.reset")}
        </button>
      </div>
      <div className="flex flex-wrap gap-2 sm:gap-3">
        <button
          type="button"
          className="h-[42px] rounded-[10px] border border-[#252526] px-4 text-[14px] font-medium text-white hover:border-[#3a3a3c]"
          onClick={onExport}
        >
          {t("admin.exportJson")}
        </button>
        <input
          ref={importInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={onImportFile}
        />
        <button
          type="button"
          className="h-[42px] rounded-[10px] border border-[#252526] px-4 text-[14px] font-medium text-white hover:border-[#3a3a3c]"
          onClick={onImportClick}
        >
          {t("admin.importJson")}
        </button>
      </div>
      {statusText ? (
        <p className="w-full text-[14px] text-[#8B8B8B] sm:order-last">{statusText}</p>
      ) : null}
    </div>
  );
}
