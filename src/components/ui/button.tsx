import { Pressable, StyleSheet, type PressableProps } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { colors, minTouchTarget, radius, spacing } from '@/theme/tokens';

type Variant = 'primary' | 'secondary' | 'ghost';

export type ButtonProps = Omit<PressableProps, 'children'> & {
  label: string;
  variant?: Variant;
};

export function Button({ label, variant = 'primary', disabled, style, ...props }: ButtonProps) {
  return (
    <Pressable
      role="button"
      aria-label={label}
      aria-disabled={disabled ?? undefined}
      disabled={disabled}
      style={(state) => [
        styles.base,
        styles[variant],
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
  },
  primary: {
    backgroundColor: colors.accent,
  },
  secondary: {
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    fontSize: 16,
  },
});
