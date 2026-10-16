"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getStoredLanguage, setStoredLanguage } from "@/lib/language";

const LanguageContext = createContext({ lang: "en", setLang: () => {} });

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState("en");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlLang = params.get("lang");
      if (urlLang === "ta" || urlLang === "en") {
        setLangState(urlLang);
        return;
      }
    }
    setLangState(getStoredLanguage());
  }, []);

  const setLang = (l) => {
    setLangState(l);
    setStoredLanguage(l);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);

export const useTrans = () => {
  const { lang } = useLanguage();
  return (en, ta) => (lang === "ta" && ta ? ta : en);
};