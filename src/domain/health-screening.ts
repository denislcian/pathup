/**
 * Pre-exercise health screening inspired by the PAR-Q+ general questions (paraphrased).
 * A single "yes" means we recommend talking to a doctor first. It informs, it never blocks.
 */
export const HEALTH_SCREENING_QUESTIONS = [
  'heartCondition',
  'chestPain',
  'dizziness',
  'chronicCondition',
  'medication',
  'boneJointProblem',
  'supervisedOnly',
] as const;

export type HealthScreeningQuestion = (typeof HEALTH_SCREENING_QUESTIONS)[number];

export type HealthScreeningAnswers = Partial<Record<HealthScreeningQuestion, boolean>>;

export function isScreeningComplete(answers: HealthScreeningAnswers): boolean {
  return HEALTH_SCREENING_QUESTIONS.every((question) => typeof answers[question] === 'boolean');
}

export function needsMedicalAdvice(answers: HealthScreeningAnswers): boolean {
  return HEALTH_SCREENING_QUESTIONS.some((question) => answers[question] === true);
}
