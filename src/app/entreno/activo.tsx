import { Redirect, router } from 'expo-router';
import { Dumbbell } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import {
  countCompletedSets,
  formatDuration,
  toPreviousPerformance,
  workoutVolumeKg,
} from '@/domain/workout';
import { useAuth } from '@/features/auth/auth-provider';
import { useActiveWorkout } from '@/features/workout/active-workout-store';
import { useFinishedWorkout } from '@/features/workout/finished-workout-store';
import { ExerciseCard, RestBar } from '@/features/workout/logger-components';
import {
  enqueueWorkout,
  readPreviousPerformance,
  removeFromOutbox,
  savePreviousPerformance,
  type PreviousByExercise,
} from '@/features/workout/workout-storage';
import { uploadWorkout } from '@/features/workout/workout-sync';
import { isSupabaseConfigured } from '@/lib/supabase';
import { colors, spacing } from '@/theme/tokens';

export default function ActiveWorkoutScreen() {
  const { t } = useTranslation();
  const { session } = useAuth();
  const workout = useActiveWorkout((state) => state.workout);
  const restEndsAt = useActiveWorkout((state) => state.restEndsAt);
  const [previous, setPrevious] = useState<PreviousByExercise>({});
  const [askDiscard, setAskDiscard] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [finishing, setFinishing] = useState(false);

  useEffect(() => {
    void readPreviousPerformance().then(setPrevious);
  }, []);

  const startedAt = workout?.startedAt;
  useEffect(() => {
    if (!startedAt) return;
    const tick = () => setElapsed(Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  if (!workout) return <Redirect href="/entreno" />;

  async function handleFinish() {
    setFinishing(true);
    const finished = useActiveWorkout.getState().finish();
    if (!finished) return;

    let synced = false;
    if (countCompletedSets(finished) > 0) {
      await savePreviousPerformance(toPreviousPerformance(finished));
      await enqueueWorkout(finished);

      if (session && isSupabaseConfigured) {
        try {
          await uploadWorkout(session.user.id, finished);
          await removeFromOutbox(finished.id);
          synced = true;
        } catch {
          // Stays in the outbox and goes up on the next attempt.
        }
      }
    }

    useFinishedWorkout.getState().setFinished(finished, synced);
    router.replace('/entreno/resumen');
  }

  const store = useActiveWorkout.getState();
  const volume = workoutVolumeKg({ ...workout, endedAt: null });
  const sets = countCompletedSets(workout);

  return (
    <View style={styles.page}>
      <Screen
        insetTop={false}
        footer={
          askDiscard ? (
            <View style={styles.footer}>
              <Button
                label={t('logger.cancel')}
                variant="secondary"
                onPress={() => setAskDiscard(false)}
                style={styles.footerButton}
              />
              <Button
                label={t('logger.discard')}
                onPress={() => {
                  store.discard();
                  router.replace('/entreno');
                }}
                style={styles.footerButton}
              />
            </View>
          ) : (
            <View style={styles.footer}>
              <Button
                label={t('logger.discard')}
                variant="ghost"
                onPress={() => setAskDiscard(true)}
              />
              <Button
                label={t('logger.finish')}
                onPress={handleFinish}
                disabled={finishing}
                aria-busy={finishing}
                style={styles.footerButton}
              />
            </View>
          )
        }>
        <Card style={styles.stats}>
          <Stat label={t('logger.elapsed')} value={formatDuration(elapsed)} />
          <Stat label={t('summary.volume')} value={`${volume} kg`} />
          <Stat label={t('summary.sets')} value={String(sets)} />
        </Card>

        {askDiscard ? (
          <Card style={styles.warning}>
            <AppText variant="heading" role="heading">
              {t('logger.discardTitle')}
            </AppText>
            <AppText tone="muted">{t('logger.discardBody')}</AppText>
          </Card>
        ) : null}

        {workout.exercises.length === 0 ? (
          <EmptyState
            icon={Dumbbell}
            title={t('logger.empty')}
            description={t('logger.emptyDescription')}
          />
        ) : (
          workout.exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              previous={previous[exercise.slug]}
              onAddSet={() => store.addSet(exercise.id)}
              onRemove={() => store.removeExercise(exercise.id)}
              onChangeSet={(setId, patch) => store.updateSet(exercise.id, setId, patch)}
              onToggleSet={(setId) => store.toggleSetCompleted(exercise.id, setId)}
              onRemoveSet={(setId) => store.removeSet(exercise.id, setId)}
            />
          ))
        )}

        <Button
          label={t('logger.addExercise')}
          variant="secondary"
          onPress={() => router.push('/entreno/elegir-ejercicio')}
        />

        <AppText variant="caption" tone="muted">
          {t('logger.offlineHint')}
        </AppText>
      </Screen>

      {restEndsAt ? (
        <RestBar
          key={restEndsAt}
          endsAt={restEndsAt}
          onExtend={() => store.extendRest(15)}
          onSkip={() => store.stopRest()}
        />
      ) : null}
    </View>
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
  page: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  stat: {
    gap: 2,
  },
  warning: {
    borderColor: colors.warning,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  footerButton: {
    flex: 1,
  },
});
