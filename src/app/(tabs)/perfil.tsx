import { useQueryClient } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/features/auth/auth-provider';
import { useProfile } from '@/features/profile/profile-api';
import { useActiveWorkout } from '@/features/workout/active-workout-store';
import { useFinishedWorkout } from '@/features/workout/finished-workout-store';
import { useWorkoutSync } from '@/features/workout/use-workout-sync';
import { clearLocalWorkouts } from '@/features/workout/workout-storage';
import { supabase } from '@/lib/supabase';
import { colors, spacing } from '@/theme/tokens';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { session } = useAuth();
  const profile = useProfile();
  const queryClient = useQueryClient();
  const data = profile.data;
  const { pending } = useWorkoutSync();
  const active = useActiveWorkout((state) => state.workout);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const unsaved = pending > 0 || active !== null;

  async function signOut() {
    await supabase?.auth.signOut();
    // Nothing of this account stays on the device for the next person who signs in.
    await clearLocalWorkouts();
    useActiveWorkout.getState().discard();
    useFinishedWorkout.getState().clear();
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

      {confirmSignOut ? (
        <Card style={styles.warning}>
          <AppText variant="heading" role="heading">
            {t('profile.signOutTitle')}
          </AppText>
          <AppText tone="muted">
            {pending > 0
              ? t('profile.signOutPending', { count: pending })
              : t('profile.signOutActive')}
          </AppText>
          <View style={styles.actions}>
            <Button
              label={t('profile.signOutCancel')}
              variant="secondary"
              onPress={() => setConfirmSignOut(false)}
              style={styles.flex}
            />
            <Button label={t('profile.signOutAnyway')} onPress={signOut} style={styles.flex} />
          </View>
        </Card>
      ) : (
        <Button
          label={t('auth.signOut')}
          variant="secondary"
          onPress={() => (unsaved ? setConfirmSignOut(true) : void signOut())}
        />
      )}
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
  flex: {
    flex: 1,
  },
  warning: {
    borderColor: colors.warning,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
