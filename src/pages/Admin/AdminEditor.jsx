import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  getCases,
  getLandingServices,
  migrateCasesPayload,
  migrateLandingServicesPayload,
  resetCasesRemote,
  saveCasesRemote,
  stripLegacyServiceCases,
} from "../../data/cases";
import { clearAdminToken, getAdminToken } from "../../data/adminSession";
import AdminHeader from "./blocks/AdminHeader";
import AdminToolbar from "./blocks/AdminToolbar";
import AdminCaseEditor from "./blocks/AdminCaseEditor";
import AdminLandingServicesEditor from "./blocks/AdminLandingServicesEditor";
import AdminPortfolioCardsSection from "./blocks/AdminPortfolioCardsSection";

function cloneDraft() {
  return {
    cases: structuredClone(getCases()),
    landingServices: structuredClone(getLandingServices()),
  };
}

export default function AdminEditor({ onLogout }) {
  const { t } = useTranslation();
  const [adminTab, setAdminTab] = useState("cases");
  const [draft, setDraft] = useState(cloneDraft);
  const [selectedId, setSelectedId] = useState(
    () => getCases()[0]?.id ?? "",
  );
  const [selectedServiceKey, setSelectedServiceKey] = useState(
    () => getLandingServices()[0]?.key ?? "web",
  );
  const [statusText, setStatusText] = useState("");
  const importRef = useRef(null);

  const selected =
    draft.cases.find((c) => c.id === selectedId) ?? draft.cases[0] ?? null;
  const selectedIndex = selected
    ? draft.cases.findIndex((c) => c.id === selected.id)
    : -1;

  const selectedService =
    draft.landingServices.find((s) => s.key === selectedServiceKey) ??
    draft.landingServices[0] ??
    null;

  const showStatus = useCallback((msg) => {
    setStatusText(msg);
    window.setTimeout(() => setStatusText(""), 5000);
  }, []);

  const logout = useCallback(() => {
    clearAdminToken();
    onLogout();
  }, [onLogout]);

  const handleUploadError = useCallback(
    (reason) => {
      if (reason === "unauthorized") {
        showStatus(t("admin.status.sessionExpired"));
        logout();
        return;
      }
      showStatus(
        reason === "noDataUrl"
          ? t("admin.noDataUrl")
          : t("admin.uploadFailed"),
      );
    },
    [logout, showStatus, t],
  );

  const onChangeCase = useCallback(
    (patch) => {
      if (!selected) return;
      setDraft((prev) => ({
        ...prev,
        cases: prev.cases.map((c) =>
          c.id === selected.id ? { ...c, ...patch } : c,
        ),
      }));
    },
    [selected],
  );

  const onChangeCard = useCallback(
    (cardIndex, patch) => {
      if (!selected) return;
      setDraft((prev) => ({
        ...prev,
        cases: prev.cases.map((c) => {
          if (c.id !== selected.id) return c;
          const cards = c.cards.map((card, i) =>
            i === cardIndex ? { ...card, ...patch } : card,
          );
          return { ...c, cards };
        }),
      }));
    },
    [selected],
  );

  const onAddCard = useCallback(() => {
    if (!selected) return;
    setDraft((prev) => ({
      ...prev,
      cases: prev.cases.map((c) => {
        if (c.id !== selected.id) return c;
        return {
          ...c,
          cards: [
            ...c.cards,
            {
              title: t("admin.newCardDefaultTitle"),
              description: "",
              href: "#",
            },
          ],
        };
      }),
    }));
  }, [selected, t]);

  const onRemoveCard = useCallback(
    (cardIndex) => {
      if (!selected) return;
      setDraft((prev) => ({
        ...prev,
        cases: prev.cases.map((c) => {
          if (c.id !== selected.id) return c;
          const cards = c.cards.filter((_, i) => i !== cardIndex);
          return { ...c, cards };
        }),
      }));
    },
    [selected],
  );

  const svcKey = selectedService?.key ?? "";

  const onChangeServicePortfolioCard = useCallback(
    (cardIndex, patch) => {
      if (!svcKey) return;
      setDraft((prev) => ({
        ...prev,
        landingServices: prev.landingServices.map((s) => {
          if (s.key !== svcKey) return s;
          const portfolioCards = s.portfolioCards.map((card, i) =>
            i === cardIndex ? { ...card, ...patch } : card,
          );
          return { ...s, portfolioCards };
        }),
      }));
    },
    [svcKey],
  );

  const onAddServicePortfolioCard = useCallback(() => {
    if (!svcKey) return;
    setDraft((prev) => ({
      ...prev,
      landingServices: prev.landingServices.map((s) => {
        if (s.key !== svcKey) return s;
        return {
          ...s,
          portfolioCards: [
            ...s.portfolioCards,
            {
              title: t("admin.newCardDefaultTitle"),
              description: "",
              href: "#",
            },
          ],
        };
      }),
    }));
  }, [svcKey, t]);

  const onRemoveServicePortfolioCard = useCallback(
    (cardIndex) => {
      if (!svcKey) return;
      setDraft((prev) => ({
        ...prev,
        landingServices: prev.landingServices.map((s) => {
          if (s.key !== svcKey) return s;
          return {
            ...s,
            portfolioCards: s.portfolioCards.filter((_, i) => i !== cardIndex),
          };
        }),
      }));
    },
    [svcKey],
  );

  const handleSave = async () => {
    const token = getAdminToken();
    if (!token) {
      showStatus(t("admin.status.sessionExpired"));
      logout();
      return;
    }
    const result = await saveCasesRemote(draft, token);
    if (result.ok) {
      setDraft(cloneDraft());
      if (result.strippedDataUrlImages > 0) {
        showStatus(
          t("admin.status.savedServerStrippedDataUrls", {
            count: result.strippedDataUrlImages,
          }),
        );
      } else {
        showStatus(t("admin.status.savedServer"));
      }
    } else if (result.status === 401 || result.status === 403) {
      showStatus(t("admin.status.sessionExpired"));
      logout();
    } else {
      showStatus(
        result.error === "data_url_images_not_allowed"
          ? t("admin.noDataUrl")
          : result.error || t("admin.status.saveFailed"),
      );
    }
  };

  const handleReset = async () => {
    if (!window.confirm(t("admin.confirmReset"))) {
      return;
    }
    const token = getAdminToken();
    if (!token) {
      showStatus(t("admin.status.sessionExpired"));
      logout();
      return;
    }
    const result = await resetCasesRemote(token);
    if (result.ok) {
      const next = cloneDraft();
      setDraft(next);
      setSelectedId(next.cases[0]?.id ?? "");
      setSelectedServiceKey(next.landingServices[0]?.key ?? "web");
      showStatus(t("admin.status.reset"));
    } else if (result.status === 401 || result.status === 403) {
      showStatus(t("admin.status.sessionExpired"));
      logout();
    } else {
      showStatus(result.error || t("admin.status.saveFailed"));
    }
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(draft, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "relaylend-cases.json";
    a.click();
    URL.revokeObjectURL(a.href);
    showStatus(t("admin.status.exported"));
  };

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        const migrated = migrateCasesPayload(parsed);
        if (!migrated) {
          showStatus(t("admin.status.importInvalid"));
          return;
        }
        setDraft((prev) => ({
          cases: migrated,
          landingServices: prev.landingServices,
        }));
        setSelectedId(migrated[0]?.id ?? "");
        showStatus(t("admin.status.importDraft"));
        return;
      }
      if (
        parsed &&
        typeof parsed === "object" &&
        Array.isArray(parsed.cases)
      ) {
        const casesRaw = migrateCasesPayload(parsed.cases);
        if (!casesRaw) {
          showStatus(t("admin.status.importInvalid"));
          return;
        }
        const landing = migrateLandingServicesPayload(
          parsed.landingServices,
          casesRaw,
        );
        const cases = stripLegacyServiceCases(casesRaw);
        setDraft((prev) => ({
          cases,
          landingServices: landing ?? prev.landingServices,
        }));
        setSelectedId(cases[0]?.id ?? "");
        if (landing?.[0]?.key) {
          setSelectedServiceKey(landing[0].key);
        }
        showStatus(t("admin.status.importDraft"));
        return;
      }
      showStatus(t("admin.status.importInvalid"));
    } catch {
      showStatus(t("admin.status.importReadError"));
    }
  };

  const tabBtn =
    "h-[42px] rounded-[10px] px-5 text-[14px] font-medium tracking-[-0.02em] transition-colors";
  const tabActive = "bg-white text-black";
  const tabIdle =
    "border border-[#252526] bg-transparent text-white hover:border-[#3a3a3c]";

  return (
    <div className="flex min-h-screen flex-col items-center bg-(--color-background) pb-16 pt-[calc(25px+42px+48px)]">
      <AdminHeader onLogout={logout} />

      <main className="flex w-[calc(100%-2rem)] max-w-[986px] flex-col gap-6 sm:w-[calc(100%-3rem)] lg:w-[calc(100%-100px)]">
        <div>
          <h1 className="text-[26px] font-semibold leading-[150%] tracking-[-0.02em] sm:text-[29px] md:text-[32px]">
            {t("admin.pageTitle")}
          </h1>
          <p className="mt-2 max-w-[520px] text-[15px] leading-[150%] text-[#8B8B8B]">
            {t("admin.pageIntroServer")}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`${tabBtn} ${adminTab === "cases" ? tabActive : tabIdle}`}
            onClick={() => setAdminTab("cases")}
          >
            {t("admin.tabCases")}
          </button>
          <button
            type="button"
            className={`${tabBtn} ${adminTab === "services" ? tabActive : tabIdle}`}
            onClick={() => setAdminTab("services")}
          >
            {t("admin.tabServices")}
          </button>
        </div>

        <AdminToolbar
          onSave={handleSave}
          onReset={handleReset}
          onExport={handleExport}
          onImportClick={() => importRef.current?.click()}
          importInputRef={importRef}
          onImportFile={handleImportFile}
          statusText={statusText}
        />

        {adminTab === "cases" ? (
          <>
            <div className="rounded-[16px] border border-[#252526] bg-[#101012]/50 p-4 sm:p-5">
              <label
                className="mb-2 block text-[13px] font-medium text-[#8B8B8B]"
                htmlFor="admin-case-select"
              >
                {t("admin.selectCase")}
              </label>
              <select
                id="admin-case-select"
                className="w-full rounded-xl border border-[#252526] bg-[#101012] px-3 py-2.5 text-[15px] text-white outline-none focus:border-[#3a3a3c]"
                value={selected?.id ?? ""}
                onChange={(e) => setSelectedId(e.target.value)}
              >
                {draft.cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.excludeFromCasesGrid ? `[${t("admin.serviceCaseBadge")}] ` : ""}
                    {c.title || c.id}
                  </option>
                ))}
              </select>
            </div>

            <AdminCaseEditor
              caseItem={selected}
              caseIndex={selectedIndex}
              uploadToken={getAdminToken()}
              onUploadError={handleUploadError}
              onChangeCase={onChangeCase}
              onChangeCard={onChangeCard}
              onAddCard={onAddCard}
              onRemoveCard={onRemoveCard}
            />
          </>
        ) : (
          <>
            <div className="rounded-[16px] border border-[#252526] bg-[#101012]/50 p-4 sm:p-5">
              <label
                className="mb-2 block text-[13px] font-medium text-[#8B8B8B]"
                htmlFor="admin-service-select"
              >
                {t("admin.selectService")}
              </label>
              <select
                id="admin-service-select"
                className="w-full rounded-xl border border-[#252526] bg-[#101012] px-3 py-2.5 text-[15px] text-white outline-none focus:border-[#3a3a3c]"
                value={selectedService?.key ?? ""}
                onChange={(e) => setSelectedServiceKey(e.target.value)}
              >
                {draft.landingServices.map((s) => (
                  <option key={s.key} value={s.key}>
                    {t(`services.items.${s.key}.title`)} ({s.key})
                  </option>
                ))}
              </select>
            </div>

            {selectedService ? (
              <>
                <AdminLandingServicesEditor serviceItem={selectedService} />

                <AdminPortfolioCardsSection
                  listKey={`svc-${selectedService.key}`}
                  cards={selectedService.portfolioCards ?? []}
                  idPrefix={`svc-${selectedService.key}`}
                  fallbackImage="/imgs/case/1.png"
                  pathHint={`/services/${selectedService.key}`}
                  uploadToken={getAdminToken()}
                  onUploadError={handleUploadError}
                  onChangeCard={onChangeServicePortfolioCard}
                  onAddCard={onAddServicePortfolioCard}
                  onRemoveCard={onRemoveServicePortfolioCard}
                />
              </>
            ) : null}
          </>
        )}

        <p className="text-center text-[13px] leading-[150%] text-[#76767A]">
          {t("admin.footerNoteServer")}
        </p>
      </main>
    </div>
  );
}
