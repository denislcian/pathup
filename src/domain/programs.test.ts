import { getExercise } from '@/data/exercises';
import { getProgram, PROGRAMS } from '@/data/programs';
import {
  nextPlannedSession,
  plannedSessionToTemplate,
  programPlan,
  programProgress,
  recommendPrograms,
  sessionKey,
  suggestNextSet,
  totalSessions,
  weightStepKg,
  type Program,
} from '@/domain/programs';
import type { PreviousPerformance } from '@/domain/workout';

const beginner = getProgram('primeros-pasos')!;

function previous(sets: { weightKg: number; reps: number }[]): PreviousPerformance {
  return {
    slug: 'press-banca-barra',
    date: '2026-09-14',
    sets: sets.map((set) => ({ ...set, type: 'normal' as const })),
  };
}

describe('programme catalogue', () => {
  it('has four programmes with unique slugs', () => {
    expect(PROGRAMS).toHaveLength(4);
    expect(new Set(PROGRAMS.map((program) => program.slug)).size).toBe(4);
  });

  it.each(PROGRAMS.map((program) => [program.slug, program] as const))(
    '%s only uses exercises that exist and sensible rep ranges',
    (_slug, program: Program) => {
      expect(program.sessions.length).toBe(program.daysPerWeek);
      expect(program.weeks.length).toBeGreaterThanOrEqual(6);
      expect(program.why.length).toBeGreaterThanOrEqual(3);
      expect(program.references.length).toBeGreaterThanOrEqual(1);
      program.sessions.forEach((session) => {
        expect(session.exercises.length).toBeGreaterThanOrEqual(4);
        session.exercises.forEach((exercise) => {
          expect(getExercise(exercise.slug)).toBeDefined();
          expect(exercise.sets).toBeGreaterThanOrEqual(1);
          expect(exercise.repMin).toBeLessThanOrEqual(exercise.repMax);
        });
      });
    },
  );

  it('only asks for equipment the home programmes can have', () => {
    const home = getProgram('en-casa-mancuernas')!;
    const allowed = ['dumbbell', 'bodyweight', 'bench'];
    home.sessions
      .flatMap((session) => session.exercises)
      .forEach((exercise) => {
        getExercise(exercise.slug)!.equipment.forEach((item) => expect(allowed).toContain(item));
      });
  });
});

describe('programPlan', () => {
  it('lays out every session of every week in order', () => {
    const plan = programPlan(beginner);

    expect(plan).toHaveLength(totalSessions(beginner));
    expect(plan[0].key).toBe(sessionKey(1, 'a'));
    expect(plan.at(-1)!.key).toBe(sessionKey(8, 'c'));
  });

  it('applies the sets the week adds or removes', () => {
    const plan = programPlan(beginner);
    const base = beginner.sessions[0].exercises[0].sets;

    // Week 4 adds a set, the deload week takes one away.
    expect(plan.find((item) => item.key === sessionKey(4, 'a'))!.exercises[0].sets).toBe(base + 1);
    expect(plan.find((item) => item.key === sessionKey(6, 'a'))!.exercises[0].sets).toBe(base - 1);
  });
});

describe('nextPlannedSession', () => {
  it('starts at the first session', () => {
    expect(nextPlannedSession(beginner, [])!.key).toBe(sessionKey(1, 'a'));
  });

  it('moves the plan down instead of losing the week when you miss a day', () => {
    // Two sessions done out of three: the week does not roll over yet.
    const done = [sessionKey(1, 'a'), sessionKey(1, 'b')];
    expect(nextPlannedSession(beginner, done)!.key).toBe(sessionKey(1, 'c'));

    const progress = programProgress(beginner, done);
    expect(progress).toMatchObject({
      done: 2,
      week: 1,
      weekDone: 2,
      weekTotal: 3,
      finished: false,
    });
  });

  it('skips a session that was already done out of order', () => {
    expect(nextPlannedSession(beginner, [sessionKey(1, 'a'), sessionKey(1, 'c')])!.key).toBe(
      sessionKey(1, 'b'),
    );
  });

  it('is finished when every session is done', () => {
    const all = programPlan(beginner).map((planned) => planned.key);
    expect(nextPlannedSession(beginner, all)).toBeNull();
    expect(programProgress(beginner, all)).toMatchObject({ finished: true, week: 8 });
  });
});

