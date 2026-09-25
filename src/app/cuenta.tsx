import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Download, Trash2 } from '@/components/icons';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { deleteMyAccount, exportFileName, exportMyData } from '@/features/account/account-api';
import { forgetThisDevice, signOutAndForget } from '@/features/account/sign-out';
import { useAuth } from '@/features/auth/auth-provider';
import { useWorkoutSync } from '@/features/workout/use-workout-sync';
import { isDemoMode } from '@/lib/demo-mode';
import { saveTextFile } from '@/lib/save-file';
import { colors, spacing } from '@/theme/tokens';

export default function AccountScreen() {
  const { t } = useTranslation();
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const { pending } = useWorkoutSync();
  const [confirmation, setConfirmation] = useState('');
  const word = t('account.confirmWord');
  const demo = isDemoMode();

  const download = useMutation({
    mutationFn: async () => {
      if (!session) throw new Error('No session');
      const contents = await exportMyData(session.user.id);
      return saveTextFile(exportFileName(), contents);
    },
  });

  const remove = useMutation({
    mutationFn: async () => {
      await deleteMyAccount();
      // The account no longer exists: sign out and leave nothing behind on the device.
      if (demo) await forgetThisDevice(queryClient);
      else await signOutAndForget(queryClient);
    },
  });

  const confirmed = confirmation.trim().toUpperCase() === word;

  return (
    <Screen insetTop={false} title={t('account.title')} subtitle={t('account.subtitle')}>
      <Card style={styles.card}>
        <View style={styles.row}>
          <Download color={colors.accent} size={20} aria-hidden />
          <AppText variant="heading" role="heading" style={styles.flex}>
            {t('account.exportTitle')}
          </AppText>
        </View>
        <AppText tone="muted">{t('account.exportBody')}</AppText>
        <Button
          label={download.isPending ? t('account.exporting') : t('account.export')}
          variant="secondary"
          disabled={download.isPending}
          aria-busy={download.isPending}
          onPress={() => download.mutate()}
        />
        {download.isSuccess && download.data ? (
          <AppText variant="caption" tone="accent" role="status">
            {t('account.exported')}
          </AppText>
        ) : null}
        {download.isError ? (
          <AppText variant="caption" tone="danger" role="alert">
            {t('account.errors.export')}
          </AppText>
        ) : null}
      </Card>

      <Card style={[styles.card, styles.danger]}>
        <View style={styles.row}>
          <Trash2 color={colors.danger} size={20} aria-hidden />
          <AppText variant="heading" role="heading" style={styles.flex}>
            {t('account.deleteTitle')}
          </AppText>
        </View>
        <AppText tone="muted">{t('account.deleteBody')}</AppText>
        {pending > 0 ? (
          <AppText variant="caption" tone="warning">
            {t('account.pendingWarning', { count: pending })}
          </AppText>
        ) : null}
        {demo ? (
          <AppText variant="caption" tone="muted">
            {t('account.demoHint')}
          </AppText>
        ) : null}
        <TextField
          label={t('account.confirmLabel', { word })}
          value={confirmation}
          onChangeText={setConfirmation}
          autoCapitalize="characters"
          autoCorrect={false}
        />
        <Button
          label={remove.isPending ? t('account.deleting') : t('account.delete')}
          disabled={!confirmed || remove.isPending}
          aria-busy={remove.isPending}
          onPress={() => remove.mutate()}
        />
        {remove.isError ? (
          <AppText variant="caption" tone="danger" role="alert">
            {t('account.errors.delete')}
          </AppText>
        ) : null}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  card: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  danger: {
    borderColor: colors.danger,
  },
});
