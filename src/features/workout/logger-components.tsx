import { Link } from 'expo-router';

import { Check, Ellipsis, Timer, Trash2 } from '@/components/icons';
import { useEffect, useEffectEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, TextInput, Vibration, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { EXERCISES, getExercise } from '@/data/exercises';
import { alternativesFor, type Equipment } from '@/domain/exercises';
import { plateLoad } from '@/domain/plates';
import {
  formatDuration,
  NOTE_MAX_LENGTH,
  previousSetFor,
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
          <View style={styles.previous}>
            <AppText variant="caption" tone="muted" numberOfLines={1}>
              {t('logger.noPrevious')}
            </AppText>
          </View>
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
  /** Equipment the user has, to offer only alternatives they can do. */
  available?: Set<Equipment> | null;
  /** Beginner mode: the key technique cue stays visible under the name. */
  beginner?: boolean;
  onAddSet: () => void;
  onRemove: () => void;
  onChangeSet: (setId: string, patch: SetPatch) => void;
  onToggleSet: (setId: string, fallback?: SetValues) => boolean;
  onRemoveSet: (setId: string) => void;
  onSwap: (slug: string) => boolean;
  onNote: (note: string) => void;
};

export function ExerciseCard({
  exercise,
  previous,
  available,
  beginner = false,
  onAddSet,
  onRemove,
  onChangeSet,
  onToggleSet,
  onRemoveSet,
  onSwap,
  onNote,
}: ExerciseCardProps) {
  const { t } = useTranslation();
  const details = getExercise(exercise.slug);
  const name = details?.name ?? exercise.slug;
  const [panel, setPanel] = useState<'menu' | 'swap' | null>(null);
  const [noteOpen, setNoteOpen] = useState(false);
  const started = exercise.sets.some((set) => set.completedAt !== null);
  const alternatives = details ? alternativesFor(details, EXERCISES, available) : [];
  const subtitle = [
    exercise.target
      ? t('logger.target', {
          reps:
            exercise.target.repMin === exercise.target.repMax
              ? exercise.target.repMin
              : `${exercise.target.repMin}-${exercise.target.repMax}`,
        })
      : null,
    exercise.hint,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.flex}>
          <Link href={{ pathname: '/ejercicios/[slug]', params: { slug: exercise.slug } }}>
            <AppText variant="heading" role="heading" numberOfLines={1}>
              {name}
            </AppText>
          </Link>
          {subtitle ? (
            <AppText variant="caption" tone="muted">
              {subtitle}
            </AppText>
          ) : null}
          {beginner && details?.cues[0] ? (
            <AppText variant="caption" tone="calm">
              {t('logger.keyCue', { cue: details.cues[0] })}
            </AppText>
          ) : null}
        </View>
        <Pressable
          role="button"
          aria-label={t('logger.exerciseActions', { name })}
          aria-expanded={panel !== null}
          onPress={() => setPanel((current) => (current ? null : 'menu'))}
          hitSlop={8}
          style={styles.removeExercise}>
          <Ellipsis color={colors.textMuted} size={20} />
        </Pressable>
      </View>

      {panel === 'menu' ? (
        <View style={styles.menu}>
          <Button
            label={t('logger.swap')}
            variant="ghost"
            disabled={started || alternatives.length === 0}
            onPress={() => setPanel('swap')}
          />
          <Button
            label={exercise.note ? t('logger.editNote') : t('logger.addNote')}
            variant="ghost"
            onPress={() => {
              setNoteOpen(true);
              setPanel(null);
            }}
          />
          <Pressable
            role="button"
            aria-label={t('logger.removeExercise', { name })}
            onPress={onRemove}
            style={styles.menuDanger}>
            <Trash2 color={colors.danger} size={16} aria-hidden />
            <AppText variant="label" tone="danger">
              {t('logger.remove')}
            </AppText>
          </Pressable>
          {started ? (
            <AppText variant="caption" tone="muted" style={styles.menuHint}>
              {t('logger.swapLocked')}
            </AppText>
          ) : null}
        </View>
      ) : null}

      {panel === 'swap' ? (
        <View style={styles.swap}>
          <AppText variant="caption" tone="muted">
            {t('logger.swapTitle', { name })}
          </AppText>
          {alternatives.map((alternative) => (
            <Pressable
              key={alternative.slug}
              role="button"
              aria-label={t('logger.swapTo', { name: alternative.name })}
              onPress={() => {
                if (onSwap(alternative.slug)) setPanel(null);
              }}
              style={styles.swapRow}>
              <View style={styles.flex}>
                <AppText variant="label">{alternative.name}</AppText>
                <AppText variant="caption" tone="muted">
                  {alternative.primaryMuscles.map((muscle) => t(`muscles.${muscle}`)).join(' · ')}
                </AppText>
              </View>
            </Pressable>
          ))}
          <Button label={t('logger.cancel')} variant="ghost" onPress={() => setPanel(null)} />
        </View>
      ) : null}

      {noteOpen || exercise.note ? (
        <TextInput
          value={exercise.note ?? ''}
          onChangeText={onNote}
          onBlur={() => setNoteOpen(false)}
          autoFocus={noteOpen && !exercise.note}
          multiline
          maxLength={NOTE_MAX_LENGTH}
          placeholder={t('logger.notePlaceholder')}
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.accent}
          aria-label={t('logger.noteLabel', { name })}
          style={styles.note}
        />
      ) : null}

      <View style={styles.columns} aria-hidden>
        <AppText variant="caption" tone="muted" style={styles.setNumber} numberOfLines={1}>
          {t('logger.setColumn')}
        </AppText>
        <AppText variant="caption" tone="muted" style={styles.previousHeader}>
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
          previous={previousSetFor(exercise.sets, index, previous)}
          onChange={(patch) => onChangeSet(set.id, patch)}
          onToggle={(fallback) => onToggleSet(set.id, fallback)}
          onRemove={() => onRemoveSet(set.id)}
        />
      ))}

      {details?.equipment.includes('barbell') ? (
        <PlateHint weightKg={nextSetWeight(exercise, previous)} />
      ) : null}

      <Button label={t('logger.addSet')} variant="secondary" onPress={onAddSet} />
    </Card>
  );
}

