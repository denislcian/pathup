import { getExercise } from '@/data/exercises';
import { PROGRAMS } from '@/data/programs';
import { dayKey, type Habit, type HabitLog } from '@/domain/habits';
import type { Measurement } from '@/domain/measurements';
import { sessionKey, suggestNextSet } from '@/domain/programs';
import type { Routine } from '@/domain/routines';
import type { Checkin } from '@/domain/wellness';
import {
  toPreviousPerformance,
  type LoggedSet,
  type PreviousPerformance,
  type SetType,
  type Workout,
} from '@/domain/workout';

/**
 * In-memory stand-in for the database in the public demo ("Probar sin cuenta", see demo-mode.ts).
 * It starts with eight weeks of realistic training so every screen has data.
 */

/** Marcos's first working weight on each exercise of Torso / Pierna, week 1. */
const START_KG: Record<string, number> = {
  'press-banca-barra': 70,
  'remo-barra': 60,
  'press-militar-mancuernas': 18,
  'jalon-pecho': 55,
  'elevaciones-laterales': 8,
  'curl-biceps-mancuernas': 12,
  'extension-triceps-sobre-cabeza': 18,
  'sentadilla-trasera-barra': 85,
  'peso-muerto-rumano': 80,
  'prensa-piernas': 140,
  'curl-femoral-tumbado': 35,
  'elevacion-gemelos': 50,
  plancha: 0,
  'press-inclinado-mancuernas': 24,
  'dominadas-asistidas': 25,
  'remo-polea-sentado': 55,
  'face-pull': 20,
  'curl-martillo': 14,
  'press-frances': 25,
  'hip-thrust': 100,
  'sentadilla-bulgara': 14,
  'extension-cuadriceps': 45,
  'curl-femoral-sentado': 40,
  'crunch-polea': 35,
};

/** Monday, Tuesday, Thursday and Saturday. */
const WEEKDAYS = [1, 2, 4, 6];
const WEEKS = 8;
const DEMO_PROGRAM = 'torso-pierna';

function buildSet(
  id: string,
  type: SetType,
  weightKg: number,
  reps: number,
  rir: number | null,
  at: Date,
): LoggedSet {
  return { id, type, weightKg, reps, rir, completedAt: at.toISOString() };
}

/**
 * Eight weeks of the Torso / Pierna programme, each session logged the way the app itself
 * suggests (double progression, src/domain/programs.ts). So the demo shows what a real user sees:
 * last time's sets in grey, and the weights of the next session already filled in.
 */
export function buildDemoWorkouts(now: Date): Workout[] {
  const program = PROGRAMS.find((item) => item.slug === DEMO_PROGRAM)!;
  const previous: Record<string, PreviousPerformance> = {};
  const workouts: Workout[] = [];
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7) - 7 * (WEEKS - 1));

  for (let week = 0; week < WEEKS; week += 1) {
    const rir = program.weeks[week]?.rir ?? 2;
    for (const [dayIndex, session] of program.sessions.entries()) {
      // One missed session this week, like real life: the programme offers it again instead of
      // losing the week.
      if (week === WEEKS - 1 && dayIndex === 1) continue;
      const started = new Date(monday);
      started.setDate(started.getDate() + week * 7 + (WEEKDAYS[dayIndex]! - 1));
      started.setHours(18, 30, 0, 0);
      if (started > now) continue;

      const id = `demo-w${week}-${dayIndex}`;
      let clock = new Date(started.getTime() + 5 * 60 * 1000);
      const exercises = session.exercises.map((planned, position) => {
        const equipment = getExercise(planned.slug)?.equipment ?? [];
        const suggestion = suggestNextSet(previous[planned.slug], planned, equipment);
        const first = suggestion.kind === 'start';
        const weightKg = first ? (START_KG[planned.slug] ?? 0) : suggestion.weightKg;
        const reps = first ? planned.repMin + 1 : suggestion.reps;

        const sets: LoggedSet[] = [];
        if (position === 0 && weightKg > 20) {
          clock = new Date(clock.getTime() + 3 * 60 * 1000);
          const warmupKg = Math.round((weightKg * 0.5) / 2.5) * 2.5;
          sets.push(buildSet(`${id}-${position}-w`, 'warmup', warmupKg, 10, null, clock));
        }
        for (let index = 0; index < planned.sets; index += 1) {
          clock = new Date(clock.getTime() + 3 * 60 * 1000);
          // Every other week the last set loses a rep, so the climb is not a straight line.
          const tired = index === planned.sets - 1 && week % 2 === 1;
          const setReps = tired ? Math.max(reps - 1, 1) : reps;
          sets.push(
            buildSet(`${id}-${position}-${index}`, 'normal', weightKg, setReps, rir, clock),
          );
        }
        return { id: `${id}-${position}`, slug: planned.slug, sets };
      });

      const workout: Workout = {
        id,
        name: session.name,
        startedAt: started.toISOString(),
        endedAt: new Date(clock.getTime() + 4 * 60 * 1000).toISOString(),
        exercises,
        programSlug: DEMO_PROGRAM,
        programSession: sessionKey(week + 1, session.key),
      };
      for (const entry of toPreviousPerformance(workout)) previous[entry.slug] = entry;
      workouts.push(workout);
    }
  }
  return workouts;
}

