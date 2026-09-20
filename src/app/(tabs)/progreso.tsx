import { TrendingUp } from '@/components/icons';
import { useTranslation } from 'react-i18next';

import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';

export default function ProgressScreen() {
  const { t } = useTranslation();

  return (
    <Screen title={t('progress.title')} subtitle={t('progress.subtitle')}>
      <EmptyState
        icon={TrendingUp}
        title={t('progress.empty')}
        description={t('progress.emptyDescription')}
      />
    </Screen>
  );
}
