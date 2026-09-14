# PathUp · Paso a paso · Fase 0 (semana del 14 al 20 de septiembre)

Tiempo tuyo estimado: **1 h 30 min**. El resto lo hace Claude.

> **Nunca pegues en el chat ni subas al repositorio** la contraseña de la base de datos ni la clave `service_role` / `secret` de Supabase. La clave `anon` / `publishable` sí puede ir en la app: es pública por diseño.

## Ya hecho (14 sep)

- [x] Proyecto Expo SDK 57 creado en `H:\PROYECTOS\pathup` (TypeScript, Expo Router, commit inicial).
- [x] Documentación del producto, arquitectura, hoja de ruta y guía de imágenes en `docs/`.
- [x] Node 22.20 y Git 2.49 instalados en tu PC.

## Paso 1 · GitHub (10 min)

1. Entra en github.com con tu cuenta.
2. **New repository**:
   - Nombre: `pathup`.
   - Visibilidad: **Public** (es para el CV).
   - **No** marques README, .gitignore ni licencia: ya existen en el proyecto.
3. Copia la URL del repositorio (`https://github.com/TU_USUARIO/pathup.git`) y pásamela. Yo conecto el proyecto y hago el primer push cuando me lo pidas.
4. Opcional, pero recomendable: en la pestaña **Projects** crea un tablero "PathUp" con la plantilla *Board*. Yo cargo las tareas de cada fase como issues.

## Paso 2 · Supabase (20 min)

1. Entra en supabase.com, **Start your project** y regístrate con GitHub.
2. **New project**:
   - Organization: la tuya personal (plan **Free**).
   - Name: `pathup`.
   - Database password: pulsa **Generate** y **guárdala en tu gestor de contraseñas**. No me la pases.
   - Region: **Central EU (Frankfurt)**. Obligatorio por RGPD: los datos de salud se quedan en la UE.
3. Espera 2 minutos a que se cree.
4. Ve a **Project Settings → API** (o **API Keys**) y copia:
   - **Project URL** (`https://xxxx.supabase.co`).
   - **Publishable key** (antes llamada `anon public`).
5. En la carpeta del proyecto, copia `.env.example` como `.env.local` y rellena los dos valores:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   EXPO_PUBLIC_SUPABASE_KEY=tu_publishable_key
   ```
   `.env.local` no se sube a GitHub: ya está en `.gitignore`.
6. En **Authentication → Sign In / Providers → Email**, deja **Confirm email** activado.
7. Sube el esquema de la base de datos (tabla `profiles` con sus reglas de seguridad). En la terminal de VS Code, dentro de `H:\PROYECTOS\pathup`:
   ```bash
   npx supabase login
   ```
   Se abre el navegador para autorizar el acceso. Después enlaza el proyecto: el `project-ref` es la parte `xxxx` de tu Project URL.
   ```bash
   npx supabase link --project-ref xxxx
   ```
   Cuando pida la contraseña de la base de datos, **la escribes tú en la terminal**. Por último, aplica las migraciones:
   ```bash
   npx supabase db push
   ```
   En **Table Editor** debería aparecer la tabla `profiles` con el candado de RLS activado.

## Paso 3 · Expo (5 min)

1. Crea una cuenta gratuita en expo.dev (puedes entrar con GitHub).
2. Nada más por ahora. La usaremos en la fase 4 para generar el APK y publicar la web.

## Paso 4 · Móviles (10 min)

**Android**
1. Abre en el móvil `https://expo.dev/go`, elige **SDK 57 → Android** e instala Expo Go.
   Si Google Play ya tiene la versión compatible con el SDK 57, también sirve la de la tienda.
2. Conecta el móvil **a la misma wifi que el PC**.

**iPhone**
- No instales nada. La App Store todavía no tiene Expo Go para el SDK 57 y la alternativa cuesta 99 $ al año.
- En iPhone probarás la **versión web** en Safari (y más adelante "Añadir a pantalla de inicio").

## Paso 5 · Primera prueba (15 min)

En VS Code, abre la carpeta `H:\PROYECTOS\pathup` y, en la terminal, arranca el servidor de desarrollo:

```bash
npx expo start
```

- **Android:** abre Expo Go y escanea el código QR de la terminal.
- **Navegador del PC:** pulsa `w` en la terminal.
- **iPhone:** en la terminal aparece la dirección de red (tipo `http://192.168.1.X:8081`); ábrela en Safari con el móvil en la misma wifi.

Si el QR no conecta en Android, prueba con:

```bash
npx expo start --tunnel
```

Deberías ver PathUp con fondo oscuro, la pantalla **Hoy** y 5 pestañas abajo.

En **Perfil** hay un aviso de desarrollo:
- **Verde lima** "Supabase configurado": `.env.local` está bien.
- **Rojo**: falta `.env.local` o tiene un nombre de variable mal escrito. Después de crearlo, reinicia `npx expo start`.

Avísame cuando lo veas en los dos móviles.

## Paso 6 · Lo que hace Claude ✅ (hecho el 14 sep)

- [x] Limpiar la plantilla y crear la estructura de carpetas de [02-arquitectura.md](02-arquitectura.md).
- [x] TypeScript estricto, ESLint + Prettier, Jest y React Native Testing Library (14 tests).
- [x] Tokens de diseño (tema oscuro y lima) y fuentes Barlow Condensed e Inter.
- [x] Navegación con 5 pestañas (Hoy · Entreno · Progreso · Bienestar · Perfil), en español y con inglés preparado.
- [x] Cliente de Supabase leyendo `.env.local` y la primera migración: `profiles` con RLS, permisos por columna, mínimo de 16 años y perfil privado obligatorio de 16 a 17 años, más tests pgTAP.
- [x] GitHub Actions: lint, formato, tipos, tests de la app y tests de la base de datos en cada push.
- [x] `docs/diario.md` y `docs/decisiones/` (registro de decisiones técnicas).

Comandos útiles:

| Comando | Qué hace |
|---|---|
| `npm run check` | Lint, formato, tipos y tests: lo mismo que el CI |
| `npm test` | Solo los tests de la app |
| `npm run db:start` y `npm run db:test` | Base de datos local en Docker y sus tests |

**Puerta de la fase 0:** la app abre en tu Android y en Safari del iPhone con las 5 pestañas y el tema oscuro, y GitHub Actions está en verde.

## Si algo falla

| Síntoma | Solución |
|---|---|
| Expo Go dice "incompatible SDK" | Instala Expo Go desde expo.dev/go eligiendo SDK 57 |
| El QR no conecta | Misma wifi en PC y móvil, o `npx expo start --tunnel` |
| El firewall de Windows pregunta por Node | **Permitir en redes privadas** |
| Safari no carga en el iPhone | Usa la IP que muestra la terminal, no `localhost` |
