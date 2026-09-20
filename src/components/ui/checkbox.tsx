import { Check } from '@/components/icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { colors, minTouchTarget, radius, spacing } from '@/theme/tokens';

export type CheckboxProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string | null;
};

export function Checkbox({ label, checked, onChange, error }: CheckboxProps) {
  return (
    <View style={styles.wrap}>
      <Pressable
        role="checkbox"
        aria-checked={checked}
        aria-label={label}
        onPress={() => onChange(!checked)}
        style={styles.row}>
        <View
          style={[styles.box, checked && styles.boxChecked, error ? styles.boxError : null]}
          aria-hidden>
          {checked ? <Check color={colors.onAccent} size={16} strokeWidth={3} /> : null}
        </View>
        <AppText style={styles.label}>{label}</AppText>
      </Pressable>
      {error ? (
        <AppText variant="caption" tone="danger" role="alert">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    minHeight: minTouchTarget,
    paddingVertical: spacing.xs,
  },
  box: {
    width: 24,
    height: 24,
    marginTop: 2,
    borderRadius: radius.sm - 2,
    borderWidth: 2,
    borderColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxChecked: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  boxError: {
    borderColor: colors.danger,
  },
  label: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
});
