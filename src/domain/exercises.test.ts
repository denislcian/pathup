import { EXERCISES } from '@/data/exercises';
import { availableEquipment, canPerform, filterExercises, normalizeText } from '@/domain/exercises';

const slugs = (list: { slug: string }[]) => list.map((exercise) => exercise.slug);

describe('normalizeText', () => {
  it('ignores accents and case', () => {
    expect(normalizeText('  Extensión de TRÍCEPS ')).toBe('extension de triceps');
  });
});

describe('availableEquipment', () => {
  it('always includes bodyweight', () => {
    expect([...availableEquipment([])]).toEqual(['bodyweight']);
  });

  it('expands a full gym to every piece of equipment', () => {
    expect(availableEquipment(['gym']).has('machine')).toBe(true);
  });

  it('ignores unknown values', () => {
    expect([...availableEquipment(['spaceship'])]).toEqual(['bodyweight']);
  });
});

describe('filterExercises', () => {
  it('finds exercises by Spanish name without accents', () => {
    expect(slugs(filterExercises(EXERCISES, { query: 'triceps' }))).toContain(
      'extension-triceps-polea',
    );
    expect(slugs(filterExercises(EXERCISES, { query: 'extension de triceps' }))).toContain(
      'extension-triceps-sobre-cabeza',
    );
  });

  it('finds exercises by English name and aliases', () => {
    expect(slugs(filterExercises(EXERCISES, { query: 'bench press' }))).toContain(
      'press-banca-barra',
    );
    expect(slugs(filterExercises(EXERCISES, { query: 'lagartijas' }))).toEqual(['flexiones']);
  });

  it('matches localized muscle labels when provided', () => {
    const result = filterExercises(EXERCISES, {
      query: 'gemelos',
      muscleLabel: (muscle) => (muscle === 'calves' ? 'Gemelos' : muscle),
    });
    expect(slugs(result)).toContain('elevacion-gemelos');
  });

  it('filters by primary muscle group', () => {
    const result = filterExercises(EXERCISES, { muscleGroup: 'chest' });
    expect(slugs(result)).toEqual(expect.arrayContaining(['flexiones', 'press-banca-barra']));
    // Only exercises whose main muscle is the chest, never those where it is secondary.
    expect(slugs(result)).not.toContain('fondos-banco');
  });

  it('keeps only exercises doable with the available equipment', () => {
    const available = availableEquipment(['bodyweight']);
    const result = filterExercises(EXERCISES, { available });
    expect(slugs(result)).toEqual(
      expect.arrayContaining(['flexiones', 'plancha', 'puente-gluteo', 'sentadilla-silla']),
    );
    expect(slugs(result)).not.toContain('press-banca-barra');
    expect(result.every((exercise) => canPerform(exercise, available))).toBe(true);
  });

  it('sorts results alphabetically in Spanish', () => {
    const names = filterExercises(EXERCISES, {}).map((exercise) => exercise.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, 'es')));
  });
});
