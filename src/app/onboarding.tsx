import { router } from 'expo-router';
import { Stethoscope } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { OptionCard } from '@/components/ui/option-card';
import { Screen } from '@/components/ui/screen';
import { isMinor, type IsoDate } from '@/domain/age';
import { USER_EQUIPMENT, type UserEquipment } from '@/domain/exercises';
import {
  HEALTH_SCREENING_QUESTIONS,
  isScreeningComplete,
  needsMedicalAdvice,
  type HealthScreeningAnswers,
} from '@/domain/health-screening';
import { useProfile, useUpdateProfile, type ProfileUpdate } from '@/features/profile/profile-api';
import { colors, radius, spacing } from '@/theme/tokens';

const GOALS = ['muscle', 'strength', 'fat_loss', 'health', 'endurance'] as const;
const LEVELS = ['beginner', 'intermediate', 'advanced'] as const;
const DAY_OPTIONS = [2, 3, 4, 5, 6] as const;
const STEPS = ['goal', 'level', 'days', 'equipment', 'health'] as const;

type Goal = (typeof GOALS)[number];
type Level = (typeof LEVELS)[number];

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const profile = useProfile();
  const updateProfile = useUpdateProfile();

  const [stepIndex, setStepIndex] = useState(0);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [level, setLevel] = useState<Level | null>(null);
  const [days, setDays] = useState<number | null>(null);
  const [equipment, setEquipment] = useState<UserEquipment[]>([]);
  const [screening, setScreening] = useState<HealthScreeningAnswers>({});
  const [showAdvice, setShowAdvice] = useState(false);

  const birthDate = profile.data?.birth_date as IsoDate | null | undefined;
  const minor = birthDate ? isMinor(birthDate) : false;
  const goals = minor ? GOALS.filter((option) => option !== 'fat_loss') : GOALS;
  const step = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;

  const canContinue = {
    goal: goal !== null,
    level: level !== null,
    days: days !== null,
    equipment: equipment.length > 0,
    health: isScreeningComplete(screening),
  }[step];

  function toggleEquipment(option: UserEquipment) {
    setEquipment((current) =>
      current.includes(option) ? current.filter((item) => item !== option) : [...current, option],
    );
  }

  function save() {
    const now = new Date().toISOString();
    const patch: ProfileUpdate = {
      goal,
      experience_level: level,
      beginner_mode: level === 'beginner',
      training_days_per_week: days,
      equipment,
      parq_flagged: needsMedicalAdvice(screening),
      parq_completed_at: now,
      onboarding_completed_at: now,
    };
    updateProfile.mutate(patch, { onSuccess: () => router.replace('/') });
  }

  function handleNext() {
    if (!isLastStep) {
      setStepIndex((index) => index + 1);
    } else if (needsMedicalAdvice(screening) && !showAdvice) {
      setShowAdvice(true);
    } else {
      save();
    }
  }

  const saving = updateProfile.isPending;
  const footer = (
    <View style={styles.footer}>
      {stepIndex > 0 && !showAdvice ? (
        <Button
          label={t('common.back')}
          variant="secondary"
          onPress={() => setStepIndex((index) => index - 1)}
          style={styles.footerButton}
        />
      ) : null}
      <Button
        label={
          saving
            ? t('onboarding.saving')
            : showAdvice
              ? t('onboarding.adviceAcknowledge')
              : isLastStep
                ? t('onboarding.finish')
                : t('common.next')
        }
        onPress={handleNext}
        disabled={!canContinue || saving}
        aria-busy={saving}
        style={styles.footerButton}
      />
    </View>
  );

  if (showAdvice) {
    return (
      <Screen footer={footer}>
        <Card style={styles.advice}>
          <Stethoscope color={colors.warning} size={32} aria-hidden />
          <AppText variant="title" role="heading">
            {t('onboarding.adviceTitle')}
          </AppText>
          <AppText>{t('onboarding.adviceBody')}</AppText>
        </Card>
        {updateProfile.isError ? (
          <AppText tone="danger" role="alert">
            {t('onboarding.saveError')}
          </AppText>
        ) : null}
      </Screen>
    );
  }

  return (
    <Screen
      title={t(`onboarding.${step}Title`)}
      subtitle={t('onboarding.step', { current: stepIndex + 1, total: STEPS.length })}
      footer={footer}>
      <View style={styles.progress} aria-hidden>
        {STEPS.map((item, index) => (
          <View
            key={item}
            style={[styles.progressSegment, index <= stepIndex && styles.progressDone]}
          />
        ))}
      </View>

      <AppText tone="muted">{t(`onboarding.${step}Subtitle`)}</AppText>

      {step === 'goal' ? (
        <View role="radiogroup" style={styles.options}>
          {goals.map((option) => (
            <OptionCard
              key={option}
              title={t(`onboarding.goals.${option}`)}
              selected={goal === option}
              onPress={() => setGoal(option)}
            />
          ))}
        </View>
      ) : null}

      {step === 'level' ? (
        <View role="radiogroup" style={styles.options}>
          {LEVELS.map((option) => (
            <OptionCard
              key={option}
              title={t(`onboarding.levels.${option}`)}
              description={t(`onboarding.levels.${option}Hint`)}
              selected={level === option}
              onPress={() => setLevel(option)}
            />
          ))}
        </View>
      ) : null}

      {step === 'days' ? (
        <View role="radiogroup" style={styles.options}>
          {DAY_OPTIONS.map((option) => (
            <OptionCard
              key={option}
              title={t('onboarding.daysOption', { count: option })}
              selected={days === option}
              onPress={() => setDays(option)}
            />
          ))}
        </View>
      ) : null}

      {step === 'equipment' ? (
        <View style={styles.options}>
          {USER_EQUIPMENT.map((option) => (
            <OptionCard
              key={option}
              role="checkbox"
              title={t(`onboarding.equipment.${option}`)}
              description={t(`onboarding.equipment.${option}Hint`)}
              selected={equipment.includes(option)}
              onPress={() => toggleEquipment(option)}
            />
          ))}
        </View>
      ) : null}

      {step === 'health' ? (
        <View style={styles.options}>
          {HEALTH_SCREENING_QUESTIONS.map((question) => {
            const answer = screening[question];
            const label = t(`onboarding.screening.${question}`);
            return (
              <Card key={question} style={styles.question}>
                <AppText>{label}</AppText>
                <View role="radiogroup" aria-label={label} style={styles.answers}>
                  <Chip
                    role="radio"
                    label={t('common.no')}
                    selected={answer === false}
                    onPress={() => setScreening((current) => ({ ...current, [question]: false }))}
                  />
                  <Chip
                    role="radio"
                    label={t('common.yes')}
                    selected={answer === true}
                    onPress={() => setScreening((current) => ({ ...current, [question]: true }))}
                  />
                </View>
              </Card>
            );
          })}
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  progress: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.surface2,
  },
  progressDone: {
    backgroundColor: colors.accent,
  },
  options: {
    gap: spacing.sm,
  },
  question: {
    gap: spacing.md,
    padding: spacing.md,
  },
  answers: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  footerButton: {
    flex: 1,
  },
  advice: {
    gap: spacing.md,
    marginTop: spacing.xl,
  },
});
