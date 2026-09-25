import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Screen } from '@/components/ui/screen';
import { spacing } from '@/theme/tokens';

const SECTIONS = ['who', 'why', 'health', 'where', 'rights'] as const;

export default function PrivacyScreen() {
  const { t } = useTranslation();

  return (
    <Screen insetTop={false} documentTitle={t('privacy.title')}>
      <AppText tone="muted">{t('privacy.intro')}</AppText>
      {SECTIONS.map((section) => (
        <View key={section} style={{ gap: spacing.xs }}>
          <AppText variant="heading" role="heading">
            {t(`privacy.${section}Title`)}
          </AppText>
          <AppText>{t(`privacy.${section}Body`)}</AppText>
        </View>
      ))}
    </Screen>
  );
}
