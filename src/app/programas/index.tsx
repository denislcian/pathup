import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Chip } from '@/components/ui/chip';
import { Columns } from '@/components/ui/columns';
import { Screen } from '@/components/ui/screen';
import { PROGRAMS } from '@/data/programs';
import { recommendPrograms, type ProgramGoal } from '@/domain/programs';
import { ProgramCard } from '@/features/programs/program-components';
import { useProgramState } from '@/features/programs/programs-api';
import { useProfile } from '@/features/profile/profile-api';
import { spacing } from '@/theme/tokens';

const MINUTES = [30, 45, 60, 75];

export default function ProgramCatalogueScreen() {
  const { t } = useTranslation();
  const profile = useProfile();
  const { program: current } = useProgramState();
  const [minutes, setMinutes] = useState<number | null>(null);

  const data = profile.data;
  const matches = recommendPrograms(PROGRAMS, {
    goal: (data?.goal as ProgramGoal | null) ?? null,
    level: (data?.experience_level as 'beginner' | 'intermediate' | 'advanced' | null) ?? null,
    daysPerWeek: data?.training_days_per_week ?? null,
    equipment: data?.equipment ?? [],
    minutes,
  });

  return (
    <Screen wide insetTop={false} title={t('programs.title')} subtitle={t('programs.subtitle')}>
      <AppText tone="muted">{t('programs.intro')}</AppText>

      <View style={styles.question}>
        <AppText variant="label">{t('programs.minutesQuestion')}</AppText>
        <View style={styles.chips} role="radiogroup" aria-label={t('programs.minutesQuestion')}>
          {MINUTES.map((value) => (
            <Chip
              key={value}
              role="radio"
              label={t('programs.minutesOption', { minutes: value })}
              selected={minutes === value}
              onPress={() => setMinutes(minutes === value ? null : value)}
            />
          ))}
        </View>
        <AppText variant="caption" tone="muted">
          {t('programs.fromOnboarding', {
            days: data?.training_days_per_week ?? '—',
            level: data?.experience_level
              ? t(`onboarding.levels.${data.experience_level}` as 'onboarding.levels.beginner')
              : '—',
          })}
        </AppText>
      </View>

      {current ? (
        <AppText variant="caption" tone="accent">
          {t('programs.currentHint', { name: current.name })}
        </AppText>
      ) : null}

      <Columns>
        {matches.map((match, index) => (
          <ProgramCard
            key={match.program.slug}
            program={match.program}
            reasons={match.reasons}
            missingEquipment={match.missingEquipment}
            recommended={index === 0 && !match.missingEquipment}
          />
        ))}
      </Columns>
    </Screen>
  );
}

const styles = StyleSheet.create({
  question: {
    gap: spacing.xs,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
});
