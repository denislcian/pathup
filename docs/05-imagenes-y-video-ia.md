# PathUp · Imágenes y vídeo con IA

Todas las imágenes de PathUp son **nuestras**, generadas con IA gratuita. Las imágenes de free-exercise-db tienen la licencia en duda (hay issues abiertos preguntándolo en su repositorio), así que de esa base solo usamos los textos.

## 1. Dirección de arte · "oscuro y sereno"

| Token | Color | Uso |
|---|---|---|
| `bg` | `#0E1116` | Fondo |
| `surface` | `#161A21` | Tarjetas |
| `surface-2` | `#1E242D` | Campos, filas de serie |
| `text` | `#E7ECF3` | Texto principal |
| `text-muted` | `#93A0B0` | Secundario, valores anteriores |
| `accent` | `#4CC38A` | **Verde menta**: botones, récords, progreso (texto encima en `#08130D`) |
| `calm` | `#6AA9FF` | Azul suave: bienestar y respiración |
| `warning` | `#E0A45E` | Preparación media |
| `danger` | `#E5766F` | Errores, preparación baja |

**Tipografía** (Google Fonts, licencia OFL):
- **Barlow Condensed SemiBold** para títulos y números grandes (estilo dorsal deportivo).
- **Inter** para el resto.

**Iconos:** Lucide (licencia ISC).

**Fotos e ilustraciones:** fondo oscuro, luz lateral dura, un solo toque de menta. Sin textos dentro de la imagen.

## 2. Estilo de los ejercicios: maniquí 3D

En lugar de personas realistas, **una figura 3D estilizada, gris grafito y sin rostro**, con los músculos trabajados iluminados en menta.

Por qué:
- **Consistencia:** es mucho más fácil que la IA repita un maniquí que la misma persona 120 veces.
- **Para todo el mundo:** no representa ninguna edad, cuerpo ni género concreto.
- **Informativo:** los músculos resaltados enseñan qué trabaja cada ejercicio.
- **Sin problemas de derechos de imagen.**

Cada ejercicio lleva **2 imágenes: posición inicial y final**. Para los más de 800 ejercicios sin imagen propia, la app dibuja un **mapa muscular SVG** generado por código (exacto y sin coste).

## 3. Lista de assets

### MVP (hasta el 1 de noviembre)

| # | Asset | Cantidad | Tamaño de entrega | Semana |
|---|---|---|---|---|
| 1 | Icono de la app (una "P" formada por un camino ascendente) | 1 + variantes | 1024 × 1024 | 1-2 |
| 2 | Splash y logo horizontal | 2 | 1242 × 2436 / SVG | 2 |
| 3 | Onboarding: entreno, bienestar, progreso | 3 | 1080 × 1350 | 2 |
| 4 | Ejercicios 1-20 (inicio y final) | 40 | 1024 × 1024 | 2 |
| 5 | Portadas de programas | 4 | 1080 × 1350 | 5 |
| 6 | Ejercicios 21-60 (inicio y final) | 80 | 1024 × 1024 | 5 |
| 7 | Estados vacíos (sin entrenos, sin hábitos…) | 5 | 800 × 800 | 6 |
| 8 | Fondos de tarjetas de récord y logro | 3 | 1080 × 1920 | 6 |
| 9 | Gráfico destacado de Google Play y banner del README | 2 | 1024 × 500 / 1280 × 640 | 7 |

### Vídeo

- **MVP sin vídeos de técnica.** La IA de vídeo todavía se equivoca con la biomecánica (codos imposibles, rangos de movimiento inventados), y un vídeo de técnica erróneo es peor que no tener vídeo.
- **Sí usaremos vídeo** en 1 o 2 clips de 5-8 s para la landing, el README y el onboarding, generados a partir de nuestras propias imágenes (imagen a vídeo) con los créditos gratuitos de las herramientas de vídeo del momento.
- **Fase 5 o posterior:** clips en bucle de 10 ejercicios clave, solo si pasan la revisión técnica de la sección 6.

