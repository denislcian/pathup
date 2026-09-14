import { Link } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { authErrorKey } from '@/features/auth/auth-errors';
import {
  signInSchema,
  validate,
  type FieldErrors,
  type SignInData,
} from '@/features/auth/auth-schemas';
import { requireSupabase } from '@/lib/supabase';
import { spacing } from '@/theme/tokens';

export default function SignInScreen() {
  const { t } = useTranslation();
  const [form, setForm] = useState<SignInData>({ email: '', password: '' });
  const [errors, setErrors] = useState<FieldErrors<SignInData>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update(field: keyof SignInData, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit() {
    setSubmitError(null);
    const result = validate(signInSchema, form);
    if (result.errors) {
      setErrors(result.errors);
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await requireSupabase().auth.signInWithPassword(result.data);
      if (error) throw error;
    } catch (error) {
      setSubmitError(t(`auth.errors.${authErrorKey(error)}`));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen
      title={t('auth.signInTitle')}
      subtitle={t('auth.signInSubtitle')}
      footer={
        <Button
          label={t('auth.submitSignIn')}
          onPress={handleSubmit}
          disabled={submitting}
          aria-busy={submitting}
        />
      }>
      <TextField
        label={t('auth.email')}
        value={form.email}
        onChangeText={(value) => update('email', value)}
        autoComplete="email"
        textContentType="emailAddress"
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.email ? t(`auth.errors.${errors.email}` as 'auth.errors.generic') : null}
      />
      <TextField
        label={t('auth.password')}
        value={form.password}
        onChangeText={(value) => update('password', value)}
        autoComplete="current-password"
        textContentType="password"
        password
        onSubmitEditing={handleSubmit}
        error={
          errors.password ? t(`auth.errors.${errors.password}` as 'auth.errors.generic') : null
        }
      />

      {submitError ? (
        <AppText tone="danger" role="alert">
          {submitError}
        </AppText>
      ) : null}

      <Link href="/registro" style={styles.link}>
        <AppText tone="accent" variant="label">
          {t('auth.noAccount')}
        </AppText>
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  link: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
  },
});
