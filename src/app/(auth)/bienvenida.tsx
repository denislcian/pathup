import { router } from 'expo-router';
import { HeartPulse, ListChecks, Timer } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { colors, spacing } from '@/theme/tokens';

export default function WelcomeScreen() {
  const { t } = useTranslation();

  const points = [
    { icon: Timer, label: t('welcome.pointWorkout') },
    { icon: ListChecks, label: t('welcome.pointPrograms') },
    { icon: HeartPulse, label: t('welcome.pointWellness') },
  ];

  return (
    <Screen
      footer={
        <View style={styles.actions}>
          <Button label={t('welcome.createAccount')} onPress={() => router.push('/registro')} />
          <Button
            label={t('welcome.signIn')}
            variant="secondary"
            onPress={() => router.push('/entrar')}
          />
        </View>
      }>
      <View style={styles.hero}>
        <AppText variant="display" role="heading" style={styles.logo}>
          Path
          <AppText variant="display" tone="accent" style={styles.logo}>
            Up
          </AppText>
        </AppText>
        <AppText variant="title" tone="muted">
          {t('welcome.tagline')}
        </AppText>
      </View>

      <View style={styles.points}>
        {points.map(({ icon: Icon, label }) => (
          <View key={label} style={styles.point}>
            <View style={styles.pointIcon} aria-hidden>
              <Icon color={colors.accent} size={22} />
            </View>
            <AppText variant="heading" style={styles.pointLabel}>
              {label}
            </AppText>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginTop: spacing.xxl,
    gap: spacing.sm,
  },
  logo: {
    fontSize: 64,
    lineHeight: 68,
  },
  points: {
    marginTop: spacing.xl,
    gap: spacing.lg,
  },
  point: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  pointIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointLabel: {
    flex: 1,
  },
  actions: {
    gap: spacing.sm,
  },
});
