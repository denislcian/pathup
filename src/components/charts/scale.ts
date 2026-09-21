/**
 * Round axis ticks (0, 25, 50…) that cover [min, max]. Charts start the axis where the data
 * starts rather than at zero: a 1RM going from 100 to 110 kg must look like progress, not a
 * flat line.
 */
export function niceTicks(min: number, max: number, count = 4): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [0, 1];
  if (min === max) {
    const pad = Math.abs(min) * 0.1 || 1;
    return niceTicks(min - pad, max + pad, count);
  }

  const rawStep = (max - min) / count;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const step =
    [1, 2, 2.5, 5, 10].map((factor) => factor * magnitude).find((value) => value >= rawStep) ??
    10 * magnitude;

  const start = Math.floor(min / step) * step;
  const end = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let value = start; value <= end + step / 2; value += step) {
    ticks.push(Math.round(value * 100) / 100);
  }
  return ticks;
}

/** Maps a value from the domain [d0, d1] to the range [r0, r1]. */
export function linear(value: number, [d0, d1]: [number, number], [r0, r1]: [number, number]) {
  if (d1 === d0) return (r0 + r1) / 2;
  return r0 + ((value - d0) / (d1 - d0)) * (r1 - r0);
}
