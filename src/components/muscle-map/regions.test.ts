import { bestView, focusBox, mirror, REGIONS, VIEW_BOX } from '@/components/muscle-map/regions';
import { MUSCLES } from '@/domain/exercises';

describe('muscle map regions', () => {
  it('draws every muscle of the catalogue in at least one view', () => {
    const drawn = new Set(
      [...REGIONS.front, ...REGIONS.back].map((region) => region.muscle).filter(Boolean),
    );
    MUSCLES.forEach((muscle) => expect(drawn).toContain(muscle));
  });

  it('keeps every point on the right half of the grid, so mirroring never overlaps', () => {
    [...REGIONS.front, ...REGIONS.back].forEach((region) =>
      region.points.forEach(([x, y]) => {
        expect(x).toBeGreaterThanOrEqual(VIEW_BOX.width / 2);
        expect(x).toBeLessThanOrEqual(VIEW_BOX.width);
        expect(y).toBeGreaterThanOrEqual(0);
        expect(y).toBeLessThanOrEqual(VIEW_BOX.height);
      }),
    );
  });

  it('mirrors a point across the centre line', () => {
    expect(mirror([[60, 10]])).toEqual([[40, 10]]);
  });

  it('picks the back for back exercises and the front for the rest', () => {
    expect(bestView(['lats', 'upper_back'])).toBe('back');
    expect(bestView(['chest'])).toBe('front');
    expect(bestView(['glutes', 'hamstrings'])).toBe('back');
  });
});

describe('focusBox', () => {
  it('frames the highlighted muscles in a square with a margin', () => {
    const box = focusBox('front', ['chest']);
    expect(box.width).toBe(box.height);
    // The chest sits between y 36 and 57 and spreads to both sides of the centre line.
    expect(box.y).toBeLessThan(36);
    expect(box.y + box.height).toBeGreaterThan(57);
    expect(box.x + box.width / 2).toBeCloseTo(50);
  });

  it('shows the whole body when nothing is highlighted', () => {
    expect(focusBox('back', [])).toEqual({ x: 0, y: 0, width: 100, height: 205 });
  });
});
