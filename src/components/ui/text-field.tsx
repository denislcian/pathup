import { Eye, EyeOff } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/ui/app-text';
import { colors, fonts, minTouchTarget, radius, spacing } from '@/theme/tokens';

export type TextFieldProps = Omit<TextInputProps, 'style'> & {
  label: string;
  hint?: string;
  error?: string | null;
  /** Adds a show/hide toggle and hides the text by default. */
  password?: boolean;
};

export function TextField({ label, hint, error, password, ...inputProps }: TextFieldProps) {
  const { t } = useTranslation();
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);

  return (
    <View style={styles.field}>
      <AppText variant="label">{label}</AppText>
      <View
        style={[
          styles.inputWrap,
          focused && styles.inputFocused,
          error ? styles.inputError : null,
        ]}>
        <TextInput
          {...inputProps}
          aria-label={label}
          aria-invalid={error ? true : undefined}
          secureTextEntry={password ? hidden : inputProps.secureTextEntry}
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.accent}
          style={styles.input}
          onFocus={(event) => {
            setFocused(true);
            inputProps.onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            inputProps.onBlur?.(event);
          }}
        />
        {password ? (
          <Pressable
            role="button"
            aria-label={hidden ? t('common.showPassword') : t('common.hidePassword')}
            hitSlop={8}
            onPress={() => setHidden((value) => !value)}
            style={styles.toggle}>
            {hidden ? (
              <Eye color={colors.textMuted} size={20} />
            ) : (
              <EyeOff color={colors.textMuted} size={20} />
            )}
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <AppText variant="caption" tone="danger" role="alert">
          {error}
        </AppText>
      ) : hint ? (
        <AppText variant="caption" tone="muted">
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: spacing.xs,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: minTouchTarget + 4,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
  },
  inputFocused: {
    borderColor: colors.accent,
  },
  inputError: {
    borderColor: colors.danger,
  },
  input: {
    flex: 1,
    minHeight: minTouchTarget + 4,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 16,
  },
  toggle: {
    paddingHorizontal: spacing.md,
    minHeight: minTouchTarget,
    justifyContent: 'center',
  },
});
