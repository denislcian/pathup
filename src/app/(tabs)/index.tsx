import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Dumbbell, HeartPulse } from '@/components/icons';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Columns, useIsWide } from '@/components/ui/columns';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { todayIso } from '@/domain/age';
import { thisWeek, weeklyStreak } from '@/domain/progress';
import { sessionAdjustment } from '@/domain/wellness';
import { countCompletedSets } from '@/domain/workout';
import { DemoBanner } from '@/features/account/demo-banner';
import { useWorkoutHistory } from '@/features/history/history-api';
import { WorkoutCard } from '@/features/history/history-components';
import { HabitsToday } from '@/features/habits/habits-today';
import { NextSessionCard, RecommendedProgram } from '@/features/programs/program-components';
import { useProgramState } from '@/features/programs/programs-api';
import { startProgramSession } from '@/features/programs/start-session';
import { useProfile } from '@/features/profile/profile-api';
import { TodayStats, type TodayStat } from '@/features/today/today-stats';
import { ReadinessCard } from '@/features/wellness/readiness-card';
import { useTodayCheckin } from '@/features/wellness/wellness-api';
import { useActiveWorkout } from '@/features/workout/active-workout-store';
import { useDemoMode } from '@/lib/demo-mode';
import { colors, spacing } from '@/theme/tokens';

export default function TodayScreen() {
  const { t, i18n } = useTranslation();
  const profile = useProfile();
  const history = useWorkoutHistory();
  const state = useProgramState();
  const active = useActiveWorkout((store) => store.workout);
  const demo = useDemoMode();
  const isWide = useIsWide();
  const today_ = todayIso();
  const { checkin } = useTodayCheckin(today_);
  const adjustment = checkin ? sessionAdjustment(checkin) : null;

  const today = new Intl.DateTimeFormat(i18n.language, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());
  const name = profile.data?.display_name;
  const workouts = history.data?.workouts ?? [];
  const week = thisWeek(workouts);
  const streak = weeklyStreak(workouts);
  const last = workouts[0];

  const stats: TodayStat[] = [
    {
      key: 'week',
      value: String(week.workouts),
      label: t('today.statWorkouts', { count: week.workouts }),
    },
    {
      key: 'streak',
      value: String(streak),
      label: t('today.statStreak', { count: streak }),
      highlight: streak > 0,
    },
    state.progress
      ? {
          key: 'program',
          value: `${state.progress.weekDone}/${state.progress.weekTotal}`,
          label: t('today.statProgram', { week: state.progress.week }),
        }
      : {
          key: 'volume',
          value: new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 0 }).format(
            week.volumeKg,
          ),
          label: t('today.statVolume'),
        },
  ];
  // On a phone the session of the day goes first and the numbers under it; on a desktop there is
  // room for the numbers on top.
  const statsStrip = <TodayStats stats={stats} />;

  return (
    <Screen
      wide
      title={name ? t('today.greeting', { name }) : t('today.title')}
      documentTitle={t('today.title')}
      subtitle={today}>
      {demo ? <DemoBanner /> : null}

      {active ? (
        <Card style={styles.active}>
          <AppText variant="heading" role="heading" tone="accent">
            {t('workout.activeTitle')}
          </AppText>
          <AppText tone="muted">
            {active.name} · {t('summary.setsCount', { count: countCompletedSets(active) })}
          </AppText>
          <Button
            label={t('workout.activeContinue')}
            onPress={() => router.push('/entreno/activo')}
          />
        </Card>
      ) : null}

      {isWide ? statsStrip : null}

      <Columns>
        {[
          <View key="workout" style={styles.stack}>
            {state.isPending ? (
              <AppText tone="muted">{t('today.loading')}</AppText>
            ) : state.program && state.next && state.progress ? (
              <NextSessionCard
                program={state.program}
                planned={state.next}
                progress={state.progress}
                disabled={active !== null}
                adjustment={adjustment}
                onStart={(adjusted) =>
                  void startProgramSession(
                    state.program!,
                    state.next!,
                    adjusted ? adjustment : null,
                  )
                }
              />
            ) : state.program && state.progress?.finished ? (
              <Card style={styles.done}>
                <AppText variant="heading" role="heading" tone="accent">
                  {t('today.programFinished', { name: state.program.name })}
                </AppText>
                <AppText tone="muted">{t('today.programFinishedBody')}</AppText>
                <Button
                  label={t('today.chooseAnother')}
                  onPress={() => router.push('/programas')}
                />
              </Card>
            ) : (
              <RecommendedProgram profile={profile.data ?? null} />
            )}

            {isWide ? null : statsStrip}

            {!state.program ? (
              <EmptyState
                icon={Dumbbell}
                title={t('today.freeWorkoutTitle')}
                description={t('today.freeWorkoutDescription')}
                actionLabel={t('today.openWorkout')}
                onAction={() => router.push('/entreno')}
              />
            ) : null}
          </View>,

          <View key="side" style={styles.stack}>
            {last ? (
              <View style={styles.stack}>
                <AppText variant="heading" role="heading">
                  {t('today.lastWorkout')}
                </AppText>
                <WorkoutCard workout={last} />
              </View>
            ) : null}

            {checkin ? (
              <ReadinessCard checkin={checkin} onEdit={() => router.push('/bienestar')} />
            ) : (
              <EmptyState
                icon={HeartPulse}
                tone="calm"
                title={t('today.checkinTitle')}
                description={t('today.checkinEmpty')}
                actionLabel={t('today.doCheckin')}
                onAction={() => router.push('/bienestar')}
              />
            )}

            <HabitsToday today={today_} />
          </View>,
        ]}
      </Columns>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.md,
  },
  active: {
    borderColor: colors.accent,
  },
  done: {
    borderColor: colors.accent,
  },
});
