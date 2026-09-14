export const MIN_AGE = 16;
export const ADULT_AGE = 18;

/** Calendar date without time zone, e.g. `2008-03-21`. */
export type IsoDate = `${number}-${number}-${number}`;

type DateParts = { year: number; month: number; day: number };

function isRealDate({ year, month, day }: DateParts): boolean {
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

function pad(value: number, length = 2): string {
  return String(value).padStart(length, '0');
}

function toParts(iso: IsoDate): DateParts {
  const [year, month, day] = iso.split('-').map(Number);
  return { year, month, day };
}

export function todayIso(now: Date = new Date()): IsoDate {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}` as IsoDate;
}

/**
 * Parses a birth date typed as DD/MM/AAAA (also accepts `-` or `.` separators).
 * Returns null for impossible dates, years before 1900 or dates after `today`.
 */
export function parseBirthDate(input: string, today: IsoDate = todayIso()): IsoDate | null {
  const match = /^\s*(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})\s*$/.exec(input);
  if (!match) return null;

  const parts = { day: Number(match[1]), month: Number(match[2]), year: Number(match[3]) };
  if (parts.year < 1900 || !isRealDate(parts)) return null;

  const iso = `${parts.year}-${pad(parts.month)}-${pad(parts.day)}` as IsoDate;
  return iso > today ? null : iso;
}

/** Full years between the birth date and `today` (a birthday counts from that same day). */
export function ageOn(birthDate: IsoDate, today: IsoDate = todayIso()): number {
  const birth = toParts(birthDate);
  const now = toParts(today);
  const hadBirthdayThisYear =
    now.month > birth.month || (now.month === birth.month && now.day >= birth.day);
  return now.year - birth.year - (hadBirthdayThisYear ? 0 : 1);
}

export function isOldEnough(birthDate: IsoDate, today: IsoDate = todayIso()): boolean {
  return ageOn(birthDate, today) >= MIN_AGE;
}

export function isMinor(birthDate: IsoDate, today: IsoDate = todayIso()): boolean {
  return ageOn(birthDate, today) < ADULT_AGE;
}
