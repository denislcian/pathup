import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CircleUser, Dumbbell, HeartPulse, House, TrendingUp } from '@/components/icons';
import { colors, fonts, spacing } from '@/theme/tokens';

// Icon (28) + label line (16) + item padding (10) + bar padding and border (9), with a little air.
const TAB_BAR_CONTENT_HEIGHT = 66;
const SIDEBAR_WIDTH = 240;
/** Above this width the tab bar becomes a sidebar, which is what a desktop browser expects. */
const SIDEBAR_BREAKPOINT = 960;

export default function TabsLayout() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const sidebar = width >= SIDEBAR_BREAKPOINT;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarPosition: sidebar ? 'left' : 'bottom',
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: sidebar
          ? {
              backgroundColor: colors.surface,
              borderRightColor: colors.border,
              borderRightWidth: 1,
              width: SIDEBAR_WIDTH,
              paddingTop: insets.top + spacing.md,
              paddingBottom: insets.bottom + spacing.md,
            }
          : {
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
              height: TAB_BAR_CONTENT_HEIGHT + insets.bottom,
              paddingTop: spacing.xs,
              paddingBottom: insets.bottom + spacing.xs,
            },
        tabBarItemStyle: sidebar
          ? { borderRadius: 12, marginHorizontal: spacing.sm, marginVertical: 2 }
          : undefined,
        tabBarLabelStyle: sidebar
          ? { fontFamily: fonts.bodyMedium, fontSize: 15 }
          : { fontFamily: fonts.bodyMedium, fontSize: 12, lineHeight: 16 },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.today'),
          tabBarIcon: ({ color, size }) => <House color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="entreno"
        options={{
          title: t('tabs.workout'),
          tabBarIcon: ({ color, size }) => <Dumbbell color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="progreso"
        options={{
          title: t('tabs.progress'),
          tabBarIcon: ({ color, size }) => <TrendingUp color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="bienestar"
        options={{
          title: t('tabs.wellness'),
          tabBarIcon: ({ color, size }) => <HeartPulse color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color, size }) => <CircleUser color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
