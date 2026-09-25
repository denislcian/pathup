import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { ImageOff } from '@/components/icons';
import { useTranslation } from 'react-i18next';
import type { ReactNode } from 'react';
import { Image, StyleSheet, View, type ImageSourcePropType } from 'react-native';

import { MuscleMap } from '@/components/muscle-map/muscle-map';
import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { EXERCISE_IMAGES } from '@/data/exercise-images';
import { getExercise } from '@/data/exercises';
import { ExerciseProgress } from '@/features/history/exercise-progress';
import { colors, radius, spacing } from '@/theme/tokens';

export default function ExerciseDetailScreen() {
  const { t } = useTranslation();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const exercise = getExercise(slug);

  if (!exercise) {
    return (
      <Screen insetTop={false}>
        <EmptyState icon={ImageOff} title={t('exercise.notFound')} description={slug ?? ''} />
      </Screen>
    );
  }

  const images = EXERCISE_IMAGES[exercise.slug];
  const substitutes = exercise.substitutes
    .map((substituteSlug) => getExercise(substituteSlug))
    .filter((item) => item !== undefined);

  return (
    <Screen
      insetTop={false}
      title={exercise.name}
      subtitle={t(`exercise.levels.${exercise.level}`)}>
      <Stack.Screen options={{ title: exercise.name }} />

      <ExerciseProgress slug={exercise.slug} name={exercise.name} />

      {images ? (
        <View style={styles.images}>
          <Figure source={images.start} caption={t('exercise.startPosition')} />
          {images.end ? <Figure source={images.end} caption={t('exercise.endPosition')} /> : null}
        </View>
      ) : (
        // Until its photos exist, every exercise shows exactly which muscles it works.
        <Card style={styles.map}>
          <MuscleMap primary={exercise.primaryMuscles} secondary={exercise.secondaryMuscles} />
        </Card>
      )}

      <Section title={t('exercise.primaryMuscles')}>
        <View style={styles.chips}>
          {exercise.primaryMuscles.map((muscle) => (
            <Chip key={muscle} label={t(`muscles.${muscle}`)} />
          ))}
        </View>
      </Section>

      {exercise.secondaryMuscles.length > 0 ? (
        <Section title={t('exercise.secondaryMuscles')}>
          <View style={styles.chips}>
            {exercise.secondaryMuscles.map((muscle) => (
              <Chip key={muscle} label={t(`muscles.${muscle}`)} variant="outline" />
            ))}
          </View>
        </Section>
      ) : null}

      <Section title={t('exercise.equipment')}>
        <AppText>{exercise.equipment.map((item) => t(`equipment.${item}`)).join(' · ')}</AppText>
      </Section>

      <Section title={t('exercise.howTo')}>
        {exercise.instructions.map((step, index) => (
          <View key={step} style={styles.step}>
            <View style={styles.stepNumber} aria-hidden>
              <AppText variant="label" style={styles.stepNumberText}>
                {index + 1}
              </AppText>
            </View>
            <AppText style={styles.flex}>{step}</AppText>
          </View>
        ))}
      </Section>

      <Card>
        <AppText variant="heading" role="heading" tone="accent">
          {t('exercise.cues')}
        </AppText>
        {exercise.cues.map((cue) => (
          <AppText key={cue}>• {cue}</AppText>
        ))}
      </Card>

      <Card>
        <AppText variant="heading" role="heading" tone="danger">
          {t('exercise.mistakes')}
        </AppText>
        {exercise.mistakes.map((mistake) => (
          <AppText key={mistake}>• {mistake}</AppText>
        ))}
      </Card>

      {substitutes.length > 0 ? (
        <Section title={t('exercise.substitutes')}>
          {substitutes.map((substitute) => (
            <Link
              key={substitute.slug}
              href={{ pathname: '/ejercicios/[slug]', params: { slug: substitute.slug } }}
              style={styles.substitute}>
              <AppText tone="accent" variant="heading">
                {substitute.name}
              </AppText>
            </Link>
          ))}
        </Section>
      ) : null}
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <AppText variant="heading" role="heading">
        {title}
      </AppText>
      {children}
    </View>
  );
}

function Figure({ source, caption }: { source: ImageSourcePropType; caption: string }) {
  return (
    <View style={styles.figure}>
      <Image source={source} style={styles.image} aria-label={caption} />
      <AppText variant="caption" tone="muted">
        {caption}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  images: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  figure: {
    flex: 1,
    gap: spacing.xs,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  map: {
    paddingVertical: spacing.lg,
  },
  section: {
    gap: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  step: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: colors.accent,
  },
  substitute: {
    paddingVertical: spacing.sm,
  },
});
