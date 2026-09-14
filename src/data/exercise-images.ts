import type { ImageSourcePropType } from 'react-native';

export type ExerciseImages = { start: ImageSourcePropType; end?: ImageSourcePropType };

/**
 * Optimized exercise images by slug. Metro needs static `require` calls, so add an entry per
 * exercise when its WebP files land in assets/images/exercises, e.g.:
 *   'press-banca-barra': {
 *     start: require('@/assets/images/exercises/ex_press-banca-barra_start.webp'),
 *     end: require('@/assets/images/exercises/ex_press-banca-barra_end.webp'),
 *   },
 */
export const EXERCISE_IMAGES: Partial<Record<string, ExerciseImages>> = {};
