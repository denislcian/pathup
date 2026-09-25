import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Svg, { Ellipse, G, Polygon } from 'react-native-svg';

import {
  focusBox,
  HEAD,
  mirror,
  NECK,
  REGIONS,
  toSvgPoints,
  VIEW_BOX,
  type View as BodyView,
} from '@/components/muscle-map/regions';
import { AppText } from '@/components/ui/app-text';
import type { Muscle } from '@/domain/exercises';
import { colors, spacing } from '@/theme/tokens';

const FILL = {
  primary: colors.accent,
  secondary: 'rgba(76, 195, 138, 0.45)',
  // Muscles that do not work stay visible but quiet; head, hands and joints a step darker.
  idle: '#303844',
  base: '#232A34',
} as const;

type MuscleMapProps = {
  primary: readonly Muscle[];
  secondary?: readonly Muscle[];
  /** Both views side by side (detail screens) or a single one (thumbnails). */
  views?: readonly BodyView[];
  /** Height of each figure in pixels. */
  height?: number;
  /** Zooms in on the highlighted muscles, drawing a square: for thumbnails. */
  crop?: boolean;
  showLabels?: boolean;
  showLegend?: boolean;
};

function Figure({
  view,
  primary,
  secondary,
  height,
  crop,
}: {
  view: BodyView;
  primary: readonly Muscle[];
  secondary: readonly Muscle[];
  height: number;
  crop: boolean;
}) {
  const box = crop
    ? focusBox(view, primary)
    : { x: 0, y: 0, width: VIEW_BOX.width, height: VIEW_BOX.height };
  const width = (height * box.width) / box.height;
  const fillFor = (muscle: Muscle | null) => {
    if (muscle === null) return FILL.base;
    if (primary.includes(muscle)) return FILL.primary;
    if (secondary.includes(muscle)) return FILL.secondary;
    return FILL.idle;
  };

  return (
    <Svg
      width={width}
      height={height}
      viewBox={`${box.x} ${box.y} ${box.width} ${box.height}`}
      aria-hidden>
      <Ellipse {...HEAD} fill={FILL.base} />
      <Polygon points={toSvgPoints(NECK)} fill={FILL.base} />
      {REGIONS[view].map((region, index) => (
        <G key={index}>
          {[region.points, mirror(region.points)].map((points, side) => (
            <Polygon
              key={side}
              points={toSvgPoints(points)}
              fill={fillFor(region.muscle)}
              // A thin line in the page colour separates neighbouring muscles.
              stroke={colors.surface}
              strokeWidth={0.8}
              strokeLinejoin="round"
            />
          ))}
        </G>
      ))}
    </Svg>
  );
}

/**
 * A drawn body with the muscles an exercise works lit up: the main ones in mint, the helpers in a
 * softer mint. Exact and free, so every exercise has a picture even before its photo exists.
 */
export function MuscleMap({
  primary,
  secondary = [],
  views = ['front', 'back'],
  height = 240,
  showLabels = true,
  showLegend = true,
  crop = false,
}: MuscleMapProps) {
  const { t } = useTranslation();
  const describe = (muscles: readonly Muscle[]) =>
    muscles.map((muscle) => t(`muscles.${muscle}`)).join(', ');
  const label = [
    t('muscleMap.primary', { muscles: describe(primary) }),
    secondary.length > 0 ? t('muscleMap.secondary', { muscles: describe(secondary) }) : null,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <View style={styles.wrap} role="img" aria-label={label} accessible>
      <View style={styles.figures}>
        {views.map((view) => (
          <View key={view} style={styles.figure}>
            <Figure
              view={view}
              primary={primary}
              secondary={secondary}
              height={height}
              crop={crop}
            />
            {showLabels ? (
              <AppText variant="caption" tone="muted">
                {t(`muscleMap.views.${view}`)}
              </AppText>
            ) : null}
          </View>
        ))}
      </View>
      {showLegend ? (
        <View style={styles.legend} aria-hidden>
          <Swatch color={FILL.primary} label={t('muscleMap.legendPrimary')} />
          {secondary.length > 0 ? (
            <Swatch color={FILL.secondary} label={t('muscleMap.legendSecondary')} />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function Swatch({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.swatchRow}>
      <View style={[styles.swatch, { backgroundColor: color }]} />
      <AppText variant="caption" tone="muted">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  figures: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  figure: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
  },
  swatchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  swatch: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
});
