import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { getExercise } from '@/data/exercises';
import type { RecordHit } from '@/domain/progress';
import { formatKg, formatNumber } from '@/lib/format';
import { colors, radius, spacing } from '@/theme/tokens';

/** "Press banca · Peso máximo 85 kg × 5 · antes 80 kg", one line per record beaten. */
export function RecordList({ records }: { records: RecordHit[] }) {
  const { t, i18n } = useTranslation();
  const language = i18n.language;

  const describe = (hit: RecordHit) => {
    switch (hit.kind) {
      case 'e1rm':
        return {
          value: formatKg(hit.value, language),
          previous: formatKg(hit.previous, language),
        };
      case 'weight':
        return {
          value: `${formatKg(hit.weightKg, language)} × ${hit.reps}`,
          previous: formatKg(hit.previous, language),
        };
      case 'setVolume':
        return {
          value: `${formatKg(hit.value, language)} (${formatKg(hit.weightKg, language)} × ${hit.reps})`,
          previous: formatKg(hit.previous, language),
        };
      case 'reps':
        return {
          value: t('records.repsValue', { count: hit.value }),
          previous: formatNumber(hit.previous, language),
        };
    }
  };

  return (
    <View style={styles.list}>
      {records.map((hit) => {
        const { value, previous } = describe(hit);
        return (
          <View key={`${hit.slug}-${hit.kind}`} style={styles.item}>
            <View style={styles.marker} aria-hidden />
            <View style={styles.flex}>
              <AppText variant="label">
                {getExercise(hit.slug)?.name ?? hit.slug} · {t(`records.kinds.${hit.kind}`)}
              </AppText>
              <AppText variant="caption" tone="muted">
                {t('records.detail', { value, previous })}
              </AppText>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  list: {
    gap: spacing.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  marker: {
    width: 8,
    height: 8,
    marginTop: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
});
