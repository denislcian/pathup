import {
  dayKey,
  habitStreak,
  isDone,
  nextCount,
  recentDays,
  todayProgress,
  validateHabit,
  type Habit,
  type HabitLog,
} from '@/domain/habits';

const water: Habit = { id: 'water', name: 'Beber agua', target: 8, unit: 'vasos', position: 0 };
const stretch: Habit = { id: 'stretch', name: 'Estirar', target: 1, unit: null, position: 1 };

function log(habitId: string, date: string, count: number): HabitLog {
  return { habitId, date, count };
}

describe('habits', () => {
  it('counts a day as done only when the target is reached', () => {
    const logs = [log('water', '2026-09-25', 7), log('stretch', '2026-09-25', 1)];
    expect(isDone(water, logs, '2026-09-25')).toBe(false);
    expect(isDone(stretch, logs, '2026-09-25')).toBe(true);
  });

  it('keeps yesterday’s streak while today is still pending', () => {
    const logs = ['2026-09-22', '2026-09-23', '2026-09-24'].map((date) => log('stretch', date, 1));
    expect(habitStreak(stretch, logs, '2026-09-25')).toBe(3);
    expect(habitStreak(stretch, [...logs, log('stretch', '2026-09-25', 1)], '2026-09-25')).toBe(4);
    expect(habitStreak(stretch, logs, '2026-09-26')).toBe(0);
  });

  it('crosses months without losing count', () => {
    const logs = ['2026-08-30', '2026-08-31', '2026-09-01'].map((date) => log('stretch', date, 1));
    expect(habitStreak(stretch, logs, '2026-09-01')).toBe(3);
  });

  it('lists the last seven days, oldest first', () => {
    const days = recentDays(
      water,
      [log('water', '2026-09-25', 8), log('water', '2026-09-20', 3)],
      '2026-09-25',
    );
    expect(days).toHaveLength(7);
    expect(days[0]).toEqual({ date: '2026-09-19', count: 0, done: false });
    expect(days[1]).toEqual({ date: '2026-09-20', count: 3, done: false });
    expect(days[6]).toEqual({ date: '2026-09-25', count: 8, done: true });
  });

  it('toggles ticks and counts up counters, wrapping after the target', () => {
    expect(nextCount(stretch, 0)).toBe(1);
    expect(nextCount(stretch, 1)).toBe(0);
    expect(nextCount(water, 3)).toBe(4);
    expect(nextCount(water, 8)).toBe(0);
  });

  it('summarises today', () => {
    expect(
      todayProgress([water, stretch], [log('stretch', '2026-09-25', 1)], '2026-09-25'),
    ).toEqual({ done: 1, total: 2 });
  });

  it('needs a name and a sensible target', () => {
    expect(validateHabit({ name: ' ', target: 0 })).toEqual(['nameRequired', 'target']);
    expect(validateHabit({ name: 'Leer', target: 1 })).toEqual([]);
  });

  it('uses the local day', () => {
    expect(dayKey(new Date(2026, 8, 25, 0, 30))).toBe('2026-09-25');
  });
});
