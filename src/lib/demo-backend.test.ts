import { PROGRAMS } from '@/data/programs';
import { buildDemoWorkouts } from '@/lib/demo-backend';

// A Friday, so the current week already has its Monday and Thursday sessions.
const NOW = new Date(2026, 8, 25, 20, 0);
const program = PROGRAMS.find((item) => item.slug === 'torso-pierna')!;

describe('demo workouts', () => {
  const workouts = buildDemoWorkouts(NOW);

  it('are the sessions of the programme they say they belong to', () => {
    for (const workout of workouts) {
      const key = workout.programSession!.split('-')[1];
      const session = program.sessions.find((item) => item.key === key)!;
      expect(workout.name).toBe(session.name);
      // Otherwise the logger shows no "last time" and suggests no weights in the demo.
      expect(workout.exercises.map((exercise) => exercise.slug)).toEqual(
        session.exercises.map((exercise) => exercise.slug),
      );
    }
  });

  it('follow the double progression: the weight goes up over the eight weeks', () => {
    const bench = workouts
      .filter((workout) => workout.name === 'Torso A')
      .map((workout) => {
        const sets = workout.exercises[0]!.sets.filter((set) => set.type === 'normal');
        return Math.max(...sets.map((set) => set.weightKg));
      });

    expect(bench).toHaveLength(8);
    expect(bench[bench.length - 1]).toBeGreaterThan(bench[0]!);
    // Never down, and never a jump bigger than the smallest barbell step.
    for (let index = 1; index < bench.length; index += 1) {
      expect(bench[index]! - bench[index - 1]!).toBeGreaterThanOrEqual(0);
      expect(bench[index]! - bench[index - 1]!).toBeLessThanOrEqual(2.5);
    }
  });

  it('miss the second session of this week, so it is the one on Today', () => {
    const thisWeek = workouts.filter((workout) => workout.programSession?.startsWith('w8-'));
    expect(thisWeek.map((workout) => workout.name)).toEqual(['Torso A', 'Torso B']);
  });
});
