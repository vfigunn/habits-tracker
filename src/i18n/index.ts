import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import es from "./locales/es.json";
import en from "./locales/en.json";

// Detect saved language or default to Spanish
const savedLang = localStorage.getItem("appLanguage") || "es";

i18n.use(initReactI18next).init({
  resources: {
    es: { translation: es },
    en: { translation: en },
  },
  lng: savedLang,
  fallbackLng: "es",
  interpolation: {
    escapeValue: false, // React already escapes by default
  },
});

export default i18n;
