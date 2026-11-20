import React, { useEffect, useSyncExternalStore } from "react";
import { Globe } from "lucide-react";
import { LANGS, getLang, setLang, subscribeLang, translate, t, L } from "./core.js";
import { startDomTranslator } from "./domTranslator.js";

// Re-renders the caller whenever the language changes (explicit `t()` / `L()` users need this; the
// DOM layer retranslates everything else by itself).
export function useLang() {
  const lang = useSyncExternalStore(subscribeLang, getLang, getLang);
  return { lang, setLang, translate, t, L, isSomali: lang === "so" };
}

// Mount once near the root: starts the DOM translator after the first render.
export function LanguageProvider({ children }) {
  useEffect(() => { startDomTranslator(); }, []);
  return children;
}

// Compact EN | SO switch. Works on phones (44px touch targets) and on the sign-in screens, so it is
// visible before and after login.
export function LanguageSwitcher({ className = "", showIcon = true }) {
  const { lang } = useLang();
  return (
    <div
      role="group"
      aria-label="Language / Luuqad"
      translate="no"
      className={`inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-0.5 shadow-sm shrink-0 ${className}`}
    >
      {showIcon && <Globe size={14} className="text-slate-400 ml-1.5 hidden min-[380px]:block" aria-hidden="true" />}
      {LANGS.map((l) => {
        const active = lang === l.code;
        return (
          <button
            key={l.code}
            type="button"
            lang={l.code}
            aria-pressed={active}
            title={l.label}
            onClick={() => setLang(l.code)}
            className={`min-h-[36px] min-w-[40px] px-2.5 rounded-lg text-xs font-semibold tracking-wide transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 ${active ? "bg-brand-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"}`}
          >
            {l.short}
          </button>
        );
      })}
    </div>
  );
}
