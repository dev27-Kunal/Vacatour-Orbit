import { format } from 'date-fns';
import { nl, enGB, de as deDE, fr as frFR } from 'date-fns/locale';

/**
 * Locale-aware formatting utilities for subscription components
 */
export class I18nFormatters {
  private locale: string;

  constructor(locale: string = 'nl') {
    this.locale = locale;
  }

  /**
   * Format currency values with proper locale formatting
   * Both Dutch and English use EUR (€) as per requirements
   */
  formatCurrency(amount: number, currency: 'EUR' | 'eur' | 'euro' = 'EUR'): string {
    const euros = amount / 100; // Convert cents to euros

    const lang = this.locale?.slice(0, 2);
    const nfLocale = lang === 'nl' ? 'nl-NL' : lang === 'de' ? 'de-DE' : lang === 'fr' ? 'fr-FR' : 'en-GB';
    return new Intl.NumberFormat(nfLocale, {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(euros);
  }

  /**
   * Format numbers with proper locale formatting
   */
  formatNumber(number: number): string {
    const lang = this.locale?.slice(0, 2);
    const nfLocale = lang === 'nl' ? 'nl-NL' : lang === 'de' ? 'de-DE' : lang === 'fr' ? 'fr-FR' : 'en-GB';
    return new Intl.NumberFormat(nfLocale).format(number);
  }

  /**
   * Format percentages with proper locale formatting
   */
  formatPercentage(percentage: number, decimals: number = 0): string {
    const lang = this.locale?.slice(0, 2);
    const nfLocale = lang === 'nl' ? 'nl-NL' : lang === 'de' ? 'de-DE' : lang === 'fr' ? 'fr-FR' : 'en-GB';
    return new Intl.NumberFormat(nfLocale, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(percentage / 100);
  }

  /**
   * Format dates with proper locale formatting
   */
  formatDate(date: Date | string, dateFormat: string = 'dd MMMM yyyy'): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const lang = this.locale?.slice(0, 2);
    const dfLocale = lang === 'nl' ? nl : lang === 'de' ? deDE : lang === 'fr' ? frFR : enGB;
    return format(dateObj, dateFormat, { locale: dfLocale });
  }

  /**
   * Format date and time with proper locale formatting
   */
  formatDateTime(date: Date | string, dateFormat: string = 'dd MMM yyyy, HH:mm'): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const lang = this.locale?.slice(0, 2);
    const dfLocale = lang === 'nl' ? nl : lang === 'de' ? deDE : lang === 'fr' ? frFR : enGB;
    return format(dateObj, dateFormat, { locale: dfLocale });
  }

  /**
   * Format relative dates (for usage periods, etc.)
   */
  formatShortDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const lang = this.locale?.slice(0, 2);
    if (lang === 'nl') {return format(dateObj, 'dd-MM-yyyy', { locale: nl });}
    if (lang === 'de') {return format(dateObj, 'dd.MM.yyyy', { locale: deDE });}
    if (lang === 'fr') {return format(dateObj, 'dd/MM/yyyy', { locale: frFR });}
    return format(dateObj, 'dd/MM/yyyy', { locale: enGB });
  }

  /**
   * Format compact numbers for statistics (1K, 1M, etc.)
   */
  formatCompactNumber(number: number): string {
    if (this.locale === 'nl') {
      return new Intl.NumberFormat('nl-NL', { 
        notation: 'compact',
        compactDisplay: 'short'
      }).format(number);
    } else {
      return new Intl.NumberFormat('en-GB', { 
        notation: 'compact',
        compactDisplay: 'short'
      }).format(number);
    }
  }

  /**
   * Format payment method last 4 digits
   */
  formatCardNumber(last4: string, brand?: string): string {
    const brandName = brand?.toUpperCase() || '';
    return `**** **** **** ${last4}`;
  }

  /**
   * Format card expiry
   */
  formatCardExpiry(month: number, year: number): string {
    const paddedMonth = month.toString().padStart(2, '0');
    return `${paddedMonth}/${year}`;
  }

  /**
   * Get locale-specific date input format placeholder
   */
  getDateInputPlaceholder(): string {
    const lang = this.locale?.slice(0, 2);
    if (lang === 'nl') {return 'dd-mm-jjjj';}
    if (lang === 'de') {return 'dd.mm.jjjj';}
    if (lang === 'fr') {return 'jj/mm/aaaa';}
    return 'dd/mm/yyyy';
  }

  /**
   * Format billing interval text
   */
  formatInterval(interval: string): string {
    // This will use the translation keys, but we provide fallbacks here
    const intervals: Record<string, Record<string, string>> = {
      nl: { month: 'maand', year: 'jaar', week: 'week', day: 'dag' },
      en: { month: 'month', year: 'year', week: 'week', day: 'day' },
      de: { month: 'Monat', year: 'Jahr', week: 'Woche', day: 'Tag' },
      fr: { month: 'mois', year: 'an', week: 'semaine', day: 'jour' },
    };

    const lang = this.locale?.slice(0, 2) as keyof typeof intervals;
    return intervals[lang]?.[interval] || interval;
  }
}

/**
 * Hook to get formatters with current locale
 */
export function useI18nFormatters(locale?: string): I18nFormatters {
  // In a real React component, this would use the i18n hook to get current locale
  // For now, we'll create a new instance with the provided locale
  return new I18nFormatters(locale || 'nl');
}

/**
 * Standalone utility functions for use in components
 */
export const formatters = {
  /**
   * Create formatters for specific locale
   */
  for: (locale: string) => new I18nFormatters(locale),

  /**
   * Quick currency formatting (defaults to Dutch locale)
   */
  currency: (amount: number, locale: string = 'nl') => 
    new I18nFormatters(locale).formatCurrency(amount),

  /**
   * Quick date formatting (defaults to Dutch locale)
   */
  date: (date: Date | string, locale: string = 'nl', format?: string) => 
    new I18nFormatters(locale).formatDate(date, format),

  /**
   * Quick number formatting (defaults to Dutch locale)
   */
  number: (number: number, locale: string = 'nl') => 
    new I18nFormatters(locale).formatNumber(number),

  /**
   * Quick percentage formatting (defaults to Dutch locale)
   */
  percentage: (percentage: number, locale: string = 'nl', decimals?: number) => 
    new I18nFormatters(locale).formatPercentage(percentage, decimals),
};
