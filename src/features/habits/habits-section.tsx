import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { Check, Minus, Plus, Trash2 } from '@/components/icons';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { TextField } from '@/components/ui/text-field';
import {
  countOn,
  HABIT_LIMITS,
  HABIT_SUGGESTIONS,
  habitStreak,
  nextCount,
  recentDays,
  todayProgress,
  validateHabit,
  type Habit,
  type HabitIssue,
  type HabitLog,
} from '@/domain/habits';
import { useDeleteHabit, useHabits, useLogHabit, useSaveHabit } from '@/features/habits/habits-api';
import { createId } from '@/features/workout/ids';
import { colors, minTouchTarget, radius, spacing } from '@/theme/tokens';

/** "Hábitos de hoy" on the wellness tab: tick them, count them and keep the streak. */
export function HabitsSection({ today }: { today: string }) {
  const { t } = useTranslation();
  const query = useHabits();
  const log = useLogHabit();
  const save = useSaveHabit();
  const [creating, setCreating] = useState(false);

  const habits = query.data?.habits ?? [];
  const logs = query.data?.logs ?? [];
  const progress = todayProgress(habits, logs, today);
  const nextPosition = habits.reduce((max, habit) => Math.max(max, habit.position + 1), 0);

  function addSuggestion(key: string, target: number) {
    save.mutate({
      id: createId(),
      name: t(`habits.suggestions.${key}.name` as 'habits.suggestions.water.name'),
      unit:
        target > 1 ? t(`habits.suggestions.${key}.unit` as 'habits.suggestions.water.unit') : null,
      target,
      position: nextPosition,
    });
  }

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.flex}>
          <AppText variant="heading" role="heading">
            {t('habits.title')}
          </AppText>
          {habits.length > 0 ? (
            <AppText variant="caption" tone="muted">
              {t('habits.progress', { done: progress.done, total: progress.total })}
            </AppText>
          ) : null}
        </View>
        {habits.length > 0 && habits.length < HABIT_LIMITS.habits && !creating ? (
          <Button label={t('habits.new')} variant="ghost" onPress={() => setCreating(true)} />
        ) : null}
      </View>

      {query.isPending ? (
        <AppText tone="muted">{t('habits.loading')}</AppText>
      ) : habits.length === 0 && !creating ? (
        <View style={styles.empty}>
          <AppText tone="muted">{t('habits.empty')}</AppText>
          <View style={styles.chips}>
            {HABIT_SUGGESTIONS.map((suggestion) => (
              <Chip
                key={suggestion.key}
                label={t(
                  `habits.suggestions.${suggestion.key}.name` as 'habits.suggestions.water.name',
                )}
                onPress={() => addSuggestion(suggestion.key, suggestion.target)}
              />
            ))}
          </View>
          <Button label={t('habits.custom')} variant="ghost" onPress={() => setCreating(true)} />
        </View>
      ) : (
        habits.map((habit) => (
          <HabitRow
            key={habit.id}
            habit={habit}
            logs={logs}
            today={today}
            onTap={() =>
              log.mutate({
                habitId: habit.id,
                date: today,
                count: nextCount(habit, countOn(logs, habit.id, today)),
              })
            }
          />
        ))
      )}

      {creating ? (
        <HabitForm
          position={nextPosition}
          saving={save.isPending}
          onCancel={() => setCreating(false)}
          onSave={(habit) => save.mutate(habit, { onSuccess: () => setCreating(false) })}
        />
      ) : null}

      {log.isError || save.isError ? (
        <AppText variant="caption" tone="danger" role="alert">
          {t('habits.errors.save')}
        </AppText>
      ) : null}
    </Card>
  );
}

