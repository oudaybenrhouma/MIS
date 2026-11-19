import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { L, Lang } from "@/data/types";
import { en, type Dict } from "./en";
import { ar } from "./ar";

const dictionaries: Record<Lang, Dict> = { en, ar };
const STORAGE_KEY = "mis.lang";

interface I18nValue {
  lang: Lang;
  dir: "rtl" | "ltr";
  isAr: boolean;
  setLang: (l: Lang) => void;
  toggle: () => void;
  /** Dot-path lookup with {var} interpolation. */
  t: (key: string, vars?: Record<string, string | number>) => string;
  /** Raw (non-string) lookup, e.g. arrays. */
  raw: <T = unknown>(key: string) => T;
  /** Pick the active language from a bilingual value. */
  tr: (value: L) => string;
  n: (value: number) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

function lookup(dict: unknown, key: string): unknown {
  return key.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[part];
    return undefined;
  }, dict);
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "ar" || stored === "en") return stored;
    } catch {
      /* ignore */
    }
    return "ar"; // Arabic is the default
  });

  const dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignore */
    }
  }, [lang, dir]);

  const setLang = useCallback((l: Lang) => setLangState(l), []);
  const toggle = useCallback(() => setLangState((l) => (l === "ar" ? "en" : "ar")), []);

  const value = useMemo<I18nValue>(() => {
    const dict = dictionaries[lang];
    return {
      lang,
      dir,
      isAr: lang === "ar",
      setLang,
      toggle,
      t: (key, vars) => {
        const found = lookup(dict, key);
        let str = typeof found === "string" ? found : key;
        if (vars) for (const [k, v] of Object.entries(vars)) str = str.split(`{${k}}`).join(String(v));
        return str;
      },
      raw: <T,>(key: string) => lookup(dict, key) as T,
      tr: (v) => v[lang],
      n: (v) => new Intl.NumberFormat("en-US").format(v), // Latin digits, common in Libyan business
    };
  }, [lang, dir, setLang, toggle]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
