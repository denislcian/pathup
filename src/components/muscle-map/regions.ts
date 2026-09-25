import type { Muscle } from '@/domain/exercises';

/**
 * A geometric body for the muscle map, drawn on a 100 × 205 grid per view. Every polygon is the
 * right half of the figure (x from 50 outwards); the map mirrors it to draw the left half. Parts
 * that are not muscles (head, hands, knees…) are drawn in the base colour and never light up.
 */

export type Point = readonly [number, number];
export type View = 'front' | 'back';

export type Region = {
  /** The muscle it lights up for, or null for the base silhouette. */
  muscle: Muscle | null;
  points: readonly Point[];
};

export const VIEW_BOX = { width: 100, height: 205 } as const;
export const CENTER_X = 50;

/** Drawn once, not mirrored: they sit on the centre line. */
export const HEAD = { cx: 50, cy: 14, rx: 8.5, ry: 10.5 } as const;
export const NECK: readonly Point[] = [
  [46, 23],
  [54, 23],
  [54.5, 31],
  [45.5, 31],
];

const BASE_HAND: readonly Point[] = [
  [72, 90],
  [77.5, 90],
  [78.5, 99],
  [73, 100.5],
];

const BASE_FOOT: readonly Point[] = [
  [56, 192],
  [63, 192],
  [67, 199],
  [55, 199],
];

const BASE_KNEE: readonly Point[] = [
  [56, 136],
  [61, 142.5],
  [66.5, 135],
  [66, 148],
  [57, 148],
];

export const REGIONS: Record<View, readonly Region[]> = {
  front: [
    {
      muscle: 'traps',
      points: [
        [54, 29],
        [63, 34],
        [55, 35.5],
      ],
    },
    {
      muscle: 'front_delts',
      points: [
        [62, 34],
        [70, 36],
        [72, 45],
        [66, 46],
        [61, 40],
      ],
    },
    {
      muscle: 'side_delts',
      points: [
        [70, 36],
        [75.5, 40],
        [76.5, 50],
        [72, 45],
      ],
    },
    {
      muscle: 'chest',
      points: [
        [50.6, 36.5],
        [61, 40.5],
        [65.5, 46.5],
        [64, 55],
        [56, 57],
        [50.6, 55],
      ],
    },
    {
      muscle: 'biceps',
      points: [
        [66.5, 48],
        [73, 47],
        [76.5, 61],
        [71.5, 65],
        [66.5, 57],
      ],
    },
    {
      muscle: 'forearms',
      points: [
        [71.5, 66],
        [76.5, 62],
        [80, 78],
        [77.5, 89],
        [72, 89],
        [70, 77],
      ],
    },
    { muscle: null, points: BASE_HAND },
    {
      muscle: 'abs',
      points: [
        [50.6, 58],
        [57, 58],
        [57, 89.5],
        [50.6, 92.5],
      ],
    },
    {
      muscle: 'obliques',
      points: [
        [57.6, 58],
        [64.5, 56],
        [66.5, 70],
        [63.5, 86],
        [57.6, 89.5],
      ],
    },
    {
      muscle: null,
      points: [
        [50.6, 93.5],
        [57.6, 90.5],
        [63.5, 87],
        [66.5, 95],
        [58, 99],
        [50.6, 99],
      ],
    },
    {
      muscle: 'quads',
      points: [
        [54.5, 100],
        [66.5, 96],
        [69.5, 108],
        [67, 133],
        [61, 141],
        [56, 133],
      ],
    },
    {
      muscle: 'adductors',
      points: [
        [50.6, 100],
        [54, 100],
        [55.5, 131],
        [51.5, 123],
      ],
    },
    { muscle: null, points: BASE_KNEE },
    {
      muscle: null,
      points: [
        [56.5, 149],
        [61.5, 149],
        [60, 190.5],
        [57, 190.5],
        [55.5, 170],
      ],
    },
    {
      muscle: 'calves',
      points: [
        [62.5, 149],
        [67, 150],
        [66.5, 174],
        [62.5, 190.5],
        [60.8, 189],
      ],
    },
    { muscle: null, points: BASE_FOOT },
  ],
  back: [
    {
      muscle: 'traps',
      points: [
        [50.6, 25.5],
        [54.5, 28.5],
        [63, 34],
        [56.5, 41.5],
        [50.6, 50],
      ],
    },
    {
      muscle: 'rear_delts',
      points: [
        [63, 34],
        [70.5, 36.5],
        [72, 45.5],
        [66, 45],
      ],
    },
    {
      muscle: 'side_delts',
      points: [
        [70.5, 36.5],
        [75.5, 40],
        [76.5, 50],
        [72, 45.5],
      ],
    },
    {
      muscle: 'upper_back',
      points: [
        [50.6, 50.5],
        [57, 42],
        [64, 39.5],
        [65.5, 45.5],
        [59, 58],
        [55, 68],
        [50.6, 69],
      ],
    },
    {
      muscle: 'lats',
      points: [
        [59.6, 58],
        [66, 46.5],
        [69, 54],
        [65, 76],
        [57.6, 86],
        [56.5, 72],
        [55.6, 68.5],
      ],
    },
    {
      muscle: 'lower_back',
      points: [
        [50.6, 69.8],
        [55, 69],
        [56, 72.5],
        [57, 86.5],
        [50.6, 90],
      ],
    },
    {
      muscle: 'triceps',
      points: [
        [66.5, 47],
        [73, 46.5],
        [76.5, 61],
        [71.5, 65],
        [66.5, 57],
      ],
    },
    {
      muscle: 'forearms',
      points: [
        [71.5, 66],
        [76.5, 62],
        [80, 78],
        [77.5, 89],
        [72, 89],
        [70, 77],
      ],
    },
    { muscle: null, points: BASE_HAND },
    {
      muscle: 'glutes',
      points: [
        [50.6, 91],
        [57.6, 87.5],
        [65.5, 90],
        [67.5, 100],
        [62.5, 110],
        [50.6, 110],
      ],
    },
    {
      muscle: 'hamstrings',
      points: [
        [52.5, 111.5],
        [62.5, 111],
        [67.5, 104],
        [67, 132],
        [61, 141],
        [55.5, 133],
        [53.5, 122],
      ],
    },
    {
      muscle: 'adductors',
      points: [
        [50.6, 111.5],
        [51.9, 111.5],
        [53, 124],
        [51, 119],
      ],
    },
    { muscle: null, points: BASE_KNEE },
    {
      muscle: 'calves',
      points: [
        [56, 149],
        [66.5, 149],
        [68, 165],
        [64, 184],
        [59, 186],
        [55, 168],
      ],
    },
    {
      muscle: null,
      points: [
        [59, 186.8],
        [64, 184.8],
        [62.5, 191.5],
        [58, 191.5],
      ],
    },
    { muscle: null, points: BASE_FOOT },
  ],
};

