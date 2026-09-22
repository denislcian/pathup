import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Activity } from '@/components/icons';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { sessionAdjustment, type Checkin } from '@/domain/wellness';
import { colors, radius, spacing } from '@/theme/tokens';

const BAND_COLOR = {
  great: colors.accent,
  normal: colors.accent,
  easy: colors.warning,
  rest: colors.danger,
} as const;

/** Today's readiness with what it suggests doing about the session. */
export function ReadinessCard({
  checkin,
  onEdit,
  compact = false,
}: {
  checkin: Checkin;
  onEdit?: () => void;
  compact?: boolean;
}) {
  const { t } = useTranslation();
  const advice = sessionAdjustment(checkin);
  const color = BAND_COLOR[advice.band];

  return (
    <Card style={[styles.card, { borderColor: color }]}>
      <View style={styles.row}>
        <Activity color={color} size={20} aria-hidden />
        <AppText variant="heading" role="heading" style={styles.flex}>
          {t('wellness.readinessTitle')}
        </AppText>
        <AppText variant="title" style={{ color }}>
          {advice.score}
        </AppText>
      </View>

      <View style={styles.track} aria-hidden>
        <View style={[styles.fill, { width: `${advice.score}%`, backgroundColor: color }]} />
      </View>

      <AppText variant="label">{t(`wellness.bands.${advice.band}`)}</AppText>
      <AppText tone="muted">{t(`wellness.advice.${advice.band}`)}</AppText>
      {advice.weakest ? (
        <AppText variant="caption" tone="muted">
          {t(`wellness.because.${advice.weakest}` as 'wellness.because.energy')}
        </AppText>
      ) : null}

      {!compact && onEdit ? (
        <Button label={t('wellness.edit')} variant="secondary" onPress={onEdit} />
      ) : null}
    </Card>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
  },
});
