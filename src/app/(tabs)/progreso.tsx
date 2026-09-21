import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { ChevronRight, CloudOff, TrendingUp, Trophy } from '@/components/icons';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Columns } from '@/components/ui/columns';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { useHover } from '@/components/ui/use-hover';
import { getExercise } from '@/data/exercises';
import {
  computeRecords,
  localDayKey,
  thisWeek,
  trainingDays,
  weeklyStreak,
  type ExerciseRecords,
} from '@/domain/progress';
import { useWorkoutHistory } from '@/features/history/history-api';
import {
  StatRow,
  StatTile,
  TrainingCalendar,
  WorkoutCard,
} from '@/features/history/history-components';
import { formatKg, formatNumber } from '@/lib/format';
import { colors, minTouchTarget, radius, spacing } from '@/theme/tokens';

const PAGE = 10;
const RECORDS_SHOWN = 6;

export default function ProgressScreen() {
  const { t, i18n } = useTranslation();
  const history = useWorkoutHistory();
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [visible, setVisible] = useState(PAGE);
  const [allRecords, setAllRecords] = useState(false);

  const workouts = history.data?.workouts ?? [];
  const pendingIds = new Set(history.data?.pendingIds ?? []);

  if (history.isPending) {
    return (
      <Screen title={t('progress.title')} subtitle={t('progress.subtitle')}>
        <AppText tone="muted">{t('progress.loading')}</AppText>
      </Screen>
    );
  }

  if (workouts.length === 0) {
    return (
      <Screen title={t('progress.title')} subtitle={t('progress.subtitle')}>
        <EmptyState
          icon={TrendingUp}
          title={t('progress.empty')}
          description={t('progress.emptyDescription')}
          actionLabel={t('progress.startWorkout')}
          onAction={() => router.push('/entreno')}
        />
      </Screen>
    );
  }

  const week = thisWeek(workouts);
  const streak = weeklyStreak(workouts);
  const days = trainingDays(workouts);
  const listed = selectedDay
    ? workouts.filter((workout) => localDayKey(new Date(workout.startedAt)) === selectedDay)
    : workouts.slice(0, visible);

  // Exercises you trained most recently first: the records you care about today.
  const records = computeRecords(workouts);
  const recentSlugs = [
    ...new Set(workouts.flatMap((workout) => workout.exercises.map((exercise) => exercise.slug))),
  ].filter((slug) => records[slug]);
  const shownSlugs = allRecords ? recentSlugs : recentSlugs.slice(0, RECORDS_SHOWN);

  return (
    <Screen wide title={t('progress.title')} subtitle={t('progress.subtitle')}>
      {history.data?.offline ? (
        <Card style={styles.offline}>
          <View style={styles.row}>
            <CloudOff color={colors.warning} size={18} aria-hidden />
            <AppText variant="label" style={styles.flex}>
              {t('progress.offline')}
            </AppText>
          </View>
        </Card>
      ) : null}

      <StatRow>
        <StatTile
          label={t('progress.thisWeek')}
          value={t('progress.workoutsCount', { count: week.workouts })}
          hint={week.volumeKg > 0 ? formatKg(week.volumeKg, i18n.language) : undefined}
        />
        <StatTile
          label={t('progress.streak')}
          value={t('progress.weeksCount', { count: streak })}
          hint={t('progress.streakHint')}
        />
        <StatTile
          label={t('progress.total')}
          value={t('progress.workoutsCount', { count: workouts.length })}
        />
      </StatRow>

      <Columns>
        {[
          <View key="side" style={styles.stack}>
            <TrainingCalendar days={days} selected={selectedDay} onSelect={setSelectedDay} />

            <Card style={styles.records}>
              <View style={styles.row}>
                <Trophy color={colors.accent} size={18} aria-hidden />
                <AppText variant="heading" role="heading" style={styles.flex}>
                  {t('progress.recordsTitle')}
                </AppText>
              </View>
              {shownSlugs.map((slug) => (
                <RecordRow key={slug} slug={slug} records={records[slug]} />
              ))}
              {recentSlugs.length > RECORDS_SHOWN ? (
                <Button
                  variant="ghost"
                  label={allRecords ? t('progress.showLess') : t('progress.showAllRecords')}
                  onPress={() => setAllRecords((value) => !value)}
                />
              ) : null}
            </Card>
          </View>,

          <View key="history" style={styles.stack}>
            <View style={styles.row}>
              <AppText variant="heading" role="heading" style={styles.flex}>
                {selectedDay
                  ? t('progress.historyForDay', {
                      date: new Intl.DateTimeFormat(i18n.language, {
                        day: 'numeric',
                        month: 'long',
                      }).format(new Date(`${selectedDay}T12:00:00`)),
                    })
                  : t('progress.historyTitle')}
              </AppText>
              {selectedDay ? (
                <Button
                  variant="ghost"
                  label={t('progress.showAll')}
                  onPress={() => setSelectedDay(null)}
                />
              ) : null}
            </View>
            {listed.map((workout) => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                pending={pendingIds.has(workout.id)}
              />
            ))}
            {!selectedDay && workouts.length > visible ? (
              <Button
                variant="secondary"
                label={t('progress.showMore')}
                onPress={() => setVisible((count) => count + PAGE)}
              />
            ) : null}
          </View>,
        ]}
      </Columns>
    </Screen>
  );
}

function RecordRow({ slug, records }: { slug: string; records: ExerciseRecords }) {
  const { t, i18n } = useTranslation();
  const { hovered, hoverProps } = useHover();
  const name = getExercise(slug)?.name ?? slug;
  const parts = [
    records.e1rm
      ? t('progress.recordE1rm', { value: formatKg(records.e1rm.value, i18n.language) })
      : null,
    records.weight
      ? t('progress.recordWeight', {
          value: formatKg(records.weight.weightKg, i18n.language),
          reps: records.weight.reps,
        })
      : null,
    records.reps
      ? t('progress.recordReps', { value: formatNumber(records.reps.value, i18n.language) })
      : null,
  ].filter(Boolean);

  return (
    <Pressable
      role="link"
      aria-label={`${name}. ${parts.join('. ')}`}
      onPress={() => router.push({ pathname: '/ejercicios/[slug]', params: { slug } })}
      {...hoverProps}
      style={[styles.recordRow, hovered && styles.recordRowHovered]}>
      <View style={styles.flex}>
        <AppText variant="label" numberOfLines={1}>
          {name}
        </AppText>
        <AppText variant="caption" tone="muted" numberOfLines={2}>
          {parts.join(' · ')}
        </AppText>
      </View>
      <ChevronRight color={colors.textMuted} size={18} aria-hidden />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  stack: {
    gap: spacing.md,
  },
  offline: {
    borderColor: colors.warning,
    padding: spacing.md,
  },
  records: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  recordRow: {
    cursor: 'pointer',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: minTouchTarget,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    marginHorizontal: -spacing.sm,
    borderRadius: radius.sm,
  },
  recordRowHovered: {
    backgroundColor: colors.surface2,
  },
});
