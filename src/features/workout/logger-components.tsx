import { Check, Timer, Trash2 } from '@/components/icons';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getExercise } from '@/data/exercises';
import {
  formatDuration,
  type LoggedExercise,
  type LoggedSet,
  type PreviousPerformance,
} from '@/domain/workout';
import { colors, fonts, minTouchTarget, radius, spacing } from '@/theme/tokens';

/** Accepts both "82.5" and "82,5" while typing. */
export function parseDecimal(text: string): number {
  const value = Number(text.replace(',', '.'));
  return Number.isFinite(value) ? value : 0;
}

function formatNumber(value: number): string {
  return value === 0 ? '' : String(value).replace('.', ',');
}

type SetRowProps = {
  set: LoggedSet;
  index: number;
  exerciseName: string;
  previous?: { weightKg: number; reps: number };
  onChange: (patch: Partial<Pick<LoggedSet, 'weightKg' | 'reps'>>) => void;
  onToggle: () => void;
  onRemove: () => void;
};

export function SetRow({
  set,
  index,
  exerciseName,
  previous,
  onChange,
  onToggle,
  onRemove,
}: SetRowProps) {
  const { t } = useTranslation();
  const [weight, setWeight] = useState(formatNumber(set.weightKg));
  const [reps, setReps] = useState(formatNumber(set.reps));
  const [source, setSource] = useState({ weightKg: set.weightKg, reps: set.reps });
  const done = set.completedAt !== null;
  const number = index + 1;

  // The inputs keep their own text while typing, but follow the set when it changes from
  // outside (a restored session, or the template used for a new set).
  if (source.weightKg !== set.weightKg || source.reps !== set.reps) {
    setSource({ weightKg: set.weightKg, reps: set.reps });
    if (source.weightKg !== set.weightKg) setWeight(formatNumber(set.weightKg));
    if (source.reps !== set.reps) setReps(formatNumber(set.reps));
  }

  return (
    <View style={[styles.setRow, done && styles.setRowDone]}>
      <AppText variant="label" tone="muted" style={styles.setNumber}>
        {number}
      </AppText>

      <AppText variant="caption" tone="muted" style={styles.previous} numberOfLines={1}>
        {previous
          ? `${formatNumber(previous.weightKg) || 0} × ${previous.reps}`
          : t('logger.noPrevious')}
      </AppText>

      <TextInput
        value={weight}
        onChangeText={(text) => {
          setWeight(text);
          onChange({ weightKg: parseDecimal(text) });
        }}
        keyboardType="decimal-pad"
        placeholder={t('logger.weightColumn')}
        placeholderTextColor={colors.textMuted}
        selectionColor={colors.accent}
        selectTextOnFocus
        aria-label={t('logger.weightLabel', { number, name: exerciseName })}
        style={styles.input}
      />

      <TextInput
        value={reps}
        onChangeText={(text) => {
          setReps(text);
          onChange({ reps: Math.round(parseDecimal(text)) });
        }}
        keyboardType="number-pad"
        returnKeyType="done"
        onSubmitEditing={() => {
          if (!done) onToggle();
        }}
        placeholder={t('logger.repsColumn')}
        placeholderTextColor={colors.textMuted}
        selectionColor={colors.accent}
        selectTextOnFocus
        aria-label={t('logger.repsLabel', { number, name: exerciseName })}
        style={styles.input}
      />

      <Pressable
        role="checkbox"
        aria-checked={done}
        aria-label={t(done ? 'logger.markUndone' : 'logger.markDone', {
          number,
          name: exerciseName,
        })}
        onPress={onToggle}
        style={[styles.check, done && styles.checkDone]}>
        <Check color={done ? colors.onAccent : colors.textMuted} size={18} strokeWidth={3} />
      </Pressable>

      <Pressable
        role="button"
        aria-label={t('logger.removeSet', { number })}
        onPress={onRemove}
        hitSlop={8}
        style={styles.removeSet}>
        <Trash2 color={colors.textMuted} size={16} />
      </Pressable>
    </View>
  );
}

