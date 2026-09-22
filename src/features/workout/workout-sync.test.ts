import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Workout } from '@/domain/workout';
import { enqueueWorkout, readOutbox } from '@/features/workout/workout-storage';
import { flushOutbox, uploadWorkout } from '@/features/workout/workout-sync';

const mockUpsert = jest.fn();

jest.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: true,
  requireSupabase: () => ({
    from: (table: string) => ({ upsert: (rows: unknown) => mockUpsert(table, rows) }),
  }),
}));

function buildWorkout(id: string): Workout {
  return {
    id,
    name: 'Torso',
    startedAt: '2026-09-20T17:00:00.000Z',
    endedAt: '2026-09-20T18:00:00.000Z',
    exercises: [
      {
        id: `${id}-e1`,
        slug: 'press-banca-barra',
        sets: [
          {
            id: `${id}-s1`,
            type: 'normal',
            weightKg: 82.5,
            reps: 8,
            rir: 2,
            completedAt: '2026-09-20T17:20:00.000Z',
          },
        ],
      },
    ],
  };
}

beforeEach(async () => {
  mockUpsert.mockReset();
  mockUpsert.mockResolvedValue({ error: null });
  await AsyncStorage.clear();
});

describe('uploadWorkout', () => {
  it('sends the session, its exercises and its sets with device ids', async () => {
    await uploadWorkout('user-1', buildWorkout('w1'));

    expect(mockUpsert).toHaveBeenCalledTimes(3);
    expect(mockUpsert).toHaveBeenNthCalledWith(1, 'workouts', {
      id: 'w1',
      user_id: 'user-1',
      name: 'Torso',
      started_at: '2026-09-20T17:00:00.000Z',
      ended_at: '2026-09-20T18:00:00.000Z',
      program_slug: null,
      program_session: null,
    });
    expect(mockUpsert).toHaveBeenNthCalledWith(2, 'workout_exercises', [
      {
        id: 'w1-e1',
        workout_id: 'w1',
        user_id: 'user-1',
        exercise_slug: 'press-banca-barra',
        position: 0,
      },
    ]);
    expect(mockUpsert).toHaveBeenNthCalledWith(3, 'workout_sets', [
      {
        id: 'w1-s1',
        workout_exercise_id: 'w1-e1',
        user_id: 'user-1',
        position: 0,
        set_type: 'normal',
        weight_kg: 82.5,
        reps: 8,
        rir: 2,
        completed_at: '2026-09-20T17:20:00.000Z',
      },
    ]);
  });

  it('fails when the server rejects a row', async () => {
    mockUpsert.mockResolvedValueOnce({ error: { message: 'nope' } });

    await expect(uploadWorkout('user-1', buildWorkout('w1'))).rejects.toEqual({ message: 'nope' });
  });
});

describe('flushOutbox', () => {
  it('uploads everything queued and empties the queue', async () => {
    await enqueueWorkout(buildWorkout('w1'));
    await enqueueWorkout(buildWorkout('w2'));

    await expect(flushOutbox('user-1')).resolves.toEqual({ uploaded: 2, pending: 0 });
    await expect(readOutbox()).resolves.toEqual([]);
  });

  it('keeps the workout queued when the upload fails', async () => {
    await enqueueWorkout(buildWorkout('w1'));
    mockUpsert.mockRejectedValueOnce(new Error('offline'));

    await expect(flushOutbox('user-1')).resolves.toEqual({ uploaded: 0, pending: 1 });
    await expect(readOutbox()).resolves.toHaveLength(1);
  });

  it('stops at the first failure so the order is kept', async () => {
    await enqueueWorkout(buildWorkout('w1'));
    await enqueueWorkout(buildWorkout('w2'));
    mockUpsert
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: null })
      .mockRejectedValueOnce(new Error('offline'));

    await expect(flushOutbox('user-1')).resolves.toEqual({ uploaded: 1, pending: 1 });
    const outbox = await readOutbox();
    expect(outbox.map((workout) => workout.id)).toEqual(['w2']);
  });

  it('queueing the same workout twice leaves one copy', async () => {
    await enqueueWorkout(buildWorkout('w1'));
    await enqueueWorkout(buildWorkout('w1'));

    await expect(readOutbox()).resolves.toHaveLength(1);
  });
});
