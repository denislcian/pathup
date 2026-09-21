import { Link, router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { CloudOff, Trophy } from '@/components/icons';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Columns } from '@/components/ui/columns';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { useEscapeKey } from '@/components/ui/use-escape-key';
import { getExercise } from '@/data/exercises';
import { estimateOneRepMax } from '@/domain/one-rep-max';
import { detectRecords } from '@/domain/progress';
import { routineFromWorkout } from '@/domain/routines';
import {
  countCompletedSets,
  formatDuration,
  setLabel,
  workoutDurationSeconds,
  workoutToTemplate,
  workoutVolumeKg,
} from '@/domain/workout';
import { useDeleteWorkout, useWorkoutHistory } from '@/features/history/history-api';
import { RecordList } from '@/features/history/record-list';
import { useRoutineDraft } from '@/features/routines/routine-draft-store';
import { nextRoutinePosition } from '@/features/routines/routine-list';
import { useRoutines } from '@/features/routines/routines-api';
import { useActiveWorkout } from '@/features/workout/active-workout-store';
import { createId } from '@/features/workout/ids';
import { formatKg, formatLongDate } from '@/lib/format';
import { colors, spacing } from '@/theme/tokens';

export default function WorkoutDetailScreen() {
  const { t, i18n } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const history = useWorkoutHistory();
  const remove = useDeleteWorkout();
  const routines = useRoutines();
  const active = useActiveWorkout((state) => state.workout);
  const [confirmDelete, setConfirmDelete] = useState(false);
  useEscapeKey(() => setConfirmDelete(false), confirmDelete);

  const workouts = history.data?.workouts ?? [];
  const workout = workouts.find((item) => item.id === id);

  if (history.isPending) {
    return (
      <Screen insetTop={false}>
        <AppText tone="muted">{t('progress.loading')}</AppText>
      </Screen>
    );
  }

  if (!workout) {
    return (
      <Screen insetTop={false}>
        <EmptyState
          icon={CloudOff}
          title={t('history.notFound')}
          description={t('history.notFoundDescription')}
          actionLabel={t('history.backToProgress')}
          onAction={() => router.replace('/progreso')}
        />
      </Screen>
    );
  }

  const records = detectRecords(workouts, workout);
  const time = new Intl.DateTimeFormat(i18n.language, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(workout.startedAt));

  function repeat() {
    if (!workout) return;
    useActiveWorkout.getState().startFrom(workoutToTemplate(workout));
    router.push('/entreno/activo');
  }

  function saveAsRoutine() {
    if (!workout) return;
    const position = nextRoutinePosition(routines.data?.routines ?? []);
    useRoutineDraft.getState().open(routineFromWorkout(workout, createId, position), false);
    router.push('/rutinas/editar');
  }

  const footer = confirmDelete ? (
    <View style={styles.footer}>
      <Button
        label={t('history.keep')}
        variant="secondary"
        onPress={() => setConfirmDelete(false)}
        style={styles.footerButton}
      />
      <Button
        label={t('history.delete')}
        disabled={remove.isPending}
        aria-busy={remove.isPending}
        onPress={() =>
          remove.mutate(workout.id, {
            onSuccess: () => router.replace('/progreso'),
          })
        }
        style={styles.footerButton}
      />
    </View>
  ) : (
    <View style={styles.footer}>
      <Button label={t('history.delete')} variant="ghost" onPress={() => setConfirmDelete(true)} />
      {active ? (
        <Button
          label={t('workout.activeContinue')}
          variant="secondary"
          onPress={() => router.push('/entreno/activo')}
          style={styles.footerButton}
        />
      ) : (
        <Button label={t('history.repeat')} onPress={repeat} style={styles.footerButton} />
      )}
    </View>
  );

  return (
    <Screen
      wide
      insetTop={false}
      title={workout.name}
      subtitle={`${formatLongDate(workout.startedAt, i18n.language)} · ${time}`}
      footer={footer}>
      <Stack.Screen options={{ title: workout.name }} />

      {confirmDelete ? (
        <Card style={styles.warning}>
          <AppText variant="heading" role="heading">
            {t('history.deleteTitle')}
          </AppText>
          <AppText tone="muted">{t('history.deleteBody')}</AppText>
          {remove.isError ? (
            <AppText tone="danger" role="alert">
              {t('history.deleteError')}
            </AppText>
          ) : null}
        </Card>
      ) : null}

      {active && !confirmDelete ? (
        <AppText variant="caption" tone="muted">
          {t('history.activeHint')}
        </AppText>
      ) : null}

      <Card style={styles.stats}>
        <Stat
          label={t('summary.duration')}
          value={formatDuration(workoutDurationSeconds(workout))}
        />
        <Stat
          label={t('summary.volume')}
          value={formatKg(workoutVolumeKg(workout), i18n.language)}
        />
        <Stat label={t('summary.sets')} value={String(countCompletedSets(workout))} />
      </Card>

      {records.length > 0 ? (
        <Card style={styles.records}>
          <View style={styles.row}>
            <Trophy color={colors.accent} size={18} aria-hidden />
            <AppText variant="heading" role="heading">
              {t('records.title', { count: records.length })}
            </AppText>
          </View>
          <RecordList records={records} />
        </Card>
      ) : null}

      <Button
        label={t('history.saveAsRoutine')}
        variant="secondary"
        onPress={saveAsRoutine}
        style={styles.saveRoutine}
      />

      <Columns>
        {workout.exercises.map((exercise) => {
          const name = getExercise(exercise.slug)?.name ?? exercise.slug;
          return (
            <Card key={exercise.id} style={styles.exercise}>
              <Link href={{ pathname: '/ejercicios/[slug]', params: { slug: exercise.slug } }}>
                <AppText variant="heading" role="heading" tone="accent">
                  {name}
                </AppText>
              </Link>
              {exercise.sets.map((set, index) => {
                const e1rm =
                  set.type === 'warmup' ? null : estimateOneRepMax(set.weightKg, set.reps);
                return (
                  <View key={set.id} style={styles.setRow}>
                    <AppText variant="label" tone="muted" style={styles.setLabel}>
                      {setLabel(exercise.sets, index)}
                    </AppText>
                    <AppText variant="label" style={styles.flex}>
                      {formatKg(set.weightKg, i18n.language)} × {set.reps}
                      {set.rir !== null ? `  ·  ${t('history.rir', { rir: set.rir })}` : ''}
                    </AppText>
                    {e1rm !== null ? (
                      <AppText variant="caption" tone="muted">
                        {t('history.e1rm', { value: formatKg(e1rm, i18n.language) })}
                      </AppText>
                    ) : null}
                  </View>
                );
              })}
            </Card>
          );
        })}
      </Columns>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  stat: {
    gap: 2,
  },
  records: {
    borderColor: colors.accent,
    padding: spacing.md,
  },
  warning: {
    borderColor: colors.danger,
  },
  exercise: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 2,
  },
  setLabel: {
    width: 24,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  footerButton: {
    flex: 1,
  },
  saveRoutine: {
    alignSelf: 'flex-start',
  },
});
