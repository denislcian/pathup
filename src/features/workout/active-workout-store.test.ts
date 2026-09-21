import { DEFAULT_REST_SECONDS } from '@/domain/workout';
import { useActiveWorkout } from '@/features/workout/active-workout-store';

const store = () => useActiveWorkout.getState();

function startWithOneSet() {
  store().start('Torso');
  store().addExercise('press-banca-barra');
  const exercise = store().workout!.exercises[0];
  store().updateSet(exercise.id, exercise.sets[0].id, { weightKg: 82.5, reps: 8 });
  return { exerciseId: exercise.id, setId: exercise.sets[0].id };
}

beforeEach(() => {
  useActiveWorkout.setState({
    workout: null,
    restEndsAt: null,
    restSeconds: DEFAULT_REST_SECONDS,
  });
});

describe('active workout', () => {
  it('starts a session with a name and no exercises', () => {
    store().start('Torso');

    expect(store().workout).toMatchObject({ name: 'Torso', exercises: [], endedAt: null });
    expect(store().workout!.id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('adds an exercise with one empty set ready to fill in', () => {
    store().start('Torso');
    store().addExercise('press-banca-barra');

    expect(store().workout!.exercises).toHaveLength(1);
    expect(store().workout!.exercises[0].sets).toEqual([
      expect.objectContaining({ weightKg: 0, reps: 0, completedAt: null, type: 'normal' }),
    ]);
  });

  it('copies the last set when you add another one', () => {
    const { exerciseId } = startWithOneSet();
    store().addSet(exerciseId);

    const sets = store().workout!.exercises[0].sets;
    expect(sets).toHaveLength(2);
    expect(sets[1]).toMatchObject({ weightKg: 82.5, reps: 8, completedAt: null });
  });

  it('starts the rest timer when a working set is ticked off', () => {
    const { exerciseId, setId } = startWithOneSet();

    store().toggleSetCompleted(exerciseId, setId);

    expect(store().workout!.exercises[0].sets[0].completedAt).not.toBeNull();
    expect(store().restEndsAt).toBeGreaterThan(Date.now());
  });

  it('does not rest after a warm-up set', () => {
    const { exerciseId, setId } = startWithOneSet();
    store().updateSet(exerciseId, setId, { type: 'warmup' });

    store().toggleSetCompleted(exerciseId, setId);

    expect(store().restEndsAt).toBeNull();
  });

  it('unticking a set clears its timestamp', () => {
    const { exerciseId, setId } = startWithOneSet();
    store().toggleSetCompleted(exerciseId, setId);
    store().toggleSetCompleted(exerciseId, setId);

    expect(store().workout!.exercises[0].sets[0].completedAt).toBeNull();
  });

  it('keeps the rest timer between 15 seconds and 10 minutes', () => {
    store().setRestSeconds(5);
    expect(store().restSeconds).toBe(15);
    store().setRestSeconds(9999);
    expect(store().restSeconds).toBe(600);
  });

  it('finishing keeps only the sets that were ticked off', () => {
    const { exerciseId, setId } = startWithOneSet();
    store().addSet(exerciseId);
    store().toggleSetCompleted(exerciseId, setId);

    const finished = store().finish();

    expect(finished!.endedAt).not.toBeNull();
    expect(finished!.exercises[0].sets).toHaveLength(1);
    expect(store().workout).toBeNull();
    expect(store().restEndsAt).toBeNull();
  });

  it('finishing drops exercises where nothing was logged', () => {
    startWithOneSet();

    const finished = store().finish();

    expect(finished!.exercises).toEqual([]);
  });

  it('refuses to tick a set without reps, so nothing invalid reaches the queue', () => {
    store().start('Torso');
    store().addExercise('press-banca-barra');
    const exercise = store().workout!.exercises[0];

    expect(store().toggleSetCompleted(exercise.id, exercise.sets[0].id)).toBe(false);
    expect(store().workout!.exercises[0].sets[0].completedAt).toBeNull();
    expect(store().restEndsAt).toBeNull();
  });

  it('fills empty fields with last session when a set is ticked', () => {
    store().start('Torso');
    store().addExercise('press-banca-barra');
    const exercise = store().workout!.exercises[0];
    store().updateSet(exercise.id, exercise.sets[0].id, { weightKg: 85 });

    const ticked = store().toggleSetCompleted(exercise.id, exercise.sets[0].id, {
      weightKg: 80,
      reps: 8,
    });

    expect(ticked).toBe(true);
    // The weight you typed wins; the reps you left empty come from last time.
    expect(store().workout!.exercises[0].sets[0]).toMatchObject({ weightKg: 85, reps: 8 });
  });

  it('discarding throws the session away', () => {
    startWithOneSet();
    store().discard();

    expect(store().workout).toBeNull();
  });

  it('ignores edits when there is no session', () => {
    store().addExercise('flexiones');
    store().addSet('nope');

    expect(store().workout).toBeNull();
    expect(store().finish()).toBeNull();
  });
});