/** The weight of the next set to do: what is typed, or else last time's, which a tick would copy. */
function nextSetWeight(exercise: LoggedExercise, previous?: PreviousPerformance): number {
  const index = exercise.sets.findIndex((set) => set.completedAt === null);
  if (index === -1) return 0;
  const typed = exercise.sets[index]!.weightKg;
  return typed > 0 ? typed : (previousSetFor(exercise.sets, index, previous)?.weightKg ?? 0);
}

/**
 * Plates per side for the next set, so nobody does sums between sets. Drawn like the end of a
 * bar: the heavier the plate, the taller.
 */
function PlateHint({ weightKg }: { weightKg: number }) {
  const { t, i18n } = useTranslation();
  if (weightKg <= 0) return null;

  const kg = (value: number) =>
    new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 2 }).format(value);
  const load = plateLoad(weightKg);

  return (
    <View style={styles.plates}>
      {load.kind === 'plates' ? (
        <>
          <AppText variant="caption" tone="muted">
            {t('logger.platesFor', { weight: kg(weightKg) })}
          </AppText>
          <View style={styles.plateRow}>
            {load.perSide.map((plate, index) => (
              <View key={index} style={[styles.plate, { height: 14 + Math.min(plate, 20) * 1.1 }]}>
                <AppText style={styles.plateText}>{kg(plate)}</AppText>
              </View>
            ))}
            <AppText variant="caption" tone="muted">
              {t('logger.platesBar', { bar: kg(load.barKg) })}
            </AppText>
          </View>
          {load.shortPerSideKg > 0 ? (
            <AppText variant="caption" tone="warning">
              {t('logger.platesShort', { kg: kg(load.shortPerSideKg) })}
            </AppText>
          ) : null}
        </>
      ) : (
        <AppText variant="caption" tone="muted">
          {load.kind === 'bar-only'
            ? t('logger.platesBarOnly', { bar: kg(load.barKg) })
            : t('logger.platesBelowBar', { weight: kg(weightKg), bar: kg(load.barKg) })}
        </AppText>
      )}
    </View>
  );
}

/** Shown once per session in beginner mode: how the logger works, in three lines. */
export function BeginnerTips({ onDismiss }: { onDismiss: () => void }) {
  const { t } = useTranslation();
  return (
    <Card style={styles.tips}>
      <AppText variant="heading" role="heading" tone="calm">
        {t('logger.tipsTitle')}
      </AppText>
      <AppText>• {t('logger.tipTick')}</AppText>
      <AppText>• {t('logger.tipPrevious')}</AppText>
      <AppText>• {t('logger.tipRir')}</AppText>
      <Button label={t('logger.tipsDismiss')} variant="secondary" onPress={onDismiss} />
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
  plates: {
    gap: spacing.xs,
    paddingTop: spacing.xs,
  },
  plateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 3,
  },
  plate: {
    minWidth: 30,
    paddingHorizontal: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plateText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    lineHeight: 14,
  },
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
  menu: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceRaised,
  },
  menuDanger: {
    cursor: 'pointer',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: minTouchTarget,
    paddingHorizontal: spacing.md,
  },
  menuHint: {
    flexBasis: '100%',
    paddingHorizontal: spacing.sm,
  },
  swap: {
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceRaised,
  },
  swapRow: {
    cursor: 'pointer',
    minHeight: minTouchTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.surface2,
  },
  note: {
    minHeight: minTouchTarget,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 14,
  },
  tips: {
    borderColor: colors.calm,
    padding: spacing.md,
    gap: spacing.xs,
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
  previousHeader: {
    flex: 1,
    minWidth: 52,
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
