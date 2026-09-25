import { useQueryClient } from '@tanstack/react-query';
import { Redirect, router } from 'expo-router';
import { Dumbbell } from '@/components/icons';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Columns } from '@/components/ui/columns';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { useEscapeKey } from '@/components/ui/use-escape-key';
import { getProgram } from '@/data/programs';
import { availableEquipment } from '@/domain/exercises';
import { detectRecords, type RecordHit } from '@/domain/progress';

import {
  countCompletedSets,
  formatDuration,
  nextRestPreset,
  toPreviousPerformance,
  workoutVolumeKg,
} from '@/domain/workout';
import { useAuth } from '@/features/auth/auth-provider';
import { historyKeys } from '@/features/history/history-api';
import { useProfile } from '@/features/profile/profile-api';
import { useActiveWorkout } from '@/features/workout/active-workout-store';
import { useFinishedWorkout } from '@/features/workout/finished-workout-store';
import { BeginnerTips, ExerciseCard, RestBar } from '@/features/workout/logger-components';
import {
  enqueueWorkout,
  readKnownWorkouts,
  readPreviousPerformance,
  removeFromOutbox,
  savePreviousPerformance,
  type PreviousByExercise,
} from '@/features/workout/workout-storage';
import { uploadWorkout } from '@/features/workout/workout-sync';
import { isDemoMode } from '@/lib/demo-mode';
import { isSupabaseConfigured } from '@/lib/supabase';
import { colors, minTouchTarget, radius, spacing } from '@/theme/tokens';

/** The programme week a session belongs to, read from its key (w3-b). */
function programWeekOf(slug: string | null | undefined, sessionKey: string | null | undefined) {
  const program = slug ? getProgram(slug) : undefined;
  const number = Number(sessionKey?.match(/^w(\d+)-/)?.[1]);
  const week = program?.weeks.find((item) => item.number === number);
  return program && week ? { program, week } : null;
}

export default function ActiveWorkoutScreen() {
  const { t } = useTranslation();
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const workout = useActiveWorkout((state) => state.workout);
  const restEndsAt = useActiveWorkout((state) => state.restEndsAt);
  const restSeconds = useActiveWorkout((state) => state.restSeconds);
  const [previous, setPrevious] = useState<PreviousByExercise>({});
  const [askDiscard, setAskDiscard] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [finishing, setFinishing] = useState(false);
  const [tipsDismissed, setTipsDismissed] = useState(false);
  const profile = useProfile();
  const beginner = profile.data?.beginner_mode ?? false;
  const available = profile.data ? availableEquipment(profile.data.equipment) : null;

  useEffect(() => {
    void readPreviousPerformance().then(setPrevious);
  }, []);

  useEscapeKey(() => setAskDiscard(false), askDiscard);

  const startedAt = workout?.startedAt;
  useEffect(() => {
    if (!startedAt) return;
    const tick = () => setElapsed(Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  // While finishing, the session is already closed but the summary is not open yet: without this
  // guard the redirect below wins the race and the summary never shows.
  if (!workout) return finishing ? null : <Redirect href="/entreno" />;

  async function handleFinish() {
    setFinishing(true);
    const finished = useActiveWorkout.getState().finish();
    if (!finished) return;

    let synced = false;
    let records: RecordHit[] = [];
    if (countCompletedSets(finished) > 0) {
      // Compared with what the phone knows, so records show up even without signal.
      records = detectRecords(await readKnownWorkouts(), finished);
      await savePreviousPerformance(toPreviousPerformance(finished));
      await enqueueWorkout(finished);

      if (session && (isSupabaseConfigured || isDemoMode())) {
        try {
          await uploadWorkout(session.user.id, finished);
          await removeFromOutbox(finished.id);
          synced = true;
        } catch {
          // Stays in the outbox and goes up on the next attempt.
        }
      }
    }

    useFinishedWorkout.getState().setFinished(finished, synced, records);
    void queryClient.invalidateQueries({ queryKey: historyKeys.all(session?.user.id) });
    router.replace('/entreno/resumen');
  }

  const store = useActiveWorkout.getState();
  const programWeek = programWeekOf(workout.programSlug, workout.programSession);
  const volume = workoutVolumeKg({ ...workout, endedAt: null });
  const sets = countCompletedSets(workout);

  return (
    <View style={styles.page}>
      <Screen
        wide
        insetTop={false}
        documentTitle={workout.name}
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
          <Pressable
            role="button"
            aria-label={t('logger.restSetting', { time: formatDuration(restSeconds) })}
            onPress={() => store.setRestSeconds(nextRestPreset(restSeconds))}
            style={styles.restSetting}>
            <AppText variant="caption" tone="muted">
              {t('logger.rest')}
            </AppText>
            <AppText variant="title" tone="calm">
              {formatDuration(restSeconds)}
            </AppText>
          </Pressable>
        </Card>

        {programWeek ? (
          <Card style={styles.program}>
            <AppText variant="label" tone="accent">
              {programWeek.program.name} · {t('programs.week', { week: programWeek.week.number })} ·{' '}
              {t(`programs.phases.${programWeek.week.phase}`)}
            </AppText>
            <AppText variant="caption" tone="muted">
              {t('programs.rirHint', { count: programWeek.week.rir })} {programWeek.week.note}
            </AppText>
          </Card>
        ) : null}

        {beginner && !tipsDismissed ? (
          <BeginnerTips onDismiss={() => setTipsDismissed(true)} />
        ) : null}

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
          <Columns>
            {workout.exercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                previous={previous[exercise.slug]}
                available={available}
                beginner={beginner}
                onSwap={(slug) => store.swapExercise(exercise.id, slug)}
                onNote={(note) => store.setExerciseNote(exercise.id, note)}
                onAddSet={() => store.addSet(exercise.id)}
                onRemove={() => store.removeExercise(exercise.id)}
                onChangeSet={(setId, patch) => store.updateSet(exercise.id, setId, patch)}
                onToggleSet={(setId, fallback) =>
                  store.toggleSetCompleted(exercise.id, setId, fallback)
                }
                onRemoveSet={(setId) => store.removeSet(exercise.id, setId)}
              />
            ))}
          </Columns>
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
  restSetting: {
    cursor: 'pointer',
    gap: 2,
    paddingHorizontal: spacing.sm,
    marginHorizontal: -spacing.sm,
    minHeight: minTouchTarget,
    borderRadius: radius.sm,
  },
  warning: {
    borderColor: colors.warning,
  },
  program: {
    borderColor: colors.accent,
    padding: spacing.md,
    gap: spacing.xs,
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