/** The polygon mirrored onto the left half of the figure. */
export function mirror(points: readonly Point[]): Point[] {
  return points.map(([x, y]) => [2 * CENTER_X - x, y] as const);
}

export function toSvgPoints(points: readonly Point[]): string {
  return points.map(([x, y]) => `${x},${y}`).join(' ');
}

export type Box = { x: number; y: number; width: number; height: number };

/**
 * A square window around the highlighted muscles (both sides of the body), with some margin, so
 * a small thumbnail shows the muscles that work instead of a tiny whole body.
 */
export function focusBox(view: View, muscles: readonly Muscle[], margin = 8): Box {
  const points = REGIONS[view]
    .filter((region) => region.muscle && muscles.includes(region.muscle))
    .flatMap((region) => region.points);
  if (points.length === 0) return { x: 0, y: 0, width: VIEW_BOX.width, height: VIEW_BOX.height };

  const xs = points.flatMap(([x]) => [x, 2 * CENTER_X - x]);
  const ys = points.map(([, y]) => y);
  const minX = Math.min(...xs) - margin;
  const maxX = Math.max(...xs) + margin;
  const minY = Math.min(...ys) - margin;
  const maxY = Math.max(...ys) + margin;
  const size = Math.max(maxX - minX, maxY - minY);
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  return { x: centerX - size / 2, y: centerY - size / 2, width: size, height: size };
}

/** The view that shows more of the highlighted muscles, for small thumbnails. */
export function bestView(muscles: readonly Muscle[]): View {
  const count = (view: View) =>
    REGIONS[view].filter((region) => region.muscle && muscles.includes(region.muscle)).length;
  return count('back') > count('front') ? 'back' : 'front';
}
