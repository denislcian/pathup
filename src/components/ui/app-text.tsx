import { StyleSheet, Text, type TextProps } from 'react-native';

import { colors, typography, type TypographyVariant } from '@/theme/tokens';

type Tone = 'default' | 'muted' | 'accent' | 'calm' | 'danger';

export type AppTextProps = TextProps & {
  variant?: TypographyVariant;
  tone?: Tone;
};

const toneColor: Record<Tone, string> = {
  default: colors.text,
  muted: colors.textMuted,
  accent: colors.accent,
  calm: colors.calm,
  danger: colors.danger,
};

export function AppText({ variant = 'body', tone = 'default', style, ...props }: AppTextProps) {
  return (
    <Text
      {...props}
      style={[typography[variant], styles.base, { color: toneColor[tone] }, style]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    includeFontPadding: false,
  },
});
