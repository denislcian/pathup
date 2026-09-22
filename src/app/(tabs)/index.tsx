import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Activity, Dumbbell, Sprout } from '@/components/icons';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Columns } from '@/components/ui/columns';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { thisWeek, weeklyStreak } from '@/domain/progress';
import { countCompletedSets } from '@/domain/workout';
import { useWorkoutHistory } from '@/features/history/history-api';
import { StatRow, StatTile, WorkoutCard } from '@/features/history/history-components';
import { NextSessionCard } from '@/features/programs/program-components';
import { useProgramState } from '@/features/programs/programs-api';
import { startProgramSession } from '@/features/programs/start-session';
import { useProfile } from '@/features/profile/profile-api';
import { useActiveWorkout } from '@/features/workout/active-workout-store';
import { formatKg } from '@/lib/format';
import { colors, spacing } from '@/theme/tokens';

export default function TodayScreen() {
  const { t, i18n } = useTranslation();
  const profile = useProfile();
  const history = useWorkoutHistory();
  const state = useProgramState();
  const active = useActiveWorkout((store) => store.workout);

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

  return (
    <Screen wide title={name ? t('today.greeting', { name }) : t('today.title')} subtitle={today}>
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

      <StatRow>
        <StatTile
          label={t('today.weekSessions')}
          value={t('progress.workoutsCount', { count: week.workouts })}
          hint={week.volumeKg > 0 ? formatKg(week.volumeKg, i18n.language) : undefined}
        />
        <StatTile
          label={t('progress.streak')}
          value={t('progress.weeksCount', { count: streak })}
          hint={t('progress.streakHint')}
        />
        {state.progress ? (
          <StatTile
            label={t('today.programWeek')}
            value={t('programs.week', { week: state.progress.week })}
            hint={t('today.programSessions', {
              done: state.progress.weekDone,
              total: state.progress.weekTotal,
            })}
          />
        ) : null}
      </StatRow>

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
                onStart={() => void startProgramSession(state.program!, state.next!)}
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
              <EmptyState
                icon={Sprout}
                title={t('today.noProgramTitle')}
                description={t('today.noProgramDescription')}
                actionLabel={t('today.chooseProgram')}
                onAction={() => router.push('/programas')}
              />
            )}

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

            <EmptyState
              icon={Activity}
              tone="calm"
              title={t('today.checkinTitle')}
              description={t('today.checkinEmpty')}
            />
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
