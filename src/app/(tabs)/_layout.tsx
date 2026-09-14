import { Tabs } from 'expo-router';
import { CircleUser, Dumbbell, HeartPulse, House, TrendingUp } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts, spacing } from '@/theme/tokens';

// Icon (28) + label line (16) + item padding (10) + bar padding and border (9), with a little air.
const TAB_BAR_CONTENT_HEIGHT = 66;

export default function TabsLayout() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: TAB_BAR_CONTENT_HEIGHT + insets.bottom,
          paddingTop: spacing.xs,
          paddingBottom: insets.bottom + spacing.xs,
        },
        tabBarLabelStyle: { fontFamily: fonts.bodyMedium, fontSize: 12, lineHeight: 16 },
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
