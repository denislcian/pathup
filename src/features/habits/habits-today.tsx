import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { Check, ChevronRight } from '@/components/icons';
import { AppText } from '@/components/ui/app-text';
import { useHover } from '@/components/ui/use-hover';
import { isDone, todayProgress } from '@/domain/habits';
import { useHabits } from '@/features/habits/habits-api';
import { colors, radius, spacing } from '@/theme/tokens';

/** Today's habits at a glance, linking to the wellness tab where they are ticked off. */
export function HabitsToday({ today }: { today: string }) {
  const { t } = useTranslation();
  const { hovered, hoverProps } = useHover();
  const query = useHabits();
  const habits = query.data?.habits ?? [];
  const logs = query.data?.logs ?? [];
  if (habits.length === 0) return null;

  const progress = todayProgress(habits, logs, today);

  return (
    <Pressable
      role="link"
      aria-label={t('habits.todayLink', { done: progress.done, total: progress.total })}
      onPress={() => router.push('/bienestar')}
      {...hoverProps}
      style={[styles.card, hovered && styles.hovered]}>
      <View style={styles.header}>
        <AppText variant="heading" style={styles.flex}>
          {t('habits.title')}
        </AppText>
        <AppText variant="label" tone={progress.done === progress.total ? 'accent' : 'muted'}>
          {progress.done}/{progress.total}
        </AppText>
        <ChevronRight color={colors.textMuted} size={18} aria-hidden />
      </View>
      {habits.map((habit) => {
        const done = isDone(habit, logs, today);
        return (
          <View key={habit.id} style={styles.row}>
            <View style={[styles.tick, done && styles.tickDone]}>
              {done ? <Check color={colors.onAccent} size={12} strokeWidth={3} /> : null}
            </View>
            <AppText variant="caption" tone={done ? 'default' : 'muted'} numberOfLines={1}>
              {habit.name}
            </AppText>
          </View>
        );
      })}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  card: {
    cursor: 'pointer',
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  hovered: {
    borderColor: colors.textMuted,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  tick: {
    width: 18,
    height: 18,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tickDone: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
});
