import { router } from 'expo-router';
import { BookOpen, Dumbbell } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';

export default function WorkoutScreen() {
  const { t } = useTranslation();

  return (
    <Screen title={t('workout.title')} subtitle={t('workout.subtitle')}>
      <EmptyState
        icon={BookOpen}
        title={t('workout.libraryTitle')}
        description={t('workout.libraryDescription')}
        actionLabel={t('workout.openLibrary')}
        onAction={() => router.push('/ejercicios')}
      />
      <EmptyState
        icon={Dumbbell}
        title={t('workout.empty')}
        description={t('workout.emptyDescription')}
      />
    </Screen>
  );
}
