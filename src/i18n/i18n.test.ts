import { resolveLanguage } from '@/i18n';
import en from '@/i18n/en.json';
import es from '@/i18n/es.json';

function keys(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'object' || value === null) return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    keys(child, prefix ? `${prefix}.${key}` : key),
  );
}

describe('translations', () => {
  it('has exactly the same keys in Spanish and English', () => {
    expect(keys(en).sort()).toEqual(keys(es).sort());
  });

  it('falls back to Spanish for unsupported languages', () => {
    expect(resolveLanguage('en')).toBe('en');
    expect(resolveLanguage('fr')).toBe('es');
    expect(resolveLanguage(undefined)).toBe('es');
  });
});
