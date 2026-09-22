import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Workout } from '@/domain/workout';
import { loadHistory, toWorkout } from '@/features/history/history-api';
import {
  enqueueWorkout,
  readHistorySnapshot,
  readPreviousPerformance,
} from '@/features/workout/workout-storage';

const mockLimit = jest.fn();

jest.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: true,
  requireSupabase: () => ({
    from: () => ({
      select: () => ({ order: () => ({ limit: (count: number) => mockLimit(count) }) }),
    }),
  }),
}));

function row(id: string, startedAt: string, weight: number) {
  return {
    id,
    name: 'Torso',
    started_at: startedAt,
    ended_at: startedAt,
    program_slug: null,
    program_session: null,
    workout_exercises: [
      {
        id: `${id}-e2`,
        exercise_slug: 'remo-barra',
        position: 1,
        workout_sets: [
          {
            id: `${id}-s3`,
            position: 0,
            set_type: 'normal',
            weight_kg: 60,
            reps: 10,
            rir: null,
            completed_at: startedAt,
          },
        ],
      },
      {
        id: `${id}-e1`,
        exercise_slug: 'press-banca-barra',
        position: 0,
        workout_sets: [
          {
            id: `${id}-s2`,
            position: 1,
            set_type: 'normal',
            weight_kg: weight,
            reps: 8,
            rir: 2,
            completed_at: startedAt,
          },
          {
            id: `${id}-s1`,
            position: 0,
            set_type: 'warmup',
            weight_kg: 40,
            reps: 10,
            rir: null,
            completed_at: startedAt,
          },
        ],
      },
    ],
  };
}

const queued: Workout = {
  id: 'queued',
  name: 'Pierna',
  startedAt: '2026-09-21T18:00:00.000Z',
  endedAt: '2026-09-21T19:00:00.000Z',
  exercises: [
    {
      id: 'q-e1',
      slug: 'sentadilla-goblet',
      sets: [
        {
          id: 'q-s1',
          type: 'normal',
          weightKg: 24,
          reps: 10,
          rir: null,
          completedAt: '2026-09-21T18:10:00.000Z',
        },
      ],
    },
  ],
};

beforeEach(async () => {
  mockLimit.mockReset();
  await AsyncStorage.clear();
});

describe('toWorkout', () => {
  it('puts exercises and sets back in the order they were logged', () => {
    const workout = toWorkout(row('w1', '2026-09-14T18:00:00.000Z', 80));

    expect(workout.exercises.map((exercise) => exercise.slug)).toEqual([
      'press-banca-barra',
      'remo-barra',
    ]);
    expect(workout.exercises[0].sets.map((set) => set.type)).toEqual(['warmup', 'normal']);
    expect(workout.exercises[0].sets[1]).toMatchObject({ weightKg: 80, reps: 8, rir: 2 });
  });
});

describe('loadHistory', () => {
  it('joins the server history with the workouts still waiting to upload', async () => {
    mockLimit.mockResolvedValue({
      data: [
        row('w2', '2026-09-17T18:00:00.000Z', 82.5),
        row('w1', '2026-09-14T18:00:00.000Z', 80),
      ],
      error: null,
    });
    await enqueueWorkout(queued);

    const history = await loadHistory();

    expect(history.offline).toBe(false);
    expect(history.pendingIds).toEqual(['queued']);
    expect(history.workouts.map((workout) => workout.id)).toEqual(['queued', 'w2', 'w1']);
    // Kept for the gym, where there is no signal.
    await expect(readHistorySnapshot()).resolves.toHaveLength(2);
  });

  it('falls back to the copy on the phone when there is no connection', async () => {
    mockLimit.mockResolvedValueOnce({
      data: [row('w1', '2026-09-14T18:00:00.000Z', 80)],
      error: null,
    });
    await loadHistory();

    mockLimit.mockRejectedValueOnce(new Error('offline'));
    const history = await loadHistory();

    expect(history.offline).toBe(true);
    expect(history.workouts.map((workout) => workout.id)).toEqual(['w1']);
  });

  it('fills in last time’s weights from the history, newest session first', async () => {
    mockLimit.mockResolvedValue({
      data: [
        row('w2', '2026-09-17T18:00:00.000Z', 82.5),
        row('w1', '2026-09-14T18:00:00.000Z', 80),
      ],
      error: null,
    });

    await loadHistory();

    const previous = await readPreviousPerformance();
    expect(previous['press-banca-barra'].sets).toEqual([
      { weightKg: 40, reps: 10, type: 'warmup' },
      { weightKg: 82.5, reps: 8, type: 'normal' },
    ]);
  });
});
