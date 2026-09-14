import {
  HEALTH_SCREENING_QUESTIONS,
  isScreeningComplete,
  needsMedicalAdvice,
  type HealthScreeningAnswers,
} from '@/domain/health-screening';

const allNo = Object.fromEntries(
  HEALTH_SCREENING_QUESTIONS.map((question) => [question, false]),
) as HealthScreeningAnswers;

describe('health screening', () => {
  it('is complete only when every question has an answer', () => {
    expect(isScreeningComplete({})).toBe(false);
    expect(isScreeningComplete({ ...allNo, medication: undefined })).toBe(false);
    expect(isScreeningComplete(allNo)).toBe(true);
  });

  it('recommends medical advice when any answer is yes', () => {
    expect(needsMedicalAdvice(allNo)).toBe(false);
    expect(needsMedicalAdvice({ ...allNo, chestPain: true })).toBe(true);
  });
});
