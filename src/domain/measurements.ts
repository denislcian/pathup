/** Body measurements: one entry per day, every value optional. */

export const MEASUREMENT_FIELDS = [
  'weightKg',
  'bodyFatPct',
  'waistCm',
  'hipsCm',
  'chestCm',
  'armCm',
  'thighCm',
  'neckCm',
] as const;
export type MeasurementField = (typeof MEASUREMENT_FIELDS)[number];

/** Same ranges as the database constraints, so the form catches typos before the server does. */
export const MEASUREMENT_RANGES: Record<MeasurementField, { min: number; max: number }> = {
  weightKg: { min: 20, max: 400 },
  bodyFatPct: { min: 2, max: 70 },
  waistCm: { min: 30, max: 300 },
  hipsCm: { min: 30, max: 300 },
  chestCm: { min: 30, max: 300 },
  armCm: { min: 10, max: 100 },
  thighCm: { min: 20, max: 150 },
  neckCm: { min: 20, max: 80 },
};

export const MEASUREMENT_UNITS: Record<MeasurementField, 'kg' | '%' | 'cm'> = {
  weightKg: 'kg',
  bodyFatPct: '%',
  waistCm: 'cm',
  hipsCm: 'cm',
  chestCm: 'cm',
  armCm: 'cm',
  thighCm: 'cm',
  neckCm: 'cm',
};

export type MeasurementValues = Partial<Record<MeasurementField, number | null>>;

export type Measurement = MeasurementValues & {
  /** YYYY-MM-DD, the day it was measured. */
  date: string;
};

export type MeasurementIssue = { field: MeasurementField; min: number; max: number };

/** Values outside the realistic range (usually a typo, like 825 instead of 82,5). */
export function validateMeasurement(values: MeasurementValues): MeasurementIssue[] {
  return MEASUREMENT_FIELDS.flatMap((field) => {
    const value = values[field];
    if (value === null || value === undefined) return [];
    const { min, max } = MEASUREMENT_RANGES[field];
    return Number.isFinite(value) && value >= min && value <= max ? [] : [{ field, min, max }];
  });
}

export function hasAnyValue(values: MeasurementValues): boolean {
  return MEASUREMENT_FIELDS.some((field) => values[field] !== null && values[field] !== undefined);
}

export type MeasurementPoint = { date: string; value: number };

/** The values of one field over time, oldest first, skipping the days it wasn't measured. */
export function measurementSeries(
  measurements: readonly Measurement[],
  field: MeasurementField,
): MeasurementPoint[] {
  return measurements
    .flatMap((entry) => {
      const value = entry[field];
      return value === null || value === undefined ? [] : [{ date: entry.date, value }];
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

function dayNumber(date: string): number {
  return Math.round(Date.UTC(+date.slice(0, 4), +date.slice(5, 7) - 1, +date.slice(8, 10)) / 864e5);
}

/**
 * Average of the last `days` days at each point. Body weight moves 1-2 kg a day with water and
 * food; the average shows the real trend.
 */
export function movingAverage(points: readonly MeasurementPoint[], days = 7): MeasurementPoint[] {
  return points.map((point) => {
    const end = dayNumber(point.date);
    const window = points.filter((other) => {
      const day = dayNumber(other.date);
      return day <= end && day > end - days;
    });
    const average = window.reduce((total, other) => total + other.value, 0) / window.length;
    return { date: point.date, value: Math.round(average * 10) / 10 };
  });
}

/**
 * Change between the average of the last week and the average of the week `weeksBack` weeks
 * before. Null when there is not enough data on either side.
 */
export function trendChange(
  points: readonly MeasurementPoint[],
  weeksBack = 4,
): { change: number; from: number; to: number } | null {
  if (points.length < 2) return null;
  const last = dayNumber(points.at(-1)!.date);
  const averageBetween = (start: number, end: number) => {
    const inside = points.filter((point) => {
      const day = dayNumber(point.date);
      return day > start && day <= end;
    });
    return inside.length === 0
      ? null
      : inside.reduce((total, point) => total + point.value, 0) / inside.length;
  };
  const to = averageBetween(last - 7, last);
  const pastEnd = last - weeksBack * 7;
  const from = averageBetween(pastEnd - 7, pastEnd);
  if (to === null || from === null) return null;
  return {
    change: Math.round((to - from) * 10) / 10,
    from: Math.round(from * 10) / 10,
    to: Math.round(to * 10) / 10,
  };
}
