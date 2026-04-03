import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import logo from "../../../assets/logo.svg";
import { apiUrl } from "../../../data/apiBase";
import { setAdminToken } from "../../../data/adminSession";

export default function AdminLogin({ onLoggedIn }) {
  const { t } = useTranslation();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(apiUrl("/api/admin/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || t("admin.loginError"));
        return;
      }
      if (!data.token) {
        setError(t("admin.loginError"));
        return;
      }
      setAdminToken(data.token);
      setPassword("");
      onLoggedIn();
    } catch {
      setError(t("admin.loginNetworkError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-(--color-background) px-4 pb-16 pt-24">
      <div className="mb-8 flex w-full max-w-[400px] items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <img src={logo} alt="" width={32} height={32} className="h-8 w-8 shrink-0" />
          <span className="truncate text-[17px] font-semibold">{t("admin.headerTitle")}</span>
        </div>
        <Link
          to="/"
          className="shrink-0 text-[15px] font-medium text-(--color-gray) transition-colors hover:text-white"
        >
          {t("admin.toSite")}
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[400px] rounded-[16px] border border-[#252526] bg-[#101012] p-6 sm:p-8"
        style={{
          border: "1px solid transparent",
          background: `linear-gradient(var(--color-line-background), var(--color-line-background)) padding-box, linear-gradient(180deg, #1E1E20 0%, #101012 50%, #1E1E20 100%) border-box`,
        }}
      >
        <h1 className="text-[22px] font-semibold tracking-[-0.02em]">{t("admin.loginTitle")}</h1>
        <p className="mt-2 text-[14px] leading-[150%] text-[#8B8B8B]">{t("admin.loginSubtitle")}</p>

        <label className="mt-6 mb-2 block text-[13px] font-medium text-[#8B8B8B]" htmlFor="admin-password">
          {t("admin.loginPasswordLabel")}
        </label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded-xl border border-[#252526] bg-[#101012] px-3 py-2.5 text-[15px] text-white outline-none focus:border-[#3a3a3c]"
        />

        {error ? (
          <p className="mb-4 text-[14px] text-red-400" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading || !password}
          className="h-[44px] w-full rounded-[10px] bg-white text-[15px] font-medium tracking-[-0.02em] text-black disabled:opacity-50"
        >
          {loading ? t("admin.loginLoading") : t("admin.loginSubmit")}
        </button>
      </form>
    </div>
  );
}
