# 0005 · Paleta pizarra y menta

- **Fecha:** 2026-09-20
- **Estado:** aceptada (sustituye a la paleta lima de la decisión inicial)

## Contexto

La primera paleta usaba lima eléctrico (#C8FF2E) sobre negro. Al verla en una pantalla grande con la app ya montada, resultaba estridente: el acento competía con el contenido y daba un aire de app de gimnasio agresiva, no de herramienta que se usa a diario. Denis pidió "algo más chill y profesional".

## Decisión

Se compararon cuatro paletas sobre la misma pantalla (pizarra y menta, noche azul, grafito y arena, bosque y salvia) y se eligió **pizarra y menta**.

| Token | Antes | Ahora |
|---|---|---|
| `bg` | `#0B0D10` | `#0E1116` |
| `surface` | `#15181D` | `#161A21` |
| `surface2` | `#1E2229` | `#1E242D` |
| `text` | `#F2F4F7` | `#E7ECF3` |
| `textMuted` | `#9AA3AF` | `#93A0B0` |
| `accent` | `#C8FF2E` (lima) | `#4CC38A` (menta) |
| `calm` | `#38D9F5` | `#6AA9FF` |
| `warning` | `#FFB020` | `#E0A45E` |
| `danger` | `#FF5C5C` | `#E5766F` |

Se añadieron `accentHover`, `accentSoft` (fondo teñido de las series marcadas), `surfaceRaised` y `shadow` para no repetir colores sueltos por el código.

## Consecuencias

- Iconos de la app, splash, manifiesto y color de tema regenerados con los nuevos valores.
- Los prompts de las imágenes de ejercicios pasan a iluminar los músculos en menta; como aún no se ha generado ninguna, no hay nada que rehacer.
- El acento sigue reservado a acciones principales, récords y progreso.
