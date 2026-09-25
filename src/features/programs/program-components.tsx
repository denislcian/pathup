import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { ChevronRight, Sprout } from '@/components/icons';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { useHover } from '@/components/ui/use-hover';
import { getExercise } from '@/data/exercises';
import { PROGRAMS } from '@/data/programs';
import { describePrescription } from '@/domain/routines';
import {
  recommendPrograms,
  type PlannedSession,
  type Program,
  type ProgramAnswers,
  type ProgramGoal,
  type ProgramProgress,
} from '@/domain/programs';
import type { SessionAdjustment } from '@/domain/wellness';
import { useStartProgram } from '@/features/programs/programs-api';
import { colors, radius, spacing } from '@/theme/tokens';

/** Progress bar of a programme: sessions done out of the total. */
export function ProgramProgressBar({ progress }: { progress: ProgramProgress }) {
  const { t } = useTranslation();
  const percent = progress.total === 0 ? 0 : Math.round((progress.done / progress.total) * 100);

  return (
    <View style={styles.progress}>
      <View
        style={styles.track}
        role="progressbar"
        aria-label={t('programs.progressLabel', { done: progress.done, total: progress.total })}
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}>
        <View style={[styles.fill, { width: `${percent}%` }]} />
      </View>
      <AppText variant="caption" tone="muted">
        {t('programs.progressText', {
          done: progress.done,
          total: progress.total,
          week: progress.week,
        })}
      </AppText>
    </View>
  );
}

/** A programme in the catalogue: what it is and who it is for. */
export function ProgramCard({
  program,
  reasons,
  missingEquipment,
  recommended = false,
}: {
  program: Program;
  reasons?: string[];
  missingEquipment?: boolean;
  recommended?: boolean;
}) {
  const { t } = useTranslation();
  const { hovered, hoverProps } = useHover();

  return (
    <Pressable
      role="link"
      aria-label={t('programs.open', { name: program.name })}
      onPress={() => router.push({ pathname: '/programas/[slug]', params: { slug: program.slug } })}
      {...hoverProps}
      style={[styles.card, hovered && styles.cardHovered, recommended && styles.cardRecommended]}>
      {recommended ? (
        <View style={styles.badge}>
          <Sprout color={colors.accent} size={16} aria-hidden />
          <AppText variant="caption" tone="accent">
            {t('programs.recommended')}
          </AppText>
        </View>
      ) : null}

      <View style={styles.row}>
        <AppText variant="heading" role="heading" style={styles.flex}>
          {program.name}
        </AppText>
        <ChevronRight color={colors.textMuted} size={18} aria-hidden />
      </View>
      <AppText tone="muted">{program.tagline}</AppText>

      <View style={styles.facts}>
        <AppText variant="caption" tone="muted">
          {t('programs.facts', {
            days: program.daysPerWeek,
            weeks: program.weeks.length,
            minutes: program.minutesPerSession,
          })}
        </AppText>
        <AppText variant="caption" tone="muted">
          {t(`programs.places.${program.place}`)} · {t(`programs.levels.${program.level}`)}
        </AppText>
      </View>

      {missingEquipment ? (
        <AppText variant="caption" tone="warning">
          {t('programs.missingEquipment')}
        </AppText>
      ) : reasons && reasons.length > 0 ? (
        <View style={styles.chips}>
          {reasons.slice(0, 3).map((reason) => (
            <Chip
              key={reason}
              label={t(`programs.reasons.${reason}` as 'programs.reasons.days')}
              variant="outline"
            />
          ))}
        </View>
      ) : null}
    </Pressable>
  );
}

/** The exercises of one session with their prescription (3 × 8-12). */
export function SessionExercises({ session }: { session: PlannedSession }) {
  return (
    <View style={styles.exercises}>
      {session.exercises.map((exercise) => (
        <View key={exercise.slug} style={styles.exerciseRow}>
          <View style={styles.flex}>
            <AppText variant="label" numberOfLines={1}>
              {getExercise(exercise.slug)?.name ?? exercise.slug}
            </AppText>
            {exercise.note ? (
              <AppText variant="caption" tone="muted">
                {exercise.note}
              </AppText>
            ) : null}
          </View>
          <AppText variant="caption" tone="muted">
            {describePrescription(exercise)}
          </AppText>
        </View>
      ))}
    </View>
  );
}

