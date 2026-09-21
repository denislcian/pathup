import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { CloudOff, Ellipsis, Folder, ListPlus } from '@/components/icons';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Columns } from '@/components/ui/columns';
import { EmptyState } from '@/components/ui/empty-state';
import { getExercise } from '@/data/exercises';
import {
  describePrescription,
  duplicateRoutine,
  groupByFolder,
  moveRoutine,
  routineToTemplate,
  type Routine,
} from '@/domain/routines';
import { newRoutine, useRoutineDraft } from '@/features/routines/routine-draft-store';
import { useRoutines, useSaveRoutine, useSaveRoutineOrder } from '@/features/routines/routines-api';
import { useActiveWorkout } from '@/features/workout/active-workout-store';
import { createId } from '@/features/workout/ids';
import { readPreviousPerformance } from '@/features/workout/workout-storage';
import { colors, minTouchTarget, radius, spacing } from '@/theme/tokens';

const EXERCISES_SHOWN = 4;

/** Starts a routine with last session's weights already filled in. */
export async function startRoutine(routine: Routine): Promise<void> {
  const previous = await readPreviousPerformance();
  useActiveWorkout.getState().startFrom(routineToTemplate(routine, previous));
  router.push('/entreno/activo');
}

export function nextRoutinePosition(routines: readonly Routine[]): number {
  return routines.reduce((max, routine) => Math.max(max, routine.position + 1), 0);
}

/** "Mis rutinas" on the workout tab: start, edit, duplicate and reorder, grouped by folder. */
export function RoutineSection({ hasActiveWorkout }: { hasActiveWorkout: boolean }) {
  const { t } = useTranslation();
  const routines = useRoutines();
  const reorder = useSaveRoutineOrder();
  const save = useSaveRoutine();
  const list = routines.data?.routines ?? [];
  const groups = groupByFolder(list);

  function create() {
    useRoutineDraft.getState().open(newRoutine(nextRoutinePosition(list)), false);
    router.push('/rutinas/editar');
  }

  function duplicate(routine: Routine) {
    const copy = duplicateRoutine(routine, createId, t('routines.copySuffix'));
    save.mutate({ ...copy, position: nextRoutinePosition(list) });
  }

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <AppText variant="title" role="heading" style={styles.flex}>
          {t('routines.title')}
        </AppText>
        <Button label={t('routines.new')} variant="secondary" onPress={create} />
      </View>

      {routines.data?.offline && list.length > 0 ? (
        <View style={styles.notice}>
          <CloudOff color={colors.warning} size={16} aria-hidden />
          <AppText variant="caption" tone="muted" style={styles.flex}>
            {t('routines.offline')}
          </AppText>
        </View>
      ) : null}

      {reorder.isError || save.isError ? (
        <AppText tone="danger" role="alert">
          {t('routines.errors.change')}
        </AppText>
      ) : null}

      {routines.isPending ? (
        <AppText tone="muted">{t('routines.loading')}</AppText>
      ) : list.length === 0 ? (
        <EmptyState
          icon={ListPlus}
          title={t('routines.emptyTitle')}
          description={t('routines.emptyDescription')}
          actionLabel={t('routines.createFirst')}
          onAction={create}
        />
      ) : (
        groups.map((group) => (
          <View key={group.folder ?? 'none'} style={styles.group}>
            {group.folder ? (
              <View style={styles.folder}>
                <Folder color={colors.textMuted} size={16} aria-hidden />
                <AppText variant="label" tone="muted" role="heading">
                  {group.folder}
                </AppText>
              </View>
            ) : null}
            <Columns>
              {group.routines.map((routine, index) => (
                <RoutineCard
                  key={routine.id}
                  routine={routine}
                  canStart={!hasActiveWorkout}
                  first={index === 0}
                  last={index === group.routines.length - 1}
                  onMove={(direction) => reorder.mutate(moveRoutine(list, routine.id, direction))}
                  onDuplicate={() => duplicate(routine)}
                />
              ))}
            </Columns>
          </View>
        ))
      )}
    </View>
  );
}

type RoutineCardProps = {
  routine: Routine;
  canStart: boolean;
  first: boolean;
  last: boolean;
  onMove: (direction: -1 | 1) => void;
  onDuplicate: () => void;
};

function RoutineCard({ routine, canStart, first, last, onMove, onDuplicate }: RoutineCardProps) {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const totalSets = routine.exercises.reduce((total, exercise) => total + exercise.sets, 0);
  const more = routine.exercises.length - EXERCISES_SHOWN;

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <View style={styles.flex}>
          <AppText variant="heading" role="heading" numberOfLines={1}>
            {routine.name}
          </AppText>
          <AppText variant="caption" tone="muted">
            {t('routines.summary', {
              exercises: t('library.results', { count: routine.exercises.length }),
              sets: t('summary.setsCount', { count: totalSets }),
            })}
          </AppText>
        </View>
        <Pressable
          role="button"
          aria-label={t('routines.moreActions', { name: routine.name })}
          aria-expanded={menuOpen}
          onPress={() => setMenuOpen((open) => !open)}
          style={styles.menuButton}>
          <Ellipsis color={colors.text} size={20} />
        </Pressable>
      </View>

      <View style={styles.exercises}>
        {routine.exercises.slice(0, EXERCISES_SHOWN).map((exercise) => (
          <View key={exercise.id} style={styles.exerciseRow}>
            <AppText variant="label" style={styles.flex} numberOfLines={1}>
              {getExercise(exercise.slug)?.name ?? exercise.slug}
            </AppText>
            <AppText variant="caption" tone="muted">
              {describePrescription(exercise)}
            </AppText>
          </View>
        ))}
        {more > 0 ? (
          <AppText variant="caption" tone="muted">
            {t('history.more', { count: more })}
          </AppText>
        ) : null}
      </View>

      {menuOpen ? (
        <View style={styles.menu}>
          <Button label={t('routines.duplicate')} variant="ghost" onPress={onDuplicate} />
          <Button
            label={t('routines.moveUpShort')}
            variant="ghost"
            disabled={first}
            onPress={() => onMove(-1)}
          />
          <Button
            label={t('routines.moveDownShort')}
            variant="ghost"
            disabled={last}
            onPress={() => onMove(1)}
          />
        </View>
      ) : null}

      <View style={styles.actions}>
        <Button
          label={t('routines.edit')}
          variant="secondary"
          onPress={() => {
            useRoutineDraft.getState().open(routine, true);
            router.push('/rutinas/editar');
          }}
        />
        <Button
          label={t('routines.start')}
          aria-label={t('routines.startNamed', { name: routine.name })}
          disabled={!canStart}
          onPress={() => void startRoutine(routine)}
          style={styles.flex}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  section: {
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  group: {
    gap: spacing.sm,
  },
  folder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  card: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  menuButton: {
    cursor: 'pointer',
    width: minTouchTarget,
    height: minTouchTarget,
    marginTop: -spacing.sm,
    marginRight: -spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  exercises: {
    gap: 2,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  menu: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    padding: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceRaised,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
