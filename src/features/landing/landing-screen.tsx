import { Link, router } from 'expo-router';
import Head from 'expo-router/head';
import {
  Apple,
  ChevronDown,
  Dumbbell,
  Footprints,
  FlaskConical,
  Gift,
  GraduationCap,
  HeartPulse,
  ListChecks,
  ShieldCheck,
  Sprout,
  TrendingUp,
  Users,
  type LucideIcon,
} from 'lucide-react-native';
import { useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import {
  LoggerPreview,
  OnboardingPreview,
  PhoneMock,
  ProgramPreview,
  ProgressPreview,
  RecordToast,
  RisingPath,
  SuggestionToast,
} from '@/features/landing/app-mocks';
import { Container, Grid, LandingSection, useLandingLayout } from '@/features/landing/layout';
import { colors, fonts, radius, spacing } from '@/theme/tokens';

type Anchor = 'how' | 'features' | 'faq';

const NAV_HEIGHT = 64;

export function LandingScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { isWide, isMedium } = useLandingLayout();
  const scrollRef = useRef<ScrollView>(null);
  const [anchors, setAnchors] = useState<Partial<Record<Anchor, number>>>({});

  const goToSignUp = () => router.push('/registro');
  const goToSignIn = () => router.push('/entrar');
  function handleNavPress(anchor: Anchor) {
    scrollRef.current?.scrollTo({ y: Math.max((anchors[anchor] ?? 0) - 16, 0), animated: true });
  }
  const saveAnchor = (anchor: Anchor) => (event: LayoutChangeEvent) => {
    const y = event.nativeEvent.layout.y;
    setAnchors((current) => (current[anchor] === y ? current : { ...current, [anchor]: y }));
  };

  return (
    <View style={styles.page}>
      <Head>
        <title>{t('landing.metaTitle')}</title>
        <meta name="description" content={t('landing.metaDescription')} />
      </Head>

      {/* Navigation ------------------------------------------------------------------------ */}
      <View style={[styles.nav, { paddingTop: insets.top }]}>
        <Container>
          <View style={styles.navInner}>
            <Logo size={28} />
            <View style={styles.navActions}>
              {isWide ? <NavLinks onNavigate={handleNavPress} /> : null}
              <Button label={t('landing.nav.signIn')} variant="ghost" onPress={goToSignIn} />
              {isMedium ? <Button label={t('landing.nav.start')} onPress={goToSignUp} /> : null}
            </View>
          </View>
        </Container>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.flex}
        contentContainerStyle={{ paddingBottom: isMedium ? 0 : 88 }}>
        {/* Hero ------------------------------------------------------------------------------ */}
        <View style={[styles.hero, { paddingTop: isWide ? 72 : 32 }]}>
          <Container>
            <View style={[styles.heroInner, isWide && styles.heroInnerWide]}>
              <View style={[styles.heroText, isWide && styles.flex]}>
                <View style={styles.badge}>
                  <View style={styles.badgeDot} />
                  <AppText variant="label">{t('landing.hero.badge')}</AppText>
                </View>
                <AppText
                  role="heading"
                  style={[
                    styles.heroTitle,
                    {
                      fontSize: isWide ? 84 : isMedium ? 64 : 52,
                      lineHeight: isWide ? 84 : isMedium ? 64 : 54,
                    },
                  ]}>
                  {t('landing.hero.titleStart')}
                  {'\n'}
                  <AppText
                    style={[
                      styles.heroTitle,
                      styles.accent,
                      { fontSize: isWide ? 84 : isMedium ? 64 : 52 },
                    ]}>
                    {t('landing.hero.titleAccent')}
                  </AppText>
                </AppText>
                <AppText tone="muted" style={styles.heroSubtitle}>
                  {t('landing.hero.subtitle')}
                </AppText>
                <View style={[styles.ctaRow, !isMedium && styles.ctaColumn]}>
                  <Button
                    label={t('landing.hero.primary')}
                    onPress={goToSignUp}
                    style={styles.cta}
                  />
                  <Button
                    label={t('landing.hero.secondary')}
                    variant="secondary"
                    onPress={goToSignIn}
                    style={styles.cta}
                  />
                </View>
                <View style={styles.trustRow}>
                  {(['trustFree', 'trustNoAds', 'trustEu', 'trustAge'] as const).map((key) => (
                    <View key={key} style={styles.trustItem}>
                      <ShieldCheck color={colors.accent} size={16} aria-hidden />
                      <AppText variant="caption" tone="muted">
                        {t(`landing.hero.${key}`)}
                      </AppText>
                    </View>
                  ))}
                </View>
              </View>

              <View style={[styles.heroVisual, isWide && styles.heroVisualWide]}>
                <View style={styles.pathBehind} aria-hidden>
                  <RisingPath width={isWide ? 520 : 360} height={isWide ? 300 : 220} />
                </View>
                <PhoneMock width={isWide ? 310 : 280} />
                {isWide ? (
                  <>
                    <View style={[styles.toast, styles.toastTop]} aria-hidden>
                      <RecordToast />
                    </View>
                    <View style={[styles.toast, styles.toastBottom]} aria-hidden>
                      <SuggestionToast />
                    </View>
                  </>
                ) : null}
              </View>
            </View>
          </Container>
        </View>

        {/* How it works ---------------------------------------------------------------------- */}
        <LandingSection
          eyebrow={t('landing.how.eyebrow')}
          title={t('landing.how.title')}
          onLayout={saveAnchor('how')}>
          <Grid columns={isWide ? 4 : isMedium ? 2 : 1}>
            {[
              <StepCard key={1} step={1} preview={<OnboardingPreview />} />,
              <StepCard key={2} step={2} preview={<ProgramPreview />} />,
              <StepCard key={3} step={3} preview={<LoggerPreview />} />,
              <StepCard key={4} step={4} preview={<ProgressPreview />} />,
            ]}
          </Grid>
        </LandingSection>

        {/* Features -------------------------------------------------------------------------- */}
        {/* Anchors are measured on the outer band so offsets are relative to the scroll content. */}
        <View style={styles.band} onLayout={saveAnchor('features')}>
          <LandingSection
            eyebrow={t('landing.features.eyebrow')}
            title={t('landing.features.title')}
            subtitle={t('landing.features.subtitle')}>
            <Grid columns={isWide ? 3 : isMedium ? 2 : 1}>
              {(
                [
                  ['workout', Dumbbell],
                  ['programs', ListChecks],
                  ['wellness', HeartPulse],
                  ['progress', TrendingUp],
                  ['nutrition', Apple],
                  ['community', Users],
                ] as const
              ).map(([key, icon]) => (
                <InfoCard
                  key={key}
                  icon={icon}
                  title={t(`landing.features.${key}Title`)}
                  body={t(`landing.features.${key}Body`)}
                />
              ))}
            </Grid>
          </LandingSection>
        </View>

        {/* Principles ------------------------------------------------------------------------ */}
        <LandingSection
          eyebrow={t('landing.principles.eyebrow')}
          title={t('landing.principles.title')}>
          <Grid columns={isWide ? 4 : isMedium ? 2 : 1}>
            {(
              [
                ['free', Gift],
                ['beginner', GraduationCap],
                ['evidence', FlaskConical],
                ['privacy', ShieldCheck],
              ] as const
            ).map(([key, icon]) => (
              <InfoCard
                key={key}
                icon={icon}
                plain
                title={t(`landing.principles.${key}Title`)}
                body={t(`landing.principles.${key}Body`)}
              />
            ))}
          </Grid>
        </LandingSection>

        {/* Audiences ------------------------------------------------------------------------- */}
        <View style={styles.band}>
          <LandingSection
            eyebrow={t('landing.audiences.eyebrow')}
            title={t('landing.audiences.title')}>
            <Grid columns={isMedium ? 3 : 1}>
              {(
                [
                  ['beginner', Sprout],
                  ['lifter', Dumbbell],
                  ['active', Footprints],
                ] as const
              ).map(([key, icon]) => (
                <InfoCard
                  key={key}
                  icon={icon}
                  title={t(`landing.audiences.${key}Title`)}
                  body={t(`landing.audiences.${key}Body`)}
                />
              ))}
            </Grid>
          </LandingSection>
        </View>

        {/* Roadmap --------------------------------------------------------------------------- */}
        <LandingSection
          eyebrow={t('landing.roadmap.eyebrow')}
          title={t('landing.roadmap.title')}
          subtitle={t('landing.roadmap.subtitle')}>
          <Grid columns={isWide ? 4 : isMedium ? 2 : 1}>
            {(['sep', 'oct', 'nov', 'dec'] as const).map((key, index) => (
              <RoadmapItem
                key={key}
                done={index === 0}
                title={t(`landing.roadmap.${key}Title`)}
                body={t(`landing.roadmap.${key}Body`)}
              />
            ))}
          </Grid>
        </LandingSection>

        {/* FAQ ------------------------------------------------------------------------------- */}
        <View style={styles.band} onLayout={saveAnchor('faq')}>
          <LandingSection
            eyebrow={t('landing.faq.eyebrow')}
            title={t('landing.faq.title')}
            centered>
            <View style={styles.faqList}>
              {(['free', 'gym', 'beginner', 'age', 'data', 'devices'] as const).map((key) => (
                <FaqItem
                  key={key}
                  question={t(`landing.faq.${key}Q`)}
                  answer={t(`landing.faq.${key}A`)}
                />
              ))}
            </View>
          </LandingSection>
        </View>

        {/* Final call to action ------------------------------------------------------------ */}
        <View style={{ paddingVertical: isWide ? 96 : 64 }}>
          <Container>
            <View style={styles.finalCta}>
              <View style={styles.finalPath} aria-hidden>
                <RisingPath width={isWide ? 700 : 420} height={isWide ? 260 : 180} />
              </View>
              <AppText
                role="heading"
                style={[
                  styles.finalTitle,
                  { fontSize: isWide ? 52 : 36, lineHeight: isWide ? 56 : 40 },
                ]}>
                {t('landing.cta.title')}
              </AppText>
              <AppText tone="muted" style={styles.centerText}>
                {t('landing.cta.subtitle')}
              </AppText>
              <View style={[styles.ctaRow, !isMedium && styles.ctaColumn, styles.centerSelf]}>
                <Button label={t('landing.hero.primary')} onPress={goToSignUp} style={styles.cta} />
                <Button
                  label={t('landing.hero.secondary')}
                  variant="secondary"
                  onPress={goToSignIn}
                  style={styles.cta}
                />
              </View>
            </View>
          </Container>
        </View>

        {/* Footer -------------------------------------------------------------------------- */}
        <View style={styles.footer}>
          <Container>
            <View style={[styles.footerInner, !isMedium && styles.footerColumn]}>
              <View style={styles.footerBrand}>
                <Logo size={22} />
                <AppText variant="caption" tone="muted">
                  {t('landing.footer.tagline')}
                </AppText>
              </View>
              <View style={styles.footerLinks}>
                <Link href="/privacidad">
                  <AppText variant="label" tone="muted">
                    {t('landing.footer.privacy')}
                  </AppText>
                </Link>
                <AppText variant="caption" tone="muted">
                  {t('landing.footer.rights')}
                </AppText>
              </View>
            </View>
          </Container>
        </View>
      </ScrollView>

      {/* Sticky call to action on small screens ----------------------------------------- */}
      {!isMedium ? (
        <View style={[styles.stickyCta, { paddingBottom: insets.bottom + spacing.sm }]}>
          <Button label={t('landing.nav.start')} onPress={goToSignUp} />
        </View>
      ) : null}
    </View>
  );
}

