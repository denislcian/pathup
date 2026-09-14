import { Check, Flame, Timer, Trophy, TrendingUp } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { AppText } from '@/components/ui/app-text';
import { getExercise } from '@/data/exercises';
import { colors, fonts, radius, spacing } from '@/theme/tokens';

/**
 * Decorative previews of the app, drawn with regular components so they stay crisp, themeable
 * and translatable. They are hidden from screen readers; each preview has a short label instead.
 */

function useWeight() {
  const { i18n } = useTranslation();
  return (kg: number) =>
    `${new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 1 }).format(kg)} kg`;
}

export function MockCard({ children, style }: { children: ReactNode; style?: object }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function ReadinessRing({ value, size = 64 }: { value: number; size?: number }) {
  const stroke = 7;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.surface2}
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.calm}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference * (value / 100)} ${circumference}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <AppText style={[styles.number, { fontSize: size * 0.34 }]}>{value}</AppText>
    </View>
  );
}

/** Rising lime line: the "path up" of the brand. */
export function RisingPath({ width = 420, height = 220 }: { width?: number; height?: number }) {
  const d = `M0 ${height * 0.9} C ${width * 0.25} ${height * 0.88}, ${width * 0.35} ${height * 0.55}, ${width * 0.5} ${height * 0.5} S ${width * 0.8} ${height * 0.15}, ${width} ${height * 0.08}`;
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Defs>
        <LinearGradient id="fade" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={colors.accent} stopOpacity="0" />
          <Stop offset="0.4" stopColor={colors.accent} stopOpacity="1" />
        </LinearGradient>
      </Defs>
      <Path
        d={d}
        stroke={colors.accent}
        strokeOpacity={0.18}
        strokeWidth={18}
        fill="none"
        strokeLinecap="round"
      />
      <Path d={d} stroke="url(#fade)" strokeWidth={4} fill="none" strokeLinecap="round" />
    </Svg>
  );
}

function SessionRow({
  slug,
  sets,
  reps,
  kg,
  up,
}: {
  slug: string;
  sets: number;
  reps: number;
  kg: number;
  up?: boolean;
}) {
  const { t } = useTranslation();
  const weight = useWeight();
  return (
    <View style={styles.sessionRow}>
      <View style={styles.flex}>
        <AppText variant="label" numberOfLines={1}>
          {getExercise(slug)?.name}
        </AppText>
        <AppText variant="caption" tone="muted">
          {t('landing.mock.sets', { sets, reps })} · {weight(kg)}
        </AppText>
      </View>
      {up ? <TrendingUp color={colors.accent} size={18} /> : null}
    </View>
  );
}

/** The "Today" screen inside a phone frame. */
export function PhoneMock({ width = 300 }: { width?: number }) {
  const { t } = useTranslation();

  return (
    <View
      role="img"
      aria-label={`${t('landing.mock.greeting')}. ${t('landing.mock.readinessLabel')} 82. ${t('landing.mock.sessionTitle')}`}
      style={[styles.phone, { width }]}>
      <View aria-hidden style={styles.phoneScreen}>
        <View style={styles.notch} />
        <AppText variant="caption" tone="muted">
          {t('landing.mock.day')}
        </AppText>
        <AppText style={styles.phoneTitle}>{t('landing.mock.greeting')}</AppText>

        <MockCard style={styles.row}>
          <ReadinessRing value={82} size={58} />
          <View style={styles.flex}>
            <AppText variant="label">{t('landing.mock.readinessLabel')}</AppText>
            <AppText variant="caption" tone="muted">
              {t('landing.mock.readinessNote')}
            </AppText>
          </View>
        </MockCard>

        <MockCard>
          <AppText variant="label" tone="accent">
            {t('landing.mock.sessionTitle')}
          </AppText>
          <SessionRow slug="press-banca-barra" sets={4} reps={8} kg={82.5} up />
          <SessionRow slug="remo-barra" sets={3} reps={10} kg={60} />
          <SessionRow slug="elevaciones-laterales" sets={3} reps={15} kg={10} />
          <View style={styles.fakeButton}>
            <AppText variant="label" style={{ color: colors.onAccent }}>
              {t('landing.mock.startSession')}
            </AppText>
          </View>
        </MockCard>

        <View style={styles.streak}>
          <Flame color={colors.warning} size={16} />
          <AppText variant="caption">{t('landing.mock.streak')}</AppText>
        </View>
      </View>
    </View>
  );
}

export function RecordToast() {
  const { t } = useTranslation();
  return (
    <MockCard style={[styles.row, styles.floating]}>
      <View style={styles.iconBadge}>
        <Trophy color={colors.onAccent} size={18} />
      </View>
      <View>
        <AppText variant="label">{t('landing.mock.record')}</AppText>
        <AppText variant="caption" tone="muted">
          {t('landing.mock.recordDetail')}
        </AppText>
      </View>
    </MockCard>
  );
}

