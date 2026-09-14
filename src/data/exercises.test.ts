import { EXERCISES, getExercise } from '@/data/exercises';
import { EQUIPMENT, MUSCLES } from '@/domain/exercises';
import en from '@/i18n/en.json';
import es from '@/i18n/es.json';

describe('exercise catalogue', () => {
  it('has unique, URL-safe slugs', () => {
    const slugs = EXERCISES.map((exercise) => exercise.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    slugs.forEach((slug) => expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/));
  });

  it.each(EXERCISES.map((exercise) => [exercise.slug, exercise] as const))(
    '%s is complete and consistent',
    (_slug, exercise) => {
      expect(exercise.primaryMuscles.length).toBeGreaterThan(0);
      expect(exercise.equipment.length).toBeGreaterThan(0);
      expect(exercise.instructions.length).toBeGreaterThanOrEqual(3);
      expect(exercise.cues.length).toBeGreaterThanOrEqual(2);
      expect(exercise.mistakes.length).toBeGreaterThanOrEqual(2);
      exercise.primaryMuscles.forEach((muscle) =>
        expect(exercise.secondaryMuscles).not.toContain(muscle),
      );
      exercise.substitutes.forEach((slug) => {
        expect(slug).not.toBe(exercise.slug);
        expect(getExercise(slug)).toBeDefined();
      });
    },
  );

  it('has a label for every muscle and piece of equipment in both languages', () => {
    for (const messages of [es, en]) {
      MUSCLES.forEach((muscle) => expect(messages.muscles[muscle]).toBeTruthy());
      EQUIPMENT.forEach((item) => expect(messages.equipment[item]).toBeTruthy());
    }
  });
});