/** The programme's four sessions, saved as routines in a "Torso / Pierna" folder. */
export function buildDemoRoutines(): Routine[] {
  const program = PROGRAMS.find((item) => item.slug === DEMO_PROGRAM)!;
  return program.sessions.map((session, index) => ({
    id: `demo-r${index}`,
    name: session.name,
    folder: 'Torso / Pierna',
    position: index,
    exercises: session.exercises.map((planned, position) => ({
      id: `demo-r${index}-${position}`,
      slug: planned.slug,
      sets: planned.sets,
      repMin: planned.repMin,
      repMax: planned.repMax,
    })),
  }));
}

/**
 * Eight weeks of a slow cut: weigh-ins every two or three days with the usual day-to-day noise,
 * waist once a week and body fat every two weeks.
 */
export function buildDemoMeasurements(now: Date): Measurement[] {
  const noise = [0.4, -0.3, 0.1, 0.5, -0.2, 0, 0.3, -0.4, 0.2, -0.1];
  const entries: Measurement[] = [];
  const pad = (value: number) => String(value).padStart(2, '0');
  for (let daysAgo = 56, index = 0; daysAgo >= 0; daysAgo -= index % 2 === 0 ? 2 : 3, index += 1) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysAgo);
    const progress = (56 - daysAgo) / 56;
    const entry: Measurement = {
      date: `${day.getFullYear()}-${pad(day.getMonth() + 1)}-${pad(day.getDate())}`,
      weightKg: Math.round((94 - 2.4 * progress + noise[index % noise.length]) * 10) / 10,
    };
    if (index % 3 === 0) entry.waistCm = Math.round((96 - 2.5 * progress) * 10) / 10;
    if (index % 6 === 0) entry.bodyFatPct = Math.round((22 - 1.3 * progress) * 10) / 10;
    entries.push(entry);
  }
  return entries.reverse();
}

let workouts: Workout[] | null = null;
let routines: Routine[] | null = null;
let measurements: Measurement[] | null = null;
let enrollment: {
  id: string;
  programSlug: string;
  startedOn: string;
  status: 'active' | 'finished' | 'abandoned';
} | null = null;
let enrollmentReady = false;
let checkins: Checkin[] | null = null;
let habits: { habits: Habit[]; logs: HabitLog[] } | null = null;

/** Three habits with two weeks of history: water most days, stretching on and off. */
export function buildDemoHabits(now: Date): { habits: Habit[]; logs: HabitLog[] } {
  const list: Habit[] = [
    { id: 'demo-h-water', name: 'Beber agua', target: 8, unit: 'vasos', position: 0 },
    { id: 'demo-h-stretch', name: 'Estirar 10 minutos', target: 1, unit: null, position: 1 },
    {
      id: 'demo-h-screens',
      name: 'Sin pantallas antes de dormir',
      target: 1,
      unit: null,
      position: 2,
    },
  ];
  const logs: HabitLog[] = [];
  for (let daysAgo = 0; daysAgo < 14; daysAgo += 1) {
    const date = dayKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysAgo));
    // Today is still in progress: a few glasses and nothing else yet.
    if (daysAgo === 0) {
      logs.push({ habitId: 'demo-h-water', date, count: 3 });
      continue;
    }
    logs.push({ habitId: 'demo-h-water', date, count: daysAgo === 6 ? 5 : 8 });
    if (daysAgo % 3 !== 0) logs.push({ habitId: 'demo-h-stretch', date, count: 1 });
    if (daysAgo < 5) logs.push({ habitId: 'demo-h-screens', date, count: 1 });
  }
  return { habits: list, logs };
}