describe('suggestNextSet', () => {
  const target = { repMin: 6, repMax: 10, sets: 3 };

  it('suggests the top of the range with no history', () => {
    expect(suggestNextSet(undefined, target, ['barbell'])).toEqual({
      weightKg: 0,
      reps: 10,
      kind: 'start',
    });
  });

  it('asks for one more rep while you climb the range', () => {
    const last = previous([
      { weightKg: 80, reps: 8 },
      { weightKg: 80, reps: 7 },
      { weightKg: 80, reps: 7 },
    ]);
    expect(suggestNextSet(last, target, ['barbell'])).toEqual({
      weightKg: 80,
      reps: 8,
      kind: 'reps',
    });
  });

  it('adds the smallest jump when every set hit the top, and drops back to the bottom', () => {
    const last = previous([
      { weightKg: 80, reps: 10 },
      { weightKg: 80, reps: 10 },
      { weightKg: 80, reps: 11 },
    ]);
    expect(suggestNextSet(last, target, ['barbell'])).toEqual({
      weightKg: 82.5,
      reps: 6,
      kind: 'up',
    });
    // Dumbbells go up in smaller jumps.
    expect(suggestNextSet(last, target, ['dumbbell']).weightKg).toBe(82);
  });

  it('keeps climbing in reps when there is no weight to add', () => {
    const last = previous([
      { weightKg: 0, reps: 10 },
      { weightKg: 0, reps: 10 },
      { weightKg: 0, reps: 10 },
    ]);
    expect(suggestNextSet(last, target, ['bodyweight'])).toEqual({
      weightKg: 0,
      reps: 11,
      kind: 'reps',
    });
  });

  it('ignores warm-ups and reads the heaviest weight of the session', () => {
    const last: PreviousPerformance = {
      slug: 'press-banca-barra',
      date: '2026-09-14',
      sets: [
        { weightKg: 200, reps: 10, type: 'warmup' },
        { weightKg: 80, reps: 10, type: 'normal' },
        { weightKg: 80, reps: 10, type: 'normal' },
        { weightKg: 80, reps: 10, type: 'normal' },
      ],
    };
    expect(suggestNextSet(last, target, ['barbell']).weightKg).toBe(82.5);
  });
});

describe('weightStepKg', () => {
  it('uses the jump each piece of equipment allows', () => {
    expect(weightStepKg(['barbell'])).toBe(2.5);
    expect(weightStepKg(['dumbbell'])).toBe(2);
    expect(weightStepKg(['bodyweight'])).toBe(0);
  });
});

describe('plannedSessionToTemplate', () => {
  it('plans every set with the suggestion for that exercise', () => {
    const planned = nextPlannedSession(beginner, [])!;
    const template = plannedSessionToTemplate(
      planned,
      { 'press-banca-barra': previous([{ weightKg: 60, reps: 10 }]) },
      (slug) => getExercise(slug)?.equipment ?? [],
    );

    expect(template.name).toBe(planned.session.name);
    const bench = template.exercises.find((item) => item.slug === 'press-banca-barra')!;
    expect(bench.sets).toHaveLength(3);
    // 60 kg x 10 hits the top of 6-10 in the only set logged, so the weight goes up.
    expect(bench.sets[0]).toMatchObject({ weightKg: 62.5, reps: 6 });
  });
});

describe('recommendPrograms', () => {
  it('recommends the beginner full body for someone new with three days in a gym', () => {
    const [best] = recommendPrograms(PROGRAMS, {
      goal: 'muscle',
      level: 'beginner',
      daysPerWeek: 3,
      equipment: ['gym'],
      minutes: 60,
    });
    expect(best.program.slug).toBe('primeros-pasos');
    expect(best.reasons).toEqual(expect.arrayContaining(['days', 'level', 'goal']));
  });

  it('recommends torso/pierna to an intermediate with four days', () => {
    const [best] = recommendPrograms(PROGRAMS, {
      goal: 'muscle',
      level: 'intermediate',
      daysPerWeek: 4,
      equipment: ['gym'],
      minutes: 75,
    });
    expect(best.program.slug).toBe('torso-pierna');
  });

  it('sends someone training at home with dumbbells to the home programme', () => {
    const [best] = recommendPrograms(PROGRAMS, {
      goal: 'muscle',
      level: 'beginner',
      daysPerWeek: 3,
      equipment: ['dumbbells'],
      minutes: 45,
    });
    expect(best.program.slug).toBe('en-casa-mancuernas');
  });

  it('marks the programmes whose equipment you do not have', () => {
    const matches = recommendPrograms(PROGRAMS, {
      goal: 'health',
      level: 'beginner',
      daysPerWeek: 2,
      equipment: ['bodyweight'],
      minutes: 40,
    });
    expect(matches[0].program.slug).toBe('empezar-suave');
    expect(matches.find((match) => match.program.slug === 'torso-pierna')!.missingEquipment).toBe(
      true,
    );
  });
});
