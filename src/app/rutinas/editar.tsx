import { Redirect, router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ArrowDown, ArrowUp, Dumbbell, Minus, Plus, Trash2 } from '@/components/icons';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { getExercise } from '@/data/exercises';
import {
  folderNames,
  ROUTINE_LIMITS,
  validateRoutine,
  type RoutineExercise,
  type RoutineIssue,
} from '@/domain/routines';
import { useRoutineDraft } from '@/features/routines/routine-draft-store';
import { useDeleteRoutine, useRoutines, useSaveRoutine } from '@/features/routines/routines-api';
import { colors, fonts, minTouchTarget, radius, spacing } from '@/theme/tokens';

export default function RoutineEditorScreen() {
  const { t } = useTranslation();
  const draft = useRoutineDraft((state) => state.draft);
  const existing = useRoutineDraft((state) => state.existing);
  const routines = useRoutines();
  const save = useSaveRoutine();
  const remove = useDeleteRoutine();
  const [issues, setIssues] = useState<RoutineIssue[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Reloading the page in a browser loses the draft: go back to the list.
  if (!draft) return <Redirect href="/entreno" />;

  const store = useRoutineDraft.getState();
  const folders = folderNames(routines.data?.routines ?? []);

  function leave() {
    useRoutineDraft.getState().close();
    if (router.canGoBack()) router.back();
    else router.replace('/entreno');
  }

  function submit() {
    const current = useRoutineDraft.getState().draft;
    if (!current) return;
    const found = validateRoutine(current);
    setIssues(found);
    if (found.length > 0) return;
    save.mutate({ ...current, name: current.name.trim() }, { onSuccess: leave });
  }

  const footer = confirmDelete ? (
    <View style={styles.footer}>
      <Button
        label={t('routines.keep')}
        variant="secondary"
        onPress={() => setConfirmDelete(false)}
        style={styles.flex}
      />
      <Button
        label={t('routines.delete')}
        disabled={remove.isPending}
        onPress={() => remove.mutate(draft.id, { onSuccess: leave })}
        style={styles.flex}
      />
    </View>
  ) : (
    <View style={styles.footer}>
      <Button label={t('routines.cancel')} variant="ghost" onPress={leave} />
      <Button
        label={save.isPending ? t('routines.saving') : t('routines.save')}
        disabled={save.isPending}
        aria-busy={save.isPending}
        onPress={submit}
        style={styles.flex}
      />
    </View>
  );

  return (
    <Screen
      insetTop={false}
      title={existing ? t('routines.editTitle') : t('routines.newTitle')}
      footer={footer}>
      <TextField
        label={t('routines.name')}
        placeholder={t('routines.namePlaceholder')}
        value={draft.name}
        maxLength={ROUTINE_LIMITS.nameLength}
        onChangeText={(name) => store.update({ name })}
        error={issues.includes('nameRequired') ? t('routines.errors.nameRequired') : null}
      />

      <TextField
        label={t('routines.folder')}
        hint={t('routines.folderHint')}
        placeholder={t('routines.folderPlaceholder')}
        value={draft.folder ?? ''}
        maxLength={ROUTINE_LIMITS.folderLength}
        onChangeText={(folder) => store.update({ folder: folder.length > 0 ? folder : null })}
      />
      {folders.length > 0 ? (
        <View style={styles.chips} role="radiogroup" aria-label={t('routines.folder')}>
          {folders.map((folder) => (
            <Chip
              key={folder}
              role="radio"
              label={folder}
              selected={draft.folder?.trim() === folder}
              onPress={() =>
                store.update({ folder: draft.folder?.trim() === folder ? null : folder })
              }
            />
          ))}
        </View>
      ) : null}

      <AppText variant="heading" role="heading" style={styles.sectionTitle}>
        {t('routines.exercises', { count: draft.exercises.length })}
      </AppText>

      {draft.exercises.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title={t('routines.noExercisesTitle')}
          description={t('routines.noExercisesDescription')}
        />
      ) : (
        draft.exercises.map((exercise, index) => (
          <ExerciseEditor
            key={exercise.id}
            exercise={exercise}
            index={index}
            last={index === draft.exercises.length - 1}
          />
        ))
      )}

      {issues.includes('noExercises') ? (
        <AppText tone="danger" role="alert">
          {t('routines.errors.noExercises')}
        </AppText>
      ) : null}
      {issues.includes('repRange') ? (
        <AppText tone="danger" role="alert">
          {t('routines.errors.repRange')}
        </AppText>
      ) : null}

      <Button
        label={t('routines.addExercise')}
        variant="secondary"
        disabled={draft.exercises.length >= ROUTINE_LIMITS.exercises}
        onPress={() => router.push('/rutinas/elegir-ejercicio')}
      />

      {save.isError ? (
        <AppText tone="danger" role="alert">
          {t('routines.errors.save')}
        </AppText>
      ) : null}

      {existing && !confirmDelete ? (
        <Button
          label={t('routines.deleteRoutine')}
          variant="ghost"
          onPress={() => setConfirmDelete(true)}
        />
      ) : null}
      {confirmDelete ? (
        <Card style={styles.warning}>
          <AppText variant="heading" role="heading">
            {t('routines.deleteTitle')}
          </AppText>
          <AppText tone="muted">{t('routines.deleteBody')}</AppText>
          {remove.isError ? (
            <AppText tone="danger" role="alert">
              {t('routines.errors.delete')}
            </AppText>
          ) : null}
        </Card>
      ) : null}
    </Screen>
  );
}

