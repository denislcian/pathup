import type { Routine } from '@/domain/routines';
import type { LoggedSet, SetType, Workout } from '@/domain/workout';

/**
 * In-memory stand-in for the database while previewing the app with `?demo=1` (development only,
 * see demo-mode.ts). It starts with eight weeks of realistic training so every screen has data.
 */

type Plan = { slug: string; sets: number; reps: number; start: number; step: number };

const DAYS: { weekday: number; name: string; plan: Plan[] }[] = [
  {
    weekday: 1,
    name: 'Torso A',
    plan: [
      { slug: 'press-banca-barra', sets: 3, reps: 8, start: 70, step: 2.5 },
      { slug: 'remo-barra', sets: 3, reps: 10, start: 55, step: 2.5 },
      { slug: 'press-militar-mancuernas', sets: 3, reps: 10, start: 16, step: 1 },
      { slug: 'curl-biceps-mancuernas', sets: 2, reps: 12, start: 10, step: 0.5 },
      { slug: 'extension-triceps-polea', sets: 2, reps: 12, start: 20, step: 1.25 },
    ],
  },
  {
    weekday: 2,
    name: 'Pierna A',
    plan: [
      { slug: 'sentadilla-goblet', sets: 3, reps: 10, start: 24, step: 2 },
      { slug: 'peso-muerto-rumano', sets: 3, reps: 8, start: 70, step: 2.5 },
      { slug: 'prensa-piernas', sets: 3, reps: 12, start: 120, step: 5 },
      { slug: 'elevacion-gemelos', sets: 3, reps: 15, start: 40, step: 2.5 },
    ],
  },
  {
    weekday: 4,
    name: 'Torso B',
    plan: [
      { slug: 'press-inclinado-mancuernas', sets: 3, reps: 10, start: 24, step: 1 },
      { slug: 'jalon-pecho', sets: 3, reps: 10, start: 50, step: 2.5 },
      { slug: 'elevaciones-laterales', sets: 3, reps: 15, start: 8, step: 0.5 },
      { slug: 'flexiones', sets: 2, reps: 15, start: 0, step: 0 },
    ],
  },
  {
    weekday: 6,
    name: 'Pierna B',
    plan: [
      { slug: 'hip-thrust', sets: 3, reps: 10, start: 80, step: 5 },
      { slug: 'zancadas', sets: 3, reps: 10, start: 12, step: 1 },
      { slug: 'curl-femoral-sentado', sets: 3, reps: 12, start: 35, step: 2.5 },
      { slug: 'crunch-polea', sets: 3, reps: 12, start: 30, step: 2.5 },
    ],
  },
];

const WEEKS = 8;

function buildSet(id: string, type: SetType, weightKg: number, reps: number, at: Date): LoggedSet {
  return {
    id,
    type,
    weightKg,
    reps,
    rir: type === 'warmup' ? null : 2,
    completedAt: at.toISOString(),
  };
}

export function buildDemoWorkouts(now: Date): Workout[] {
  const workouts: Workout[] = [];
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7) - 7 * (WEEKS - 1));

  for (let week = 0; week < WEEKS; week += 1) {
    for (const [dayIndex, day] of DAYS.entries()) {
      // One missed session in week 4, like real life.
      if (week === 3 && dayIndex === 3) continue;
      const started = new Date(monday);
      started.setDate(started.getDate() + week * 7 + (day.weekday - 1));
      started.setHours(18, 30, 0, 0);
      if (started > now) continue;

      const id = `demo-w${week}-${dayIndex}`;
      let clock = new Date(started.getTime() + 5 * 60 * 1000);
      const exercises = day.plan.map((plan, position) => {
        // Double progression: reps climb for a week, then the weight goes up.
        const level = Math.floor(week / 2);
        const weightKg = plan.start + plan.step * level;
        const reps = plan.reps + (week % 2) + (plan.step === 0 ? week : 0);
        const sets: LoggedSet[] = [];
        if (position === 0 && weightKg > 20) {
          clock = new Date(clock.getTime() + 3 * 60 * 1000);
          sets.push(
            buildSet(`${id}-${position}-w`, 'warmup', Math.round(weightKg * 0.5), 10, clock),
          );
        }
        for (let index = 0; index < plan.sets; index += 1) {
          clock = new Date(clock.getTime() + 3 * 60 * 1000);
          // The last set usually loses a rep.
          const setReps = index === plan.sets - 1 ? Math.max(reps - 1, 1) : reps;
          sets.push(buildSet(`${id}-${position}-${index}`, 'normal', weightKg, setReps, clock));
        }
        return { id: `${id}-${position}`, slug: plan.slug, sets };
      });

      workouts.push({
        id,
        name: day.name,
        startedAt: started.toISOString(),
        endedAt: new Date(clock.getTime() + 4 * 60 * 1000).toISOString(),
        exercises,
      });
    }
  }
  return workouts;
}

/** The four sessions above, saved as routines in a "Torso / Pierna" folder. */
export function buildDemoRoutines(): Routine[] {
  return DAYS.map((day, index) => ({
    id: `demo-r${index}`,
    name: day.name,
    folder: 'Torso / Pierna',
    position: index,
    exercises: day.plan.map((plan, position) => ({
      id: `demo-r${index}-${position}`,
      slug: plan.slug,
      sets: plan.sets,
      repMin: plan.reps,
      repMax: plan.reps + 2,
    })),
  }));
}

let workouts: Workout[] | null = null;
let routines: Routine[] | null = null;

export const demoBackend = {
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
};
