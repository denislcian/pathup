import '@/i18n';

import {
  BarlowCondensed_600SemiBold,
  BarlowCondensed_700Bold,
} from '@expo-google-fonts/barlow-condensed';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

import { ProfileLoadError } from '@/components/profile-load-error';
import { AuthProvider, useAuth } from '@/features/auth/auth-provider';
import { useProfile } from '@/features/profile/profile-api';
import { createQueryClient } from '@/lib/query-client';
import { colors, fonts } from '@/theme/tokens';

void SplashScreen.preventAutoHideAsync();
// Paints the root view (and the web page body) so no light background shows during overscroll or transitions.
void SystemUI.setBackgroundColorAsync(colors.bg);
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  // Dark native form controls and scrollbars in the browser.
  document.documentElement.style.colorScheme = 'dark';
}

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.accent,
    background: colors.bg,
    card: colors.bg,
    text: colors.text,
    border: colors.border,
    notification: colors.accent,
  },
};

export default function RootLayout() {
  const [queryClient] = useState(createQueryClient);
  const [fontsLoaded, fontError] = useFonts({
    BarlowCondensed_600SemiBold,
    BarlowCondensed_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider value={navigationTheme}>
          <StatusBar style="light" />
          <RootNavigator />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function RootNavigator() {
  const { t } = useTranslation();
  const { session, isLoading } = useAuth();
  const profile = useProfile();

  const signedIn = Boolean(session);
  const onboarded = Boolean(profile.data?.onboarding_completed_at);
  const ready = !isLoading && (!signedIn || !profile.isPending);

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;
  if (signedIn && profile.isError) return <ProfileLoadError onRetry={() => profile.refetch()} />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerTitleStyle: { fontFamily: fonts.bodySemiBold },
        headerShadowVisible: false,
      }}>
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>

      <Stack.Protected guard={signedIn && !onboarded}>
        <Stack.Screen name="onboarding" />
      </Stack.Protected>

      <Stack.Protected guard={signedIn && onboarded}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="ejercicios/index"
          options={{ headerShown: true, title: t('library.title') }}
        />
        <Stack.Screen name="ejercicios/[slug]" options={{ headerShown: true, title: '' }} />
        <Stack.Screen
          name="entreno/activo"
          options={{ headerShown: true, title: t('logger.title') }}
        />
        <Stack.Screen
          name="entreno/elegir-ejercicio"
          options={{ headerShown: true, title: t('logger.pickerTitle') }}
        />
        <Stack.Screen
          name="entreno/resumen"
          options={{ headerShown: true, title: t('summary.title'), headerBackVisible: false }}
        />
      </Stack.Protected>

      <Stack.Screen name="privacidad" options={{ headerShown: true, title: t('privacy.title') }} />
    </Stack>
  );
}
