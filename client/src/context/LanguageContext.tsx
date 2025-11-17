import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageContextType {
  currentLanguage: string;
  changeLanguage: (langCode: string) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
  const [renderKey, setRenderKey] = useState(0);

  const changeLanguage = async (langCode: string) => {
    localStorage.setItem('i18nextLng', langCode);
    console.log('Context: Setting language to:', langCode);

    // Also sync to cookies so any Next/SSR pages (if used) follow the same selection
    try {
      const isSecure = typeof window !== 'undefined' && window.location?.protocol === 'https:';
      const attributes = [
        'path=/',
        'SameSite=Lax',
        // 365 days
        `Max-Age=${60 * 60 * 24 * 365}`,
      ];
      if (isSecure) {attributes.push('Secure');}
      // i18next default cookie key
      document.cookie = `i18next=${encodeURIComponent(langCode)}; ${attributes.join('; ')}`;
      // Next.js locale cookie (used by Next's router locale detection)
      document.cookie = `NEXT_LOCALE=${encodeURIComponent(langCode)}; ${attributes.join('; ')}`;
    } catch (err) {
      console.warn('Language cookie sync failed:', err);
    }

    await i18n.changeLanguage(langCode);
    setCurrentLanguage(langCode);
    setRenderKey(prev => prev + 1);

    console.log('Context: Language changed to:', i18n.language);
  };

  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      console.log('Context: i18next language changed to:', lng);
      setCurrentLanguage(lng);
      setRenderKey(prev => prev + 1);
    };

    // Listen for i18next language changes
    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  return (
    <LanguageContext.Provider value={{ currentLanguage, changeLanguage }}>
      <div key={renderKey}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguageContext() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguageContext must be used within a LanguageProvider');
  }
  return context;
}
