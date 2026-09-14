import { Link } from 'expo-router';
import { MailCheck } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { authErrorKey } from '@/features/auth/auth-errors';
import {
  createSignUpSchema,
  validate,
  type FieldErrors,
  type SignUpForm,
} from '@/features/auth/auth-schemas';
import { maskBirthDate } from '@/features/auth/birth-date-mask';
import { requireSupabase } from '@/lib/supabase';
import { spacing } from '@/theme/tokens';

const EMPTY_FORM: SignUpForm = {
  displayName: '',
  email: '',
  password: '',
  birthDate: '',
  acceptTerms: false,
  healthConsent: false,
};

export default function SignUpScreen() {
  const { t } = useTranslation();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors<SignUpForm>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const fieldError = (field: keyof SignUpForm) =>
    errors[field] ? t(`auth.errors.${errors[field]}` as 'auth.errors.generic') : null;

  function update<K extends keyof SignUpForm>(field: K, value: SignUpForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit() {
    setSubmitError(null);
    const result = validate(createSignUpSchema(), form);
    if (result.errors) {
      setErrors(result.errors);
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await requireSupabase().auth.signUp({
        email: result.data.email,
        password: result.data.password,
        options: {
          data: {
            display_name: result.data.displayName,
            birth_date: result.data.birthDate,
            health_data_consent: true,
          },
        },
      });
      if (error) throw error;
      // With email confirmation enabled Supabase returns no session until the link is opened.
      if (!data.session) setNeedsConfirmation(true);
    } catch (error) {
      setSubmitError(t(`auth.errors.${authErrorKey(error)}`));
    } finally {
      setSubmitting(false);
    }
  }

  if (needsConfirmation) {
    return (
      <Screen>
        <EmptyState
          icon={MailCheck}
          title={t('auth.checkEmailTitle')}
          description={t('auth.checkEmailBody')}
        />
        <Link href="/entrar" style={styles.link}>
          <AppText tone="accent">{t('auth.submitSignIn')}</AppText>
        </Link>
      </Screen>
    );
  }

  return (
    <Screen
      title={t('auth.signUpTitle')}
      subtitle={t('auth.signUpSubtitle')}
      footer={
        <Button
          label={t('auth.submitSignUp')}
          onPress={handleSubmit}
          disabled={submitting}
          aria-busy={submitting}
        />
      }>
      <TextField
        label={t('auth.name')}
        value={form.displayName}
        onChangeText={(value) => update('displayName', value)}
        autoComplete="given-name"
        textContentType="givenName"
        error={fieldError('displayName')}
      />
      <TextField
        label={t('auth.email')}
        value={form.email}
        onChangeText={(value) => update('email', value)}
        autoComplete="email"
        textContentType="emailAddress"
        keyboardType="email-address"
        autoCapitalize="none"
        error={fieldError('email')}
      />
      <TextField
        label={t('auth.password')}
        value={form.password}
        onChangeText={(value) => update('password', value)}
        autoComplete="new-password"
        textContentType="newPassword"
        password
        hint={t('auth.passwordHint')}
        error={fieldError('password')}
      />
      <TextField
        label={t('auth.birthDate')}
        value={form.birthDate}
        onChangeText={(value) => update('birthDate', maskBirthDate(value))}
        placeholder="DD/MM/AAAA"
        keyboardType="number-pad"
        autoComplete="birthdate-full"
        maxLength={10}
        hint={t('auth.birthDateHint')}
        error={fieldError('birthDate')}
      />

      <View style={styles.consents}>
        <Checkbox
          label={t('auth.acceptTerms')}
          checked={form.acceptTerms}
          onChange={(checked) => update('acceptTerms', checked)}
          error={fieldError('acceptTerms')}
        />
        <Link href="/privacidad" style={styles.link}>
          <AppText tone="accent" variant="label">
            {t('auth.privacyLink')}
          </AppText>
        </Link>
        <Checkbox
          label={t('auth.healthConsent')}
          checked={form.healthConsent}
          onChange={(checked) => update('healthConsent', checked)}
          error={fieldError('healthConsent')}
        />
      </View>

      {submitError ? (
        <AppText tone="danger" role="alert">
          {submitError}
        </AppText>
      ) : null}

      <Link href="/entrar" style={styles.link}>
        <AppText tone="accent" variant="label">
          {t('auth.haveAccount')}
        </AppText>
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  consents: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  link: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
  },
});
