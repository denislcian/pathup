import { estimateOneRepMax } from '@/domain/one-rep-max';
import { workoutVolumeKg, type LoggedSet, type Workout } from '@/domain/workout';

/** Working sets that count for records and charts: ticked off and not a warm-up. */
function workingSets(sets: readonly LoggedSet[]): LoggedSet[] {
  return sets.filter((set) => set.completedAt !== null && set.type !== 'warmup');
}

function workoutDate(workout: Workout): string {
  return workout.endedAt ?? workout.startedAt;
}

/** Newest first, the order history is shown in. */
export function sortNewestFirst(workouts: readonly Workout[]): Workout[] {
  return [...workouts].sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

// Per-exercise history -------------------------------------------------------------------------

export type ExerciseSession = {
  workoutId: string;
  date: string;
  /** Best estimated one-rep max of the session, null when no set is in the reliable range. */
  bestE1rm: number | null;
  topWeightKg: number;
  /** Most reps in a single set: the metric that matters for bodyweight exercises. */
  maxReps: number;
  volumeKg: number;
  sets: { weightKg: number; reps: number; type: LoggedSet['type'] }[];
};

/** Every session where the exercise was trained, oldest first (the order a chart reads). */
export function exerciseHistory(workouts: readonly Workout[], slug: string): ExerciseSession[] {
  const sessions: ExerciseSession[] = [];

  for (const workout of workouts) {
    const sets = workout.exercises
      .filter((exercise) => exercise.slug === slug)
      .flatMap((exercise) => workingSets(exercise.sets));
    if (sets.length === 0) continue;

    const estimates = sets
      .map((set) => estimateOneRepMax(set.weightKg, set.reps))
      .filter((value) => value !== null);

    sessions.push({
      workoutId: workout.id,
      date: workoutDate(workout),
      bestE1rm: estimates.length > 0 ? Math.max(...estimates) : null,
      topWeightKg: Math.max(...sets.map((set) => set.weightKg)),
      maxReps: Math.max(...sets.map((set) => set.reps)),
      volumeKg:
        Math.round(sets.reduce((total, set) => total + set.weightKg * set.reps, 0) * 10) / 10,
      sets: sets.map(({ weightKg, reps, type }) => ({ weightKg, reps, type })),
    });
  }

  return sessions.sort((a, b) => a.date.localeCompare(b.date));
}

// Personal records ------------------------------------------------------------------------------

export const RECORD_KINDS = ['e1rm', 'weight', 'setVolume', 'reps'] as const;
export type RecordKind = (typeof RECORD_KINDS)[number];

export type RecordEntry = {
  value: number;
  weightKg: number;
  reps: number;
  date: string;
  workoutId: string;
};

export type ExerciseRecords = Partial<Record<RecordKind, RecordEntry>>;
export type RecordBook = Record<string, ExerciseRecords>;

function scores(set: Pick<LoggedSet, 'weightKg' | 'reps'>): Partial<Record<RecordKind, number>> {
  const e1rm = estimateOneRepMax(set.weightKg, set.reps);
  return {
    // Only loaded sets can set a weight, 1RM or volume record; bodyweight sets compete on reps.
    ...(set.weightKg > 0 ? { weight: set.weightKg, setVolume: set.weightKg * set.reps } : {}),
    ...(e1rm !== null ? { e1rm } : {}),
    ...(set.weightKg === 0 ? { reps: set.reps } : {}),
  };
}

function addWorkout(book: RecordBook, workout: Workout): void {
  for (const exercise of workout.exercises) {
    for (const set of workingSets(exercise.sets)) {
      const records = (book[exercise.slug] ??= {});
      for (const [kind, value] of Object.entries(scores(set)) as [RecordKind, number][]) {
        const current = records[kind];
        if (current && value <= current.value) continue;
        records[kind] = {
          value: Math.round(value * 10) / 10,
          weightKg: set.weightKg,
          reps: set.reps,
          date: workoutDate(workout),
          workoutId: workout.id,
        };
      }
    }
  }
}

/** Best marks per exercise across every workout. */
export function computeRecords(workouts: readonly Workout[]): RecordBook {
  const book: RecordBook = {};
  const oldestFirst = [...workouts].sort((a, b) => a.startedAt.localeCompare(b.startedAt));
  for (const workout of oldestFirst) addWorkout(book, workout);
  return book;
}

export type RecordHit = {
  slug: string;
  kind: RecordKind;
  value: number;
  previous: number;
  weightKg: number;
  reps: number;
};

/**
 * Records a workout beats, compared with everything before it. The first time you log an
 * exercise sets your marks but doesn't count as beating them.
 */
export function detectRecords(history: readonly Workout[], workout: Workout): RecordHit[] {
  const earlier = history.filter(
    (item) => item.id !== workout.id && item.startedAt < workout.startedAt,
  );
  const before = computeRecords(earlier);
  const book = computeRecords([...earlier, workout]);

  const hits: RecordHit[] = [];
  for (const slug of new Set(workout.exercises.map((exercise) => exercise.slug))) {
    for (const kind of RECORD_KINDS) {
      const previous = before[slug]?.[kind];
      const now = book[slug]?.[kind];
      if (previous && now && now.value > previous.value) {
        hits.push({
          slug,
          kind,
          value: now.value,
          previous: previous.value,
          weightKg: now.weightKg,
          reps: now.reps,
        });
      }
    }
  }
  return hits;
}

// Calendar and consistency ---------------------------------------------------------------------

/** YYYY-MM-DD in the phone's time zone: a session at 00:30 belongs to that night, not to UTC. */
export function localDayKey(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function trainingDays(workouts: readonly Workout[]): Set<string> {
  return new Set(workouts.map((workout) => localDayKey(new Date(workout.startedAt))));
}

/** Monday of the week that contains `date`, at midnight local time. */
export function startOfWeek(date: Date): Date {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const offset = (monday.getDay() + 6) % 7;
  monday.setDate(monday.getDate() - offset);
  return monday;
}

/**
 * Weeks of a month for a calendar that starts on Monday. Days outside the month are null so the
 * grid keeps its shape.
 */
export function monthGrid(year: number, month: number): (Date | null)[][] {
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leading = (first.getDay() + 6) % 7;
  const cells: (Date | null)[] = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => new Date(year, month, index + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (Date | null)[][] = [];
  for (let index = 0; index < cells.length; index += 7) weeks.push(cells.slice(index, index + 7));
  return weeks;
}

/**
 * Consecutive weeks with at least one workout. The current week only breaks the streak once it
 * is over: on Tuesday, not having trained yet this week doesn't reset it.
 */
export function weeklyStreak(workouts: readonly Workout[], now: Date = new Date()): number {
  const weeks = new Set(
    workouts.map((workout) => startOfWeek(new Date(workout.startedAt)).getTime()),
  );
  const cursor = startOfWeek(now);
  if (!weeks.has(cursor.getTime())) cursor.setDate(cursor.getDate() - 7);

  let streak = 0;
  while (weeks.has(cursor.getTime())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 7);
  }
  return streak;
}

export type PeriodSummary = { workouts: number; volumeKg: number; seconds: number };

/** Totals for the workouts that started between `from` (included) and `to` (excluded). */
export function summarizePeriod(workouts: readonly Workout[], from: Date, to: Date): PeriodSummary {
  const inPeriod = workouts.filter((workout) => {
    const started = new Date(workout.startedAt).getTime();
    return started >= from.getTime() && started < to.getTime();
  });
  return {
    workouts: inPeriod.length,
    volumeKg: Math.round(inPeriod.reduce((total, item) => total + workoutVolumeKg(item), 0)),
    seconds: inPeriod.reduce((total, item) => {
      if (!item.endedAt) return total;
      return total + (new Date(item.endedAt).getTime() - new Date(item.startedAt).getTime()) / 1000;
    }, 0),
  };
}

/** Summary of the current week (Monday to Sunday). */
export function thisWeek(workouts: readonly Workout[], now: Date = new Date()): PeriodSummary {
  const from = startOfWeek(now);
  const to = new Date(from);
  to.setDate(to.getDate() + 7);
  return summarizePeriod(workouts, from, to);
}
