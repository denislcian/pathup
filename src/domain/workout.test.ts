import {
  bestSet,
  countCompletedSets,
  formatDuration,
  isSetLoggable,
  isWorkoutEmpty,
  nextRestPreset,
  nextSetTemplate,
  sanitizeWorkout,
  setLabel,
  toPreviousPerformance,
  workoutDurationSeconds,
  workoutVolumeKg,
  type LoggedSet,
  type Workout,
} from '@/domain/workout';

function set(overrides: Partial<LoggedSet> = {}): LoggedSet {
  return {
    id: Math.random().toString(36).slice(2),
    type: 'normal',
    weightKg: 80,
    reps: 8,
    rir: 2,
    completedAt: '2026-09-20T18:00:00.000Z',
    ...overrides,
  };
}

function workout(overrides: Partial<Workout> = {}): Workout {
  return {
    id: 'w1',
    name: 'Torso',
    startedAt: '2026-09-20T17:00:00.000Z',
    endedAt: '2026-09-20T18:05:30.000Z',
    exercises: [
      { id: 'e1', slug: 'press-banca-barra', sets: [set(), set({ weightKg: 82.5 })] },
      { id: 'e2', slug: 'remo-barra', sets: [set({ weightKg: 60, reps: 10 })] },
    ],
    ...overrides,
  };
}

describe('workout totals', () => {
  it('counts only the sets that were ticked off', () => {
    const session = workout({
      exercises: [{ id: 'e1', slug: 'flexiones', sets: [set(), set({ completedAt: null })] }],
    });
    expect(countCompletedSets(session)).toBe(1);
  });

  it('adds up the kilos moved, ignoring warm-ups', () => {
    const session = workout({
      exercises: [
        {
          id: 'e1',
          slug: 'press-banca-barra',
          sets: [set({ type: 'warmup', weightKg: 40, reps: 10 }), set({ weightKg: 80, reps: 8 })],
        },
      ],
    });
    expect(workoutVolumeKg(session)).toBe(640);
  });

  it('measures how long the session lasted', () => {
    expect(workoutDurationSeconds(workout())).toBe(3930);
  });

  it('keeps counting while the workout is still open', () => {
    const open = workout({ endedAt: null, startedAt: '2026-09-20T17:00:00.000Z' });
    expect(workoutDurationSeconds(open, new Date('2026-09-20T17:12:00.000Z'))).toBe(720);
  });

  it('never reports a negative duration', () => {
    const open = workout({ endedAt: null });
    expect(workoutDurationSeconds(open, new Date('2026-09-20T16:00:00.000Z'))).toBe(0);
  });
});

describe('formatDuration', () => {
  it.each([
    [0, '0:00'],
    [59, '0:59'],
    [754, '12:34'],
    [3930, '1:05:30'],
  ])('%p seconds -> %p', (seconds, expected) => {
    expect(formatDuration(seconds)).toBe(expected);
  });
});

describe('bestSet', () => {
  it('picks the set with the best estimated one-rep max', () => {
    // 100 x 3 estimates 110 kg; 90 x 8 estimates 114 kg, so the lighter set wins.
    const heavy = set({ weightKg: 100, reps: 3 });
    const volume = set({ weightKg: 90, reps: 8 });
    expect(bestSet([heavy, volume])).toBe(volume);
    expect(bestSet([heavy, set({ weightKg: 70, reps: 8 })])).toBe(heavy);
  });

  it('ignores warm-ups and sets that were never completed', () => {
    const warmup = set({ type: 'warmup', weightKg: 200, reps: 5 });
    const planned = set({ weightKg: 300, reps: 5, completedAt: null });
    const done = set({ weightKg: 60, reps: 5 });
    expect(bestSet([warmup, planned, done])).toBe(done);
  });

  it('returns null when nothing was logged', () => {
    expect(bestSet([set({ completedAt: null })])).toBeNull();
  });
});

