import {
  describePrescription,
  duplicateRoutine,
  folderNames,
  groupByFolder,
  moveExercise,
  moveRoutine,
  routineFromWorkout,
  routineToTemplate,
  validateRoutine,
  type Routine,
} from '@/domain/routines';
import type { Workout } from '@/domain/workout';

let counter = 0;
const createId = () => {
  counter += 1;
  return `id-${counter}`;
};

function routine(id: string, position: number, folder: string | null = null): Routine {
  return {
    id,
    name: id,
    folder,
    position,
    exercises: [{ id: `${id}-e`, slug: 'press-banca-barra', sets: 3, repMin: 6, repMax: 10 }],
  };
}

describe('routineToTemplate', () => {
  it('plans each set with what you did last time', () => {
    const template = routineToTemplate(
      {
        ...routine('torso', 0),
        exercises: [
          { id: 'e1', slug: 'press-banca-barra', sets: 3, repMin: 6, repMax: 10 },
          { id: 'e2', slug: 'remo-barra', sets: 2, repMin: 8, repMax: 12 },
        ],
      },
      {
        'press-banca-barra': {
          slug: 'press-banca-barra',
          date: '2026-09-14',
          sets: [
            { weightKg: 40, reps: 10, type: 'warmup' },
            { weightKg: 80, reps: 8, type: 'normal' },
            { weightKg: 80, reps: 7, type: 'normal' },
          ],
        },
      },
    );

    expect(template.name).toBe('torso');
    // Warm-ups are skipped; a third set repeats the last one you did.
    expect(template.exercises[0].sets.map((set) => [set.weightKg, set.reps])).toEqual([
      [80, 8],
      [80, 7],
      [80, 7],
    ]);
    // Never done: top of the range, weight left for you.
    expect(template.exercises[1].sets).toEqual([
      { type: 'normal', weightKg: 0, reps: 12, rir: null },
      { type: 'normal', weightKg: 0, reps: 12, rir: null },
    ]);
  });
});

describe('routineFromWorkout', () => {
  it('keeps the exercises, the working sets and the reps you moved in', () => {
    const workout: Workout = {
      id: 'w1',
      name: 'Torso',
      startedAt: '2026-09-14T18:00:00Z',
      endedAt: '2026-09-14T19:00:00Z',
      exercises: [
        {
          id: 'e1',
          slug: 'press-banca-barra',
          sets: [
            { id: 's0', type: 'warmup', weightKg: 40, reps: 12, rir: null, completedAt: 'x' },
            { id: 's1', type: 'normal', weightKg: 80, reps: 9, rir: 2, completedAt: 'x' },
            { id: 's2', type: 'normal', weightKg: 80, reps: 7, rir: 1, completedAt: 'x' },
          ],
        },
      ],
    };

    const created = routineFromWorkout(workout, createId, 4);

    expect(created).toMatchObject({ name: 'Torso', folder: null, position: 4 });
    expect(created.exercises).toEqual([
      expect.objectContaining({ slug: 'press-banca-barra', sets: 2, repMin: 7, repMax: 9 }),
    ]);
  });
});

describe('duplicateRoutine', () => {
  it('copies everything with new ids', () => {
    const original = routine('torso', 2);
    const copy = duplicateRoutine(original, createId, '(copia)');

    expect(copy.name).toBe('torso (copia)');
    expect(copy.id).not.toBe(original.id);
    expect(copy.exercises[0].id).not.toBe(original.exercises[0].id);
    expect(copy.exercises[0]).toMatchObject({ slug: 'press-banca-barra', sets: 3 });
  });
});

describe('folders', () => {
  const routines = [
    routine('c', 2, 'Torso / Pierna'),
    routine('a', 0),
    routine('d', 3, 'Empuje'),
    routine('b', 1, 'Torso / Pierna'),
  ];

  it('lists loose routines first, then folders alphabetically', () => {
    expect(
      groupByFolder(routines).map((group) => [group.folder, group.routines.map((r) => r.id)]),
    ).toEqual([
      [null, ['a']],
      ['Empuje', ['d']],
      ['Torso / Pierna', ['b', 'c']],
    ]);
  });

  it('names each folder once', () => {
    expect(folderNames(routines)).toEqual(['Empuje', 'Torso / Pierna']);
  });
});

describe('moveRoutine', () => {
  const routines = [routine('a', 0, 'F'), routine('x', 1), routine('b', 2, 'F')];

  it('swaps with the neighbour in the same folder and returns what changed', () => {
    const changed = moveRoutine(routines, 'b', -1);
    expect(changed.map((item) => [item.id, item.position])).toEqual([
      ['b', 0],
      ['a', 2],
    ]);
  });

  it('does nothing at the edge of the folder', () => {
    expect(moveRoutine(routines, 'a', -1)).toEqual([]);
    expect(moveRoutine(routines, 'x', 1)).toEqual([]);
  });
});

describe('moveExercise', () => {
  it('moves an exercise and ignores moves past the ends', () => {
    const exercises = routine('a', 0).exercises.concat({
      id: 'e2',
      slug: 'remo-barra',
      sets: 3,
      repMin: 8,
      repMax: 12,
    });
    expect(moveExercise(exercises, 1, -1).map((item) => item.slug)).toEqual([
      'remo-barra',
      'press-banca-barra',
    ]);
    expect(moveExercise(exercises, 0, -1)).toEqual(exercises);
  });
});

describe('validateRoutine', () => {
  it('needs a name, at least one exercise and a sensible rep range', () => {
    expect(validateRoutine({ name: ' ', exercises: [] })).toEqual(['nameRequired', 'noExercises']);
    expect(
      validateRoutine({
        name: 'Torso',
        exercises: [{ id: 'e', slug: 'flexiones', sets: 3, repMin: 12, repMax: 8 }],
      }),
    ).toEqual(['repRange']);
    expect(validateRoutine(routine('ok', 0))).toEqual([]);
  });
});

describe('describePrescription', () => {
  it('reads like a gym sheet', () => {
    expect(describePrescription({ sets: 3, repMin: 8, repMax: 12 })).toBe('3 × 8-12');
    expect(describePrescription({ sets: 5, repMin: 5, repMax: 5 })).toBe('5 × 5');
  });
});
