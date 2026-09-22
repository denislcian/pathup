import {
  applyAdjustment,
  averageReadiness,
  breathingStep,
  BREATHING_PATTERNS,
  checkinStreak,
  patternSeconds,
  readinessBand,
  readinessScore,
  sessionAdjustment,
  sleepScore,
  weakestFactor,
  type Checkin,
} from '@/domain/wellness';

function checkin(overrides: Partial<Checkin> = {}): Checkin {
  return {
    date: '2026-09-22',
    sleepHours: 7.5,
    sleepQuality: 4,
    energy: 4,
    stress: 2,
    soreness: 2,
    mood: 4,
    ...overrides,
  };
}

describe('readinessScore', () => {
  it('is 100 with a perfect day and 0 with the worst one', () => {
    expect(
      readinessScore(
        checkin({ sleepHours: 9, sleepQuality: 5, energy: 5, stress: 1, soreness: 1 }),
      ),
    ).toBe(100);
    expect(
      readinessScore(
        checkin({ sleepHours: 4, sleepQuality: 1, energy: 1, stress: 5, soreness: 5 }),
      ),
    ).toBe(0);
  });

  it('drops when you sleep badly, even if everything else is fine', () => {
    const rested = readinessScore(checkin());
    const tired = readinessScore(checkin({ sleepHours: 5, sleepQuality: 2 }));
    expect(tired).toBeLessThan(rested - 20);
  });

  it('counts hours in bed on their own scale', () => {
    expect(sleepScore(4)).toBe(0);
    expect(sleepScore(7.5)).toBe(1);
    expect(sleepScore(9)).toBe(1);
    expect(sleepScore(5.75)).toBeCloseTo(0.5);
  });
});

describe('readinessBand', () => {
  it.each([
    [95, 'great'],
    [80, 'great'],
    [65, 'normal'],
    [45, 'easy'],
    [20, 'rest'],
  ] as const)('%p is %p', (score, band) => {
    expect(readinessBand(score)).toBe(band);
  });
});

describe('sessionAdjustment', () => {
  it('leaves a good day alone', () => {
    const advice = sessionAdjustment(
      checkin({ sleepHours: 8, sleepQuality: 5, energy: 5, stress: 1, soreness: 1 }),
    );
    expect(advice).toMatchObject({ band: 'great', setsDelta: 0, weightFactor: 1, weakest: null });
  });

  it('takes a set away on a mediocre day and names the culprit', () => {
    const advice = sessionAdjustment(checkin({ sleepHours: 5, sleepQuality: 3, energy: 1 }));
    expect(advice.band).toBe('easy');
    expect(advice.setsDelta).toBe(-1);
    expect(advice.weakest).toBe('energy');
  });

  it('on a bad day keeps training but lighter', () => {
    const advice = sessionAdjustment(
      checkin({ sleepHours: 4.5, sleepQuality: 1, energy: 1, stress: 5, soreness: 5 }),
    );
    expect(advice.band).toBe('rest');
    expect(advice.weightFactor).toBeLessThan(1);
  });

  it('points at the worst answer', () => {
    expect(weakestFactor(checkin({ soreness: 5 }))).toBe('soreness');
    expect(weakestFactor(checkin({ sleepHours: 4 }))).toBe('sleepHours');
  });
});

describe('applyAdjustment', () => {
  const template = {
    name: 'Torso A',
    exercises: [
      {
        slug: 'press-banca-barra',
        sets: [
          { weightKg: 80, reps: 8 },
          { weightKg: 80, reps: 8 },
          { weightKg: 80, reps: 8 },
        ],
      },
      { slug: 'plancha', sets: [{ weightKg: 0, reps: 40 }] },
    ],
  };

  it('does nothing when the day is good', () => {
    const advice = sessionAdjustment(
      checkin({ sleepHours: 8, sleepQuality: 5, energy: 5, stress: 1, soreness: 1 }),
    );
    expect(applyAdjustment(template, advice)).toBe(template);
  });

  it('removes a set and rounds the lighter weight to half kilos', () => {
    const advice = sessionAdjustment(
      checkin({ sleepHours: 4.5, sleepQuality: 1, energy: 1, stress: 5, soreness: 5 }),
    );
    const adjusted = applyAdjustment(template, advice);

    expect(adjusted.exercises[0].sets).toHaveLength(2);
    expect(adjusted.exercises[0].sets[0].weightKg).toBe(72);
    // An exercise with a single set keeps it: the advice never leaves you with nothing.
    expect(adjusted.exercises[1].sets).toHaveLength(1);
  });
});

describe('checkinStreak', () => {
  it('counts days in a row and lets today still be pending', () => {
    const days = ['2026-09-22', '2026-09-21', '2026-09-20'].map((date) => checkin({ date }));
    expect(checkinStreak(days, '2026-09-22')).toBe(3);
    // Today is not done yet: yesterday's streak still stands.
    expect(checkinStreak(days, '2026-09-23')).toBe(3);
    expect(checkinStreak(days, '2026-09-24')).toBe(0);
  });
});

describe('averageReadiness', () => {
  it('averages the last check-ins', () => {
    const good = checkin({
      date: '2026-09-22',
      sleepQuality: 5,
      energy: 5,
      stress: 1,
      soreness: 1,
    });
    const bad = checkin({ date: '2026-09-21', sleepQuality: 1, energy: 1, stress: 5, soreness: 5 });
    expect(averageReadiness([good, bad])).toBe(
      Math.round((readinessScore(good) + readinessScore(bad)) / 2),
    );
    expect(averageReadiness([])).toBeNull();
  });
});

describe('breathing', () => {
  const box = BREATHING_PATTERNS[0];
  const relax = BREATHING_PATTERNS[1];

  it('lasts what the pattern says', () => {
    expect(patternSeconds(box)).toBe(16 * 8);
    expect(patternSeconds(relax)).toBe(19 * 6);
  });

  it('walks through inhale, hold, exhale and hold', () => {
    expect(breathingStep(box, 0)).toEqual({ phase: 0, secondsLeft: 4, cycle: 0 });
    expect(breathingStep(box, 5)).toEqual({ phase: 1, secondsLeft: 3, cycle: 0 });
    expect(breathingStep(box, 9)).toEqual({ phase: 2, secondsLeft: 3, cycle: 0 });
    expect(breathingStep(box, 17)).toEqual({ phase: 0, secondsLeft: 3, cycle: 1 });
  });

  it('skips phases the pattern does not use', () => {
    // 4-7-8 has no final hold, so after the exhale the next cycle starts.
    expect(breathingStep(relax, 18)).toEqual({ phase: 2, secondsLeft: 1, cycle: 0 });
    expect(breathingStep(relax, 19)).toEqual({ phase: 0, secondsLeft: 4, cycle: 1 });
  });

  it('ends after the last cycle', () => {
    expect(breathingStep(box, patternSeconds(box))).toBeNull();
  });
});
