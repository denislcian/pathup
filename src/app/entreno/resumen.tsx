import { Redirect, router } from 'expo-router';
import { CloudOff, CloudUpload, Trophy } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { getExercise } from '@/data/exercises';
import {
  bestSet,
  countCompletedSets,
  formatDuration,
  workoutDurationSeconds,
  workoutVolumeKg,
} from '@/domain/workout';
import { useFinishedWorkout } from '@/features/workout/finished-workout-store';
import { colors, spacing } from '@/theme/tokens';

export default function WorkoutSummaryScreen() {
  const { t, i18n } = useTranslation();
  const workout = useFinishedWorkout((state) => state.workout);
  const synced = useFinishedWorkout((state) => state.synced);
  const clear = useFinishedWorkout((state) => state.clear);

  if (!workout) return <Redirect href="/entreno" />;

  function done() {
    clear();
    router.replace('/entreno');
  }

  const sets = countCompletedSets(workout);
  if (sets === 0) {
    return (
      <Screen insetTop={false} footer={<Button label={t('summary.done')} onPress={done} />}>
        <EmptyState
          icon={CloudOff}
          title={t('summary.empty')}
          description={t('summary.emptyDescription')}
        />
      </Screen>
    );
  }

  const date = new Intl.DateTimeFormat(i18n.language, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(workout.startedAt));

  return (
    <Screen
      insetTop={false}
      title={t('summary.title')}
      subtitle={date}
      footer={<Button label={t('summary.done')} onPress={done} />}>
      <Card style={styles.stats}>
        <Stat
          label={t('summary.duration')}
          value={formatDuration(workoutDurationSeconds(workout))}
        />
        <Stat label={t('summary.volume')} value={`${workoutVolumeKg(workout)} kg`} />
        <Stat label={t('summary.sets')} value={String(sets)} />
      </Card>

      <View style={styles.sync}>
        {synced ? (
          <CloudUpload color={colors.accent} size={18} aria-hidden />
        ) : (
          <CloudOff color={colors.warning} size={18} aria-hidden />
        )}
        <AppText variant="label" tone={synced ? 'accent' : 'muted'} style={styles.flex}>
          {synced ? t('summary.synced') : t('summary.queued')}
        </AppText>
      </View>

      {workout.exercises.map((exercise) => {
        const best = bestSet(exercise.sets);
        return (
          <Card key={exercise.id}>
            <AppText variant="heading" role="heading">
              {getExercise(exercise.slug)?.name ?? exercise.slug}
            </AppText>
            <AppText tone="muted">
              {t('summary.setsCount', { count: exercise.sets.length })}
            </AppText>
            {best ? (
              <View style={styles.best}>
                <Trophy color={colors.accent} size={16} aria-hidden />
                <AppText variant="label">
                  {t('summary.best')}: {best.weightKg} kg × {best.reps}
                </AppText>
              </View>
            ) : null}
          </Card>
        );
      })}
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <AppText variant="caption" tone="muted">
        {label}
      </AppText>
      <AppText variant="title">{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  stat: {
    gap: 2,
  },
  sync: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  best: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
