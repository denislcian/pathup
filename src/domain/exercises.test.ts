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
    expect(slugs(filterExercises(EXERCISES, { query: 'triceps' }))).toEqual([
      'extension-triceps-polea',
    ]);
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
    expect(slugs(result)).toEqual(['elevacion-gemelos']);
  });

  it('filters by primary muscle group', () => {
    const result = filterExercises(EXERCISES, { muscleGroup: 'chest' });
    expect(slugs(result).sort()).toEqual(
      ['flexiones', 'press-banca-barra', 'press-inclinado-mancuernas'].sort(),
    );
  });

  it('keeps only exercises doable with the available equipment', () => {
    const available = availableEquipment(['bodyweight']);
    const result = filterExercises(EXERCISES, { available });
    expect(slugs(result).sort()).toEqual(['flexiones', 'plancha']);
    expect(result.every((exercise) => canPerform(exercise, available))).toBe(true);
  });

  it('sorts results alphabetically in Spanish', () => {
    const names = filterExercises(EXERCISES, {}).map((exercise) => exercise.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, 'es')));
  });
});
