"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { translations, Lang, TranslationKey } from "@/lib/i18n";

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'fr',
  setLang: () => {},
  t: (key) => translations.fr[key] as string,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('fr');

  useEffect(() => {
    const saved = localStorage.getItem('agora-lang') as Lang | null;
    if (saved === 'fr' || saved === 'en') setLangState(saved);
  }, []);

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem('agora-lang', newLang);
  };

  const t = (key: TranslationKey): string => {
    return (translations[lang][key] as string) ?? (translations.fr[key] as string) ?? key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
