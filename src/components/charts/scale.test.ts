import { linear, niceTicks } from '@/components/charts/scale';

describe('niceTicks', () => {
  it('uses round steps that cover the data', () => {
    expect(niceTicks(96.3, 112.7)).toEqual([95, 100, 105, 110, 115]);
    expect(niceTicks(0, 1830)).toEqual([0, 500, 1000, 1500, 2000]);
  });

  it('opens up a flat series so the line sits in the middle', () => {
    const ticks = niceTicks(80, 80);
    expect(ticks[0]).toBeLessThan(80);
    expect(ticks.at(-1)).toBeGreaterThan(80);
  });

  it('does not crash on empty input', () => {
    expect(niceTicks(Number.NaN, Number.NaN)).toEqual([0, 1]);
  });
});

describe('linear', () => {
  it('maps a domain onto pixels, inverted for the y axis', () => {
    expect(linear(100, [90, 110], [200, 0])).toBe(100);
    expect(linear(5, [5, 5], [0, 40])).toBe(20);
  });
});
