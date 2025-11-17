import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import nlTranslations from '../locales/nl.json';
import enTranslations from '../locales/en.json';
import deTranslations from '../locales/de.json';
import frTranslations from '../locales/fr.json';

const resources = {
  en: {
    translation: enTranslations,
  },
  nl: {
    translation: nlTranslations,
  },
  de: {
    translation: deTranslations,
  },
  fr: {
    translation: frTranslations,
  },
};

// DESIGN MODE: Default to English for designers
const getDefaultLanguage = () => {
  // Check if explicitly set in localStorage
  const stored = localStorage.getItem('i18nextLng');
  if (stored) return stored;

  // In design mode, default to English
  if (import.meta.env.VITE_DESIGN_MODE === 'true') {
    return 'en';
  }

  // Otherwise Dutch for production
  return 'nl';
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en', // Fallback to English
    lng: getDefaultLanguage(), // Start with English for designers
    debug: false,

    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;