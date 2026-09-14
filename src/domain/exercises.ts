export const MUSCLES = [
  'chest',
  'front_delts',
  'side_delts',
  'rear_delts',
  'biceps',
  'triceps',
  'forearms',
  'lats',
  'upper_back',
  'traps',
  'lower_back',
  'abs',
  'obliques',
  'glutes',
  'quads',
  'hamstrings',
  'adductors',
  'calves',
] as const;
export type Muscle = (typeof MUSCLES)[number];

export const EQUIPMENT = [
  'barbell',
  'dumbbell',
  'machine',
  'cable',
  'bench',
  'band',
  'bodyweight',
] as const;
export type Equipment = (typeof EQUIPMENT)[number];

/** What a user says they can train with during onboarding (stored in profiles.equipment). */
export const USER_EQUIPMENT = ['gym', 'dumbbells', 'bands', 'bodyweight'] as const;
export type UserEquipment = (typeof USER_EQUIPMENT)[number];

export const MUSCLE_GROUPS = {
  chest: ['chest'],
  back: ['lats', 'upper_back', 'traps', 'lower_back'],
  shoulders: ['front_delts', 'side_delts', 'rear_delts'],
  arms: ['biceps', 'triceps', 'forearms'],
  legs: ['quads', 'hamstrings', 'adductors', 'calves'],
  glutes: ['glutes'],
  core: ['abs', 'obliques'],
} as const satisfies Record<string, readonly Muscle[]>;
export type MuscleGroup = keyof typeof MUSCLE_GROUPS;

export type Exercise = {
  slug: string;
  name: string;
  nameEn: string;
  aliases: string[];
  category: 'strength' | 'core' | 'carry';
  mechanic: 'compound' | 'isolation';
  level: 'beginner' | 'intermediate';
  equipment: Equipment[];
  primaryMuscles: Muscle[];
  secondaryMuscles: Muscle[];
  instructions: string[];
  cues: string[];
  mistakes: string[];
  substitutes: string[];
};

const EQUIPMENT_BY_USER_CHOICE: Record<UserEquipment, readonly Equipment[]> = {
  gym: EQUIPMENT,
  dumbbells: ['dumbbell', 'bodyweight'],
  bands: ['band', 'bodyweight'],
  bodyweight: ['bodyweight'],
};

export function availableEquipment(choices: readonly string[]): Set<Equipment> {
  const available = new Set<Equipment>(['bodyweight']);
  for (const choice of choices) {
    const equipment = EQUIPMENT_BY_USER_CHOICE[choice as UserEquipment];
    equipment?.forEach((item) => available.add(item));
  }
  return available;
}

export function canPerform(exercise: Exercise, available: Set<Equipment>): boolean {
  return exercise.equipment.every((item) => available.has(item));
}

/** Unicode combining diacritical marks (U+0300 to U+036F), left behind by NFD normalization. */
const COMBINING_MARKS = new RegExp(
  `[${String.fromCharCode(0x300)}-${String.fromCharCode(0x36f)}]`,
  'g',
);

export function normalizeText(text: string): string {
  return text.normalize('NFD').replace(COMBINING_MARKS, '').toLowerCase().trim();
}

export type ExerciseFilters = {
  query?: string;
  muscleGroup?: MuscleGroup | null;
  /** When set, only exercises doable with this equipment are returned. */
  available?: Set<Equipment> | null;
  /** Extra searchable text per muscle, e.g. localized labels ("pecho"). */
  muscleLabel?: (muscle: Muscle) => string;
};

export function filterExercises(
  exercises: readonly Exercise[],
  filters: ExerciseFilters,
): Exercise[] {
  const tokens = normalizeText(filters.query ?? '')
    .split(/\s+/)
    .filter(Boolean);
  const groupMuscles: readonly Muscle[] | null = filters.muscleGroup
    ? MUSCLE_GROUPS[filters.muscleGroup]
    : null;

  return exercises
    .filter((exercise) => {
      if (groupMuscles && !exercise.primaryMuscles.some((m) => groupMuscles.includes(m))) {
        return false;
      }
      if (filters.available && !canPerform(exercise, filters.available)) {
        return false;
      }
      if (tokens.length === 0) return true;

      const haystack = normalizeText(
        [
          exercise.name,
          exercise.nameEn,
          ...exercise.aliases,
          ...(filters.muscleLabel ? exercise.primaryMuscles.map(filters.muscleLabel) : []),
        ].join(' '),
      );
      return tokens.every((token) => haystack.includes(token));
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'es'));
}
