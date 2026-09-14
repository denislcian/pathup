import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { colors, maxContentWidth, spacing } from '@/theme/tokens';

export type ScreenProps = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  /** Set to false on screens that show a navigation header, which already handles the top inset. */
  insetTop?: boolean;
  /** Content pinned below the scroll area (e.g. the main action of a form). */
  footer?: ReactNode;
};

/** Standard screen: safe-area aware, scrollable, keyboard friendly, centered column on wide screens. */
export function Screen({ title, subtitle, children, insetTop = true, footer }: ScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.scroll}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.content,
          { paddingTop: (insetTop ? insets.top : 0) + spacing.lg },
        ]}>
        <View style={styles.column}>
          {title ? (
            <View style={styles.header}>
              {subtitle ? (
                <AppText variant="label" tone="muted">
                  {subtitle}
                </AppText>
              ) : null}
              <AppText variant="display" role="heading">
                {title}
              </AppText>
            </View>
          ) : null}
          {children}
        </View>
      </ScrollView>
      {footer ? (
        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
          <View style={styles.column}>{footer}</View>
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    flex: 1,
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
  footer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
    alignItems: 'center',
  },
});
