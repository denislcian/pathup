# 0001 · App móvil con Expo en lugar de PWA

- **Fecha:** 2026-09-14
- **Estado:** aceptada

## Contexto

PathUp es el proyecto principal del portfolio. Tiene que funcionar en Android, iOS y web, y aportar al CV algo distinto de proyectos anteriores, que eran PWA en vanilla JS y Next.js.

## Opciones

| Opción | A favor | En contra |
|---|---|---|
| **Expo SDK 57 + TypeScript** | Una base de código para Android, iOS y web; añade desarrollo móvil nativo al CV; ecosistema maduro (Expo Router, EAS) | En iPhone no se puede probar gratis la versión nativa (Expo Go SDK 57 no está en la App Store) |
| PWA con React o Next.js | Enlace inmediato para reclutadores; alojamiento gratis | Repite lo que ya hay en el portfolio; peor acceso a sensores, notificaciones y cámara |
| Flutter | Muy buena interfaz | Menos demanda en ofertas en España; Dart no se reutiliza en la web |

## Decisión

**Expo SDK 57** con Expo Router, TypeScript estricto y `StyleSheet` con tokens propios (sin librería de estilos, para no depender de su compatibilidad con cada SDK).

## Consecuencias

- La versión web (`web.output: "single"`, SPA) es el enlace para el CV y la forma de probar en iPhone.
- En Android se prueba con Expo Go o con un APK de EAS Build.
- Las pestañas usan `Tabs` de JavaScript (no `NativeTabs`) para tener el mismo diseño oscuro en las tres plataformas.
