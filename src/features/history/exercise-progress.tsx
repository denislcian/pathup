import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { LineChart } from '@/components/charts/line-chart';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { exerciseHistory, type ExerciseSession } from '@/domain/progress';
import { useWorkoutHistory } from '@/features/history/history-api';
import { formatKg, formatMediumDate, formatNumber, formatShortDate } from '@/lib/format';
import { spacing } from '@/theme/tokens';

type Metric = 'e1rm' | 'weight' | 'volume' | 'reps';

const METRIC_VALUE: Record<Metric, (session: ExerciseSession) => number | null> = {
  e1rm: (session) => session.bestE1rm,
  weight: (session) => (session.topWeightKg > 0 ? session.topWeightKg : null),
  volume: (session) => (session.volumeKg > 0 ? session.volumeKg : null),
  // Reps only tell the story for bodyweight work; with a load, the 1RM estimate does.
  reps: (session) => (session.topWeightKg === 0 ? session.maxReps : null),
};

const RECENT = 5;

/** "Tu progreso" on an exercise: chart of the chosen metric, best and change, and past sessions. */
export function ExerciseProgress({ slug, name }: { slug: string; name: string }) {
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  const history = useWorkoutHistory();
  const sessions = exerciseHistory(history.data?.workouts ?? [], slug);
  const [chosen, setChosen] = useState<Metric | null>(null);
  const [showAll, setShowAll] = useState(false);

  if (sessions.length === 0) return null;

  const available = (['e1rm', 'weight', 'volume', 'reps'] as const).filter((metric) =>
    sessions.some((session) => METRIC_VALUE[metric](session) !== null),
  );
  // Loaded exercises default to the 1RM estimate; bodyweight ones to reps.
  const metric = chosen && available.includes(chosen) ? chosen : available[0];
  const points = sessions
    .map((session) => ({ session, value: METRIC_VALUE[metric](session) }))
    .filter((point): point is { session: ExerciseSession; value: number } => point.value !== null);

  const format = (value: number) =>
    metric === 'reps' ? formatNumber(value, language, 0) : formatKg(value, language);
  const values = points.map((point) => point.value);
  const best = Math.max(...values);
  const change = values.length > 1 ? values.at(-1)! - values[0] : null;
  const recent = [...sessions].reverse();
  const listed = showAll ? recent : recent.slice(0, RECENT);

  return (
    <Card style={styles.card}>
      <AppText variant="heading" role="heading">
        {t('exerciseProgress.title')}
      </AppText>

      {available.length > 1 ? (
        <View style={styles.chips} role="radiogroup" aria-label={t('exerciseProgress.metric')}>
          {available.map((item) => (
            <Chip
              key={item}
              role="radio"
              label={t(`exerciseProgress.metrics.${item}`)}
              selected={item === metric}
              onPress={() => setChosen(item)}
            />
          ))}
        </View>
      ) : null}

      <View style={styles.stats}>
        <Stat label={t('exerciseProgress.best')} value={format(best)} />
        <Stat
          label={t('exerciseProgress.change', { count: points.length })}
          value={change === null ? '—' : `${change >= 0 ? '+' : '−'}${format(Math.abs(change))}`}
        />
        <Stat
          label={t('exerciseProgress.sessions')}
          value={formatNumber(sessions.length, language)}
        />
      </View>

      {points.length > 1 ? (
        <LineChart
          title={t('exerciseProgress.chartTitle', {
            metric: t(`exerciseProgress.metrics.${metric}`),
            name,
          })}
          data={points.map((point) => ({
            label: formatShortDate(point.session.date, language),
            value: point.value,
          }))}
          formatValue={format}
          formatTick={(value) => formatNumber(value, language)}
        />
      ) : (
        <AppText tone="muted">{t('exerciseProgress.needTwo')}</AppText>
      )}

      {metric === 'e1rm' ? (
        <AppText variant="caption" tone="muted">
          {t('exerciseProgress.e1rmHint')}
        </AppText>
      ) : null}

      <AppText variant="label" role="heading" style={styles.subheading}>
        {t('exerciseProgress.history')}
      </AppText>
      {listed.map((session) => (
        <View key={session.workoutId} style={styles.session}>
          <AppText variant="label" style={styles.date}>
            {formatMediumDate(session.date, language)}
          </AppText>
          <AppText variant="caption" tone="muted" style={styles.flex}>
            {session.sets
              .map((set) => `${formatNumber(set.weightKg, language)} × ${set.reps}`)
              .join(' · ')}
          </AppText>
        </View>
      ))}
      {recent.length > RECENT ? (
        <Button
          variant="ghost"
          label={showAll ? t('progress.showLess') : t('exerciseProgress.allSessions')}
          onPress={() => setShowAll((value) => !value)}
        />
      ) : null}
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <AppText variant="caption" tone="muted">
        {label}
      </AppText>
      <AppText variant="heading">{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  card: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  stat: {
    flex: 1,
    gap: 2,
  },
  subheading: {
    marginTop: spacing.sm,
  },
  session: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  date: {
    width: 96,
  },
});
