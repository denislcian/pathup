import { Check, Timer, Trash2 } from '@/components/icons';
import { useEffect, useEffectEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, TextInput, Vibration, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { getExercise } from '@/data/exercises';
import {
  formatDuration,
  RIR_OPTIONS,
  SET_TYPES,
  setLabel,
  type LoggedExercise,
  type LoggedSet,
  type PreviousPerformance,
  type SetType,
} from '@/domain/workout';
import { colors, fonts, minTouchTarget, radius, spacing } from '@/theme/tokens';

type SetPatch = Partial<Pick<LoggedSet, 'weightKg' | 'reps' | 'type' | 'rir'>>;
type SetValues = Pick<LoggedSet, 'weightKg' | 'reps'>;

const typeColor: Record<SetType, string> = {
  warmup: colors.warning,
  normal: colors.textMuted,
  drop: colors.calm,
  failure: colors.danger,
};

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
  /** Short label for the set column: a number, or C/D/F for warm-up, drop and failure sets. */
  label: string;
  exerciseName: string;
  previous?: SetValues;
  onChange: (patch: SetPatch) => void;
  /** Returns false when the set can't be ticked yet (no reps and nothing to fall back on). */
  onToggle: (fallback?: SetValues) => boolean;
  onRemove: () => void;
};

export function SetRow({
  set,
  index,
  label,
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
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const done = set.completedAt !== null;
  const number = index + 1;

  function toggle() {
    const ok = onToggle(previous);
    setInvalid(!ok);
  }

  function change(patch: SetPatch) {
    setInvalid(false);
    onChange(patch);
  }

  // The inputs keep their own text while typing, but follow the set when it changes from
  // outside (a restored session, or the template used for a new set).
  if (source.weightKg !== set.weightKg || source.reps !== set.reps) {
    setSource({ weightKg: set.weightKg, reps: set.reps });
    if (source.weightKg !== set.weightKg) setWeight(formatNumber(set.weightKg));
    if (source.reps !== set.reps) setReps(formatNumber(set.reps));
  }

  return (
    <View style={styles.setBlock}>
      <View style={[styles.setRow, done && styles.setRowDone]}>
        <Pressable
          role="button"
          aria-expanded={optionsOpen}
          aria-label={t('logger.setOptions', {
            number,
            type: t(`logger.setTypes.${set.type}`),
          })}
          onPress={() => setOptionsOpen((open) => !open)}
          style={styles.setLabel}>
          <AppText variant="label" style={{ color: typeColor[set.type] }}>
            {label}
          </AppText>
          {set.rir !== null ? (
            <AppText variant="caption" tone="muted" style={styles.rirBadge}>
              {t('logger.rirShort', { rir: set.rir })}
            </AppText>
          ) : null}
        </Pressable>

        {previous ? (
          <Pressable
            role="button"
            aria-label={t('logger.usePrevious', {
              weight: formatNumber(previous.weightKg) || 0,
              reps: previous.reps,
            })}
            onPress={() => {
              setWeight(formatNumber(previous.weightKg));
              setReps(formatNumber(previous.reps));
              change({ weightKg: previous.weightKg, reps: previous.reps });
            }}
            style={styles.previous}>
            <AppText variant="caption" tone="muted" numberOfLines={1}>
              {`${formatNumber(previous.weightKg) || 0} × ${previous.reps}`}
            </AppText>
          </Pressable>
        ) : (
          <AppText variant="caption" tone="muted" style={styles.previous} numberOfLines={1}>
            {t('logger.noPrevious')}
          </AppText>
        )}

        <TextInput
          value={weight}
          onChangeText={(text) => {
            setWeight(text);
            change({ weightKg: parseDecimal(text) });
          }}
          keyboardType="decimal-pad"
          placeholder={previous ? formatNumber(previous.weightKg) || '0' : t('logger.weightColumn')}
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.accent}
          selectTextOnFocus
          aria-label={t('logger.weightLabel', { number, name: exerciseName })}
          style={[styles.input, invalid && styles.inputInvalid]}
        />

        <TextInput
          value={reps}
          onChangeText={(text) => {
            setReps(text);
            change({ reps: Math.round(parseDecimal(text)) });
          }}
          keyboardType="number-pad"
          returnKeyType="done"
          onSubmitEditing={() => {
            if (!done) toggle();
          }}
          placeholder={previous ? String(previous.reps) : t('logger.repsColumn')}
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.accent}
          selectTextOnFocus
          aria-label={t('logger.repsLabel', { number, name: exerciseName })}
          aria-invalid={invalid}
          style={[styles.input, invalid && styles.inputInvalid]}
        />

        <Pressable
          role="checkbox"
          aria-checked={done}
          aria-label={t(done ? 'logger.markUndone' : 'logger.markDone', {
            number,
            name: exerciseName,
          })}
          onPress={toggle}
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

      {invalid ? (
        <AppText variant="caption" tone="danger" role="alert" style={styles.invalidHint}>
          {t('logger.invalidSet')}
        </AppText>
      ) : null}

      {optionsOpen ? (
        <View style={styles.options}>
          <AppText variant="caption" tone="muted">
            {t('logger.setTypeTitle')}
          </AppText>
          <View style={styles.chips} role="radiogroup" aria-label={t('logger.setTypeTitle')}>
            {SET_TYPES.map((type) => (
              <Chip
                key={type}
                role="radio"
                label={t(`logger.setTypes.${type}`)}
                selected={set.type === type}
                onPress={() => change({ type })}
              />
            ))}
          </View>
          <AppText variant="caption" tone="muted">
            {t('logger.rirTitle')}
          </AppText>
          <View style={styles.chips} role="radiogroup" aria-label={t('logger.rirTitle')}>
            <Chip
              role="radio"
              label={t('logger.rirNone')}
              selected={set.rir === null}
              onPress={() => change({ rir: null })}
            />
            {RIR_OPTIONS.map((rir) => (
              <Chip
                key={rir}
                role="radio"
                label={rir === 5 ? '5+' : String(rir)}
                selected={set.rir === rir}
                onPress={() => change({ rir })}
              />
            ))}
          </View>
          <AppText variant="caption" tone="muted">
            {t('logger.rirHint')}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

type ExerciseCardProps = {
  exercise: LoggedExercise;
  previous?: PreviousPerformance;
  onAddSet: () => void;
  onRemove: () => void;
  onChangeSet: (setId: string, patch: SetPatch) => void;
  onToggleSet: (setId: string, fallback?: SetValues) => boolean;
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
        <AppText variant="caption" tone="muted" style={styles.setNumber} numberOfLines={1}>
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
          label={setLabel(exercise.sets, index)}
          exerciseName={name}
          previous={previous?.sets[index]}
          onChange={(patch) => onChangeSet(set.id, patch)}
          onToggle={(fallback) => onToggleSet(set.id, fallback)}
          onRemove={() => onRemoveSet(set.id)}
        />
      ))}

      <Button label={t('logger.addSet')} variant="secondary" onPress={onAddSet} />
    </Card>
  );
}

