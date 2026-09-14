import { ageOn, isMinor, isOldEnough, parseBirthDate, todayIso } from '@/domain/age';

const TODAY = '2026-09-14';

describe('parseBirthDate', () => {
  it.each([
    ['21/03/2008', '2008-03-21'],
    ['1/2/1990', '1990-02-01'],
    ['29-02-2004', '2004-02-29'],
    [' 05.11.1975 ', '1975-11-05'],
  ])('parses %p', (input, expected) => {
    expect(parseBirthDate(input, TODAY)).toBe(expected);
  });

  it.each(['31/02/2000', '29/02/2003', '12/13/1990', '2008-03-21', '1/1/1899', 'abc', ''])(
    'rejects %p',
    (input) => {
      expect(parseBirthDate(input, TODAY)).toBeNull();
    },
  );

  it('rejects dates in the future', () => {
    expect(parseBirthDate('15/09/2026', TODAY)).toBeNull();
    expect(parseBirthDate('14/09/2026', TODAY)).toBe('2026-09-14');
  });
});

describe('ageOn', () => {
  it('counts a birthday from that same day', () => {
    expect(ageOn('2010-09-14', TODAY)).toBe(16);
    expect(ageOn('2010-09-15', TODAY)).toBe(15);
  });

  it('handles people born on 29 February', () => {
    expect(ageOn('2008-02-29', '2026-02-28')).toBe(17);
    expect(ageOn('2008-02-29', '2026-03-01')).toBe(18);
  });
});

describe('age rules', () => {
  it('requires at least 16 years', () => {
    expect(isOldEnough('2010-09-14', TODAY)).toBe(true);
    expect(isOldEnough('2010-09-15', TODAY)).toBe(false);
  });

  it('treats 16 and 17 year olds as minors', () => {
    expect(isMinor('2009-01-01', TODAY)).toBe(true);
    expect(isMinor('2008-09-14', TODAY)).toBe(false);
  });
});

describe('todayIso', () => {
  it('formats the local calendar date', () => {
    expect(todayIso(new Date(2026, 0, 5, 23, 30))).toBe('2026-01-05');
  });
});
