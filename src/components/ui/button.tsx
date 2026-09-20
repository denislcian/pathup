import { Pressable, StyleSheet, type PressableProps } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { useHover } from '@/components/ui/use-hover';
import { colors, minTouchTarget, radius, spacing } from '@/theme/tokens';

type Variant = 'primary' | 'secondary' | 'ghost';

export type ButtonProps = Omit<PressableProps, 'children'> & {
  label: string;
  variant?: Variant;
};

export function Button({ label, variant = 'primary', disabled, style, ...props }: ButtonProps) {
  const { hovered, hoverProps } = useHover();

  return (
    <Pressable
      role="button"
      aria-label={label}
      aria-disabled={disabled ?? undefined}
      disabled={disabled}
      {...hoverProps}
      style={(state) => [
        styles.base,
        styles[variant],
        hovered && !disabled && styles[`${variant}Hovered`],
        state.pressed && styles.pressed,
        disabled && styles.disabled,
        typeof style === 'function' ? style(state) : style,
      ]}
      {...props}>
      <AppText
        variant="label"
        style={[styles.label, { color: variant === 'primary' ? colors.onAccent : colors.text }]}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: minTouchTarget,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  primary: {
    backgroundColor: colors.accent,
  },
  primaryHovered: {
    backgroundColor: '#D6FF5C',
  },
  secondary: {
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryHovered: {
    borderColor: colors.textMuted,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  ghostHovered: {
    backgroundColor: colors.surface2,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.4,
    cursor: 'auto',
  },
  label: {
    fontSize: 16,
  },
});
