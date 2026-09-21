import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { ChevronLeft, ChevronRight, CloudOff } from '@/components/icons';
import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { useHover } from '@/components/ui/use-hover';
import { getExercise } from '@/data/exercises';
import { localDayKey, monthGrid } from '@/domain/progress';
import {
  countCompletedSets,
  formatDuration,
  workoutDurationSeconds,
  workoutVolumeKg,
  type Workout,
} from '@/domain/workout';
import { formatKg, formatMediumDate, formatMonth, weekdayInitials } from '@/lib/format';
import { colors, minTouchTarget, radius, spacing } from '@/theme/tokens';

/** One number with its label: "3 · entrenos esta semana". */
export function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card style={styles.tile}>
      <AppText variant="caption" tone="muted">
        {label}
      </AppText>
      <AppText variant="title">{value}</AppText>
      {hint ? (
        <AppText variant="caption" tone="muted">
          {hint}
        </AppText>
      ) : null}
    </Card>
  );
}

export function StatRow({ children }: { children: ReactNode }) {
  return <View style={styles.statRow}>{children}</View>;
}

/** A row of the history: tap to open the session. */
export function WorkoutCard({ workout, pending = false }: { workout: Workout; pending?: boolean }) {
  const { t, i18n } = useTranslation();
  const { hovered, hoverProps } = useHover();
  const names = workout.exercises.map(
    (exercise) => getExercise(exercise.slug)?.name ?? exercise.slug,
  );
  const shown = names.slice(0, 3).join(' · ');
  const more = names.length - 3;
  const date = formatMediumDate(workout.startedAt, i18n.language);

  return (
    <Pressable
      role="link"
      aria-label={t('history.openWorkout', { name: workout.name, date })}
      onPress={() => router.push({ pathname: '/historial/[id]', params: { id: workout.id } })}
      {...hoverProps}
      style={({ pressed }) => [
        styles.workoutCard,
        hovered && styles.workoutCardHovered,
        pressed && styles.pressed,
      ]}>
      <View style={styles.workoutHeader}>
        <AppText variant="heading" style={styles.flex} numberOfLines={1}>
          {workout.name}
        </AppText>
        <AppText variant="caption" tone="muted">
          {date}
        </AppText>
      </View>
      <AppText tone="muted" numberOfLines={1}>
        {shown}
        {more > 0 ? ` ${t('history.more', { count: more })}` : ''}
      </AppText>
      <View style={styles.workoutStats}>
        <AppText variant="label">{formatDuration(workoutDurationSeconds(workout))}</AppText>
        <AppText variant="label">{formatKg(workoutVolumeKg(workout), i18n.language)}</AppText>
        <AppText variant="label">
          {t('summary.setsCount', { count: countCompletedSets(workout) })}
        </AppText>
        {pending ? (
          <View style={styles.pendingBadge}>
            <CloudOff color={colors.warning} size={14} aria-hidden />
            <AppText variant="caption" tone="muted">
              {t('history.pending')}
            </AppText>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

type CalendarProps = {
  days: Set<string>;
  selected: string | null;
  onSelect: (day: string | null) => void;
  today?: Date;
};

/** Month view that marks the days you trained. Tap a marked day to see only that day. */
export function TrainingCalendar({ days, selected, onSelect, today = new Date() }: CalendarProps) {
  const { t, i18n } = useTranslation();
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const weeks = monthGrid(month.getFullYear(), month.getMonth());
  const todayKey = localDayKey(today);
  const trainedThisMonth = weeks.flat().filter((day) => day && days.has(localDayKey(day))).length;

  function shift(delta: number) {
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));
  }

  const isCurrentMonth =
    month.getFullYear() === today.getFullYear() && month.getMonth() === today.getMonth();

  return (
    <Card style={styles.calendar}>
      <View style={styles.calendarHeader}>
        <Pressable
          role="button"
          aria-label={t('history.previousMonth')}
          onPress={() => shift(-1)}
          style={styles.navButton}>
          <ChevronLeft color={colors.text} size={20} />
        </Pressable>
        <View style={styles.monthTitle}>
          <AppText variant="heading" role="heading">
            {formatMonth(month, i18n.language)}
          </AppText>
          <AppText variant="caption" tone="muted">
            {t('history.daysTrained', { count: trainedThisMonth })}
          </AppText>
        </View>
        <Pressable
          role="button"
          aria-label={t('history.nextMonth')}
          aria-disabled={isCurrentMonth}
          disabled={isCurrentMonth}
          onPress={() => shift(1)}
          style={[styles.navButton, isCurrentMonth && styles.disabled]}>
          <ChevronRight color={colors.text} size={20} />
        </Pressable>
      </View>

      <View style={styles.week} aria-hidden>
        {weekdayInitials(i18n.language).map((initial, index) => (
          <AppText key={index} variant="caption" tone="muted" style={styles.weekday}>
            {initial}
          </AppText>
        ))}
      </View>

      {weeks.map((week, weekIndex) => (
        <View key={weekIndex} style={styles.week}>
          {week.map((day, dayIndex) => {
            if (!day) return <View key={dayIndex} style={styles.day} />;
            const key = localDayKey(day);
            const trained = days.has(key);
            const isSelected = selected === key;
            return (
              <Pressable
                key={dayIndex}
                role="button"
                disabled={!trained}
                aria-disabled={!trained}
                aria-pressed={trained ? isSelected : undefined}
                aria-label={`${formatMediumDate(day, i18n.language)}${
                  trained ? `, ${t('history.trainedDay')}` : ''
                }`}
                onPress={() => onSelect(isSelected ? null : key)}
                style={[
                  styles.day,
                  trained && styles.dayTrained,
                  isSelected && styles.daySelected,
                  key === todayKey && styles.dayToday,
                ]}>
                <AppText
                  variant="label"
                  style={{
                    color: isSelected ? colors.onAccent : trained ? colors.text : colors.textMuted,
                  }}>
                  {day.getDate()}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  statRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tile: {
    flexGrow: 1,
    flexBasis: 140,
    padding: spacing.md,
    gap: 2,
  },
  workoutCard: {
    cursor: 'pointer',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs,
  },
  workoutCardHovered: {
    borderColor: colors.textMuted,
  },
  pressed: {
    opacity: 0.85,
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  workoutStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: spacing.md,
    rowGap: spacing.xs,
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  calendar: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  monthTitle: {
    flex: 1,
    alignItems: 'center',
  },
  navButton: {
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
  week: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
  },
  day: {
    flex: 1,
    aspectRatio: 1,
    maxHeight: 48,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayTrained: {
    cursor: 'pointer',
    backgroundColor: colors.accentSoft,
  },
  daySelected: {
    backgroundColor: colors.accent,
  },
  dayToday: {
    borderWidth: 1,
    borderColor: colors.textMuted,
  },
});
