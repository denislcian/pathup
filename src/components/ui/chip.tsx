import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { useHover } from '@/components/ui/use-hover';
import { colors, radius, spacing } from '@/theme/tokens';

export type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  /**
   * `radio` for single choice groups, `checkbox` for toggles. A tappable chip without either is a
   * plain button; static chips have no role.
   */
  role?: 'radio' | 'checkbox';
  variant?: 'filled' | 'outline';
};

export function Chip({ label, selected = false, onPress, role, variant = 'filled' }: ChipProps) {
  const { hovered, hoverProps } = useHover();
  const interactive = Boolean(onPress);
  const highlighted = selected || (!interactive && variant === 'filled');

  return (
    <Pressable
      role={role ?? (interactive ? 'button' : undefined)}
      aria-checked={role ? selected : undefined}
      aria-label={label}
      disabled={!interactive}
      onPress={onPress}
      {...hoverProps}
      style={({ pressed }) => [
        styles.chip,
        highlighted ? styles.selected : styles.idle,
        !interactive && variant === 'outline' && styles.outline,
        interactive && styles.interactive,
        interactive && hovered && !highlighted && styles.hovered,
        pressed && styles.pressed,
      ]}>
      <AppText
        variant="label"
        style={{ color: highlighted ? colors.onAccent : colors.text }}
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
});
