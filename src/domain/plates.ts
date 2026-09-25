/**
 * Plate calculator: which plates go on each side of the bar for a given total. The plates are the
 * ones any commercial gym has (25 kg plates are rare outside powerlifting gyms, so they are left
 * out and nobody is sent looking for them).
 */

/** Plates for one side of the bar, heaviest first, in kilos. */
export const STANDARD_PLATES_KG = [20, 15, 10, 5, 2.5, 1.25] as const;
/** An Olympic men's bar. */
export const DEFAULT_BAR_KG = 20;

export type PlateLoad =
  | { kind: 'below-bar'; barKg: number }
  | { kind: 'bar-only'; barKg: number }
  | {
      kind: 'plates';
      barKg: number;
      /** Plates for ONE side, heaviest first. */
      perSide: number[];
      /** Kilos per side the plates cannot make up (0 when the total comes out exact). */
      shortPerSideKg: number;
    };

// Everything in grams so 2.5 and 1.25 add up exactly.
const toGrams = (kg: number) => Math.round(kg * 1000);

export function plateLoad(
  totalKg: number,
  barKg: number = DEFAULT_BAR_KG,
  plates: readonly number[] = STANDARD_PLATES_KG,
): PlateLoad {
  const total = toGrams(totalKg);
  const bar = toGrams(barKg);
  if (total < bar) return { kind: 'below-bar', barKg };
  if (total === bar) return { kind: 'bar-only', barKg };

  // With a sensible set of plates (each one at least double the next, or close), taking the
  // heaviest that fits is also the fewest plates.
  let side = Math.floor((total - bar) / 2);
  const perSide: number[] = [];
  for (const plate of [...plates].sort((a, b) => b - a)) {
    const grams = toGrams(plate);
    while (grams > 0 && side >= grams) {
      perSide.push(plate);
      side -= grams;
    }
  }

  // Tiny leftovers from halving an odd number of grams are not worth a warning.
  const shortPerSideKg = side >= 10 ? side / 1000 : 0;
  if (perSide.length === 0 && shortPerSideKg === 0) return { kind: 'bar-only', barKg };
  return { kind: 'plates', barKg, perSide, shortPerSideKg };
}
