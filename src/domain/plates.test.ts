import { plateLoad } from '@/domain/plates';

describe('plateLoad', () => {
  it('splits the weight over the bar into plates per side, heaviest first', () => {
    expect(plateLoad(100)).toEqual({
      kind: 'plates',
      barKg: 20,
      perSide: [20, 20],
      shortPerSideKg: 0,
    });
    expect(plateLoad(62.5)).toEqual({
      kind: 'plates',
      barKg: 20,
      perSide: [20, 1.25],
      shortPerSideKg: 0,
    });
    expect(plateLoad(57.5)).toMatchObject({ perSide: [15, 2.5, 1.25] });
    expect(plateLoad(80)).toMatchObject({ perSide: [20, 10] });
  });

  it('says when it is just the bar, or less than the bar', () => {
    expect(plateLoad(20)).toEqual({ kind: 'bar-only', barKg: 20 });
    expect(plateLoad(15)).toEqual({ kind: 'below-bar', barKg: 20 });
    expect(plateLoad(0)).toEqual({ kind: 'below-bar', barKg: 20 });
  });

  it('says how much is missing when standard plates cannot make the total', () => {
    // 61 kg: 20.5 per side, and the smallest plate is 1.25.
    expect(plateLoad(61)).toEqual({
      kind: 'plates',
      barKg: 20,
      perSide: [20],
      shortPerSideKg: 0.5,
    });
    // 21 kg: half a kilo per side, not even one plate.
    expect(plateLoad(21)).toEqual({ kind: 'plates', barKg: 20, perSide: [], shortPerSideKg: 0.5 });
  });

  it('works with another bar and another set of plates', () => {
    expect(plateLoad(35, 15)).toMatchObject({ barKg: 15, perSide: [10] });
    expect(plateLoad(120, 20, [25, 20, 10, 5])).toMatchObject({ perSide: [25, 25] });
    expect(plateLoad(130, 20, [25, 20, 10, 5])).toMatchObject({ perSide: [25, 25, 5] });
  });

  it('adds up decimals exactly', () => {
    // 22.5 kg: 1.25 per side, which floating point would get wrong if summed as 0.1s.
    expect(plateLoad(22.5)).toMatchObject({ perSide: [1.25], shortPerSideKg: 0 });
    expect(plateLoad(27.5)).toMatchObject({ perSide: [2.5, 1.25], shortPerSideKg: 0 });
  });
});