function ExerciseEditor({
  exercise,
  index,
  last,
}: {
  exercise: RoutineExercise;
  index: number;
  last: boolean;
}) {
  const { t } = useTranslation();
  const store = useRoutineDraft.getState();
  const name = getExercise(exercise.slug)?.name ?? exercise.slug;

  return (
    <Card style={styles.exercise}>
      <View style={styles.row}>
        <AppText variant="label" tone="muted" style={styles.index}>
          {index + 1}
        </AppText>
        <AppText variant="heading" style={styles.flex} numberOfLines={2}>
          {name}
        </AppText>
        <IconButton
          label={t('routines.moveUp', { name })}
          disabled={index === 0}
          onPress={() => store.moveExercise(index, -1)}>
          <ArrowUp color={colors.text} size={18} />
        </IconButton>
        <IconButton
          label={t('routines.moveDown', { name })}
          disabled={last}
          onPress={() => store.moveExercise(index, 1)}>
          <ArrowDown color={colors.text} size={18} />
        </IconButton>
        <IconButton
          label={t('routines.removeExercise', { name })}
          onPress={() => store.removeExercise(index)}>
          <Trash2 color={colors.textMuted} size={18} />
        </IconButton>
      </View>

      <View style={styles.prescription}>
        <View style={styles.field}>
          <AppText variant="caption" tone="muted">
            {t('routines.sets')}
          </AppText>
          <View style={styles.row}>
            <IconButton
              label={t('routines.fewerSets', { name })}
              disabled={exercise.sets <= ROUTINE_LIMITS.sets.min}
              onPress={() => store.updateExercise(index, { sets: exercise.sets - 1 })}>
              <Minus color={colors.text} size={18} />
            </IconButton>
            <AppText variant="title" style={styles.setsValue} aria-live="polite">
              {exercise.sets}
            </AppText>
            <IconButton
              label={t('routines.moreSets', { name })}
              disabled={exercise.sets >= ROUTINE_LIMITS.sets.max}
              onPress={() => store.updateExercise(index, { sets: exercise.sets + 1 })}>
              <Plus color={colors.text} size={18} />
            </IconButton>
          </View>
        </View>

        <View style={styles.field}>
          <AppText variant="caption" tone="muted">
            {t('routines.reps')}
          </AppText>
          <View style={styles.row}>
            <RepInput
              value={exercise.repMin}
              label={t('routines.repMin', { name })}
              onChange={(repMin) => store.updateExercise(index, { repMin })}
            />
            <AppText tone="muted">–</AppText>
            <RepInput
              value={exercise.repMax}
              label={t('routines.repMax', { name })}
              onChange={(repMax) => store.updateExercise(index, { repMax })}
            />
          </View>
        </View>
      </View>
    </Card>
  );
}

function RepInput({
  value,
  label,
  onChange,
}: {
  value: number;
  label: string;
  onChange: (value: number) => void;
}) {
  const [text, setText] = useState(String(value));
  return (
    <TextInput
      value={text}
      onChangeText={(next) => {
        const digits = next.replace(/\D/g, '').slice(0, 3);
        setText(digits);
        onChange(digits === '' ? 0 : Number(digits));
      }}
      keyboardType="number-pad"
      selectTextOnFocus
      aria-label={label}
      selectionColor={colors.accent}
      style={styles.repInput}
    />
  );
}

function IconButton({
  label,
  onPress,
  disabled = false,
  children,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <Pressable
      role="button"
      aria-label={label}
      aria-disabled={disabled}
      disabled={disabled}
      onPress={onPress}
      hitSlop={4}
      style={[styles.iconButton, disabled && styles.disabled]}>
      {children}
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
    gap: spacing.xs,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  sectionTitle: {
    marginTop: spacing.sm,
  },
  exercise: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  index: {
    width: 20,
  },
  prescription: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    paddingLeft: 24,
  },
  field: {
    gap: spacing.xs,
  },
  setsValue: {
    minWidth: 32,
    textAlign: 'center',
  },
  repInput: {
    width: 56,
    minHeight: minTouchTarget,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
    color: colors.text,
    fontFamily: fonts.bodyMedium,
    fontSize: 16,
    textAlign: 'center',
  },
  iconButton: {
    cursor: 'pointer',
    width: minTouchTarget - 8,
    height: minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
  },
  disabled: {
    opacity: 0.35,
    cursor: 'auto',
  },
  warning: {
    borderColor: colors.danger,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
