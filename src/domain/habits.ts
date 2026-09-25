/**
 * Daily habits: tick them off (or count them, like glasses of water) and keep a streak. Pure
 * functions over the logs, so the streak works the same online and offline.
 */

export type Habit = {
  id: string;
  name: string;
  /** Times a day it has to happen to count as done: 1 for a tick, 8 for glasses of water. */
  target: number;
  /** Short word shown on the chip, e.g. "vasos". Null for tick habits. */
  unit: string | null;
  position: number;
};

export type HabitLog = {
  habitId: string;
  /** YYYY-MM-DD in the phone's time zone. */
  date: string;
  count: number;
};

export const HABIT_LIMITS = {
  nameLength: 40,
  unitLength: 12,
  target: { min: 1, max: 30 },
  habits: 12,
} as const;

/** One tap ideas for people who do not know where to start. */
export const HABIT_SUGGESTIONS = [
  { key: 'water', target: 8 },
  { key: 'sleep', target: 1 },
  { key: 'walk', target: 1 },
  { key: 'stretch', target: 1 },
  { key: 'screens', target: 1 },
  { key: 'protein', target: 1 },
] as const;

export function dayKey(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function shiftDay(date: string, days: number): string {
  const [year, month, day] = date.split('-').map(Number);
  return dayKey(new Date(year, month - 1, day + days));
}

export function countOn(logs: readonly HabitLog[], habitId: string, date: string): number {
  return logs.find((log) => log.habitId === habitId && log.date === date)?.count ?? 0;
}

export function isDone(habit: Habit, logs: readonly HabitLog[], date: string): boolean {
  return countOn(logs, habit.id, date) >= habit.target;
}

/**
 * Days in a row the habit was done, counting back from today. Today does not break the streak
 * until it is over: at 9 in the morning yesterday's streak still stands.
 */
export function habitStreak(habit: Habit, logs: readonly HabitLog[], today: string): number {
  let cursor = isDone(habit, logs, today) ? today : shiftDay(today, -1);
  let streak = 0;
  while (isDone(habit, logs, cursor)) {
    streak += 1;
    cursor = shiftDay(cursor, -1);
  }
  return streak;
}

/** The last `days` days, oldest first, with whether the habit was done each day. */
export function recentDays(
  habit: Habit,
  logs: readonly HabitLog[],
  today: string,
  days = 7,
): { date: string; done: boolean; count: number }[] {
  return Array.from({ length: days }, (_, index) => {
    const date = shiftDay(today, index - (days - 1));
    const count = countOn(logs, habit.id, date);
    return { date, count, done: count >= habit.target };
  });
}

/** What a tap does: counters go up by one (and wrap to 0 past the target), ticks toggle. */
export function nextCount(habit: Habit, current: number): number {
  if (habit.target === 1) return current >= 1 ? 0 : 1;
  return current >= habit.target ? 0 : current + 1;
}

/** Share of habits done today, for the summary ring. */
export function todayProgress(
  habits: readonly Habit[],
  logs: readonly HabitLog[],
  today: string,
): { done: number; total: number } {
  return {
    done: habits.filter((habit) => isDone(habit, logs, today)).length,
    total: habits.length,
  };
}

export type HabitIssue = 'nameRequired' | 'target';

export function validateHabit(input: { name: string; target: number }): HabitIssue[] {
  const issues: HabitIssue[] = [];
  if (input.name.trim().length === 0) issues.push('nameRequired');
  if (
    !Number.isInteger(input.target) ||
    input.target < HABIT_LIMITS.target.min ||
    input.target > HABIT_LIMITS.target.max
  ) {
    issues.push('target');
  }
  return issues;
}
