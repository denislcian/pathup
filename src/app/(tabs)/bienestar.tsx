import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { LineChart } from '@/components/charts/line-chart';
import { ChevronRight, CloudOff, HeartPulse, Wind } from '@/components/icons';
import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { Columns } from '@/components/ui/columns';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { useHover } from '@/components/ui/use-hover';
import { todayIso } from '@/domain/age';
import {
  averageReadiness,
  BREATHING_PATTERNS,
  checkinStreak,
  patternSeconds,
  readinessScore,
} from '@/domain/wellness';
import { StatRow, StatTile } from '@/features/history/history-components';
import { CheckinForm } from '@/features/wellness/checkin-form';
import { ReadinessCard } from '@/features/wellness/readiness-card';
import { useCheckins, useSaveCheckin } from '@/features/wellness/wellness-api';
import { formatMediumDate, formatNumber, formatShortDate } from '@/lib/format';
import { colors, minTouchTarget, radius, spacing } from '@/theme/tokens';

const HISTORY_SHOWN = 7;

export default function WellnessScreen() {
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  const query = useCheckins();
  const save = useSaveCheckin();
  const [editing, setEditing] = useState(false);

  const today = todayIso();
  const checkins = query.data?.checkins ?? [];
  const todayCheckin = checkins.find((checkin) => checkin.date === today) ?? null;
  const streak = checkinStreak(checkins, today);
  const average = averageReadiness(checkins);
  const series = [...checkins]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-14)
    .map((checkin) => ({
      label: formatShortDate(`${checkin.date}T12:00:00`, language),
      value: readinessScore(checkin),
    }));

  return (
    <Screen wide title={t('wellness.title')} subtitle={t('wellness.subtitle')}>
      {query.data?.offline ? (
        <View style={styles.notice}>
          <CloudOff color={colors.warning} size={16} aria-hidden />
          <AppText variant="caption" tone="muted" style={styles.flex}>
            {t('wellness.offline')}
          </AppText>
        </View>
      ) : null}

      {checkins.length > 0 ? (
        <StatRow>
          <StatTile
            label={t('wellness.streak')}
            value={t('wellness.daysCount', { count: streak })}
            hint={t('wellness.streakHint')}
          />
          {average !== null ? (
            <StatTile
              label={t('wellness.average')}
              value={String(average)}
              hint={t('wellness.averageHint')}
            />
          ) : null}
        </StatRow>
      ) : null}

      <Columns>
        {[
          <View key="today" style={styles.stack}>
            {query.isPending ? (
              <AppText tone="muted">{t('wellness.loading')}</AppText>
            ) : todayCheckin && !editing ? (
              <ReadinessCard checkin={todayCheckin} onEdit={() => setEditing(true)} />
            ) : (
              <CheckinForm
                today={today}
                initial={todayCheckin}
                saving={save.isPending}
                error={save.isError}
                onCancel={todayCheckin ? () => setEditing(false) : undefined}
                onSave={(checkin) => save.mutate(checkin, { onSuccess: () => setEditing(false) })}
              />
            )}

            <Card style={styles.card}>
              <View style={styles.row}>
                <Wind color={colors.calm} size={20} aria-hidden />
                <AppText variant="heading" role="heading" style={styles.flex}>
                  {t('wellness.breathingTitle')}
                </AppText>
              </View>
              <AppText tone="muted">{t('wellness.breathingDescription')}</AppText>
              {BREATHING_PATTERNS.map((pattern) => (
                <PatternRow
                  key={pattern.slug}
                  name={t(`wellness.patterns.${pattern.slug}.name`)}
                  detail={t(`wellness.patterns.${pattern.slug}.detail`)}
                  minutes={Math.round(patternSeconds(pattern) / 60)}
                  onPress={() =>
                    router.push({
                      pathname: '/bienestar/respiracion',
                      params: { patron: pattern.slug },
                    })
                  }
                />
              ))}
            </Card>
          </View>,

          <View key="history" style={styles.stack}>
            {series.length > 1 ? (
              <Card style={styles.card}>
                <AppText variant="heading" role="heading">
                  {t('wellness.chartTitle')}
                </AppText>
                <LineChart
                  title={t('wellness.chartTitle')}
                  data={series}
                  formatValue={(value) => String(Math.round(value))}
                />
                <AppText variant="caption" tone="muted">
                  {t('wellness.chartHint')}
                </AppText>
              </Card>
            ) : null}

            {checkins.length > 0 ? (
              <Card style={styles.card}>
                <AppText variant="heading" role="heading">
                  {t('wellness.history')}
                </AppText>
                {checkins.slice(0, HISTORY_SHOWN).map((checkin) => (
                  <View key={checkin.date} style={styles.historyRow}>
                    <AppText variant="label" style={styles.historyDate}>
                      {formatMediumDate(`${checkin.date}T12:00:00`, language)}
                    </AppText>
                    <AppText variant="caption" tone="muted" style={styles.flex}>
                      {t('wellness.historyLine', {
                        readiness: readinessScore(checkin),
                        hours: formatNumber(checkin.sleepHours, language),
                        energy: checkin.energy,
                      })}
                    </AppText>
                  </View>
                ))}
              </Card>
            ) : (
              <EmptyState
                icon={HeartPulse}
                title={t('wellness.empty')}
                description={t('wellness.emptyDescription')}
              />
            )}
          </View>,
        ]}
      </Columns>
    </Screen>
  );
}

function PatternRow({
  name,
  detail,
  minutes,
  onPress,
}: {
  name: string;
  detail: string;
  minutes: number;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const { hovered, hoverProps } = useHover();

  return (
    <Pressable
      role="button"
      aria-label={t('wellness.startBreathing', { name })}
      onPress={onPress}
      {...hoverProps}
      style={[styles.patternRow, hovered && styles.patternRowHovered]}>
      <View style={styles.flex}>
        <AppText variant="label">{name}</AppText>
        <AppText variant="caption" tone="muted">
          {detail} · {t('wellness.minutes', { minutes })}
        </AppText>
      </View>
      <ChevronRight color={colors.textMuted} size={18} aria-hidden />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  stack: {
    gap: spacing.md,
  },
  card: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  patternRow: {
    cursor: 'pointer',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: minTouchTarget,
    paddingHorizontal: spacing.sm,
    marginHorizontal: -spacing.sm,
    borderRadius: radius.sm,
  },
  patternRowHovered: {
    backgroundColor: colors.surface2,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  historyDate: {
    width: 104,
  },
});