describe('isWorkoutEmpty', () => {
  it('is empty until a set is ticked off', () => {
    expect(isWorkoutEmpty(workout({ exercises: [] }))).toBe(true);
    expect(isWorkoutEmpty(workout())).toBe(false);
  });
});

describe('toPreviousPerformance', () => {
  it('keeps one entry per exercise with its completed sets', () => {
    expect(toPreviousPerformance(workout())).toEqual([
      {
        slug: 'press-banca-barra',
        date: '2026-09-20T18:05:30.000Z',
        sets: [
          { weightKg: 80, reps: 8, type: 'normal' },
          { weightKg: 82.5, reps: 8, type: 'normal' },
        ],
      },
      {
        slug: 'remo-barra',
        date: '2026-09-20T18:05:30.000Z',
        sets: [{ weightKg: 60, reps: 10, type: 'normal' }],
      },
    ]);
  });

  it('skips exercises where nothing was logged', () => {
    const session = workout({
      exercises: [{ id: 'e1', slug: 'flexiones', sets: [set({ completedAt: null })] }],
    });
    expect(toPreviousPerformance(session)).toEqual([]);
  });
});

describe('nextSetTemplate', () => {
  it('repeats the last set', () => {
    expect(nextSetTemplate([set({ weightKg: 82.5, reps: 6, rir: 1 })])).toEqual({
      weightKg: 82.5,
      reps: 6,
      rir: 1,
      type: 'normal',
    });
  });

  it('starts empty for a new exercise', () => {
    expect(nextSetTemplate([])).toEqual({ weightKg: 0, reps: 0, rir: null, type: 'normal' });
  });
});

describe('isSetLoggable', () => {
  it.each([
    [{ weightKg: 0, reps: 12 }, true],
    [{ weightKg: 82.5, reps: 8 }, true],
    [{ weightKg: 82.5, reps: 0 }, false],
    [{ weightKg: -5, reps: 8 }, false],
    [{ weightKg: 1000, reps: 8 }, false],
    [{ weightKg: 80, reps: 2.5 }, false],
    [{ weightKg: Number.NaN, reps: 8 }, false],
  ])('%p -> %p', (candidate, expected) => {
    expect(isSetLoggable(candidate)).toBe(expected);
  });
});

describe('setLabel', () => {
  it('numbers normal sets among themselves and marks the special ones with a letter', () => {
    const sets = [
      set({ type: 'warmup' }),
      set({ type: 'warmup' }),
      set(),
      set(),
      set({ type: 'failure' }),
      set({ type: 'drop' }),
    ];
    expect(sets.map((_, index) => setLabel(sets, index))).toEqual(['C', 'C', '1', '2', 'F', 'D']);
  });
});

describe('nextRestPreset', () => {
  it('cycles through the presets and wraps around', () => {
    expect(nextRestPreset(60)).toBe(90);
    expect(nextRestPreset(120)).toBe(150);
    expect(nextRestPreset(240)).toBe(60);
    // A custom value moves on to the next preset above it.
    expect(nextRestPreset(100)).toBe(120);
  });
});

describe('sanitizeWorkout', () => {
  it('keeps only ticked sets the database accepts, so a bad row cannot block the queue', () => {
    const session = workout({
      name: '   ',
      exercises: [
        {
          id: 'e1',
          slug: 'press-banca-barra',
          sets: [
            set({ weightKg: 82.456, rir: 7.4 }),
            set({ reps: 0 }),
            set({ completedAt: null }),
            set({ weightKg: 1200 }),
          ],
        },
        { id: 'e2', slug: 'remo-barra', sets: [set({ reps: 0 })] },
      ],
    });

    const clean = sanitizeWorkout(session);

    expect(clean.name).toBe('Entreno');
    expect(clean.exercises).toHaveLength(1);
    expect(clean.exercises[0].sets).toEqual([
      expect.objectContaining({ weightKg: 82.46, reps: 8, rir: 7 }),
    ]);
  });

  it('leaves a valid workout as it was', () => {
    const session = workout();
    expect(sanitizeWorkout(session)).toEqual(session);
  });
});
