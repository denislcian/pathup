/**
 * Daily wellness check-in and the readiness score it produces. Everything here is a pure
 * function over the answers: the app never needs a wearable to adapt the session.
 */

export const CHECKIN_SCALES = ['sleepQuality', 'energy', 'stress', 'soreness', 'mood'] as const;
export type CheckinScale = (typeof CHECKIN_SCALES)[number];

/** Scales where a higher answer is better; the others are inverted for the score. */
const HIGHER_IS_BETTER: Record<CheckinScale, boolean> = {
  sleepQuality: true,
  energy: true,
  stress: false,
  soreness: false,
  mood: true,
};

export type Checkin = {
  /** YYYY-MM-DD in the phone's time zone. */
  date: string;
  /** Hours slept, in halves. */
  sleepHours: number;
  sleepQuality: number;
  energy: number;
  stress: number;
  soreness: number;
  mood: number;
  note?: string | null;
};

export const SLEEP_HOURS = { min: 3, max: 12, step: 0.5, target: 7.5 } as const;

/** How much each answer weighs in the readiness score. They add up to 1. */
export const READINESS_WEIGHTS = {
  sleepQuality: 0.25,
  sleepHours: 0.2,
  energy: 0.25,
  stress: 0.15,
  soreness: 0.15,
} as const;

function scaleScore(value: number, scale: CheckinScale): number {
  const clamped = Math.min(Math.max(value, 1), 5);
  const normalized = (clamped - 1) / 4;
  return HIGHER_IS_BETTER[scale] ? normalized : 1 - normalized;
}

/** 0 with four hours or less, 1 from seven and a half hours; in between, proportional. */
export function sleepScore(hours: number): number {
  return Math.min(Math.max((hours - 4) / (SLEEP_HOURS.target - 4), 0), 1);
}

/** 0-100. Higher means a better day to push. */
export function readinessScore(checkin: Checkin): number {
  const parts =
    READINESS_WEIGHTS.sleepQuality * scaleScore(checkin.sleepQuality, 'sleepQuality') +
    READINESS_WEIGHTS.sleepHours * sleepScore(checkin.sleepHours) +
    READINESS_WEIGHTS.energy * scaleScore(checkin.energy, 'energy') +
    READINESS_WEIGHTS.stress * scaleScore(checkin.stress, 'stress') +
    READINESS_WEIGHTS.soreness * scaleScore(checkin.soreness, 'soreness');
  return Math.round(parts * 100);
}

export type ReadinessBand = 'great' | 'normal' | 'easy' | 'rest';

export function readinessBand(score: number): ReadinessBand {
  if (score >= 80) return 'great';
  if (score >= 60) return 'normal';
  if (score >= 40) return 'easy';
  return 'rest';
}

export type SessionAdjustment = {
  band: ReadinessBand;
  score: number;
  /** Sets to add or remove from every exercise of the session. */
  setsDelta: number;
  /** Fraction of the planned weight to use, 1 meaning "the same as planned". */
  weightFactor: number;
  /** The answer that pulled the score down the most, to explain the advice. */
  weakest: 'sleepQuality' | 'sleepHours' | 'energy' | 'stress' | 'soreness' | null;
};

/** The answer that cost the most points, so the advice can say why. */
export function weakestFactor(checkin: Checkin): SessionAdjustment['weakest'] {
  const losses = {
    sleepQuality:
      READINESS_WEIGHTS.sleepQuality * (1 - scaleScore(checkin.sleepQuality, 'sleepQuality')),
    sleepHours: READINESS_WEIGHTS.sleepHours * (1 - sleepScore(checkin.sleepHours)),
    energy: READINESS_WEIGHTS.energy * (1 - scaleScore(checkin.energy, 'energy')),
    stress: READINESS_WEIGHTS.stress * (1 - scaleScore(checkin.stress, 'stress')),
    soreness: READINESS_WEIGHTS.soreness * (1 - scaleScore(checkin.soreness, 'soreness')),
  };
  const [worst, loss] = Object.entries(losses).sort(([, a], [, b]) => b - a)[0] as [
    NonNullable<SessionAdjustment['weakest']>,
    number,
  ];
  // Nothing worth mentioning when every answer was good.
  return loss > 0.03 ? worst : null;
}

