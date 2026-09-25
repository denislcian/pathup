import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { useHover } from '@/components/ui/use-hover';
import { colors, fonts, radius, spacing } from '@/theme/tokens';

export type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  /**
   * `radio` for single choice groups, `checkbox` for toggles. A tappable chip without either is a
   * plain button; a chip without `onPress` is a small static tag.
   */
  role?: 'radio' | 'checkbox';
  variant?: 'filled' | 'outline';
};

export function Chip({ label, selected = false, onPress, role, variant = 'filled' }: ChipProps) {
  const { hovered, hoverProps } = useHover();
  // Information, not a control: smaller, so nobody tries to tap it.
  if (!onPress) {
    return (
      <View style={[styles.tag, variant === 'filled' ? styles.selected : styles.outline]}>
        <AppText
          variant="caption"
          style={[
            styles.tagText,
            { color: variant === 'filled' ? colors.onAccent : colors.accent },
          ]}
          numberOfLines={1}>
          {label}
        </AppText>
      </View>
    );
  }

  return (
    <Pressable
      role={role ?? 'button'}
      aria-checked={role ? selected : undefined}
      aria-label={label}
      onPress={onPress}
      {...hoverProps}
      style={({ pressed }) => [
        styles.chip,
        selected ? styles.selected : styles.idle,
        styles.interactive,
        hovered && !selected && styles.hovered,
        pressed && styles.pressed,
      ]}>
      <AppText
        variant="label"
        style={{ color: selected ? colors.onAccent : colors.text }}
        numberOfLines={1}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 40,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  idle: {
    backgroundColor: colors.surface2,
    borderColor: colors.border,
  },
  interactive: {
    cursor: 'pointer',
  },
  hovered: {
    borderColor: colors.textMuted,
  },
  selected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: colors.accent,
  },
  pressed: {
    opacity: 0.8,
  },
  tag: {
    minHeight: 26,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagText: {
    fontFamily: fonts.bodyMedium,
  },
});
