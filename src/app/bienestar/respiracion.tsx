import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useEffectEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, StyleSheet, Vibration, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { useEscapeKey } from '@/components/ui/use-escape-key';
import {
  breathingStep,
  BREATHING_PATTERNS,
  patternSeconds,
  type BreathingPattern,
} from '@/domain/wellness';
import { colors, radius, spacing } from '@/theme/tokens';

const CIRCLE = 220;
const SMALL = 0.55;
/** A short buzz marks each change of phase without looking at the screen. */
const PHASE_VIBRATION = 60;

export default function BreathingScreen() {
  const { t } = useTranslation();
  const { patron } = useLocalSearchParams<{ patron?: string }>();
  const pattern: BreathingPattern =
    BREATHING_PATTERNS.find((item) => item.slug === patron) ?? BREATHING_PATTERNS[0];

  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(true);
  // Created once and read during render: an Animated.Value is not React state.
  const [scale] = useState(() => new Animated.Value(SMALL));
  useEscapeKey(() => router.back());

  const step = breathingStep(pattern, elapsed);
  const finished = step === null;
  const phase = step?.phase ?? 0;
  const total = patternSeconds(pattern);

  useEffect(() => {
    if (!running || finished) return;
    const interval = setInterval(() => setElapsed((seconds) => seconds + 1), 1000);
    return () => clearInterval(interval);
  }, [running, finished]);

  // Each phase drives the circle: it grows while you breathe in, holds, and shrinks on the way out.
  const animate = useEffectEvent(() => {
    if (finished) {
      Vibration.vibrate([0, 200, 120, 200]);
      Animated.timing(scale, { toValue: SMALL, duration: 600, useNativeDriver: true }).start();
      return;
    }
    Vibration.vibrate(PHASE_VIBRATION);
    const seconds = pattern.phases[phase];
    const target = phase === 0 ? 1 : phase === 2 ? SMALL : undefined;
    if (target !== undefined) {
      Animated.timing(scale, {
        toValue: target,
        duration: seconds * 1000,
        useNativeDriver: true,
      }).start();
    }
  });

  useEffect(() => {
    if (running) animate();
  }, [phase, finished, running]);

  return (
    <Screen
      insetTop={false}
      title={t(`wellness.patterns.${pattern.slug}.name`)}
      subtitle={t(`wellness.patterns.${pattern.slug}.detail`)}>
      <Card style={styles.stage}>
        <View style={styles.circleWrap}>
          <Animated.View style={[styles.circle, { transform: [{ scale }] }]} aria-hidden />
          <View style={styles.labels} pointerEvents="none">
            <AppText variant="title" role="status">
              {finished ? t('wellness.breathingDone') : t(`wellness.phases.${phase}`)}
            </AppText>
            {!finished ? (
              <AppText variant="display" tone="calm">
                {step.secondsLeft}
              </AppText>
            ) : null}
          </View>
        </View>

        <AppText variant="caption" tone="muted">
          {finished
            ? t('wellness.breathingDoneHint')
            : t('wellness.cycleOf', { cycle: step.cycle + 1, total: pattern.cycles })}
        </AppText>

        <View style={styles.track} aria-hidden>
          <View style={[styles.fill, { width: `${Math.min((elapsed / total) * 100, 100)}%` }]} />
        </View>

        <View style={styles.actions}>
          <Button label={t('wellness.close')} variant="ghost" onPress={() => router.back()} />
          {finished ? (
            <Button
              label={t('wellness.again')}
              onPress={() => {
                setElapsed(0);
                setRunning(true);
              }}
              style={styles.flex}
            />
          ) : (
            <Button
              label={running ? t('wellness.pause') : t('wellness.resume')}
              variant="secondary"
              onPress={() => setRunning((value) => !value)}
              style={styles.flex}
            />
          )}
        </View>
      </Card>

      <AppText variant="caption" tone="muted">
        {t('wellness.breathingHint')}
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  stage: {
    padding: spacing.lg,
    gap: spacing.md,
    alignItems: 'center',
  },
  circleWrap: {
    width: CIRCLE,
    height: CIRCLE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    position: 'absolute',
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    backgroundColor: colors.accentSoft,
    borderWidth: 2,
    borderColor: colors.calm,
  },
  labels: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  track: {
    width: '100%',
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surface2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.calm,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'stretch',
  },
});
