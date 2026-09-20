import { Check } from '@/components/icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { colors, minTouchTarget, radius, spacing } from '@/theme/tokens';

export type OptionCardProps = {
  title: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
  role?: 'radio' | 'checkbox';
};

export function OptionCard({
  title,
  description,
  selected,
  onPress,
  role = 'radio',
}: OptionCardProps) {
  return (
    <Pressable
      role={role}
      aria-checked={selected}
      aria-label={description ? `${title}. ${description}` : title}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        selected && styles.selected,
        pressed && styles.pressed,
      ]}>
      <View style={styles.text}>
        <AppText variant="heading">{title}</AppText>
        {description ? <AppText tone="muted">{description}</AppText> : null}
      </View>
      <View style={[styles.indicator, selected && styles.indicatorSelected]} aria-hidden>
        {selected ? <Check color={colors.onAccent} size={16} strokeWidth={3} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: minTouchTarget + 16,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  selected: {
    borderColor: colors.accent,
    backgroundColor: colors.surface2,
  },
  pressed: {
    opacity: 0.85,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  indicator: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
});