function NavLinks({ onNavigate }: { onNavigate: (anchor: Anchor) => void }) {
  const { t } = useTranslation();
  return (['how', 'features', 'faq'] as const).map((anchor) => (
    <Pressable key={anchor} role="link" onPress={() => onNavigate(anchor)} style={styles.navLink}>
      <AppText variant="label" tone="muted">
        {t(`landing.nav.${anchor}`)}
      </AppText>
    </Pressable>
  ));
}

function Logo({ size }: { size: number }) {
  return (
    <AppText aria-label="PathUp" style={[styles.logo, { fontSize: size, lineHeight: size * 1.1 }]}>
      Path
      <AppText style={[styles.logo, styles.accent, { fontSize: size, lineHeight: size * 1.1 }]}>
        Up
      </AppText>
    </AppText>
  );
}

function StepCard({ step, preview }: { step: 1 | 2 | 3 | 4; preview: ReactNode }) {
  const { t } = useTranslation();
  return (
    <View style={styles.stepCard}>
      <View style={styles.stepHeader}>
        <View style={styles.stepNumber}>
          <AppText style={styles.stepNumberText}>{step}</AppText>
        </View>
        <AppText variant="heading" role="heading" style={styles.flex}>
          {t(`landing.how.step${step}Title`)}
        </AppText>
      </View>
      <AppText tone="muted">{t(`landing.how.step${step}Body`)}</AppText>
      <View style={styles.stepPreview}>{preview}</View>
    </View>
  );
}

