export const LANGUAGES = {
  en: { code: "en", label: "English", native: "English" },
  ta: { code: "ta", label: "Tamil", native: "தமிழ்" }
};

export const getStoredLanguage = () => {
  if (typeof window === "undefined") return "en";
  return localStorage.getItem("tn_lang") || "en";
};

export const setStoredLanguage = (lang) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("tn_lang", lang);
  }
};

export const t = (obj, lang) => {
  if (!obj) return "";
  if (lang === "ta" && obj.ta) return obj.ta;
  return obj.en || "";
};