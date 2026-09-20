import { ScrollViewStyleReset } from 'expo-router/html';
import type { ReactNode } from 'react';

import { colors } from '@/theme/tokens';

/**
 * HTML shell for the web build: fonts, PWA metadata and the service worker registration.
 * It only runs on web and never renders on native.
 */
export default function Root({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />

        <meta name="theme-color" content={colors.bg} />
        <meta name="color-scheme" content="dark" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="PathUp" />

        <meta property="og:title" content="PathUp · Entrenos, programas guiados y bienestar" />
        <meta
          property="og:description"
          content="Registra tus entrenos, sigue un programa hecho para ti y cuida tu descanso. Gratis, en español y sin anuncios."
        />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/icons/icon-512.png" />

        <link
          rel="preload"
          href="/fonts/inter-variable.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/barlow-condensed-700.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />

        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: styles }} />
        <script dangerouslySetInnerHTML={{ __html: registerServiceWorker }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

/**
 * Web fonts as woff2 (the native build loads the same families from TTF via expo-font).
 * Inter ships as a variable font, so each weight points at the same file.
 */
const styles = `
@font-face {
  font-family: 'BarlowCondensed_600SemiBold';
  src: url('/fonts/barlow-condensed-600.woff2') format('woff2');
  font-weight: 600;
  font-display: swap;
}
@font-face {
  font-family: 'BarlowCondensed_700Bold';
  src: url('/fonts/barlow-condensed-700.woff2') format('woff2');
  font-weight: 700;
  font-display: swap;
}
@font-face {
  font-family: 'Inter_400Regular';
  src: url('/fonts/inter-variable.woff2') format('woff2');
  font-weight: 400;
  font-display: swap;
}
@font-face {
  font-family: 'Inter_500Medium';
  src: url('/fonts/inter-variable.woff2') format('woff2');
  font-weight: 500;
  font-display: swap;
}
@font-face {
  font-family: 'Inter_600SemiBold';
  src: url('/fonts/inter-variable.woff2') format('woff2');
  font-weight: 600;
  font-display: swap;
}

html, body { background-color: ${colors.bg}; color-scheme: dark; }
body { overscroll-behavior-y: none; }

/* Keyboard users get a visible focus ring; mouse clicks do not. */
:focus-visible {
  outline: 2px solid ${colors.accent};
  outline-offset: 2px;
  border-radius: 6px;
}

::selection { background: ${colors.accent}; color: ${colors.bg}; }
`;

const registerServiceWorker = `
if ('serviceWorker' in navigator) {
  var isMetroDevServer = location.port === '8081' && ['localhost', '127.0.0.1'].indexOf(location.hostname) !== -1;
  if (!isMetroDevServer) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js').catch(function () {});
    });
  }
}
`;