/**
 * What to do with today's session. Deliberately small changes: a bad night is a reason to keep
 * the weights, not to skip training.
 */
export function sessionAdjustment(checkin: Checkin): SessionAdjustment {
  const score = readinessScore(checkin);
  const band = readinessBand(score);
  const weakest = weakestFactor(checkin);

  switch (band) {
    case 'great':
      return { band, score, setsDelta: 0, weightFactor: 1, weakest };
    case 'normal':
      return { band, score, setsDelta: 0, weightFactor: 1, weakest };
    case 'easy':
      return { band, score, setsDelta: -1, weightFactor: 1, weakest };
    case 'rest':
      return { band, score, setsDelta: -1, weightFactor: 0.9, weakest };
  }
}

export type AdjustableTemplate = {
  name: string;
  exercises: { slug: string; sets: { weightKg: number; reps: number }[] }[];
};

/** Applies the advice to a planned session: fewer sets and, on a bad day, a little less weight. */
export function applyAdjustment<T extends AdjustableTemplate>(
  template: T,
  adjustment: SessionAdjustment,
): T {
  if (adjustment.setsDelta === 0 && adjustment.weightFactor === 1) return template;

  return {
    ...template,
    exercises: template.exercises.map((exercise) => {
      const keep = Math.max(1, exercise.sets.length + adjustment.setsDelta);
      return {
        ...exercise,
        sets: exercise.sets.slice(0, keep).map((set) => ({
          ...set,
          weightKg: Math.round(set.weightKg * adjustment.weightFactor * 2) / 2,
        })),
      };
    }),
  };
}

/** Days in a row with a check-in, counting back from today (yesterday still counts today). */
export function checkinStreak(checkins: readonly Checkin[], today: string): number {
  const days = new Set(checkins.map((checkin) => checkin.date));
  const cursor = new Date(`${today}T12:00:00`);
  const key = () => cursor.toISOString().slice(0, 10);
  if (!days.has(key())) cursor.setDate(cursor.getDate() - 1);

  let streak = 0;
  while (days.has(key())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** Average readiness of the last `days` check-ins, to show a trend. */
export function averageReadiness(checkins: readonly Checkin[], days = 7): number | null {
  const recent = [...checkins].sort((a, b) => b.date.localeCompare(a.date)).slice(0, days);
  if (recent.length === 0) return null;
  return Math.round(
    recent.reduce((total, checkin) => total + readinessScore(checkin), 0) / recent.length,
  );
}

// Guided breathing --------------------------------------------------------------------------------

export type BreathingPattern = {
  slug: 'box' | 'relax';
  /** Seconds for inhale, hold, exhale, hold. */
  phases: [number, number, number, number];
  cycles: number;
};

export const BREATHING_PATTERNS: BreathingPattern[] = [
  { slug: 'box', phases: [4, 4, 4, 4], cycles: 8 },
  { slug: 'relax', phases: [4, 7, 8, 0], cycles: 6 },
];

export function patternSeconds(pattern: BreathingPattern): number {
  return pattern.phases.reduce((total, phase) => total + phase, 0) * pattern.cycles;
}

export type BreathingStep = { phase: 0 | 1 | 2 | 3; secondsLeft: number; cycle: number };

/** Which phase of the exercise second `elapsed` falls in, for the animation and the label. */
export function breathingStep(pattern: BreathingPattern, elapsed: number): BreathingStep | null {
  const cycleLength = pattern.phases.reduce((total, phase) => total + phase, 0);
  if (elapsed >= cycleLength * pattern.cycles) return null;

  const cycle = Math.floor(elapsed / cycleLength);
  let offset = elapsed % cycleLength;
  for (let phase = 0; phase < pattern.phases.length; phase += 1) {
    const length = pattern.phases[phase];
    if (length === 0) continue;
    if (offset < length) {
      return { phase: phase as BreathingStep['phase'], secondsLeft: length - offset, cycle };
    }
    offset -= length;
  }
  return null;
}
