/**
 * PathUp design tokens. Dark and energetic: near-black surfaces with a single electric-lime accent.
 * Every text/background pair used in the UI must keep WCAG 2.2 AA contrast (4.5:1 body, 3:1 large text).
 */

export const colors = {
  bg: '#0B0D10',
  surface: '#15181D',
  surface2: '#1E2229',
  border: '#2A2F37',
  text: '#F2F4F7',
  textMuted: '#9AA3AF',
  accent: '#C8FF2E',
  onAccent: '#0B0D10',
  calm: '#38D9F5',
  warning: '#FFB020',
  danger: '#FF5C5C',
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

/** Content max width so the web version reads well on desktop. */
export const maxContentWidth = 640;
