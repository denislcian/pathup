import {
  hasAnyValue,
  measurementSeries,
  movingAverage,
  trendChange,
  validateMeasurement,
} from '@/domain/measurements';

describe('validateMeasurement', () => {
  it('catches the usual typo of a missing decimal separator', () => {
    expect(validateMeasurement({ weightKg: 825, waistCm: 86 })).toEqual([
      { field: 'weightKg', min: 20, max: 400 },
    ]);
  });

  it('ignores the fields left empty', () => {
    expect(validateMeasurement({ weightKg: 82.5, bodyFatPct: null })).toEqual([]);
  });
});

describe('hasAnyValue', () => {
  it('needs at least one number', () => {
    expect(hasAnyValue({ weightKg: null })).toBe(false);
    expect(hasAnyValue({ armCm: 38 })).toBe(true);
  });
});

describe('measurementSeries', () => {
  it('returns one field over time, oldest first, skipping gaps', () => {
    const series = measurementSeries(
      [
        { date: '2026-09-10', weightKg: 83, waistCm: 88 },
        { date: '2026-09-03', weightKg: 84 },
        { date: '2026-09-17', waistCm: 87 },
      ],
      'weightKg',
    );
    expect(series).toEqual([
      { date: '2026-09-03', value: 84 },
      { date: '2026-09-10', value: 83 },
    ]);
  });
});

describe('movingAverage', () => {
  it('smooths daily noise over the last seven days', () => {
    const points = [
      { date: '2026-09-01', value: 84 },
      { date: '2026-09-02', value: 85 },
      { date: '2026-09-03', value: 83 },
      { date: '2026-09-10', value: 82 },
    ];
    expect(movingAverage(points).map((point) => point.value)).toEqual([84, 84.5, 84, 82]);
  });
});

describe('trendChange', () => {
  it('compares the last week with four weeks before', () => {
    const points = [
      { date: '2026-08-20', value: 85 },
      { date: '2026-08-22', value: 84.6 },
      { date: '2026-09-17', value: 83.2 },
      { date: '2026-09-19', value: 83 },
    ];
    expect(trendChange(points)).toEqual({ change: -1.7, from: 84.8, to: 83.1 });
  });

  it('needs data on both sides', () => {
    expect(trendChange([{ date: '2026-09-19', value: 83 }])).toBeNull();
    expect(
      trendChange([
        { date: '2026-09-15', value: 83.4 },
        { date: '2026-09-19', value: 83 },
      ]),
    ).toBeNull();
  });
});
