import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  getCases,
  migrateCasesPayload,
  resetCasesRemote,
  saveCasesRemote,
} from "../../data/cases";
import { clearAdminToken, getAdminToken } from "../../data/adminSession";
import AdminHeader from "./blocks/AdminHeader";
import AdminToolbar from "./blocks/AdminToolbar";
import AdminCaseEditor from "./blocks/AdminCaseEditor";

function cloneDraft() {
  return structuredClone(getCases());
}

export default function AdminEditor({ onLogout }) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(cloneDraft);
  const [selectedId, setSelectedId] = useState(() => getCases()[0]?.id ?? "");
  const [statusText, setStatusText] = useState("");
  const importRef = useRef(null);

  const selected =
    draft.find((c) => c.id === selectedId) ?? draft[0] ?? null;
  const selectedIndex = selected ? draft.findIndex((c) => c.id === selected.id) : -1;

  const showStatus = useCallback((msg) => {
    setStatusText(msg);
    window.setTimeout(() => setStatusText(""), 5000);
  }, []);

  const logout = useCallback(() => {
    clearAdminToken();
    onLogout();
  }, [onLogout]);

  const onChangeCase = useCallback(
    (patch) => {
      if (!selected) return;
      setDraft((prev) =>
        prev.map((c) => (c.id === selected.id ? { ...c, ...patch } : c)),
      );
    },
    [selected],
  );

  const onChangeCard = useCallback(
    (cardIndex, patch) => {
      if (!selected) return;
      setDraft((prev) =>
        prev.map((c) => {
          if (c.id !== selected.id) return c;
          const cards = c.cards.map((card, i) =>
            i === cardIndex ? { ...card, ...patch } : card,
          );
          return { ...c, cards };
        }),
      );
    },
    [selected],
  );

  const onAddCard = useCallback(() => {
    if (!selected) return;
    setDraft((prev) =>
      prev.map((c) => {
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
    );
  }, [selected, t]);

  const onRemoveCard = useCallback(
    (cardIndex) => {
      if (!selected) return;
      setDraft((prev) =>
        prev.map((c) => {
          if (c.id !== selected.id) return c;
          const cards = c.cards.filter((_, i) => i !== cardIndex);
          return { ...c, cards };
        }),
      );
    },
    [selected],
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
      showStatus(t("admin.status.savedServer"));
    } else if (result.status === 401 || result.status === 403) {
      showStatus(t("admin.status.sessionExpired"));
      logout();
    } else {
      showStatus(result.error || t("admin.status.saveFailed"));
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
      setSelectedId(next[0]?.id ?? "");
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
      const migrated = migrateCasesPayload(parsed);
      if (!migrated) {
        showStatus(t("admin.status.importInvalid"));
        return;
      }
      setDraft(migrated);
      setSelectedId(migrated[0]?.id ?? "");
      showStatus(t("admin.status.importDraft"));
    } catch {
      showStatus(t("admin.status.importReadError"));
    }
  };

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

        <AdminToolbar
          onSave={handleSave}
          onReset={handleReset}
          onExport={handleExport}
          onImportClick={() => importRef.current?.click()}
          importInputRef={importRef}
          onImportFile={handleImportFile}
          statusText={statusText}
        />

        <div className="rounded-[16px] border border-[#252526] bg-[#101012]/50 p-4 sm:p-5">
          <label className="mb-2 block text-[13px] font-medium text-[#8B8B8B]" htmlFor="admin-case-select">
            {t("admin.selectCase")}
          </label>
          <select
            id="admin-case-select"
            className="w-full rounded-xl border border-[#252526] bg-[#101012] px-3 py-2.5 text-[15px] text-white outline-none focus:border-[#3a3a3c]"
            value={selected?.id ?? ""}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            {draft.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title || c.id}
              </option>
            ))}
          </select>
        </div>

        <AdminCaseEditor
          caseItem={selected}
          caseIndex={selectedIndex}
          onChangeCase={onChangeCase}
          onChangeCard={onChangeCard}
          onAddCard={onAddCard}
          onRemoveCard={onRemoveCard}
        />

        <p className="text-center text-[13px] leading-[150%] text-[#76767A]">
          {t("admin.footerNoteServer")}
        </p>
      </main>
    </div>
  );
}
