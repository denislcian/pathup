/**
 * Number and date formatting in the app's language: "82,5 kg" and "lun, 21 sep" in Spanish,
 * "82.5 kg" and "Mon, Sep 21" in English.
 */

export function formatNumber(value: number, language: string, maxDecimals = 1): string {
  return new Intl.NumberFormat(language, { maximumFractionDigits: maxDecimals }).format(value);
}

export function formatKg(value: number, language: string): string {
  return `${formatNumber(value, language)} kg`;
}

/** "12 sep": axis labels and compact lists. */
export function formatShortDate(iso: string | Date, language: string): string {
  return new Intl.DateTimeFormat(language, { day: 'numeric', month: 'short' })
    .format(new Date(iso))
    .replace('.', '');
}

/** "lunes, 21 de septiembre": headings. */
export function formatLongDate(iso: string | Date, language: string): string {
  return new Intl.DateTimeFormat(language, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(iso));
}

/** "lun, 21 sep": history rows. */
export function formatMediumDate(iso: string | Date, language: string): string {
  return new Intl.DateTimeFormat(language, { weekday: 'short', day: 'numeric', month: 'short' })
    .format(new Date(iso))
    .replaceAll('.', '');
}

/** "septiembre de 2026" with a capital letter, for the calendar header. */
export function formatMonth(date: Date, language: string): string {
  const text = new Intl.DateTimeFormat(language, { month: 'long', year: 'numeric' }).format(date);
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Two-letter weekday names starting on Monday: L M X J V S D in Spanish. */
export function weekdayInitials(language: string): string[] {
  if (language.startsWith('es')) return ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  const monday = new Date(2026, 8, 21);
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + index);
    return new Intl.DateTimeFormat(language, { weekday: 'narrow' }).format(day);
  });
}
