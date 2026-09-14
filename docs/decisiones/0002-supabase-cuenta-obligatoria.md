# 0002 · Supabase con cuenta obligatoria y reglas de edad en la base de datos

- **Fecha:** 2026-09-14
- **Estado:** aceptada

## Contexto

La cuenta es obligatoria (decisión de producto) para sincronizar entre dispositivos y permitir la parte social. Se tratan datos de salud (art. 9 RGPD) de personas desde 16 años.

## Decisión

- **Supabase** (Postgres + Auth + Storage + Edge Functions) en región UE, plan gratuito.
- **Seguridad en la base de datos, no solo en la app:**
  - RLS en todas las tablas.
  - Permisos de `UPDATE` por columna: el usuario no puede tocar `id` ni las marcas de tiempo.
  - Trigger que **rechaza a menores de 16** y **fuerza el perfil privado de 16 a 17 años**.
  - El perfil se crea con un trigger sobre `auth.users` a partir de los metadatos de registro, incluida la marca de tiempo del consentimiento de salud.
- **Migraciones SQL versionadas** en `supabase/migrations` y **tests pgTAP** en `supabase/tests`, ejecutados en CI con `supabase db start` + `supabase test db`.

## Consecuencias

- Aunque alguien salte la validación de la app llamando a la API directamente, las reglas de edad y privacidad se siguen cumpliendo.
- Si el registro falla por edad, Supabase Auth devuelve un error genérico ("Database error saving new user"). Por eso la app debe validar la edad antes de enviar el formulario para dar un mensaje claro.
- El plan gratuito pausa el proyecto tras 7 días sin actividad: en la fase 4 se añade una tarea keep-alive.
