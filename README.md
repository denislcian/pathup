# PathUp

> **Tu camino, hacia arriba.** Entreno, programas guiados y bienestar en una sola app gratuita, en español y sin anuncios.

🚧 **En construcción** · MVP previsto: 2 de noviembre de 2026

PathUp junta en una sola app:
- el **registro de entreno** de Hevy y Strong,
- los **programas guiados** de las apps de influencers,
- un **check-in de bienestar** que ajusta la sesión del día.

Nutrición y parte social llegan después del MVP.

## Stack

Expo SDK 57 (React Native 0.86) · TypeScript · Expo Router · TanStack Query · Zustand · Supabase (Postgres + RLS, Auth, Storage, Edge Functions) · Jest · pgTAP · Maestro · GitHub Actions · EAS

## Documentación

| Documento | Contenido |
|---|---|
| [Producto](docs/01-producto.md) | Qué copiamos de cada app y cómo lo mejoramos, público, salvaguardas |
| [Arquitectura](docs/02-arquitectura.md) | Stack, modelo de datos, estrategia sin conexión, RGPD |
| [Hoja de ruta](docs/03-hoja-de-ruta.md) | Fases con fechas, puertas y qué recortar |
| [Paso a paso · Fase 0](docs/04-paso-a-paso-fase-0.md) | Cuentas, configuración y primera prueba en el móvil |
| [Imágenes y vídeo con IA](docs/05-imagenes-y-video-ia.md) | Dirección de arte, lista de assets y flujo de generación |

## Desarrollo

```bash
npm install
cp .env.example .env.local   # rellena la URL y la publishable key de Supabase
npx expo start
```

- **Android:** Expo Go para SDK 57.
- **iPhone y navegador:** versión web (pulsa `w`).

| Comando | Qué hace |
|---|---|
| `npm run check` | Lint, formato, tipos y tests (igual que el CI) |
| `npm run db:start` / `npm run db:test` | Postgres local en Docker y tests pgTAP de RLS |

Decisiones técnicas en [`docs/decisiones`](docs/decisiones) y diario en [`docs/diario.md`](docs/diario.md).
