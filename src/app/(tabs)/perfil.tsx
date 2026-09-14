import { CircleUser } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/ui/app-text';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function ProfileScreen() {
  const { t } = useTranslation();

  return (
    <Screen title={t('profile.title')} subtitle={t('profile.subtitle')}>
      <EmptyState
        icon={CircleUser}
        title={t('profile.empty')}
        description={t('profile.emptyDescription')}
      />
      {__DEV__ ? (
        <AppText variant="caption" tone={isSupabaseConfigured ? 'accent' : 'danger'}>
          {isSupabaseConfigured
            ? 'DEV · Supabase configurado'
            : 'DEV · Falta .env.local con EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_KEY'}
        </AppText>
      ) : null}
    </Screen>
  );
}
