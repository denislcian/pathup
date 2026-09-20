import { Activity, Dumbbell } from '@/components/icons';
import { useTranslation } from 'react-i18next';

import { Columns } from '@/components/ui/columns';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { useProfile } from '@/features/profile/profile-api';

export default function TodayScreen() {
  const { t, i18n } = useTranslation();
  const profile = useProfile();
  const today = new Intl.DateTimeFormat(i18n.language, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());
  const name = profile.data?.display_name;

  return (
    <Screen wide title={name ? t('today.greeting', { name }) : t('today.title')} subtitle={today}>
      <Columns>
        {[
          <EmptyState
            key="workout"
            icon={Dumbbell}
            title={t('today.workoutTitle')}
            description={t('today.workoutEmpty')}
          />,
          <EmptyState
            key="checkin"
            icon={Activity}
            tone="calm"
            title={t('today.checkinTitle')}
            description={t('today.checkinEmpty')}
          />,
        ]}
      </Columns>
    </Screen>
  );
}
