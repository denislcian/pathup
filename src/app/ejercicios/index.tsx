import { Link } from 'expo-router';
import { ChevronRight, Dumbbell, Search } from 'lucide-react-native';
import { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Image, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Chip } from '@/components/ui/chip';
import { EmptyState } from '@/components/ui/empty-state';
import { EXERCISE_IMAGES } from '@/data/exercise-images';
import { EXERCISES } from '@/data/exercises';
import {
  availableEquipment,
  filterExercises,
  MUSCLE_GROUPS,
  type Exercise,
  type MuscleGroup,
} from '@/domain/exercises';
import { useProfile } from '@/features/profile/profile-api';
import { colors, fonts, maxContentWidth, minTouchTarget, radius, spacing } from '@/theme/tokens';

const GROUPS = Object.keys(MUSCLE_GROUPS) as MuscleGroup[];

export default function ExerciseLibraryScreen() {
  const { t } = useTranslation();
  const profile = useProfile();
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState<MuscleGroup | null>(null);
  const [onlyMine, setOnlyMine] = useState(false);
  const deferredQuery = useDeferredValue(query);

  // The React Compiler memoizes this; no manual useMemo needed.
  const results = filterExercises(EXERCISES, {
    query: deferredQuery,
    muscleGroup: group,
    available: onlyMine ? availableEquipment(profile.data?.equipment ?? []) : null,
    muscleLabel: (muscle) => t(`muscles.${muscle}`),
  });

  const header = (
    <View style={styles.header}>
      <View style={styles.search}>
        <Search color={colors.textMuted} size={20} aria-hidden />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('library.searchPlaceholder')}
          placeholderTextColor={colors.textMuted}
          aria-label={t('library.searchLabel')}
          role="searchbox"
          autoCorrect={false}
          selectionColor={colors.accent}
          style={styles.searchInput}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        role="radiogroup">
        <Chip
          role="radio"
          label={t('library.allGroups')}
          selected={group === null}
          onPress={() => setGroup(null)}
        />
        {GROUPS.map((item) => (
          <Chip
            key={item}
            role="radio"
            label={t(`library.groups.${item}`)}
            selected={group === item}
            onPress={() => setGroup(item)}
          />
        ))}
      </ScrollView>

      <View style={styles.row}>
        <Chip
          role="checkbox"
          label={t('library.onlyMyEquipment')}
          selected={onlyMine}
          onPress={() => setOnlyMine((value) => !value)}
        />
        <AppText variant="caption" tone="muted" aria-live="polite">
          {t('library.results', { count: results.length })}
        </AppText>
      </View>
    </View>
  );

  return (
    <FlatList
      data={results}
      keyExtractor={(item) => item.slug}
      ListHeaderComponent={header}
      ListEmptyComponent={
        <EmptyState
          icon={Search}
          title={t('library.emptyTitle')}
          description={t('library.emptyDescription')}
        />
      }
      renderItem={({ item }) => <ExerciseRow exercise={item} />}
      keyboardShouldPersistTaps="handled"
      style={styles.list}
      contentContainerStyle={styles.listContent}
    />
  );
}

function ExerciseRow({ exercise }: { exercise: Exercise }) {
  const { t } = useTranslation();
  const image = EXERCISE_IMAGES[exercise.slug]?.start;
  const muscles = exercise.primaryMuscles.map((muscle) => t(`muscles.${muscle}`)).join(' · ');

  return (
    <Link href={{ pathname: '/ejercicios/[slug]', params: { slug: exercise.slug } }} asChild>
      <Pressable
        role="link"
        aria-label={`${exercise.name}. ${muscles}`}
        style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}>
        <View style={styles.thumb}>
          {image ? (
            <Image source={image} style={styles.thumbImage} accessibilityIgnoresInvertColors />
          ) : (
            <Dumbbell color={colors.textMuted} size={24} aria-hidden />
          )}
        </View>
        <View style={styles.itemText}>
          <AppText variant="heading" numberOfLines={1}>
            {exercise.name}
          </AppText>
          <AppText variant="caption" tone="muted" numberOfLines={1}>
            {muscles}
          </AppText>
        </View>
        <ChevronRight color={colors.textMuted} size={20} aria-hidden />
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  listContent: {
    width: '100%',
    maxWidth: maxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
  },
  header: {
    gap: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: minTouchTarget + 4,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
  },
  searchInput: {
    flex: 1,
    minHeight: minTouchTarget,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 16,
  },
  chips: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemPressed: {
    backgroundColor: colors.surface2,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  itemText: {
    flex: 1,
    gap: 2,
  },
});