function InfoCard({
  icon: Icon,
  title,
  body,
  plain = false,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  plain?: boolean;
}) {
  return (
    <View style={[styles.infoCard, plain && styles.infoCardPlain]}>
      <View style={styles.infoIcon} aria-hidden>
        <Icon color={colors.accent} size={22} />
      </View>
      <AppText variant="heading" role="heading">
        {title}
      </AppText>
      <AppText tone="muted">{body}</AppText>
    </View>
  );
}

function RoadmapItem({ title, body, done }: { title: string; body: string; done: boolean }) {
  const { t } = useTranslation();
  return (
    <View style={[styles.roadmapItem, done && styles.roadmapDone]}>
      <View style={[styles.statusPill, done ? styles.statusDone : styles.statusNext]}>
        <AppText variant="caption" style={{ color: done ? colors.onAccent : colors.accent }}>
          {done ? t('landing.roadmap.done') : t('landing.roadmap.next')}
        </AppText>
      </View>
      <AppText variant="heading" role="heading">
        {title}
      </AppText>
      <AppText tone="muted">{body}</AppText>
    </View>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.faqItem}>
      <Pressable
        role="button"
        aria-expanded={open}
        aria-label={question}
        onPress={() => setOpen((value) => !value)}
        style={styles.faqQuestion}>
        <AppText variant="heading" style={styles.flex}>
          {question}
        </AppText>
        <View style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }} aria-hidden>
          <ChevronDown color={colors.textMuted} size={20} />
        </View>
      </Pressable>
      {open ? (
        <AppText tone="muted" style={styles.faqAnswer}>
          {answer}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  flex: {
    flex: 1,
  },
  accent: {
    color: colors.accent,
  },
  centerText: {
    textAlign: 'center',
  },
  centerSelf: {
    alignSelf: 'center',
  },
  nav: {
    backgroundColor: colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    zIndex: 10,
  },
  navInner: {
    height: NAV_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  navLink: {
    paddingHorizontal: spacing.md,
    minHeight: 44,
    justifyContent: 'center',
  },
  logo: {
    fontFamily: fonts.displayBold,
    color: colors.text,
  },
  hero: {
    paddingBottom: 48,
    overflow: 'hidden',
  },
  heroInner: {
    gap: spacing.xxl,
  },
  heroInnerWide: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroText: {
    gap: spacing.lg,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  heroTitle: {
    fontFamily: fonts.displayBold,
    color: colors.text,
    letterSpacing: 0.5,
  },
  heroSubtitle: {
    fontSize: 19,
    lineHeight: 30,
    maxWidth: 560,
  },
  ctaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  ctaColumn: {
    flexDirection: 'column',
    flexWrap: 'nowrap',
    alignSelf: 'stretch',
  },
  cta: {
    minHeight: 56,
    paddingHorizontal: spacing.xl,
  },
  trustRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: spacing.lg,
    rowGap: spacing.sm,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  heroVisual: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 520,
  },
  heroVisualWide: {
    flex: 1,
    alignItems: 'flex-end',
    paddingRight: spacing.md,
  },
  pathBehind: {
    position: 'absolute',
    left: -40,
    right: -40,
    alignItems: 'center',
    opacity: 0.9,
  },
  toast: {
    position: 'absolute',
  },
  // Floating cards sit to the left of the right-aligned phone so they never cover its content.
  toastTop: {
    top: 130,
    left: -24,
  },
  toastBottom: {
    bottom: 120,
    left: 0,
  },
  band: {
    backgroundColor: '#0F1216',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  stepCard: {
    flex: 1,
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  stepPreview: {
    marginTop: 'auto',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontFamily: fonts.displayBold,
    fontSize: 20,
    color: colors.onAccent,
  },
  infoCard: {
    flex: 1,
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  infoCardPlain: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingHorizontal: 0,
  },
  infoIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  roadmapItem: {
    flex: 1,
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  roadmapDone: {
    borderStyle: 'solid',
    borderColor: colors.accent,
    backgroundColor: colors.surface,
  },
  statusPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  statusDone: {
    backgroundColor: colors.accent,
  },
  statusNext: {
    backgroundColor: 'transparent',
  },
  faqList: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    gap: spacing.sm,
  },
  faqItem: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 64,
    paddingHorizontal: spacing.lg,
  },
  faqAnswer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  finalCta: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 64,
    paddingHorizontal: spacing.lg,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  finalPath: {
    position: 'absolute',
    bottom: -20,
    right: -40,
    opacity: 0.5,
  },
  finalTitle: {
    fontFamily: fonts.displayBold,
    color: colors.text,
    textAlign: 'center',
    maxWidth: 960,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: spacing.xl,
  },
  footerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  footerColumn: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  footerBrand: {
    gap: spacing.xs,
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  stickyCta: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    backgroundColor: 'rgba(11, 13, 16, 0.94)',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
