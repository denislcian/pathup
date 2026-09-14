import { Activity, Dumbbell } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';

export default function TodayScreen() {
  const { t, i18n } = useTranslation();
  const today = new Intl.DateTimeFormat(i18n.language, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  return (
    <Screen title={t('today.title')} subtitle={today}>
      <EmptyState
        icon={Dumbbell}
        title={t('today.workoutTitle')}
        description={t('today.workoutEmpty')}
      />
      <EmptyState
        icon={Activity}
        tone="calm"
        title={t('today.checkinTitle')}
        description={t('today.checkinEmpty')}
      />
    </Screen>
  );
}
