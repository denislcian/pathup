import {
  computeRecords,
  detectRecords,
  exerciseHistory,
  localDayKey,
  monthGrid,
  sortNewestFirst,
  startOfWeek,
  thisWeek,
  trainingDays,
  weeklyStreak,
} from '@/domain/progress';
import type { LoggedSet, Workout } from '@/domain/workout';

/** ISO string for a local date and hour, so the tests read the same in any time zone. */
function at(month: number, day: number, hour = 18): string {
  return new Date(2026, month - 1, day, hour).toISOString();
}

let nextId = 0;

function set(weightKg: number, reps: number, overrides: Partial<LoggedSet> = {}): LoggedSet {
  nextId += 1;
  return {
    id: `s${nextId}`,
    type: 'normal',
    weightKg,
    reps,
    rir: null,
    completedAt: '2026-09-01T18:00:00.000Z',
    ...overrides,
  };
}

function session(id: string, startedAt: string, exercises: Record<string, LoggedSet[]>): Workout {
  const end = new Date(new Date(startedAt).getTime() + 60 * 60 * 1000).toISOString();
  return {
    id,
    name: 'Torso',
    startedAt,
    endedAt: end,
    exercises: Object.entries(exercises).map(([slug, sets], index) => ({
      id: `${id}-e${index}`,
      slug,
      sets,
    })),
  };
}

describe('exerciseHistory', () => {
  it('summarises every session of an exercise, oldest first, ignoring warm-ups', () => {
    const workouts = [
      session('w2', at(9, 10), {
        'press-banca-barra': [set(40, 10, { type: 'warmup' }), set(85, 6), set(80, 8)],
      }),
      session('w1', at(9, 3), { 'press-banca-barra': [set(80, 8)], 'remo-barra': [set(60, 10)] }),
      session('w0', at(9, 1), { 'remo-barra': [set(60, 10)] }),
    ];

    const history = exerciseHistory(workouts, 'press-banca-barra');

    expect(history.map((item) => item.workoutId)).toEqual(['w1', 'w2']);
    expect(history[1]).toMatchObject({
      topWeightKg: 85,
      maxReps: 8,
      volumeKg: 85 * 6 + 80 * 8,
      // 85 x 6 = 102 kg, 80 x 8 = 101.3 kg: the heavier set wins.
      bestE1rm: 102,
    });
  });

  it('has no 1RM estimate when every set is above 12 reps', () => {
    const [only] = exerciseHistory(
      [session('w1', at(9, 1), { flexiones: [set(0, 20)] })],
      'flexiones',
    );
    expect(only.bestE1rm).toBeNull();
    expect(only.maxReps).toBe(20);
  });
});

describe('records', () => {
  const first = session('w1', at(9, 1), { 'press-banca-barra': [set(80, 8), set(80, 7)] });
  const second = session('w2', at(9, 8), { 'press-banca-barra': [set(85, 5)] });

  it('keeps the best mark of each kind with the set that made it', () => {
    const book = computeRecords([second, first]);

    expect(book['press-banca-barra']).toEqual({
      weight: expect.objectContaining({ value: 85, weightKg: 85, reps: 5, workoutId: 'w2' }),
      e1rm: expect.objectContaining({ value: 101.3, weightKg: 80, reps: 8, workoutId: 'w1' }),
      setVolume: expect.objectContaining({ value: 640, workoutId: 'w1' }),
    });
  });

  it('bodyweight exercises compete on reps', () => {
    const book = computeRecords([session('w1', at(9, 1), { flexiones: [set(0, 15), set(0, 18)] })]);
    expect(book.flexiones).toEqual({ reps: expect.objectContaining({ value: 18 }) });
  });

  it('flags only the marks a workout beats', () => {
    expect(detectRecords([first], second)).toEqual([
      { slug: 'press-banca-barra', kind: 'weight', value: 85, previous: 80, weightKg: 85, reps: 5 },
    ]);
  });

  it('does not call the first session of an exercise a record', () => {
    expect(detectRecords([], first)).toEqual([]);
  });

  it('only compares with older workouts, even if newer ones are already in the history', () => {
    const later = session('w3', at(9, 15), { 'press-banca-barra': [set(100, 5)] });
    expect(detectRecords([first, second, later], second)).toHaveLength(1);
  });
});

describe('calendar', () => {
  it('uses the local day, not the UTC one', () => {
    expect(localDayKey(new Date(2026, 8, 21, 0, 30))).toBe('2026-09-21');
  });

  it('lists the days you trained', () => {
    const days = trainingDays([session('w1', at(9, 1), {}), session('w2', at(9, 3, 7), {})]);
    expect([...days]).toEqual(['2026-09-01', '2026-09-03']);
  });

  it('starts weeks on Monday', () => {
    // Sunday 20 September 2026 belongs to the week that started on Monday the 14th.
    expect(localDayKey(startOfWeek(new Date(2026, 8, 20, 22)))).toBe('2026-09-14');
    expect(localDayKey(startOfWeek(new Date(2026, 8, 21, 9)))).toBe('2026-09-21');
  });

  it('draws September 2026 with Tuesday the 1st in the second column', () => {
    const weeks = monthGrid(2026, 8);
    expect(weeks).toHaveLength(5);
    expect(weeks[0][0]).toBeNull();
    expect(weeks[0][1]?.getDate()).toBe(1);
    expect(weeks[4][2]?.getDate()).toBe(30);
    expect(weeks[4][3]).toBeNull();
  });
});

describe('weeklyStreak', () => {
  const now = new Date(2026, 8, 22, 12); // Tuesday

  it('counts consecutive weeks with at least one workout', () => {
    const workouts = [
      session('a', at(9, 21), {}),
      session('b', at(9, 16), {}),
      session('c', at(9, 9), {}),
      // A gap in the week of 31 August breaks it.
      session('d', at(8, 25), {}),
    ];
    expect(weeklyStreak(workouts, now)).toBe(3);
  });

  it('does not break on Tuesday just because this week has no workout yet', () => {
    expect(weeklyStreak([session('b', at(9, 16), {}), session('c', at(9, 9), {})], now)).toBe(2);
  });

  it('is zero when last week was missed too', () => {
    expect(weeklyStreak([session('c', at(9, 9), {})], now)).toBe(0);
  });
});

describe('thisWeek', () => {
  it('adds up the current week only', () => {
    const workouts = [
      session('a', at(9, 21), { 'press-banca-barra': [set(80, 8)] }),
      session('b', at(9, 22, 8), { 'remo-barra': [set(60, 10)] }),
      session('c', at(9, 20), { 'remo-barra': [set(60, 10)] }),
    ];
    expect(thisWeek(workouts, new Date(2026, 8, 23))).toEqual({
      workouts: 2,
      volumeKg: 1240,
      seconds: 7200,
    });
  });
});

describe('sortNewestFirst', () => {
  it('orders by start time without touching the input', () => {
    const input = [session('old', at(9, 1), {}), session('new', at(9, 2), {})];
    expect(sortNewestFirst(input).map((item) => item.id)).toEqual(['new', 'old']);
    expect(input[0].id).toBe('old');
  });
});
