import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { colors, radius, spacing } from '@/theme/tokens';

export type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  tone?: 'accent' | 'calm';
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  tone = 'accent',
}: EmptyStateProps) {
  const toneColor = tone === 'calm' ? colors.calm : colors.accent;

  return (
    <Card style={styles.card}>
      <View style={[styles.iconWrap, { borderColor: toneColor }]} aria-hidden>
        <Icon color={toneColor} size={28} strokeWidth={2.25} />
      </View>
      <AppText variant="heading" role="heading" style={styles.center}>
        {title}
      </AppText>
      <AppText tone="muted" style={styles.center}>
        {description}
      </AppText>
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} style={styles.action} />
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  center: {
    textAlign: 'center',
  },
  action: {
    marginTop: spacing.md,
    alignSelf: 'stretch',
  },
});
