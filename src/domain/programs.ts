import type { UserEquipment } from '@/domain/exercises';
import type { PreviousPerformance, WorkoutTemplate } from '@/domain/workout';

/** One exercise inside a session of a programme: what to do, not how much weight. */
export type ProgramExercise = {
  slug: string;
  sets: number;
  repMin: number;
  repMax: number;
  /** Shown under the exercise while logging, e.g. "por lado" or "apunta los segundos". */
  note?: string;
};

export type ProgramSession = {
  /** Letter used in the plan: a, b, c… */
  key: string;
  name: string;
  focus: string;
  exercises: ProgramExercise[];
};

export type ProgramWeek = {
  number: number;
  phase: 'aprender' | 'acumular' | 'apretar' | 'descarga';
  /** Reps in reserve to leave on the working sets that week. */
  rir: number;
  /** Sets added to (or removed from) every exercise that week. */
  setsDelta: number;
  note: string;
};

export type ProgramGoal = 'muscle' | 'strength' | 'fat_loss' | 'health' | 'endurance';

export type Program = {
  slug: string;
  name: string;
  tagline: string;
  /** 'gym' needs a gym; 'home' works at home; 'both' works anywhere. */
  place: 'gym' | 'home' | 'both';
  level: 'beginner' | 'intermediate' | 'any';
  daysPerWeek: number;
  minutesPerSession: number;
  goals: ProgramGoal[];
  /** What the user must have said they train with (profiles.equipment). */
  equipment: UserEquipment[];
  /** Why it is built this way, in plain Spanish. */
  why: string[];
  references: { text: string; url: string }[];
  sessions: ProgramSession[];
  weeks: ProgramWeek[];
};

export type PlannedSession = {
  /** Stable identifier stored with the workout, e.g. "w3-b". */
  key: string;
  week: ProgramWeek;
  session: ProgramSession;
  /** The exercises of the session with that week's set count applied. */
  exercises: ProgramExercise[];
};

export function sessionKey(week: number, session: string): string {
  return `w${week}-${session}`;
}

function applyWeek(exercise: ProgramExercise, week: ProgramWeek): ProgramExercise {
  return { ...exercise, sets: Math.max(1, exercise.sets + week.setsDelta) };
}

/** Every session of the programme, week by week, in the order they are meant to be done. */
export function programPlan(program: Program): PlannedSession[] {
  return program.weeks.flatMap((week) =>
    program.sessions.map((session) => ({
      key: sessionKey(week.number, session.key),
      week,
      session,
      exercises: session.exercises.map((exercise) => applyWeek(exercise, week)),
    })),
  );
}

export function totalSessions(program: Program): number {
  return program.weeks.length * program.sessions.length;
}

/**
 * The session to do next: the first one of the plan that is not done yet. Because progress is
 * counted in sessions and not in dates, missing a day does not lose the week; it just moves
 * everything one session down.
 */
export function nextPlannedSession(
  program: Program,
  doneKeys: readonly string[],
): PlannedSession | null {
  const done = new Set(doneKeys);
  return programPlan(program).find((planned) => !done.has(planned.key)) ?? null;
}

export type ProgramProgress = {
  done: number;
  total: number;
  /** Week the next session belongs to; the last week once the programme is finished. */
  week: number;
  /** Sessions done in that week and how many it has. */
  weekDone: number;
  weekTotal: number;
  finished: boolean;
};

export function programProgress(program: Program, doneKeys: readonly string[]): ProgramProgress {
  const plan = programPlan(program);
  const done = new Set(plan.filter((planned) => doneKeys.includes(planned.key)).map((p) => p.key));
  const next = plan.find((planned) => !done.has(planned.key)) ?? null;
  const week = next?.week.number ?? program.weeks.at(-1)?.number ?? 1;
  const weekKeys = plan.filter((planned) => planned.week.number === week);

  return {
    done: done.size,
    total: plan.length,
    week,
    weekDone: weekKeys.filter((planned) => done.has(planned.key)).length,
    weekTotal: weekKeys.length,
    finished: next === null,
  };
}

// Weight suggestion (double progression) ---------------------------------------------------------

/** Smallest jump that makes sense for the equipment of an exercise. */
export function weightStepKg(equipment: readonly string[]): number {
  if (equipment.includes('barbell')) return 2.5;
  if (equipment.includes('machine') || equipment.includes('cable')) return 2.5;
  if (equipment.includes('dumbbell')) return 2;
  return 0;
}

export type WeightSuggestion = {
  weightKg: number;
  reps: number;
  /** `up` when it is time to add weight, `reps` while climbing the range, `start` with no history. */
  kind: 'up' | 'reps' | 'start' | 'hold';
};

/**
 * Double progression: stay at the same weight until every working set reaches the top of the rep
 * range, then add the smallest jump and go back to the bottom of the range.
 */
