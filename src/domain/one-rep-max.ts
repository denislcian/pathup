/** Above this many reps the Epley estimate stops being reliable, so we don't estimate. */
export const MAX_REPS_FOR_ESTIMATE = 12;

/**
 * Estimated one-rep max using the Epley formula: weight × (1 + reps / 30).
 * Returns null when the set can't produce a reliable estimate.
 */
export function estimateOneRepMax(weightKg: number, reps: number): number | null {
  if (!Number.isFinite(weightKg) || !Number.isInteger(reps)) return null;
  if (weightKg <= 0 || reps < 1 || reps > MAX_REPS_FOR_ESTIMATE) return null;
  if (reps === 1) return weightKg;

  return Math.round(weightKg * (1 + reps / 30) * 10) / 10;
}
