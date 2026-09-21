/**
 * PathUp design tokens. Calm and professional: slate surfaces with a muted mint accent.
 * Every text/background pair used in the UI must keep WCAG 2.2 AA contrast (4.5:1 body, 3:1 large text).
 */

export const colors = {
  bg: '#0E1116',
  surface: '#161A21',
  surface2: '#1E242D',
  surfaceRaised: '#131820',
  border: '#2A313B',
  text: '#E7ECF3',
  textMuted: '#93A0B0',
  accent: '#4CC38A',
  accentHover: '#5ED69B',
  /** Tinted background for the accent, e.g. a set that has been ticked off. */
  accentSoft: 'rgba(76, 195, 138, 0.12)',
  onAccent: '#08130D',
  calm: '#6AA9FF',
  warning: '#E0A45E',
  danger: '#E5766F',
  shadow: 'rgba(0, 0, 0, 0.45)',
} as const;

/**
 * Chart colours. The series mint is one step darker than `accent`: it passes the data-viz
 * lightness band and 3:1 contrast on the card surface (checked with the palette validator).
 */
export const chartColors = {
  series: '#36A873',
  seriesWash: 'rgba(54, 168, 115, 0.10)',
  grid: colors.border,
  crosshair: colors.textMuted,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 20,
  pill: 999,
} as const;

/** Font family names match the keys exported by @expo-google-fonts packages loaded in the root layout. */
export const fonts = {
  displayBold: 'BarlowCondensed_700Bold',
  displaySemiBold: 'BarlowCondensed_600SemiBold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
} as const;

export const typography = {
  display: { fontFamily: fonts.displayBold, fontSize: 40, lineHeight: 44, letterSpacing: 0.5 },
  title: { fontFamily: fonts.displaySemiBold, fontSize: 28, lineHeight: 32, letterSpacing: 0.3 },
  heading: { fontFamily: fonts.bodySemiBold, fontSize: 18, lineHeight: 24 },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24 },
  label: { fontFamily: fonts.bodyMedium, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18 },
} as const;

export type TypographyVariant = keyof typeof typography;

/** Minimum touch target (WCAG 2.5.8 asks 24px; platform guidelines ask 44-48px). */
export const minTouchTarget = 48;

/** Reading width for a single column (forms, long text). */
export const maxContentWidth = 640;
/** Width used by screens that lay their cards out in columns on a desktop browser. */
export const maxWideWidth = 1080;
/** From this width on, screens use the desktop layout: sidebar and multiple columns. */
export const wideBreakpoint = 960;