/** Two short pulses: noticeable in a pocket, not alarming. */
const REST_DONE_VIBRATION = [0, 250, 150, 250];
/** How long "rest is over" stays on screen before the bar goes away. */
const REST_DONE_VISIBLE_MS = 5000;

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
  const finished = remaining <= 0;

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(Math.ceil((endsAt - Date.now()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  const onFinished = useEffectEvent(() => {
    // A rest that ran out long ago (the app was closed) just goes away, without buzzing.
    if (Date.now() - endsAt > REST_DONE_VISIBLE_MS) {
      onSkip();
      return undefined;
    }
    Vibration.vibrate(REST_DONE_VIBRATION);
    const timeout = setTimeout(onSkip, REST_DONE_VISIBLE_MS);
    return () => clearTimeout(timeout);
  });

  useEffect(() => {
    if (finished) return onFinished();
  }, [finished]);

  return (
    <View
      style={[styles.restBar, finished && styles.restBarDone]}
      role="timer"
      aria-live={finished ? 'assertive' : 'off'}
      aria-label={t('logger.rest')}>
      <Timer color={finished ? colors.accent : colors.calm} size={20} aria-hidden />
      <AppText variant="heading" tone={finished ? 'accent' : 'calm'} style={styles.flex}>
        {finished
          ? t('logger.restDone')
          : `${t('logger.rest')} ${formatDuration(Math.max(remaining, 0))}`}
      </AppText>
      {finished ? (
        <Button label={t('logger.restClose')} variant="secondary" onPress={onSkip} />
      ) : (
        <>
          <Button label={t('logger.restPlus')} variant="ghost" onPress={onExtend} />
          <Button label={t('logger.restSkip')} variant="secondary" onPress={onSkip} />
        </>
      )}
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
  setBlock: {
    gap: spacing.xs,
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
    backgroundColor: colors.accentSoft,
  },
  setNumber: {
    width: 34,
  },
  setLabel: {
    cursor: 'pointer',
    width: 34,
    minHeight: minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
  },
  rirBadge: {
    fontSize: 11,
    lineHeight: 14,
  },
  previous: {
    flex: 1,
    minWidth: 52,
    minHeight: minTouchTarget,
    justifyContent: 'center',
    cursor: 'pointer',
  },
  inputInvalid: {
    borderColor: colors.danger,
  },
  invalidHint: {
    paddingHorizontal: spacing.xs,
  },
  options: {
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
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
  restBarDone: {
    borderTopColor: colors.accent,
    backgroundColor: colors.surfaceRaised,
  },
});
