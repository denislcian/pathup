import { estimateOneRepMax, MAX_REPS_FOR_ESTIMATE } from '@/domain/one-rep-max';

describe('estimateOneRepMax', () => {
  it('returns the lifted weight for a single rep', () => {
    expect(estimateOneRepMax(100, 1)).toBe(100);
  });

  it('applies the Epley formula rounded to one decimal', () => {
    expect(estimateOneRepMax(100, 5)).toBe(116.7);
    expect(estimateOneRepMax(60, 10)).toBe(80);
  });

  it('refuses to estimate above the reliable rep limit', () => {
    expect(estimateOneRepMax(50, MAX_REPS_FOR_ESTIMATE)).not.toBeNull();
    expect(estimateOneRepMax(50, MAX_REPS_FOR_ESTIMATE + 1)).toBeNull();
  });

  it.each([
    [0, 5],
    [-20, 5],
    [100, 0],
    [100, 2.5],
    [Number.NaN, 5],
  ])('returns null for invalid input (%p kg × %p reps)', (weight, reps) => {
    expect(estimateOneRepMax(weight, reps)).toBeNull();
  });
});
