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

// Get stored language from localStorage or default to Dutch
const getStoredLanguage = () => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem('i18nextLng');
      return stored || 'nl';
    }
  } catch (error) {
    console.warn('localStorage not available:', error);
  }
  return 'nl';
};

// Initialize i18n and export the promise
export const i18nInitPromise = i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: getStoredLanguage(), // Explicitly set initial language
    fallbackLng: 'nl', // Default to Dutch
    debug: true, // Enable debug to diagnose production issues

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    detection: {
      // Read from cookie as well to keep Next/SSR pages in sync when present
      order: ['localStorage', 'cookie', 'navigator', 'htmlTag'],
      caches: ['localStorage', 'cookie'],
      lookupCookie: 'i18next',
      lookupLocalStorage: 'i18nextLng',
      lookupSessionStorage: 'i18nextLng',
    },

    react: {
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added removed',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i'],
      useSuspense: false,
    },
  });

export default i18n;
