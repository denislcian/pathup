import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { colors, maxContentWidth, spacing } from '@/theme/tokens';

export type ScreenProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

/** Standard tab screen: safe-area aware, scrollable, large title, centered column on wide screens. */
export function Screen({ title, subtitle, children }: ScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.lg }]}>
      <View style={styles.column}>
        <View style={styles.header}>
          {subtitle ? (
            <AppText variant="label" tone="muted">
              {subtitle}
            </AppText>
          ) : null}
          <AppText variant="display" role="heading" aria-level={1}>
            {title}
          </AppText>
        </View>
        {children}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
    alignItems: 'center',
  },
  column: {
    width: '100%',
    maxWidth: maxContentWidth,
    gap: spacing.md,
  },
  header: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
});
