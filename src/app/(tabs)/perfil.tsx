import { useQueryClient } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/features/auth/auth-provider';
import { useProfile } from '@/features/profile/profile-api';
import { supabase } from '@/lib/supabase';
import { spacing } from '@/theme/tokens';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { session } = useAuth();
  const profile = useProfile();
  const queryClient = useQueryClient();
  const data = profile.data;

  async function signOut() {
    await supabase?.auth.signOut();
    queryClient.clear();
  }

  const rows = data
    ? [
        {
          label: t('profile.goal'),
          value: data.goal ? t(`onboarding.goals.${data.goal}` as 'onboarding.goals.health') : '—',
        },
        {
          label: t('profile.level'),
          value: data.experience_level
            ? t(`onboarding.levels.${data.experience_level}` as 'onboarding.levels.beginner')
            : '—',
        },
        { label: t('profile.days'), value: String(data.training_days_per_week ?? '—') },
        {
          label: t('profile.equipment'),
          value:
            data.equipment
              .map((item) => t(`onboarding.equipment.${item}` as 'onboarding.equipment.gym'))
              .join(', ') || '—',
        },
      ]
    : [];

  return (
    <Screen wide title={data?.display_name ?? t('profile.title')} subtitle={session?.user.email}>
      <Card>
        <AppText variant="heading" role="heading">
          {t('profile.summaryTitle')}
        </AppText>
        {rows.map((row) => (
          <View key={row.label} style={styles.row}>
            <AppText tone="muted">{row.label}</AppText>
            <AppText style={styles.value}>{row.value}</AppText>
          </View>
        ))}
      </Card>

      <Link href="/privacidad" style={styles.link}>
        <AppText tone="accent" variant="label">
          {t('profile.privacy')}
        </AppText>
      </Link>

      <Button label={t('auth.signOut')} variant="secondary" onPress={signOut} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  value: {
    flexShrink: 1,
    textAlign: 'right',
  },
  link: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
  },
});
