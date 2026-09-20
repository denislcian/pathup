import type { ReactNode } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { spacing, wideBreakpoint } from '@/theme/tokens';

export function useIsWide(): boolean {
  const { width } = useWindowDimensions();
  return width >= wideBreakpoint;
}

/**
 * Lays its children out in columns, so a desktop browser does not show one narrow strip of
 * content with half the screen empty. Falls back to a single column on phones.
 */
export function Columns({
  children,
  count = 2,
  gap = spacing.md,
}: {
  children: ReactNode[];
  count?: number;
  gap?: number;
}) {
  const isWide = useIsWide();
  const items = children.filter(Boolean);

  if (!isWide || count < 2) {
    return <View style={{ gap }}>{items}</View>;
  }

  return (
    <View style={[styles.row, { marginHorizontal: -gap / 2 }]}>
      {items.map((child, index) => (
        <View
          key={index}
          style={{ width: `${100 / count}%`, paddingHorizontal: gap / 2, marginBottom: gap }}>
          {child}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
});