export function SuggestionToast() {
  const { t } = useTranslation();
  return (
    <MockCard style={[styles.row, styles.floating]}>
      <TrendingUp color={colors.accent} size={20} />
      <AppText variant="label">{t('landing.mock.suggestion')}</AppText>
    </MockCard>
  );
}

/* Mini previews for the "how it works" steps ---------------------------------------------- */

export function OnboardingPreview() {
  const { t } = useTranslation();
  const options = ['muscle', 'strength', 'health'] as const;
  return (
    <View aria-hidden style={styles.preview}>
      {options.map((option, index) => (
        <View key={option} style={[styles.option, index === 0 && styles.optionSelected]}>
          <AppText variant="label">{t(`onboarding.goals.${option}`)}</AppText>
          <View style={[styles.dot, index === 0 && styles.dotSelected]}>
            {index === 0 ? <Check color={colors.onAccent} size={12} strokeWidth={3} /> : null}
          </View>
        </View>
      ))}
    </View>
  );
}

export function ProgramPreview() {
  const { t } = useTranslation();
  return (
    <View aria-hidden style={styles.preview}>
      <AppText variant="label" tone="accent">
        {t('landing.mock.programName')}
      </AppText>
      <AppText variant="caption" tone="muted">
        {t('landing.mock.programWeek')}
      </AppText>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: '37%' }]} />
      </View>
      <View style={styles.weekDots}>
        {[0, 1, 2, 3, 4, 5, 6].map((day) => (
          <View key={day} style={[styles.weekDot, [0, 2, 4].includes(day) && styles.weekDotDone]} />
        ))}
      </View>
    </View>
  );
}

export function LoggerPreview() {
  const { t } = useTranslation();
  const weight = useWeight();
  return (
    <View aria-hidden style={styles.preview}>
      <AppText variant="label">{getExercise('press-banca-barra')?.name}</AppText>
      <AppText variant="caption" tone="muted">
        {t('landing.mock.previous')} → {t('landing.mock.today')}
      </AppText>
      {[80, 82.5].map((kg, index) => (
        <View key={kg} style={styles.setRow}>
          <AppText variant="caption" tone="muted" style={styles.setIndex}>
            {index + 1}
          </AppText>
          <AppText variant="caption" tone="muted" style={styles.flex} numberOfLines={1}>
            {weight(kg - 2.5).replace(' kg', '')} × 8
          </AppText>
          <AppText variant="label" numberOfLines={1}>
            {weight(kg)} × 8
          </AppText>
          <View style={[styles.dot, styles.dotSelected]}>
            <Check color={colors.onAccent} size={12} strokeWidth={3} />
          </View>
        </View>
      ))}
      <View style={styles.restPill}>
        <Timer color={colors.calm} size={14} />
        <AppText variant="caption" tone="calm">
          {t('landing.mock.rest')} 1:45
        </AppText>
      </View>
    </View>
  );
}

export function ProgressPreview() {
  const { t } = useTranslation();
  return (
    <View aria-hidden style={styles.preview}>
      <View style={styles.row}>
        <ReadinessRing value={82} size={48} />
        <AppText variant="caption" tone="muted" style={styles.flex}>
          {t('landing.mock.readinessNote')}
        </AppText>
      </View>
      <View style={styles.row}>
        <TrendingUp color={colors.accent} size={18} />
        <AppText variant="label">{t('landing.mock.suggestion')}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm + 4,
    gap: spacing.sm,
  },
  number: {
    fontFamily: fonts.displayBold,
    color: colors.text,
  },
  phone: {
    aspectRatio: 9 / 18.5,
    borderRadius: 44,
    borderWidth: 10,
    borderColor: '#1B1F25',
    backgroundColor: colors.bg,
    overflow: 'hidden',
    shadowColor: colors.accent,
    shadowOpacity: 0.15,
    shadowRadius: 60,
  },
  phoneScreen: {
    flex: 1,
    padding: spacing.md,
    paddingTop: spacing.xl,
    gap: spacing.sm,
  },
  notch: {
    position: 'absolute',
    top: 8,
    alignSelf: 'center',
    width: 84,
    height: 22,
    borderRadius: radius.pill,
    backgroundColor: '#1B1F25',
  },
  phoneTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 30,
    lineHeight: 34,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 2,
  },
  fakeButton: {
    marginTop: spacing.xs,
    minHeight: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.surface2,
  },
  floating: {
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
  },
  iconBadge: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  preview: {
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm + 4,
    gap: spacing.sm,
    minHeight: 150,
    justifyContent: 'center',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.surface2,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },
  progressTrack: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surface2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent,
  },
  weekDots: {
    flexDirection: 'row',
    gap: 6,
  },
  weekDot: {
    flex: 1,
    height: 22,
    borderRadius: 6,
    backgroundColor: colors.surface2,
  },
  weekDotDone: {
    backgroundColor: colors.accent,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  setIndex: {
    width: 14,
  },
  restPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.calm,
  },
});
