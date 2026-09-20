import type { ReactNode } from 'react';
import { StyleSheet, useWindowDimensions, View, type LayoutChangeEvent } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { useHydrated } from '@/components/ui/use-hydrated';
import { colors, fonts, spacing } from '@/theme/tokens';

export const LANDING_MAX_WIDTH = 1120;

export function useLandingLayout() {
  const { width } = useWindowDimensions();
  const hydrated = useHydrated();
  return {
    width,
    isWide: hydrated && width >= 960,
    isMedium: hydrated && width >= 640,
  };
}

export function Container({ children }: { children: ReactNode }) {
  return <View style={styles.container}>{children}</View>;
}

type SectionProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  onLayout?: (event: LayoutChangeEvent) => void;
  centered?: boolean;
};

export function LandingSection({
  eyebrow,
  title,
  subtitle,
  children,
  onLayout,
  centered = false,
}: SectionProps) {
  const { isWide } = useLandingLayout();

  return (
    <View onLayout={onLayout} style={{ paddingVertical: isWide ? 96 : 64 }}>
      <Container>
        <View style={[styles.header, centered && styles.headerCentered]}>
          <AppText variant="label" tone="accent" style={styles.eyebrow}>
            {eyebrow.toUpperCase()}
          </AppText>
          <AppText
            role="heading"
            style={[
              styles.title,
              { fontSize: isWide ? 48 : 36, lineHeight: isWide ? 52 : 40 },
              centered && styles.centerText,
            ]}>
            {title}
          </AppText>
          {subtitle ? (
            <AppText tone="muted" style={[styles.subtitle, centered && styles.centerText]}>
              {subtitle}
            </AppText>
          ) : null}
        </View>
        {children}
      </Container>
    </View>
  );
}

/** Responsive grid without CSS calc: each cell takes 1/columns of the row. */
export function Grid({
  columns,
  gap = spacing.md,
  children,
}: {
  columns: number;
  gap?: number;
  children: ReactNode[];
}) {
  return (
    <View style={[styles.grid, { marginHorizontal: -gap / 2 }]}>
      {children.map((child, index) => (
        <View
          key={index}
          style={{ width: `${100 / columns}%`, paddingHorizontal: gap / 2, marginBottom: gap }}>
          {child}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: LANDING_MAX_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
  },
  header: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
    maxWidth: 720,
  },
  headerCentered: {
    alignSelf: 'center',
    alignItems: 'center',
  },
  eyebrow: {
    letterSpacing: 1.5,
  },
  title: {
    fontFamily: fonts.displayBold,
    color: colors.text,
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 28,
  },
  centerText: {
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
