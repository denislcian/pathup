# 0003 · Registro sin confirmación por email hasta la fase 4

- **Fecha:** 2026-09-14
- **Estado:** aceptada (se revisa en la fase 4)

## Contexto

El servidor de email que Supabase incluye por defecto solo envía a los miembros del equipo del proyecto y como máximo 2 emails por hora en todo el proyecto. Con la confirmación activada, ningún probador externo podría registrarse.

## Opciones

| Opción | A favor | En contra |
|---|---|---|
| **Desactivar la confirmación ahora** | Registro inmediato; 10 probadores sin fricción; cero configuración | Se pueden crear cuentas con emails ajenos; sin recuperación de contraseña hasta tener SMTP |
| SMTP gratuito ya (Brevo, 300 emails/día) + código de 6 dígitos | Flujo completo desde el principio | Más configuración y tiempo en una fase que ya es grande |
| SMTP por defecto | Nada que configurar | Solo sirve para el email del propio desarrollador |

## Decisión

Desactivar "Confirm email" en Supabase durante las fases 1 a 3. La app gestiona los dos casos: si `signUp` no devuelve sesión, muestra "Revisa tu email", así que volver a activarlo no exige cambiar código.

## Consecuencias

- **Fase 4:** conectar Brevo como SMTP, reactivar la confirmación (con código de 6 dígitos, sin enlaces que fallen en móvil) y añadir "¿Olvidaste tu contraseña?".
- Login con Google también en la fase 4, cuando exista una build propia de la app.
