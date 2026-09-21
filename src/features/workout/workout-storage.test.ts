import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Workout } from '@/domain/workout';
import {
  clearLocalWorkouts,
  enqueueWorkout,
  mergeWorkouts,
  readKnownWorkouts,
  readOutbox,
  readPreviousPerformance,
  savePreviousPerformance,
  writeHistorySnapshot,
} from '@/features/workout/workout-storage';

function workout(id: string, startedAt: string, name = 'Torso'): Workout {
  return { id, name, startedAt, endedAt: startedAt, exercises: [] };
}

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('previous performance', () => {
  it('never replaces a newer entry with an older one', async () => {
    const sets = [{ weightKg: 85, reps: 6, type: 'normal' as const }];
    await savePreviousPerformance([{ slug: 'press-banca-barra', date: '2026-09-20', sets }]);
    await savePreviousPerformance([
      { slug: 'press-banca-barra', date: '2026-09-10', sets: [{ ...sets[0], weightKg: 80 }] },
    ]);

    const previous = await readPreviousPerformance();
    expect(previous['press-banca-barra'].sets[0].weightKg).toBe(85);
  });
});

describe('known workouts', () => {
  it('adds the queue to the downloaded history, the queued copy winning', async () => {
    await writeHistorySnapshot([
      workout('a', '2026-09-10T18:00:00Z'),
      workout('b', '2026-09-12T18:00:00Z'),
    ]);
    await enqueueWorkout(workout('b', '2026-09-12T18:00:00Z', 'Editado'));
    await enqueueWorkout(workout('c', '2026-09-14T18:00:00Z'));

    const known = await readKnownWorkouts();

    expect(known.map((item) => item.id)).toEqual(['c', 'b', 'a']);
    expect(known[1].name).toBe('Editado');
  });

  it('mergeWorkouts sorts newest first', () => {
    const merged = mergeWorkouts(
      [workout('old', '2026-09-01T10:00:00Z')],
      [workout('new', '2026-09-02T10:00:00Z')],
    );
    expect(merged.map((item) => item.id)).toEqual(['new', 'old']);
  });
});

describe('clearLocalWorkouts', () => {
  it('leaves nothing from the account on the device', async () => {
    await enqueueWorkout(workout('a', '2026-09-10T18:00:00Z'));
    await writeHistorySnapshot([workout('b', '2026-09-12T18:00:00Z')]);
    await savePreviousPerformance([{ slug: 'flexiones', date: '2026-09-12', sets: [] }]);

    await clearLocalWorkouts();

    await expect(readOutbox()).resolves.toEqual([]);
    await expect(readKnownWorkouts()).resolves.toEqual([]);
    await expect(readPreviousPerformance()).resolves.toEqual({});
  });
});
