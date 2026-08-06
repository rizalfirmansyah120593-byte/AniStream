"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export const LANGUAGES = [
  { code: "id", label: "Indonesia", short: "ID" },
  { code: "en", label: "English", short: "EN" },
  { code: "ms", label: "Melayu", short: "MS" },
  { code: "zh", label: "中文", short: "中" },
  { code: "es", label: "Español", short: "ES" },
  { code: "fr", label: "Français", short: "FR" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

const translations = {
  id: { home: "Beranda", browse: "Jelajahi", genres: "Genre", type: "Tipe", schedule: "Jadwal", myList: "Daftar Saya", search: "Cari", latest: "Update Terbaru", menu: "MENU", language: "Bahasa" },
  en: { home: "Home", browse: "Browse", genres: "Genres", type: "Type", schedule: "Schedule", myList: "My List", search: "Search", latest: "Latest Updates", menu: "MENU", language: "Language" },
  ms: { home: "Laman Utama", browse: "Jelajah", genres: "Genre", type: "Jenis", schedule: "Jadual", myList: "Senarai Saya", search: "Cari", latest: "Kemas Kini Terkini", menu: "MENU", language: "Bahasa" },
  zh: { home: "首页", browse: "浏览", genres: "类型", type: "分类", schedule: "日程", myList: "我的收藏", search: "搜索", latest: "最新更新", menu: "菜单", language: "语言" },
  es: { home: "Inicio", browse: "Explorar", genres: "Géneros", type: "Tipo", schedule: "Calendario", myList: "Mi lista", search: "Buscar", latest: "Últimas actualizaciones", menu: "MENÚ", language: "Idioma" },
  fr: { home: "Accueil", browse: "Parcourir", genres: "Genres", type: "Type", schedule: "Programme", myList: "Ma liste", search: "Rechercher", latest: "Dernières mises à jour", menu: "MENU", language: "Langue" },
} as const;

type TranslationKey = keyof typeof translations.id;
type LanguageContextValue = {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  t: (key: TranslationKey) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>("id");

  useEffect(() => {
    const saved = window.localStorage.getItem("anistream-language") as LanguageCode | null;
    if (saved && LANGUAGES.some((item) => item.code === saved)) setLanguageState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    window.localStorage.setItem("anistream-language", language);
  }, [language]);

  const value = useMemo(() => ({
    language,
    setLanguage: (nextLanguage: LanguageCode) => setLanguageState(nextLanguage),
    t: (key: TranslationKey) => translations[language][key],
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}
