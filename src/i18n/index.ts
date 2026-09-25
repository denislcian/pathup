import { getLocales } from 'expo-localization';
import i18n, { createInstance, use as registerI18nPlugin, type InitOptions } from 'i18next';
import { createElement, useEffect, useSyncExternalStore, type ReactNode } from 'react';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { Platform } from 'react-native';

import en from '@/i18n/en.json';
import es from '@/i18n/es.json';

export const supportedLanguages = ['es', 'en'] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

export function resolveLanguage(languageCode: string | null | undefined): SupportedLanguage {
  return supportedLanguages.find((lang) => lang === languageCode) ?? 'es';
}

export function deviceLanguage(): SupportedLanguage {
  return resolveLanguage(getLocales()[0]?.languageCode);
}

const options: InitOptions = {
  resources: {
    es: { translation: es },
    en: { translation: en },
  },
  fallbackLng: 'es',
  interpolation: { escapeValue: false },
  initAsync: false,
};

/**
 * The web export renders the landing to HTML on the build machine, and the browser's first render
 * has to match it to hydrate. So the web always starts in Spanish, whatever language the build
 * machine speaks (the CI runner speaks English), and `LanguageProvider` switches once hydrated.
 */
void registerI18nPlugin(initReactI18next).init({
  ...options,
  lng: Platform.OS === 'web' ? 'es' : deviceLanguage(),
});

/**
 * The browser's language gets its own instance instead of `changeLanguage` on the shared one:
 * i18next is a mutable global, so switching it while React was still hydrating the screen (Expo
 * Router wraps every screen in Suspense) made that screen render English over Spanish HTML
 * (React error #418). Handed down as React context, the change waits for hydration to finish.
 */
const instances = new Map<SupportedLanguage, typeof i18n>([[resolveLanguage(i18n.language), i18n]]);

function instanceFor(language: SupportedLanguage): typeof i18n {
  let instance = instances.get(language);
  if (!instance) {
    instance = createInstance();
    void instance.init({ ...options, lng: language });
    instances.set(language, instance);
  }
  return instance;
}

const noSubscription = () => () => {};

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Spanish while rendering the HTML and while hydrating it; the device's language right after.
  const language = useSyncExternalStore(noSubscription, deviceLanguage, () => 'es' as const);
  const instance = instanceFor(language);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  return createElement(I18nextProvider, { i18n: instance }, children);
}

export default i18n;