export function suggestNextSet(
  previous: PreviousPerformance | undefined,
  target: { repMin: number; repMax: number; sets: number },
  equipment: readonly string[],
): WeightSuggestion {
  const working = previous?.sets.filter((set) => set.type !== 'warmup') ?? [];
  if (working.length === 0) return { weightKg: 0, reps: target.repMax, kind: 'start' };

  const weight = Math.max(...working.map((set) => set.weightKg));
  const atWeight = working.filter((set) => set.weightKg >= weight);
  const allAtTop =
    atWeight.length >= Math.min(target.sets, working.length) &&
    atWeight.every((set) => set.reps >= target.repMax);

  if (allAtTop) {
    const step = weightStepKg(equipment);
    if (step === 0) {
      // Bodyweight: there is no weight to add, so the reps keep climbing.
      return { weightKg: weight, reps: target.repMax + 1, kind: 'reps' };
    }
    return { weightKg: Math.round((weight + step) * 100) / 100, reps: target.repMin, kind: 'up' };
  }

  const lowest = Math.min(...atWeight.map((set) => set.reps));
  return {
    weightKg: weight,
    reps: Math.min(Math.max(lowest + 1, target.repMin), target.repMax),
    kind: lowest < target.repMax ? 'reps' : 'hold',
  };
}

/** The session ready to be logged: sets planned with the suggested weight and reps. */
export function plannedSessionToTemplate(
  planned: PlannedSession,
  previous: Record<string, PreviousPerformance | undefined>,
  equipmentOf: (slug: string) => readonly string[],
): WorkoutTemplate {
  return {
    name: planned.session.name,
    exercises: planned.exercises.map((exercise) => {
      const suggestion = suggestNextSet(
        previous[exercise.slug],
        exercise,
        equipmentOf(exercise.slug),
      );
      return {
        slug: exercise.slug,
        sets: Array.from({ length: exercise.sets }, () => ({
          type: 'normal' as const,
          weightKg: suggestion.weightKg,
          reps: suggestion.reps,
          rir: null,
        })),
      };
    }),
  };
}

// Recommendation ---------------------------------------------------------------------------------

export type ProgramAnswers = {
  goal: ProgramGoal | null;
  level: 'beginner' | 'intermediate' | 'advanced' | null;
  daysPerWeek: number | null;
  equipment: readonly string[];
  /** Minutes available per session, as chosen in the questionnaire. */
  minutes: number | null;
};

export type ProgramMatch = {
  program: Program;
  score: number;
  /** Why it fits (or does not), ready to show under the name. */
  reasons: string[];
  /** True when the user does not have the equipment the programme needs. */
  missingEquipment: boolean;
};

const GYM_ONLY: UserEquipment[] = ['gym'];

function hasEquipment(program: Program, equipment: readonly string[]): boolean {
  if (equipment.includes('gym')) return true;
  return program.equipment.some((needed) => equipment.includes(needed));
}

/**
 * Scores the catalogue against the questionnaire. The order is what the app shows; the first one
 * is the recommendation.
 */
export function recommendPrograms(
  programs: readonly Program[],
  answers: ProgramAnswers,
): ProgramMatch[] {
  return [...programs]
    .map((program) => {
      const reasons: string[] = [];
      let score = 0;

      const missingEquipment = !hasEquipment(program, answers.equipment);
      if (missingEquipment) score -= 100;
      else if (program.equipment.every((item) => GYM_ONLY.includes(item))) reasons.push('gym');
      else reasons.push('equipment');

      // Where you train wins ties: with a gym, a gym programme; at home, a home one.
      const atGym = answers.equipment.includes('gym');
      if (!missingEquipment && program.place !== 'both') {
        score += (atGym ? program.place === 'gym' : program.place === 'home') ? 10 : 0;
      }

      if (answers.daysPerWeek !== null) {
        const diff = Math.abs(program.daysPerWeek - answers.daysPerWeek);
        score += Math.max(0, 30 - diff * 15);
        if (diff === 0) reasons.push('days');
        // Never recommend something that asks for more days than the user has.
        if (program.daysPerWeek > answers.daysPerWeek) score -= 25;
      }

      if (answers.level !== null) {
        const fits =
          program.level === 'any' ||
          program.level === answers.level ||
          (answers.level === 'advanced' && program.level === 'intermediate');
        score += fits ? 25 : -20;
        // An exact level beats a programme that simply works for everyone.
        if (program.level === answers.level) score += 8;
        if (fits) reasons.push('level');
      }

      if (answers.goal !== null) {
        const fits = program.goals.includes(answers.goal);
        score += fits ? 20 : 0;
        if (fits) reasons.push('goal');
      }

      if (answers.minutes !== null) {
        const over = program.minutesPerSession - answers.minutes;
        score += over <= 0 ? 15 : Math.max(-20, -over / 2);
        if (over <= 0) reasons.push('minutes');
      }

      return { program, score, reasons, missingEquipment };
    })
    .sort((a, b) => b.score - a.score || a.program.name.localeCompare(b.program.name, 'es'));
}
