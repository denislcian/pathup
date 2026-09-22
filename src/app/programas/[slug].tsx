import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { CloudOff } from '@/components/icons';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { Columns } from '@/components/ui/columns';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { useEscapeKey } from '@/components/ui/use-escape-key';
import { getProgram } from '@/data/programs';
import { programPlan, totalSessions } from '@/domain/programs';
import { ProgramProgressBar, SessionExercises } from '@/features/programs/program-components';
import {
  useLeaveProgram,
  useProgramState,
  useStartProgram,
} from '@/features/programs/programs-api';
import { startProgramSession } from '@/features/programs/start-session';
import { useActiveWorkout } from '@/features/workout/active-workout-store';
import { colors, spacing } from '@/theme/tokens';

export default function ProgramDetailScreen() {
  const { t } = useTranslation();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const program = getProgram(slug);
  const state = useProgramState();
  const start = useStartProgram();
  const leave = useLeaveProgram();
  const active = useActiveWorkout((workout) => workout.workout);
  const [confirmLeave, setConfirmLeave] = useState(false);
  useEscapeKey(() => setConfirmLeave(false), confirmLeave);

  if (!program) {
    return (
      <Screen insetTop={false}>
        <EmptyState
          icon={CloudOff}
          title={t('programs.notFound')}
          description={t('programs.notFoundDescription')}
          actionLabel={t('programs.backToCatalogue')}
          onAction={() => router.replace('/programas')}
        />
      </Screen>
    );
  }

  const isCurrent = state.program?.slug === program.slug;
  const plan = programPlan(program);
  const firstWeek = plan.filter((planned) => planned.week.number === 1);
  const next = isCurrent ? state.next : null;

  const footer = confirmLeave ? (
    <View style={styles.footer}>
      <Button
        label={t('programs.keep')}
        variant="secondary"
        onPress={() => setConfirmLeave(false)}
        style={styles.flex}
      />
      <Button
        label={t('programs.leave')}
        disabled={leave.isPending}
        onPress={() =>
          state.enrollment &&
          leave.mutate({ id: state.enrollment.id }, { onSuccess: () => setConfirmLeave(false) })
        }
        style={styles.flex}
      />
    </View>
  ) : isCurrent ? (
    <View style={styles.footer}>
      <Button
        label={t('programs.leaveProgram')}
        variant="ghost"
        onPress={() => setConfirmLeave(true)}
      />
      <Button
        label={t('programs.startSession')}
        disabled={!next || active !== null}
        onPress={() => next && void startProgramSession(program, next)}
        style={styles.flex}
      />
    </View>
  ) : (
    <Button
      label={start.isPending ? t('programs.starting') : t('programs.start')}
      disabled={start.isPending}
      aria-busy={start.isPending}
      onPress={() => start.mutate(program.slug, { onSuccess: () => router.replace('/(tabs)') })}
    />
  );

  return (
    <Screen wide insetTop={false} title={program.name} subtitle={program.tagline} footer={footer}>
      <Stack.Screen options={{ title: program.name }} />

      <View style={styles.chips}>
        <Chip
          label={t('programs.facts', {
            days: program.daysPerWeek,
            weeks: program.weeks.length,
            minutes: program.minutesPerSession,
          })}
          variant="outline"
        />
        <Chip label={t(`programs.places.${program.place}`)} variant="outline" />
        <Chip label={t(`programs.levels.${program.level}`)} variant="outline" />
      </View>

      {isCurrent && state.progress ? (
        <Card style={styles.current}>
          <AppText variant="heading" role="heading" tone="accent">
            {t('programs.following')}
          </AppText>
          <ProgramProgressBar progress={state.progress} />
          {next ? (
            <AppText tone="muted">
              {t('programs.nextIs', { name: next.session.name, week: next.week.number })}
            </AppText>
          ) : (
            <AppText tone="accent">{t('programs.finished')}</AppText>
          )}
        </Card>
      ) : null}

      {confirmLeave ? (
        <Card style={styles.warning}>
          <AppText variant="heading" role="heading">
            {t('programs.leaveTitle')}
          </AppText>
          <AppText tone="muted">{t('programs.leaveBody')}</AppText>
          {leave.isError ? (
            <AppText tone="danger" role="alert">
              {t('programs.errors.leave')}
            </AppText>
          ) : null}
        </Card>
      ) : null}

      {start.isError ? (
        <AppText tone="danger" role="alert">
          {t('programs.errors.start')}
        </AppText>
      ) : null}

      <Card>
        <AppText variant="heading" role="heading">
          {t('programs.why')}
        </AppText>
        {program.why.map((reason) => (
          <AppText key={reason}>• {reason}</AppText>
        ))}
        <AppText variant="label" style={styles.referencesTitle}>
          {t('programs.references')}
        </AppText>
        {program.references.map((reference) => (
          <Pressable
            key={reference.url}
            role="link"
            aria-label={reference.text}
            onPress={() => void Linking.openURL(reference.url)}>
            <AppText variant="caption" tone="accent">
              {reference.text}
            </AppText>
          </Pressable>
        ))}
      </Card>

      <AppText variant="heading" role="heading">
        {t('programs.week1', { count: totalSessions(program) })}
      </AppText>
      <Columns>
        {firstWeek.map((planned) => (
          <Card key={planned.key} style={styles.session}>
            <AppText variant="heading" role="heading">
              {planned.session.name}
            </AppText>
            <AppText variant="caption" tone="muted">
              {planned.session.focus}
            </AppText>
            <SessionExercises session={planned} />
          </Card>
        ))}
      </Columns>

      <AppText variant="heading" role="heading">
        {t('programs.weekByWeek')}
      </AppText>
      <Card style={styles.weeks}>
        {program.weeks.map((week) => (
          <View key={week.number} style={styles.weekRow}>
            <AppText variant="label" style={styles.weekNumber}>
              {t('programs.week', { week: week.number })}
            </AppText>
            <View style={styles.flex}>
              <AppText variant="label" tone={week.phase === 'descarga' ? 'calm' : 'default'}>
                {t(`programs.phases.${week.phase}`)} · {t('programs.rir', { rir: week.rir })}
              </AppText>
              <AppText variant="caption" tone="muted">
                {week.note}
              </AppText>
            </View>
          </View>
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  current: {
    borderColor: colors.accent,
  },
  warning: {
    borderColor: colors.danger,
  },
  referencesTitle: {
    marginTop: spacing.sm,
  },
  session: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  weeks: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  weekRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  weekNumber: {
    width: 80,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
