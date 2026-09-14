import 'i18next';

import type es from '@/i18n/es.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: typeof es;
    };
  }
}
