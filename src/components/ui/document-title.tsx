import Head from 'expo-router/head';
import { Platform } from 'react-native';

/**
 * The browser tab's title, "Progreso · PathUp". Every page needs its own (WCAG 2.4.2): it is the
 * first thing a screen reader announces and what tells tabs and history entries apart.
 */
export function DocumentTitle({ title }: { title: string }) {
  if (Platform.OS !== 'web') return null;
  return (
    <Head>
      <title>{`${title} · PathUp`}</title>
    </Head>
  );
}
