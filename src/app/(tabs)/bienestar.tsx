import { HeartPulse } from '@/components/icons';
import { useTranslation } from 'react-i18next';

import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';

export default function WellnessScreen() {
  const { t } = useTranslation();

  return (
    <Screen title={t('wellness.title')} subtitle={t('wellness.subtitle')}>
      <EmptyState
        icon={HeartPulse}
        tone="calm"
        title={t('wellness.empty')}
        description={t('wellness.emptyDescription')}
      />
    </Screen>
  );
}
