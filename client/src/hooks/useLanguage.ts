import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export function useLanguage() {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      setCurrentLanguage(lng);
      // Force component re-render by updating state
      forceUpdate(prev => prev + 1);
    };

    const handleCustomLanguageChange = () => {
      setCurrentLanguage(i18n.language);
      forceUpdate(prev => prev + 1);
    };

    // Listen for custom language change events
    window.addEventListener('languageChanged', handleCustomLanguageChange);
    
    // Listen for i18next language changes
    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      window.removeEventListener('languageChanged', handleCustomLanguageChange);
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  return currentLanguage;
}