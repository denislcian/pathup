import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { BookOpen, CloudOff } from '@/components/icons';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { countCompletedSets } from '@/domain/workout';
import { RoutineSection } from '@/features/routines/routine-list';
import { useActiveWorkout } from '@/features/workout/active-workout-store';
import { useWorkoutSync } from '@/features/workout/use-workout-sync';
import { colors, spacing } from '@/theme/tokens';

export default function WorkoutScreen() {
  const { t } = useTranslation();
  const active = useActiveWorkout((state) => state.workout);
  const start = useActiveWorkout((state) => state.start);
  const { pending, sync } = useWorkoutSync();

  return (
    <Screen wide title={t('workout.title')} subtitle={t('workout.subtitle')}>
      {active ? (
        <Card style={styles.active}>
          <AppText variant="heading" role="heading" tone="accent">
            {t('workout.activeTitle')}
          </AppText>
          <AppText tone="muted">
            {active.name} · {t('summary.setsCount', { count: countCompletedSets(active) })} ·{' '}
            {t('library.results', { count: active.exercises.length })}
          </AppText>
          <Button
            label={t('workout.activeContinue')}
            onPress={() => router.push('/entreno/activo')}
          />
          <AppText variant="caption" tone="muted">
            {t('workout.activeHint')}
          </AppText>
        </Card>
      ) : (
        <Button
          label={t('workout.startEmpty')}
          variant="secondary"
          onPress={() => {
            start(t('workout.defaultName'));
            router.push('/entreno/activo');
          }}
        />
      )}

      {pending > 0 ? (
        <Card style={styles.pending}>
          <View style={styles.row}>
            <CloudOff color={colors.warning} size={18} aria-hidden />
            <AppText variant="label" style={styles.flex}>
              {t('workout.pendingSync', { count: pending })}
            </AppText>
          </View>
          <Button label={t('workout.syncNow')} variant="secondary" onPress={() => void sync()} />
        </Card>
      ) : null}

      <RoutineSection hasActiveWorkout={active !== null} />

      <EmptyState
        icon={BookOpen}
        title={t('workout.libraryTitle')}
        description={t('workout.libraryDescription')}
        actionLabel={t('workout.openLibrary')}
        onAction={() => router.push('/ejercicios')}
      />
    </Screen>
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
  active: {
    borderColor: colors.accent,
  },
  pending: {
    borderColor: colors.warning,
  },
});