function HabitRow({
  habit,
  logs,
  today,
  onTap,
}: {
  habit: Habit;
  logs: readonly HabitLog[];
  today: string;
  onTap: () => void;
}) {
  const { t } = useTranslation();
  const remove = useDeleteHabit();
  const [confirm, setConfirm] = useState(false);
  const count = countOn(logs, habit.id, today);
  const done = count >= habit.target;
  const streak = habitStreak(habit, logs, today);
  const week = recentDays(habit, logs, today);
  const counter = habit.target > 1;

  return (
    <View style={styles.row}>
      <Pressable
        role={counter ? 'button' : 'checkbox'}
        aria-checked={counter ? undefined : done}
        aria-label={
          counter
            ? t('habits.addOne', { name: habit.name, count, target: habit.target })
            : t('habits.toggle', { name: habit.name })
        }
        onPress={onTap}
        style={[styles.tap, done && styles.tapDone]}>
        {counter && !done ? (
          <AppText variant="label" style={styles.tapText}>
            {count}/{habit.target}
          </AppText>
        ) : (
          <Check color={done ? colors.onAccent : colors.textMuted} size={20} strokeWidth={3} />
        )}
      </Pressable>

      <View style={styles.flex}>
        <AppText variant="label" numberOfLines={1}>
          {habit.name}
        </AppText>
        <AppText variant="caption" tone="muted">
          {[
            counter ? t('habits.target', { target: habit.target, unit: habit.unit ?? '' }) : null,
            streak > 0 ? t('habits.streak', { count: streak }) : null,
          ]
            .filter(Boolean)
            .join(' · ') || t('habits.noStreak')}
        </AppText>
        <View
          style={styles.week}
          aria-label={t('habits.weekLabel', { done: week.filter((day) => day.done).length })}>
          {week.map((day) => (
            <View key={day.date} style={[styles.dot, day.done && styles.dotDone]} />
          ))}
        </View>
      </View>

      {confirm ? (
        <View style={styles.confirm}>
          <Button label={t('habits.keep')} variant="ghost" onPress={() => setConfirm(false)} />
          <Button
            label={t('habits.delete')}
            variant="secondary"
            disabled={remove.isPending}
            onPress={() => remove.mutate(habit.id)}
          />
        </View>
      ) : (
        <Pressable
          role="button"
          aria-label={t('habits.deleteNamed', { name: habit.name })}
          onPress={() => setConfirm(true)}
          hitSlop={8}
          style={styles.iconButton}>
          <Trash2 color={colors.textMuted} size={16} />
        </Pressable>
      )}
    </View>
  );
}

function HabitForm({
  position,
  saving,
  onSave,
  onCancel,
}: {
  position: number;
  saving: boolean;
  onSave: (habit: Habit) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [target, setTarget] = useState(1);
  const [unit, setUnit] = useState('');
  const [issues, setIssues] = useState<HabitIssue[]>([]);

  function submit() {
    const found = validateHabit({ name, target });
    setIssues(found);
    if (found.length > 0) return;
    onSave({
      id: createId(),
      name: name.trim(),
      target,
      unit: target > 1 ? unit.trim() || null : null,
      position,
    });
  }

  return (
    <View style={styles.form}>
      <TextField
        label={t('habits.name')}
        placeholder={t('habits.namePlaceholder')}
        value={name}
        maxLength={HABIT_LIMITS.nameLength}
        onChangeText={setName}
        error={issues.includes('nameRequired') ? t('habits.errors.name') : null}
      />
      <View style={styles.targetRow}>
        <AppText variant="label" style={styles.flex}>
          {t('habits.timesPerDay')}
        </AppText>
        <Pressable
          role="button"
          aria-label={t('habits.less')}
          disabled={target <= HABIT_LIMITS.target.min}
          onPress={() => setTarget((value) => Math.max(HABIT_LIMITS.target.min, value - 1))}
          style={[styles.iconButton, target <= HABIT_LIMITS.target.min && styles.disabled]}>
          <Minus color={colors.text} size={18} />
        </Pressable>
        <AppText variant="title" style={styles.targetValue} aria-live="polite">
          {target}
        </AppText>
        <Pressable
          role="button"
          aria-label={t('habits.more')}
          disabled={target >= HABIT_LIMITS.target.max}
          onPress={() => setTarget((value) => Math.min(HABIT_LIMITS.target.max, value + 1))}
          style={[styles.iconButton, target >= HABIT_LIMITS.target.max && styles.disabled]}>
          <Plus color={colors.text} size={18} />
        </Pressable>
      </View>
      {target > 1 ? (
        <TextField
          label={t('habits.unit')}
          placeholder={t('habits.unitPlaceholder')}
          value={unit}
          maxLength={HABIT_LIMITS.unitLength}
          onChangeText={setUnit}
        />
      ) : null}
      <View style={styles.formActions}>
        <Button label={t('habits.cancel')} variant="ghost" onPress={onCancel} />
        <Button
          label={t('habits.save')}
          disabled={saving}
          aria-busy={saving}
          onPress={submit}
          style={styles.flex}
        />
      </View>
    </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  empty: {
    gap: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  tap: {
    cursor: 'pointer',
    width: minTouchTarget + 4,
    height: minTouchTarget + 4,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tapDone: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },
  tapText: {
    color: colors.text,
  },
  week: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dotDone: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  iconButton: {
    cursor: 'pointer',
    width: minTouchTarget - 8,
    height: minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
  },
  disabled: {
    opacity: 0.35,
    cursor: 'auto',
  },
  confirm: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  form: {
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceRaised,
  },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  targetValue: {
    minWidth: 32,
    textAlign: 'center',
  },
  formActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
