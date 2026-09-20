import { router } from 'expo-router';
import { BookOpen, CloudOff, Dumbbell } from '@/components/icons';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { countCompletedSets } from '@/domain/workout';
import { useActiveWorkout } from '@/features/workout/active-workout-store';
import { useWorkoutSync } from '@/features/workout/use-workout-sync';
import { colors, spacing } from '@/theme/tokens';

export default function WorkoutScreen() {
  const { t } = useTranslation();
  const active = useActiveWorkout((state) => state.workout);
  const start = useActiveWorkout((state) => state.start);
  const { pending, sync } = useWorkoutSync();

  return (
    <Screen title={t('workout.title')} subtitle={t('workout.subtitle')}>
      {active ? (
        <Card>
          <AppText variant="heading" role="heading" tone="accent">
            {t('workout.activeTitle')}
          </AppText>
          <AppText tone="muted">
            {t('summary.setsCount', { count: countCompletedSets(active) })} ·{' '}
            {t('library.results', { count: active.exercises.length })}
          </AppText>
          <Button
            label={t('workout.activeContinue')}
            onPress={() => router.push('/entreno/activo')}
          />
        </Card>
      ) : (
        <Button
          label={t('workout.startEmpty')}
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

      <EmptyState
        icon={BookOpen}
        title={t('workout.libraryTitle')}
        description={t('workout.libraryDescription')}
        actionLabel={t('workout.openLibrary')}
        onAction={() => router.push('/ejercicios')}
      />

      {!active ? (
        <EmptyState
          icon={Dumbbell}
          title={t('workout.empty')}
          description={t('workout.emptyDescription')}
        />
      ) : null}
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
  pending: {
    borderColor: colors.warning,
  },
});
