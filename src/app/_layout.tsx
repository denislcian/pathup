import '@/i18n';

import {
  BarlowCondensed_600SemiBold,
  BarlowCondensed_700Bold,
} from '@expo-google-fonts/barlow-condensed';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { DarkTheme, Stack, ThemeProvider, usePathname } from 'expo-router';
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
import { isServerRender } from '@/lib/storage';
import { colors, fonts } from '@/theme/tokens';

// The web build has its own dark HTML shell, and the splash overlay would only show up in the
// pre-rendered HTML and break hydration.
if (Platform.OS !== 'web') void SplashScreen.preventAutoHideAsync();
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
  // On web the same families are served as woff2 from the HTML shell (src/app/+html.tsx),
  // which is a tenth of the weight of the TTF files used on native.
  const [fontsLoaded, fontError] = useFonts(
    Platform.OS === 'web'
      ? {}
      : {
          BarlowCondensed_600SemiBold,
          BarlowCondensed_700Bold,
          Inter_400Regular,
          Inter_500Medium,
          Inter_600SemiBold,
        },
  );

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
  // While pre-rendering the web build there is no session to read. Only the public landing is
  // rendered to HTML (for search engines and link previews); the rest ships as an empty shell
  // so nobody sees the wrong screen before the session is known.
  const pathname = usePathname();
  const prerenderingLanding = isServerRender && pathname === '/bienvenida';
  const ready = prerenderingLanding || (!isLoading && (!signedIn || !profile.isPending));

  useEffect(() => {
    if (ready && Platform.OS !== 'web') void SplashScreen.hideAsync();
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
        {/* Pre-rendered as HTML (there is no session while building), so search engines and
            link previews get the real landing instead of an empty shell. */}
        <Stack.Screen name="bienvenida" />
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
        <Stack.Screen
          name="historial/[id]"
          options={{ headerShown: true, title: t('history.detailTitle') }}
        />
        <Stack.Screen
          name="medidas"
          options={{ headerShown: true, title: t('measurements.title') }}
        />
        <Stack.Screen
          name="rutinas/editar"
          options={{ headerShown: true, title: t('routines.editorHeader') }}
        />
        <Stack.Screen
          name="rutinas/elegir-ejercicio"
          options={{ headerShown: true, title: t('logger.pickerTitle') }}
        />
      </Stack.Protected>

      <Stack.Screen name="privacidad" options={{ headerShown: true, title: t('privacy.title') }} />
    </Stack>
  );
}