/** Two weeks of check-ins with the usual ups and downs. */
export function buildDemoCheckins(now: Date): Checkin[] {
  const sleep = [7.5, 6, 8, 7, 5.5, 8.5, 7, 7.5, 6.5, 8, 7, 6, 7.5, 8];
  const quality = [4, 3, 5, 4, 2, 5, 4, 4, 3, 5, 4, 3, 4, 5];
  const pad = (value: number) => String(value).padStart(2, '0');
  return sleep.map((hours, index) => {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - index);
    return {
      date: `${day.getFullYear()}-${pad(day.getMonth() + 1)}-${pad(day.getDate())}`,
      sleepHours: hours,
      sleepQuality: quality[index],
      energy: Math.min(5, Math.max(1, quality[index] + (index % 3 === 0 ? 0 : -1))),
      stress: index % 4 === 0 ? 3 : 2,
      soreness: index % 5 === 0 ? 4 : 2,
      mood: Math.min(5, quality[index]),
      note: null,
    };
  });
}

export const demoBackend = {
  /** Back to the untouched sample data, for the next person who tries the demo. */
  reset(): void {
    workouts = null;
    routines = null;
    measurements = null;
    enrollment = null;
    enrollmentReady = false;
    checkins = null;
    habits = null;
  },
  listWorkouts(): Workout[] {
    workouts ??= buildDemoWorkouts(new Date());
    return workouts;
  },
  saveWorkout(workout: Workout): void {
    workouts = [...demoBackend.listWorkouts().filter((item) => item.id !== workout.id), workout];
  },
  deleteWorkout(id: string): void {
    workouts = demoBackend.listWorkouts().filter((item) => item.id !== id);
  },
  listRoutines(): Routine[] {
    routines ??= buildDemoRoutines();
    return [...routines].sort((a, b) => a.position - b.position);
  },
  saveRoutine(routine: Routine): void {
    routines = [...demoBackend.listRoutines().filter((item) => item.id !== routine.id), routine];
  },
  deleteRoutine(id: string): void {
    routines = demoBackend.listRoutines().filter((item) => item.id !== id);
  },
  listMeasurements(): Measurement[] {
    measurements ??= buildDemoMeasurements(new Date());
    return measurements;
  },
  saveMeasurement(entry: Measurement): void {
    measurements = [
      entry,
      ...demoBackend.listMeasurements().filter((item) => item.date !== entry.date),
    ].sort((a, b) => b.date.localeCompare(a.date));
  },
  deleteMeasurement(date: string): void {
    measurements = demoBackend.listMeasurements().filter((item) => item.date !== date);
  },
  getEnrollment() {
    if (!enrollmentReady) {
      const first = demoBackend.listWorkouts().at(-1);
      enrollment = {
        id: 'demo-enrollment',
        programSlug: DEMO_PROGRAM,
        startedOn: (first?.startedAt ?? new Date().toISOString()).slice(0, 10),
        status: 'active' as const,
      };
      enrollmentReady = true;
    }
    return enrollment?.status === 'active' ? enrollment : null;
  },
  saveEnrollment(next: NonNullable<typeof enrollment>): void {
    enrollment = next;
    enrollmentReady = true;
  },
  setEnrollmentStatus(id: string, status: 'active' | 'finished' | 'abandoned'): void {
    demoBackend.getEnrollment();
    if (enrollment && enrollment.id === id) enrollment = { ...enrollment, status };
  },
  listHabits(): { habits: Habit[]; logs: HabitLog[] } {
    habits ??= buildDemoHabits(new Date());
    return { habits: [...habits.habits], logs: [...habits.logs] };
  },
  saveHabit(habit: Habit): void {
    const current = demoBackend.listHabits();
    habits = {
      habits: [...current.habits.filter((item) => item.id !== habit.id), habit].sort(
        (a, b) => a.position - b.position,
      ),
      logs: current.logs,
    };
  },
  deleteHabit(id: string): void {
    const current = demoBackend.listHabits();
    habits = {
      habits: current.habits.filter((item) => item.id !== id),
      logs: current.logs.filter((log) => log.habitId !== id),
    };
  },
  logHabit(log: HabitLog): void {
    const current = demoBackend.listHabits();
    habits = {
      habits: current.habits,
      logs: [
        ...current.logs.filter((item) => !(item.habitId === log.habitId && item.date === log.date)),
        log,
      ],
    };
  },
  listCheckins(): Checkin[] {
    checkins ??= buildDemoCheckins(new Date());
    return checkins;
  },
  saveCheckin(checkin: Checkin): void {
    checkins = [
      checkin,
      ...demoBackend.listCheckins().filter((item) => item.date !== checkin.date),
    ].sort((a, b) => b.date.localeCompare(a.date));
  },
};
