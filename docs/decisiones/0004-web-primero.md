# 0004 · La web como aplicación de primera clase

- **Fecha:** 2026-09-20
- **Estado:** aceptada

## Contexto

La web no es un extra: es el enlace que verá un reclutador y, en iPhone, la única forma de usar PathUp, porque Expo Go no admite el SDK 57 sin pagar la cuenta de Apple. La primera medición fue mala: **4,2 MB de JavaScript en un solo archivo**, fuentes en TTF, sin posibilidad de instalar y con la barra de pestañas de móvil en pantallas de ordenador.

## Decisiones

| Decisión | Por qué |
|---|---|
| **Iconos importados uno a uno** (`src/components/icons.ts`) | Importar del índice de lucide metía sus más de 1.500 iconos en el paquete. ESLint prohíbe ahora importar la librería directamente |
| **Fuentes en woff2 solo para web** (`public/fonts`, declaradas en `src/app/+html.tsx`) | 96 KB frente a cerca de 1 MB en TTF. En móvil se siguen cargando con expo-font |
| **Renderizado estático** (`web.output: "static"`) | Permite una plantilla HTML propia (fuentes, manifiesto, service worker) y deja la landing como HTML real: 14 KB que llegan en 13 ms y se ven sin esperar al JavaScript |
| **Solo la landing se genera como HTML** | El resto son pantallas con sesión: se envían como armazón vacío para que nadie vea la pantalla equivocada antes de saber si hay sesión |
| **Eliminación de código muerto forzada** (`.env` con `EXPO_UNSTABLE_TREE_SHAKING` y `EXPO_UNSTABLE_METRO_OPTIMIZE_GRAPH`) | Con renderizado estático deja de aplicarse sola y el paquete volvía a 4,3 MB |
| **Instalable (PWA)** con manifiesto, iconos y service worker propio | Se instala desde el navegador en Android y iPhone, y el armazón queda en caché para abrir sin conexión |
| **Menú lateral a partir de 960 px** (`tabBarPosition: 'left'`) | En un ordenador, una barra de pestañas abajo delata que es una app de móvil estirada |
| **Ratón y teclado** | Estados al pasar por encima, cursor de mano, Enter para completar una serie o enviar el registro, Escape para cerrar |

## Resultado

- JavaScript: **4,2 MB → 2,4 MB** sin comprimir, **560 KB** transferidos.
- Fuentes: **~1 MB → 96 KB**.
- La landing llega como HTML con estilos incluidos (388 reglas CSS en línea).

## Pendiente

- **Aviso de hidratación (error 418 de React)** en la landing compilada: React vuelve a pintar el bloque y la página queda bien, pero conviene encontrarlo. Descartados: rutas asíncronas, la etiqueta `Head`, la capa de la pantalla de carga (esta sí era un fallo y ya está corregida) y el diseño adaptable, que ahora parte siempre del layout estrecho y se ajusta tras hidratar.
- **Service worker sin verificar**: el navegador integrado de Claude no permite registrarlos. Hay que comprobarlo en Chrome (Application → Service Workers) y probar el modo sin conexión.
- Medir con Lighthouse en Chrome cuando la web esté publicada (fase 4).
