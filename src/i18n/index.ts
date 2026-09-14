import { getLocales } from 'expo-localization';
import i18n, { use as registerI18nPlugin } from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '@/i18n/en.json';
import es from '@/i18n/es.json';

export const supportedLanguages = ['es', 'en'] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

export function resolveLanguage(languageCode: string | null | undefined): SupportedLanguage {
  return supportedLanguages.find((lang) => lang === languageCode) ?? 'es';
}

void registerI18nPlugin(initReactI18next).init({
  resources: {
    es: { translation: es },
    en: { translation: en },
  },
  lng: resolveLanguage(getLocales()[0]?.languageCode),
  fallbackLng: 'es',
  interpolation: { escapeValue: false },
});

export default i18n;