/** "Tu próxima sesión": what the programme says to do today. */
export function NextSessionCard({
  program,
  planned,
  progress,
  onStart,
  disabled = false,
  adjustment = null,
}: {
  program: Program;
  planned: PlannedSession;
  progress: ProgramProgress;
  /** `adjusted` is true when the advice from today's check-in should be applied. */
  onStart: (adjusted: boolean) => void;
  disabled?: boolean;
  adjustment?: SessionAdjustment | null;
}) {
  const { t } = useTranslation();
  // Only a mediocre or bad day changes anything; a good one starts the session as planned.
  const advises =
    adjustment !== null && (adjustment.setsDelta !== 0 || adjustment.weightFactor < 1);

  return (
    <Card style={styles.next}>
      <AppText variant="caption" tone="muted">
        {program.name} · {t('programs.week', { week: planned.week.number })}
      </AppText>
      <AppText variant="title" role="heading">
        {planned.session.name}
      </AppText>
      <AppText tone="muted">{planned.session.focus}</AppText>

      <View style={styles.chips}>
        <Chip label={t(`programs.phases.${planned.week.phase}`)} variant="outline" />
        <Chip label={t('programs.rir', { rir: planned.week.rir })} variant="outline" />
      </View>

      <SessionExercises session={planned} />

      <AppText variant="caption" tone="muted">
        {planned.week.note}
      </AppText>

      <ProgramProgressBar progress={progress} />

      {advises ? (
        <View style={styles.advice}>
          <AppText variant="label" tone="warning">
            {t(`wellness.bands.${adjustment.band}`)} · {adjustment.score}
          </AppText>
          <AppText variant="caption" tone="muted">
            {t(`wellness.adjust.${adjustment.band}` as 'wellness.adjust.easy')}
          </AppText>
        </View>
      ) : null}

      <Button
        label={advises ? t('wellness.startAdjusted') : t('programs.startSession')}
        disabled={disabled}
        onPress={() => onStart(advises)}
      />
      {advises ? (
        <Button
          label={t('wellness.startAsPlanned')}
          variant="ghost"
          disabled={disabled}
          onPress={() => onStart(false)}
        />
      ) : null}
      {disabled ? (
        <AppText variant="caption" tone="muted">
          {t('workout.activeHint')}
        </AppText>
      ) : null}
    </Card>
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
  card: {
    cursor: 'pointer',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs,
  },
  cardHovered: {
    borderColor: colors.textMuted,
  },
  cardRecommended: {
    borderColor: colors.accent,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  facts: {
    gap: 2,
    marginTop: spacing.xs,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  exercises: {
    gap: 2,
    marginTop: spacing.xs,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  next: {
    borderColor: colors.accent,
    padding: spacing.md,
    gap: spacing.sm,
  },
  advice: {
    gap: 2,
    padding: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceRaised,
  },
  progress: {
    gap: spacing.xs,
  },
  track: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surface2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
});

/**
 * First thing a new user sees on Today: the programme that fits their onboarding answers, with
 * why, and one button to start it. The gate of phase 2b is that nobody has to ask what to do.
 */
export function RecommendedProgram({
  profile,
}: {
  profile: {
    goal: string | null;
    experience_level: string | null;
    training_days_per_week: number | null;
    equipment: string[];
  } | null;
}) {
  const { t } = useTranslation();
  const start = useStartProgram();
  const [best] = recommendPrograms(PROGRAMS, {
    goal: (profile?.goal as ProgramGoal | null) ?? null,
    level: (profile?.experience_level as ProgramAnswers['level']) ?? null,
    daysPerWeek: profile?.training_days_per_week ?? null,
    equipment: profile?.equipment ?? [],
    minutes: null,
  });
  if (!best) return null;
  const { program, reasons } = best;

  return (
    <Card style={styles.next}>
      <View style={styles.badge}>
        <Sprout color={colors.accent} size={16} aria-hidden />
        <AppText variant="caption" tone="accent">
          {t('programs.recommended')}
        </AppText>
      </View>
      <AppText variant="title" role="heading">
        {program.name}
      </AppText>
      <AppText tone="muted">{program.tagline}</AppText>
      <AppText variant="caption" tone="muted">
        {t('programs.facts', {
          days: program.daysPerWeek,
          weeks: program.weeks.length,
          minutes: program.minutesPerSession,
        })}
      </AppText>
      {reasons.length > 0 ? (
        <View style={styles.chips}>
          {reasons.slice(0, 3).map((reason) => (
            <Chip
              key={reason}
              label={t(`programs.reasons.${reason}` as 'programs.reasons.days')}
              variant="outline"
            />
          ))}
        </View>
      ) : null}
      <AppText variant="caption" tone="muted">
        {program.why[0]}
      </AppText>
      <Button
        label={start.isPending ? t('programs.starting') : t('programs.start')}
        disabled={start.isPending}
        aria-busy={start.isPending}
        onPress={() => start.mutate(program.slug)}
      />
      <Button
        label={t('today.seeAllPrograms')}
        variant="ghost"
        onPress={() =>
          router.push({ pathname: '/programas/[slug]', params: { slug: program.slug } })
        }
      />
      {start.isError ? (
        <AppText variant="caption" tone="danger" role="alert">
          {t('programs.errors.start')}
        </AppText>
      ) : null}
    </Card>
  );
}
