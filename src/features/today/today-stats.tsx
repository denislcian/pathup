import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { colors, fonts, radius, spacing } from '@/theme/tokens';

export type TodayStat = {
  key: string;
  /** The big number: "2", "8", "2/4". */
  value: string;
  /** What it counts, short enough for a third of a phone. Read after the value it makes a sentence: "2 entrenos esta semana". */
  label: string;
  highlight?: boolean;
};

/**
 * Today's numbers in one compact strip. Three tiles took a whole phone screen and pushed the
 * session of the day below the fold; a strip fits in 90 px on any width.
 */
export function TodayStats({ stats }: { stats: TodayStat[] }) {
  return (
    <View style={styles.strip}>
      {stats.map((stat, index) => (
        // One element for screen readers on the phone: "2 entrenos esta semana".
        <View key={stat.key} accessible style={[styles.item, index > 0 && styles.divider]}>
          <AppText style={[styles.value, stat.highlight && styles.highlight]}>{stat.value}</AppText>
          <AppText variant="caption" tone="muted" style={styles.label} numberOfLines={2}>
            {stat.label}
          </AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    gap: 2,
  },
  divider: {
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  value: {
    fontFamily: fonts.displayBold,
    fontSize: 32,
    lineHeight: 36,
    color: colors.text,
  },
  highlight: {
    color: colors.accent,
  },
  label: {
    textAlign: 'center',
  },
});