## 4. Flujo de trabajo para cada asset

1. **Ficha:** Claude te da qué hace falta, el tamaño, dónde se usa y la referencia de pose.
2. **Prompt:** invocamos la skill **promptfesor-palomo** con la ficha y el **bloque de estilo fijo** (sección 5). Siempre el mismo bloque, así todas las imágenes parecen de la misma app.
3. **Generar:** en una herramienta gratuita (sección 7), 2-4 variantes.
4. **Guardar** las variantes en `assets/raw/<tipo>/` con el nombre de la ficha, por ejemplo `ex_press-banca_start_v1.png`.
5. **Revisar y procesar (Claude):**
   - Checklist técnico.
   - Recorte y conversión a WebP optimizado en `assets/images/`.
   - Anotación en `assets/CREDITS.md` de la herramienta, fecha y prompt.

## 5. Bloque de estilo fijo (se pega en todos los prompts de ejercicio)

```text
Stylized 3D faceless mannequin figure, matte graphite grey material, athletic neutral body,
performing {EJERCICIO} in the {INICIAL|FINAL} position, {DETALLE DE POSTURA},
target muscles {MÚSCULOS} glowing soft mint green (#4CC38A), all other muscles matte grey,
full body visible, side three-quarter view, centered, dark studio background (#0E1116),
hard rim light from the left, soft floor shadow, clean minimal, no text, no logos, no gym clutter,
square 1:1, high detail, consistent character design
```

La skill de prompting lo adapta al modelo concreto y rellena `{DETALLE DE POSTURA}`: agarre, ángulo de articulaciones, posición de la espalda y del equipamiento.

## 6. Checklist técnico de cada imagen de ejercicio

- [ ] Espalda en la posición correcta para el ejercicio (neutra salvo que el ejercicio pida otra cosa).
- [ ] Agarre, anchura y posición de pies correctos.
- [ ] Rango de movimiento real: ni recortado ni exagerado.
- [ ] Equipamiento correcto (banco, barra, polea) y proporcionado.
- [ ] Los músculos resaltados coinciden con `primary_muscles`.
- [ ] Inicial y final se reconocen como el mismo ejercicio, mismo ángulo de cámara.
- [ ] Sin dedos extra, extremidades fundidas ni textos.

Si falla un punto, se regenera. No se "arregla" con un editor.

## 7. Herramientas gratuitas

Los límites gratuitos cambian a menudo: se comprueban el día que se usan.

| Para qué | Herramientas |
|---|---|
| Imágenes | Google AI Studio / Gemini (Nano Banana), ChatGPT gratis, Ideogram (buena con logos), Leonardo (créditos diarios), Microsoft Designer |
| Vídeo corto | Herramientas de imagen a vídeo con créditos gratuitos del momento; prompts con la skill de vídeo cuando lleguemos |
| Editar | Photopea (web, gratis) |
| Quitar fondo | `rembg` en local (Python, gratis) |
| Vectorizar el logo | Inkscape (trazar mapa de bits) |
| Comprimir | Squoosh o `sharp` en un script del proyecto |

**Licencias:** antes de publicar, revisa en los términos de cada herramienta que permite uso comercial del resultado y anótalo en `assets/CREDITS.md`. Es un proyecto de portfolio, pero si algún día se monetiza no habrá que rehacer nada.

## 8. Primeros 20 ejercicios (fase 1a)

Press banca con barra · press inclinado con mancuernas · flexiones · remo con barra · jalón al pecho · dominadas asistidas · press militar con mancuernas · elevaciones laterales · curl de bíceps con mancuernas · extensión de tríceps en polea · sentadilla goblet · prensa de piernas · peso muerto rumano · zancadas · hip thrust · curl femoral · elevación de gemelos · plancha · crunch en polea · paseo del granjero.
