import { CloudOff } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { supabase } from '@/lib/supabase';
import { colors, spacing } from '@/theme/tokens';

export function ProfileLoadError({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <EmptyState
        icon={CloudOff}
        title={t('profile.loadError')}
        description={t('auth.errors.network')}
        actionLabel={t('common.retry')}
        onAction={onRetry}
      />
      <Button
        label={t('auth.signOut')}
        variant="ghost"
        onPress={() => void supabase?.auth.signOut()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.md,
    gap: spacing.md,
    backgroundColor: colors.bg,
  },
});
