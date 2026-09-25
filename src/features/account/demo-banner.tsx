import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { FlaskConical } from '@/components/icons';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { useIsWide } from '@/components/ui/columns';
import { exitDemo } from '@/features/account/demo';
import { colors, radius, spacing } from '@/theme/tokens';

/**
 * Says the data is made up and offers the way out, without taking half the phone screen: it used
 * to push the session of the day below the fold.
 */
export function DemoBanner() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const isWide = useIsWide();

  return (
    <View style={[styles.banner, isWide && styles.wide]}>
      <View style={styles.text}>
        <View style={styles.titleRow}>
          <FlaskConical color={colors.calm} size={16} aria-hidden />
          <AppText variant="label" role="heading" tone="calm">
            {t('demo.bannerTitle')}
          </AppText>
        </View>
        <AppText variant="caption" tone="muted">
          {t('demo.bannerBody')}
        </AppText>
      </View>
      <View style={styles.actions}>
        <Button
          compact
          label={t('demo.createAccount')}
          onPress={() => void exitDemo(queryClient, '/registro')}
        />
        <Button
          compact
          variant="ghost"
          label={t('demo.exitShort')}
          // The visible word is part of the name, as WCAG 2.5.3 asks.
          aria-label={t('demo.exit')}
          onPress={() => void exitDemo(queryClient)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(106, 169, 255, 0.45)',
    backgroundColor: 'rgba(106, 169, 255, 0.08)',
  },
  wide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  text: {
    flexShrink: 1,
    flexGrow: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
});
