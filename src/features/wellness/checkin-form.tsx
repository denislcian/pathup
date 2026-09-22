import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { Minus, Plus } from '@/components/icons';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CHECKIN_SCALES, SLEEP_HOURS, type Checkin, type CheckinScale } from '@/domain/wellness';
import { formatNumber } from '@/lib/format';
import { colors, minTouchTarget, radius, spacing } from '@/theme/tokens';

const ANSWERS = [1, 2, 3, 4, 5];

type CheckinFormProps = {
  today: string;
  initial?: Checkin | null;
  saving?: boolean;
  error?: boolean;
  onSave: (checkin: Checkin) => void;
  onCancel?: () => void;
};

/** The 20-second check-in: hours of sleep and five answers from 1 to 5. */
export function CheckinForm({
  today,
  initial,
  saving = false,
  error = false,
  onSave,
  onCancel,
}: CheckinFormProps) {
  const { t, i18n } = useTranslation();
  const [sleepHours, setSleepHours] = useState(initial?.sleepHours ?? SLEEP_HOURS.target);
  const [answers, setAnswers] = useState<Record<CheckinScale, number>>({
    sleepQuality: initial?.sleepQuality ?? 3,
    energy: initial?.energy ?? 3,
    stress: initial?.stress ?? 3,
    soreness: initial?.soreness ?? 3,
    mood: initial?.mood ?? 3,
  });

  function shiftSleep(delta: number) {
    setSleepHours((hours) => Math.min(Math.max(hours + delta, SLEEP_HOURS.min), SLEEP_HOURS.max));
  }

  return (
    <Card style={styles.card}>
      <AppText variant="heading" role="heading">
        {t('wellness.formTitle')}
      </AppText>
      <AppText variant="caption" tone="muted">
        {t('wellness.formHint')}
      </AppText>

      <View style={styles.sleep}>
        <AppText variant="label">{t('wellness.sleepHours')}</AppText>
        <View style={styles.sleepRow}>
          <Pressable
            role="button"
            aria-label={t('wellness.sleepLess')}
            disabled={sleepHours <= SLEEP_HOURS.min}
            aria-disabled={sleepHours <= SLEEP_HOURS.min}
            onPress={() => shiftSleep(-SLEEP_HOURS.step)}
            style={[styles.stepper, sleepHours <= SLEEP_HOURS.min && styles.disabled]}>
            <Minus color={colors.text} size={18} />
          </Pressable>
          <AppText variant="title" style={styles.sleepValue} aria-live="polite">
            {t('wellness.hours', { hours: formatNumber(sleepHours, i18n.language) })}
          </AppText>
          <Pressable
            role="button"
            aria-label={t('wellness.sleepMore')}
            disabled={sleepHours >= SLEEP_HOURS.max}
            aria-disabled={sleepHours >= SLEEP_HOURS.max}
            onPress={() => shiftSleep(SLEEP_HOURS.step)}
            style={[styles.stepper, sleepHours >= SLEEP_HOURS.max && styles.disabled]}>
            <Plus color={colors.text} size={18} />
          </Pressable>
        </View>
      </View>

      {CHECKIN_SCALES.map((scale) => (
        <View key={scale} style={styles.scale}>
          <AppText variant="label">{t(`wellness.scales.${scale}`)}</AppText>
          <View style={styles.answers} role="radiogroup" aria-label={t(`wellness.scales.${scale}`)}>
            {ANSWERS.map((value) => {
              const selected = answers[scale] === value;
              return (
                <Pressable
                  key={value}
                  role="radio"
                  aria-checked={selected}
                  aria-label={`${t(`wellness.scales.${scale}`)}: ${value} · ${t(
                    `wellness.answers.${scale}.${value}` as 'wellness.answers.energy.1',
                  )}`}
                  onPress={() => setAnswers((current) => ({ ...current, [scale]: value }))}
                  style={[styles.answer, selected && styles.answerSelected]}>
                  <AppText
                    variant="label"
                    style={{ color: selected ? colors.onAccent : colors.text }}>
                    {value}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
          <AppText variant="caption" tone="muted">
            {t(`wellness.answers.${scale}.${answers[scale]}` as 'wellness.answers.energy.1')}
          </AppText>
        </View>
      ))}

      {error ? (
        <AppText tone="danger" role="alert">
          {t('wellness.errors.save')}
        </AppText>
      ) : null}

      <View style={styles.actions}>
        {onCancel ? (
          <Button label={t('wellness.cancel')} variant="ghost" onPress={onCancel} />
        ) : null}
        <Button
          label={saving ? t('wellness.saving') : t('wellness.save')}
          disabled={saving}
          aria-busy={saving}
          onPress={() => onSave({ date: today, sleepHours, ...answers })}
          style={styles.flex}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  card: {
    padding: spacing.md,
    gap: spacing.md,
  },
  sleep: {
    gap: spacing.xs,
  },
  sleepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sleepValue: {
    minWidth: 96,
    textAlign: 'center',
  },
  stepper: {
    cursor: 'pointer',
    width: minTouchTarget,
    height: minTouchTarget,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface2,
  },
  disabled: {
    opacity: 0.35,
    cursor: 'auto',
  },
  scale: {
    gap: spacing.xs,
  },
  answers: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  answer: {
    cursor: 'pointer',
    flex: 1,
    minHeight: minTouchTarget,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  answerSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