type ExerciseCardProps = {
  exercise: LoggedExercise;
  previous?: PreviousPerformance;
  onAddSet: () => void;
  onRemove: () => void;
  onChangeSet: (setId: string, patch: Partial<Pick<LoggedSet, 'weightKg' | 'reps'>>) => void;
  onToggleSet: (setId: string) => void;
  onRemoveSet: (setId: string) => void;
};

export function ExerciseCard({
  exercise,
  previous,
  onAddSet,
  onRemove,
  onChangeSet,
  onToggleSet,
  onRemoveSet,
}: ExerciseCardProps) {
  const { t } = useTranslation();
  const name = getExercise(exercise.slug)?.name ?? exercise.slug;

  return (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <AppText variant="heading" role="heading" style={styles.flex} numberOfLines={1}>
          {name}
        </AppText>
        <Pressable
          role="button"
          aria-label={t('logger.removeExercise', { name })}
          onPress={onRemove}
          hitSlop={8}
          style={styles.removeExercise}>
          <Trash2 color={colors.textMuted} size={18} />
        </Pressable>
      </View>

      <View style={styles.columns} aria-hidden>
        <AppText variant="caption" tone="muted" style={styles.setNumber}>
          {t('logger.setColumn')}
        </AppText>
        <AppText variant="caption" tone="muted" style={styles.previous}>
          {t('logger.previousColumn')}
        </AppText>
        <AppText variant="caption" tone="muted" style={styles.columnLabel}>
          {t('logger.weightColumn')}
        </AppText>
        <AppText variant="caption" tone="muted" style={styles.columnLabel}>
          {t('logger.repsColumn')}
        </AppText>
        <View style={styles.columnSpacer} />
      </View>

      {exercise.sets.map((set, index) => (
        <SetRow
          key={set.id}
          set={set}
          index={index}
          exerciseName={name}
          previous={previous?.sets[index]}
          onChange={(patch) => onChangeSet(set.id, patch)}
          onToggle={() => onToggleSet(set.id)}
          onRemove={() => onRemoveSet(set.id)}
        />
      ))}

      <Button label={t('logger.addSet')} variant="secondary" onPress={onAddSet} />
    </Card>
  );
}

export function RestBar({
  endsAt,
  onExtend,
  onSkip,
}: {
  endsAt: number;
  onExtend: () => void;
  onSkip: () => void;
}) {
  const { t } = useTranslation();
  const [remaining, setRemaining] = useState(() => Math.ceil((endsAt - Date.now()) / 1000));

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(Math.ceil((endsAt - Date.now()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  return (
    <View style={styles.restBar} role="timer" aria-label={t('logger.rest')}>
      <Timer color={colors.calm} size={20} aria-hidden />
      <AppText variant="heading" tone="calm" style={styles.flex}>
        {t('logger.rest')} {formatDuration(Math.max(remaining, 0))}
      </AppText>
      <Button label={t('logger.restPlus')} variant="ghost" onPress={onExtend} />
      <Button label={t('logger.restSkip')} variant="secondary" onPress={onSkip} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  card: {
    gap: spacing.xs,
    padding: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  removeExercise: {
    cursor: 'pointer',
    minHeight: minTouchTarget,
    minWidth: minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  columns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  columnLabel: {
    width: 72,
    textAlign: 'center',
  },
  columnSpacer: {
    width: 40 + minTouchTarget - 8,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  setRowDone: {
    backgroundColor: 'rgba(200, 255, 46, 0.08)',
  },
  setNumber: {
    width: 28,
  },
  previous: {
    flex: 1,
    minWidth: 52,
  },
  input: {
    width: 72,
    minHeight: minTouchTarget,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
    color: colors.text,
    fontFamily: fonts.bodyMedium,
    fontSize: 16,
    textAlign: 'center',
  },
  check: {
    cursor: 'pointer',
    width: 40,
    height: minTouchTarget,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDone: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  removeSet: {
    cursor: 'pointer',
    width: minTouchTarget - 8,
    height: minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});
