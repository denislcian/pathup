# PathUp · Prompts de imagen · Ejercicios 1-20

Prompts listos para pegar en Gemini (Nano Banana), ChatGPT, Ideogram o Leonardo. Siguen la dirección de arte de [`05-imagenes-y-video-ia.md`](../05-imagenes-y-video-ia.md) y se han optimizado con la skill promptfesor-palomo.

## Cómo usarlos

1. **Un ejercicio cada vez**, en un chat nuevo.
2. Pega el prompt de **Inicio**, genera y, **en el mismo chat**, pega el de **Final**. Así el maniquí, la cámara y la luz se mantienen. En herramientas sin memoria de chat (Ideogram, Leonardo) sube la imagen de inicio como referencia de personaje o estilo, o repite la misma semilla.
3. Genera **2-4 variantes** de cada posición.
4. Guarda en `assets/raw/ejercicios/` con el **nombre exacto** que aparece en cada ficha. Las variantes siguen la numeración: `_v1`, `_v2`, `_v3`...
5. Revisa cada imagen con el **checklist de la sección 6** del doc 05 y con los puntos de "Revisa especialmente". Si falla algo, se regenera; no se retoca.

Notas:
- Los prompts están en inglés porque los modelos siguen mejor la biomecánica en inglés.
- **Solo se iluminan los músculos principales** (así lo pide el checklist: coinciden con `primary_muscles`). Los secundarios se listan como referencia y quedan en gris.
- Si una herramienta avisa de que el prompt es demasiado largo, quita la última frase de restricciones ("No text...") y pega la línea negativa de abajo en su campo de negative prompt.

## Bloque de estilo

Todos los prompts comparten este texto. Ya va incluido en cada prompt; esta es la plantilla para crear ejercicios nuevos.

```text
3D render for a fitness app exercise illustration: a stylized faceless mannequin (smooth featureless head, no hair), gender-neutral athletic build, matte graphite grey surface with softly sculpted muscles, performing {EXERCISE}, shown in the {start|end} position. {POSE} Target muscles glowing soft mint green (#4CC38A), lit from within the muscle surface with clean edges: {MUSCLES}. Every other muscle stays matte graphite grey. Equipment: {EQUIPMENT}, realistically proportioned, in dark charcoal and brushed steel, clearly readable against the background, never mint. {CAMERA}, full body and all equipment in frame, figure centered with margin around it. Seamless dark studio background (#0E1116), hard rim light from the left, soft fill light, soft floor shadow, clean minimal high-contrast look, square 1:1 image. Correct anatomy: two arms, two legs, five fingers on each hand. No text, numbers or logos, no halo or neon outline, no gym clutter, no other people.
```

En el prompt de **Final** se añade al final:

```text
Keep the exact same mannequin, camera angle, framing and lighting as the start image earlier in this chat; only the pose changes.
```

Si el ejercicio no usa equipamiento, la frase `Equipment: ...` se sustituye por `No equipment: the figure is on the bare studio floor.`

**Qué cambia respecto al bloque de la sección 5 y por qué**
- **Uso final al principio** ("fitness app exercise illustration"): orienta al modelo hacia una ilustración limpia y didáctica.
- **Cabeza sin rasgos ni pelo, dicho de forma explícita:** "faceless" solo no basta; muchos modelos dibujan ojos o pelo.
- **Brillo "desde dentro del músculo, con bordes limpios" y "sin halo ni contorno neón":** evita que brille toda la silueta en vez del músculo concreto.
- **Equipamiento en carbón y acero, nunca lima:** el menta queda reservado a los músculos (el "único toque de lima" de la sección 1) y el acero se lee contra el fondo oscuro.
- **Cámara concreta por ejercicio** (tres cuartos lateral desde delante o desde detrás, y altura): sigue siendo vista lateral 3/4, pero garantiza que el músculo objetivo se vea. En los de espalda, isquios y gemelos la cámara va por detrás.
- **Fuera "high detail" y "consistent character design":** son muletillas que ya no aportan. La consistencia se consigue generando inicio y final en el mismo chat, con la frase de continuidad.
- **Anatomía explícita** (dos brazos, dos piernas, cinco dedos) y restricciones en lenguaje natural: reducen dedos extra y extremidades fundidas.

## Línea negativa (solo para herramientas con campo de negative prompt)

```text
text, letters, numbers, logo, watermark, face, facial features, hair, clothing, extra fingers, extra limbs, fused limbs, halo, neon outline, glowing equipment, bright background, gym interior, mirror, other people, cropped limbs, realistic human skin
```

---

## 1. Press banca con barra

- **Slug:** `press-banca-barra`
- **Archivos:** `ex_press-banca-barra_start_v1.png` · `ex_press-banca-barra_end_v1.png`
- **Iluminar en menta:** pecho (pectoral mayor)
- **Secundarios (quedan en gris):** deltoides anterior, tríceps

### Inicio

```text
3D render for a fitness app exercise illustration: a stylized faceless mannequin (smooth featureless head, no hair), gender-neutral athletic build, matte graphite grey surface with softly sculpted muscles, performing a flat barbell bench press, shown in the start position. Lying face up on the flat bench with head, upper back and glutes touching the pad, feet flat on the floor slightly wider than the hips with knees bent about 90 degrees, a small natural arch in the lower back and shoulder blades pinched together. Overhand grip on the barbell with hands about one and a half shoulder widths apart, wrists straight and stacked over the elbows. Arms fully extended and vertical, holding the bar directly above the shoulders. Target muscles glowing soft mint green (#4CC38A), lit from within the muscle surface with clean edges: chest muscles (pectoralis major, both sides). Every other muscle stays matte graphite grey. Equipment: a flat bench with barbell rack uprights behind the head and an Olympic barbell loaded with plates, realistically proportioned, in dark charcoal and brushed steel, clearly readable against the background, never mint. Front three-quarter side view from slightly above the bench, camera tilted down about 20 degrees so the chest is clearly visible, full body and all equipment in frame, figure centered with margin around it. Seamless dark studio background (#0E1116), hard rim light from the left, soft fill light, soft floor shadow, clean minimal high-contrast look, square 1:1 image. Correct anatomy: two arms, two legs, five fingers on each hand. No text, numbers or logos, no halo or neon outline, no gym clutter, no other people.
```

### Final

```text
3D render for a fitness app exercise illustration: a stylized faceless mannequin (smooth featureless head, no hair), gender-neutral athletic build, matte graphite grey surface with softly sculpted muscles, performing a flat barbell bench press, shown in the end position. Lying face up on the flat bench with head, upper back and glutes touching the pad, feet flat on the floor slightly wider than the hips, a small natural arch in the lower back and shoulder blades pinched together. Overhand grip about one and a half shoulder widths apart. The bar is lowered to touch the lower chest at nipple line, elbows bent and tucked about 45 degrees from the torso (not flared out to the sides), forearms vertical under the bar, wrists straight. Target muscles glowing soft mint green (#4CC38A), lit from within the muscle surface with clean edges: chest muscles (pectoralis major, both sides). Every other muscle stays matte graphite grey. Equipment: a flat bench with barbell rack uprights behind the head and an Olympic barbell loaded with plates, realistically proportioned, in dark charcoal and brushed steel, clearly readable against the background, never mint. Front three-quarter side view from slightly above the bench, camera tilted down about 20 degrees so the chest is clearly visible, full body and all equipment in frame, figure centered with margin around it. Seamless dark studio background (#0E1116), hard rim light from the left, soft fill light, soft floor shadow, clean minimal high-contrast look, square 1:1 image. Correct anatomy: two arms, two legs, five fingers on each hand. No text, numbers or logos, no halo or neon outline, no gym clutter, no other people. Keep the exact same mannequin, camera angle, framing and lighting as the start image earlier in this chat; only the pose changes.
```

**Revisa especialmente**

- Codos a unos 45° del tronco y antebrazos verticales bajo la barra. Si salen en T (90°) o las muñecas se doblan hacia atrás, regenera.
- En el final la barra toca la parte baja del pecho (línea de pezones), nunca el cuello ni el abdomen.
- Cabeza, espalda alta y glúteos sobre el banco; pies apoyados en el suelo, no encima del banco.

---

## 2. Press inclinado con mancuernas

- **Slug:** `press-inclinado-mancuernas`
- **Archivos:** `ex_press-inclinado-mancuernas_start_v1.png` · `ex_press-inclinado-mancuernas_end_v1.png`
- **Iluminar en menta:** pecho alto (porción clavicular del pectoral)
- **Secundarios (quedan en gris):** deltoides anterior, tríceps

### Inicio

```text
3D render for a fitness app exercise illustration: a stylized faceless mannequin (smooth featureless head, no hair), gender-neutral athletic build, matte graphite grey surface with softly sculpted muscles, performing an incline dumbbell bench press, shown in the start position. Lying back on the incline bench with head, upper back and glutes on the pad and feet flat on the floor. One dumbbell in each hand with palms facing forward, arms fully extended straight up above the upper chest and perpendicular to the floor, dumbbells close together but not touching, wrists stacked over the elbows. Target muscles glowing soft mint green (#4CC38A), lit from within the muscle surface with clean edges: the upper chest only (upper, clavicular portion of the pectoralis major), while the lower chest stays grey. Every other muscle stays matte graphite grey. Equipment: an adjustable bench with the backrest inclined about 35 degrees from the floor and two hexagonal dumbbells, realistically proportioned, in dark charcoal and brushed steel, clearly readable against the background, never mint. Front three-quarter side view, camera slightly above shoulder height of the reclined figure, full body and all equipment in frame, figure centered with margin around it. Seamless dark studio background (#0E1116), hard rim light from the left, soft fill light, soft floor shadow, clean minimal high-contrast look, square 1:1 image. Correct anatomy: two arms, two legs, five fingers on each hand. No text, numbers or logos, no halo or neon outline, no gym clutter, no other people.
```

### Final

```text
3D render for a fitness app exercise illustration: a stylized faceless mannequin (smooth featureless head, no hair), gender-neutral athletic build, matte graphite grey surface with softly sculpted muscles, performing an incline dumbbell bench press, shown in the end position. Lying back on the incline bench with head, upper back and glutes on the pad and feet flat on the floor. The dumbbells are lowered to the sides of the upper chest, level with the chest, palms facing forward, elbows bent about 90 degrees and angled about 45 to 60 degrees from the torso, forearms vertical, wrists straight. Target muscles glowing soft mint green (#4CC38A), lit from within the muscle surface with clean edges: the upper chest only (upper, clavicular portion of the pectoralis major), while the lower chest stays grey. Every other muscle stays matte graphite grey. Equipment: an adjustable bench with the backrest inclined about 35 degrees from the floor and two hexagonal dumbbells, realistically proportioned, in dark charcoal and brushed steel, clearly readable against the background, never mint. Front three-quarter side view, camera slightly above shoulder height of the reclined figure, full body and all equipment in frame, figure centered with margin around it. Seamless dark studio background (#0E1116), hard rim light from the left, soft fill light, soft floor shadow, clean minimal high-contrast look, square 1:1 image. Correct anatomy: two arms, two legs, five fingers on each hand. No text, numbers or logos, no halo or neon outline, no gym clutter, no other people. Keep the exact same mannequin, camera angle, framing and lighting as the start image earlier in this chat; only the pose changes.
```

**Revisa especialmente**

- Respaldo entre 30 y 45°: casi vertical parece un press militar; plano, un press banca.
- Antebrazos verticales y muñecas rectas. En el final las mancuernas quedan a la altura del pecho alto, no de los hombros ni del abdomen.
- Glúteos en el asiento y pies en el suelo, sin despegar la espalda del respaldo.

---

## 3. Flexiones

- **Slug:** `flexiones`
- **Archivos:** `ex_flexiones_start_v1.png` · `ex_flexiones_end_v1.png`
- **Iluminar en menta:** pecho (pectoral mayor)
- **Secundarios (quedan en gris):** deltoides anterior, tríceps, abdominales

### Inicio

```text
3D render for a fitness app exercise illustration: a stylized faceless mannequin (smooth featureless head, no hair), gender-neutral athletic build, matte graphite grey surface with softly sculpted muscles, performing a push-up, shown in the start position. High plank on the floor: hands flat with fingers pointing forward, slightly wider than shoulder width and directly under the shoulders, arms straight without locking the elbows. Body in one straight line from head to heels, glutes and abs braced, weight on the toes with feet hip width apart, neck neutral with the gaze on the floor just ahead of the hands. Target muscles glowing soft mint green (#4CC38A), lit from within the muscle surface with clean edges: chest muscles (pectoralis major, both sides). Every other muscle stays matte graphite grey. No equipment: the figure is on the bare studio floor. Front three-quarter side view with the camera low, at about the height of the figure's shoulders, full body in frame, figure centered with margin around it. Seamless dark studio background (#0E1116), hard rim light from the left, soft fill light, soft floor shadow, clean minimal high-contrast look, square 1:1 image. Correct anatomy: two arms, two legs, five fingers on each hand. No text, numbers or logos, no halo or neon outline, no gym clutter, no other people.
```

### Final

```text
3D render for a fitness app exercise illustration: a stylized faceless mannequin (smooth featureless head, no hair), gender-neutral athletic build, matte graphite grey surface with softly sculpted muscles, performing a push-up, shown in the end position. Bottom of the push-up: chest lowered to just above the floor, elbows bent past 90 degrees and tucked about 45 degrees from the torso, forearms roughly vertical, hands flat slightly wider than shoulder width. Body still in one straight line from head to heels, hips neither sagging nor raised, weight on the toes, neck neutral. Target muscles glowing soft mint green (#4CC38A), lit from within the muscle surface with clean edges: chest muscles (pectoralis major, both sides). Every other muscle stays matte graphite grey. No equipment: the figure is on the bare studio floor. Front three-quarter side view with the camera low, at about the height of the figure's shoulders, full body in frame, figure centered with margin around it. Seamless dark studio background (#0E1116), hard rim light from the left, soft fill light, soft floor shadow, clean minimal high-contrast look, square 1:1 image. Correct anatomy: two arms, two legs, five fingers on each hand. No text, numbers or logos, no halo or neon outline, no gym clutter, no other people. Keep the exact same mannequin, camera angle, framing and lighting as the start image earlier in this chat; only the pose changes.
```

**Revisa especialmente**

- Cuerpo recto de cabeza a talones: ni cadera hundida ni glúteos en pico.
- Codos a unos 45°, no abiertos en T; manos bajo los hombros, no adelantadas.
- En el final el pecho casi toca el suelo (no media flexión) y la cabeza no cae hacia delante.

---

## 4. Remo con barra

- **Slug:** `remo-barra`
- **Archivos:** `ex_remo-barra_start_v1.png` · `ex_remo-barra_end_v1.png`
- **Iluminar en menta:** espalda alta (romboides, trapecio medio) y dorsal ancho
- **Secundarios (quedan en gris):** deltoides posterior, bíceps, zona lumbar

### Inicio

```text
3D render for a fitness app exercise illustration: a stylized faceless mannequin (smooth featureless head, no hair), gender-neutral athletic build, matte graphite grey surface with softly sculpted muscles, performing a bent-over barbell row, shown in the start position. Standing with feet hip width apart and knees softly bent about 20 degrees, hips pushed back so the torso is hinged forward to about 45 degrees from the floor. Spine flat and neutral from pelvis to head, neck in line with the spine, gaze on the floor about a metre ahead. Overhand grip slightly wider than shoulder width, arms hanging straight down from the shoulders, the bar just below the knees and close to the shins. Target muscles glowing soft mint green (#4CC38A), lit from within the muscle surface with clean edges: upper back (rhomboids and middle trapezius between the shoulder blades) and lats (latissimus dorsi along both sides of the back). Every other muscle stays matte graphite grey. Equipment: an Olympic barbell loaded with plates, realistically proportioned, in dark charcoal and brushed steel, clearly readable against the background, never mint. Rear three-quarter side view at hip height, so the back is clearly visible, full body and all equipment in frame, figure centered with margin around it. Seamless dark studio background (#0E1116), hard rim light from the left, soft fill light, soft floor shadow, clean minimal high-contrast look, square 1:1 image. Correct anatomy: two arms, two legs, five fingers on each hand. No text, numbers or logos, no halo or neon outline, no gym clutter, no other people.
```

### Final

```text
3D render for a fitness app exercise illustration: a stylized faceless mannequin (smooth featureless head, no hair), gender-neutral athletic build, matte graphite grey surface with softly sculpted muscles, performing a bent-over barbell row, shown in the end position. Same hinged stance: feet hip width apart, knees softly bent, torso still at about 45 degrees from the floor with a flat neutral spine. The bar is pulled up to touch the lower ribs and upper abdomen, elbows driven back past the torso at about 45 degrees from the body, shoulder blades squeezed together, wrists straight, overhand grip slightly wider than shoulder width. Target muscles glowing soft mint green (#4CC38A), lit from within the muscle surface with clean edges: upper back (rhomboids and middle trapezius between the shoulder blades) and lats (latissimus dorsi along both sides of the back). Every other muscle stays matte graphite grey. Equipment: an Olympic barbell loaded with plates, realistically proportioned, in dark charcoal and brushed steel, clearly readable against the background, never mint. Rear three-quarter side view at hip height, so the back is clearly visible, full body and all equipment in frame, figure centered with margin around it. Seamless dark studio background (#0E1116), hard rim light from the left, soft fill light, soft floor shadow, clean minimal high-contrast look, square 1:1 image. Correct anatomy: two arms, two legs, five fingers on each hand. No text, numbers or logos, no halo or neon outline, no gym clutter, no other people. Keep the exact same mannequin, camera angle, framing and lighting as the start image earlier in this chat; only the pose changes.
```

**Revisa especialmente**

- Espalda plana en las dos imágenes. Si se redondea la zona lumbar o la dorsal, regenera.
- El torso sigue a unos 45° en el final: si la figura se ha incorporado, ya es otro ejercicio.
- La barra llega a costillas bajas/abdomen alto (no al pecho ni al cuello) y al inicio cuelga cerca de las piernas.

---

## 5. Jalón al pecho

- **Slug:** `jalon-pecho`
- **Archivos:** `ex_jalon-pecho_start_v1.png` · `ex_jalon-pecho_end_v1.png`
- **Iluminar en menta:** dorsal ancho
- **Secundarios (quedan en gris):** espalda alta, bíceps

### Inicio

```text
3D render for a fitness app exercise illustration: a stylized faceless mannequin (smooth featureless head, no hair), gender-neutral athletic build, matte graphite grey surface with softly sculpted muscles, performing a wide-grip lat pulldown, shown in the start position. Seated facing the machine, thighs locked under the knee pads, feet flat on the floor, torso upright with a slight lean back of about 10 degrees. Wide overhand grip on the bar with hands about one and a half shoulder widths apart, arms fully extended overhead, cable taut. Target muscles glowing soft mint green (#4CC38A), lit from within the muscle surface with clean edges: lats (latissimus dorsi, the wide muscles along both sides of the back). Every other muscle stays matte graphite grey. Equipment: a lat pulldown machine with a weight stack, knee pads and a long straight bar with slightly angled ends hanging from a high cable, realistically proportioned, in dark charcoal and brushed steel, clearly readable against the background, never mint. Rear three-quarter side view at shoulder height, so the back is clearly visible, full body and all equipment in frame, figure centered with margin around it. Seamless dark studio background (#0E1116), hard rim light from the left, soft fill light, soft floor shadow, clean minimal high-contrast look, square 1:1 image. Correct anatomy: two arms, two legs, five fingers on each hand. No text, numbers or logos, no halo or neon outline, no gym clutter, no other people.
```

### Final

```text
3D render for a fitness app exercise illustration: a stylized faceless mannequin (smooth featureless head, no hair), gender-neutral athletic build, matte graphite grey surface with softly sculpted muscles, performing a wide-grip lat pulldown, shown in the end position. Seated facing the machine, thighs locked under the knee pads, feet flat on the floor, torso leaning back about 15 degrees with the chest lifted. The bar is pulled down in front of the face to the top of the chest at collarbone level, elbows bent and driven down toward the ribs, shoulder blades pulled down and together, wrists straight, wide overhand grip. Target muscles glowing soft mint green (#4CC38A), lit from within the muscle surface with clean edges: lats (latissimus dorsi, the wide muscles along both sides of the back). Every other muscle stays matte graphite grey. Equipment: a lat pulldown machine with a weight stack, knee pads and a long straight bar with slightly angled ends hanging from a high cable, realistically proportioned, in dark charcoal and brushed steel, clearly readable against the background, never mint. Rear three-quarter side view at shoulder height, so the back is clearly visible, full body and all equipment in frame, figure centered with margin around it. Seamless dark studio background (#0E1116), hard rim light from the left, soft fill light, soft floor shadow, clean minimal high-contrast look, square 1:1 image. Correct anatomy: two arms, two legs, five fingers on each hand. No text, numbers or logos, no halo or neon outline, no gym clutter, no other people. Keep the exact same mannequin, camera angle, framing and lighting as the start image earlier in this chat; only the pose changes.
```

**Revisa especialmente**

- La barra baja por delante de la cara hasta la clavícula, nunca por detrás de la nuca.
- Inclinación ligera hacia atrás (10-20°), sin tumbarse ni balancear el tronco.
- Muslos bajo las almohadillas y cable conectado de la polea alta a la barra.

---

## 6. Dominadas asistidas en máquina

- **Slug:** `dominadas-asistidas`
- **Archivos:** `ex_dominadas-asistidas_start_v1.png` · `ex_dominadas-asistidas_end_v1.png`
- **Iluminar en menta:** dorsal ancho
- **Secundarios (quedan en gris):** espalda alta, bíceps

### Inicio

```text
3D render for a fitness app exercise illustration: a stylized faceless mannequin (smooth featureless head, no hair), gender-neutral athletic build, matte graphite grey surface with softly sculpted muscles, performing an assisted pull-up on an assisted pull-up machine, shown in the start position. Kneeling with both knees and shins on the padded assistance platform, body hanging vertically below the handles. Overhand grip on the wide pull-up handles with hands slightly wider than shoulder width, arms fully extended overhead, torso upright, spine neutral. Target muscles glowing soft mint green (#4CC38A), lit from within the muscle surface with clean edges: lats (latissimus dorsi, the wide muscles along both sides of the back). Every other muscle stays matte graphite grey. Equipment: an assisted pull-up machine with a weight stack, a padded kneeling platform and wide pull-up handles at the top, realistically proportioned, in dark charcoal and brushed steel, clearly readable against the background, never mint. Rear three-quarter side view, camera at about chest height of the figure, full body and all equipment in frame, figure centered with margin around it. Seamless dark studio background (#0E1116), hard rim light from the left, soft fill light, soft floor shadow, clean minimal high-contrast look, square 1:1 image. Correct anatomy: two arms, two legs, five fingers on each hand. No text, numbers or logos, no halo or neon outline, no gym clutter, no other people.
```

### Final

```text
3D render for a fitness app exercise illustration: a stylized faceless mannequin (smooth featureless head, no hair), gender-neutral athletic build, matte graphite grey surface with softly sculpted muscles, performing an assisted pull-up on an assisted pull-up machine, shown in the end position. Kneeling with both knees and shins on the padded assistance platform, which has risen with the body. The body is pulled up until the chin is just above the handles, elbows bent and pulled down beside the ribs, chest lifted toward the handles, shoulder blades down and together, torso nearly vertical with a slight lean back, overhand grip slightly wider than shoulder width. Target muscles glowing soft mint green (#4CC38A), lit from within the muscle surface with clean edges: lats (latissimus dorsi, the wide muscles along both sides of the back). Every other muscle stays matte graphite grey. Equipment: an assisted pull-up machine with a weight stack, a padded kneeling platform and wide pull-up handles at the top, realistically proportioned, in dark charcoal and brushed steel, clearly readable against the background, never mint. Rear three-quarter side view, camera at about chest height of the figure, full body and all equipment in frame, figure centered with margin around it. Seamless dark studio background (#0E1116), hard rim light from the left, soft fill light, soft floor shadow, clean minimal high-contrast look, square 1:1 image. Correct anatomy: two arms, two legs, five fingers on each hand. No text, numbers or logos, no halo or neon outline, no gym clutter, no other people. Keep the exact same mannequin, camera angle, framing and lighting as the start image earlier in this chat; only the pose changes.
```

**Revisa especialmente**

- Las dos rodillas apoyadas en la plataforma acolchada, no de pie sobre ella ni con los pies colgando.
- En el final la barbilla supera las asas y los codos apuntan al suelo junto a las costillas.
- Máquina coherente: asas arriba, plataforma bajo las rodillas y pila de peso; descarta estructuras imposibles.

---

## 7. Press militar con mancuernas sentado

- **Slug:** `press-militar-mancuernas`
- **Archivos:** `ex_press-militar-mancuernas_start_v1.png` · `ex_press-militar-mancuernas_end_v1.png`
- **Iluminar en menta:** deltoides anterior
- **Secundarios (quedan en gris):** deltoides lateral, tríceps

### Inicio

```text
3D render for a fitness app exercise illustration: a stylized faceless mannequin (smooth featureless head, no hair), gender-neutral athletic build, matte graphite grey surface with softly sculpted muscles, performing a seated dumbbell shoulder press, shown in the start position. Seated on the bench with the back and glutes against the upright backrest, feet flat on the floor slightly wider than the hips. Dumbbells held at shoulder height just outside the shoulders, palms facing forward, forearms vertical with wrists stacked over the elbows, elbows slightly in front of the torso rather than flared straight out to the sides. Target muscles glowing soft mint green (#4CC38A), lit from within the muscle surface with clean edges: front deltoids (anterior deltoids, the front of both shoulders). Every other muscle stays matte graphite grey. Equipment: an adjustable bench with the backrest fully upright and two hexagonal dumbbells, realistically proportioned, in dark charcoal and brushed steel, clearly readable against the background, never mint. Front three-quarter side view at shoulder height, full body and all equipment in frame, figure centered with margin around it. Seamless dark studio background (#0E1116), hard rim light from the left, soft fill light, soft floor shadow, clean minimal high-contrast look, square 1:1 image. Correct anatomy: two arms, two legs, five fingers on each hand. No text, numbers or logos, no halo or neon outline, no gym clutter, no other people.
```

### Final

```text
3D render for a fitness app exercise illustration: a stylized faceless mannequin (smooth featureless head, no hair), gender-neutral athletic build, matte graphite grey surface with softly sculpted muscles, performing a seated dumbbell shoulder press, shown in the end position. Seated with the back and glutes against the upright backrest, feet flat on the floor. Dumbbells pressed overhead with the arms extended but not hard locked, dumbbells above the shoulders and slightly closer together without touching, palms facing forward, upper arms near the ears, lower back not arched away from the pad. Target muscles glowing soft mint green (#4CC38A), lit from within the muscle surface with clean edges: front deltoids (anterior deltoids, the front of both shoulders). Every other muscle stays matte graphite grey. Equipment: an adjustable bench with the backrest fully upright and two hexagonal dumbbells, realistically proportioned, in dark charcoal and brushed steel, clearly readable against the background, never mint. Front three-quarter side view at shoulder height, full body and all equipment in frame, figure centered with margin around it. Seamless dark studio background (#0E1116), hard rim light from the left, soft fill light, soft floor shadow, clean minimal high-contrast look, square 1:1 image. Correct anatomy: two arms, two legs, five fingers on each hand. No text, numbers or logos, no halo or neon outline, no gym clutter, no other people. Keep the exact same mannequin, camera angle, framing and lighting as the start image earlier in this chat; only the pose changes.
```

**Revisa especialmente**

- Respaldo vertical (80-90°) y espalda apoyada, sin arquear la zona lumbar para empujar.
- Al inicio antebrazos verticales, mancuernas a la altura de los hombros y codos algo adelantados, no por detrás del cuerpo.
- Arriba las mancuernas quedan sobre los hombros, no por delante de la cara.

---

## 8. Elevaciones laterales con mancuernas

- **Slug:** `elevaciones-laterales`
- **Archivos:** `ex_elevaciones-laterales_start_v1.png` · `ex_elevaciones-laterales_end_v1.png`
- **Iluminar en menta:** deltoides lateral
- **Secundarios (quedan en gris):** trapecio

### Inicio

```text
3D render for a fitness app exercise illustration: a stylized faceless mannequin (smooth featureless head, no hair), gender-neutral athletic build, matte graphite grey surface with softly sculpted muscles, performing a standing dumbbell lateral raise, shown in the start position. Standing tall with feet hip width apart, knees soft, torso upright with a very slight forward lean. Arms hanging at the sides with a slight bend in the elbows, one dumbbell in each hand beside the thighs, palms facing the body, shoulders relaxed down. Target muscles glowing soft mint green (#4CC38A), lit from within the muscle surface with clean edges: side deltoids (lateral deltoids, the outer caps of both shoulders). Every other muscle stays matte graphite grey. Equipment: two light hexagonal dumbbells, realistically proportioned, in dark charcoal and brushed steel, clearly readable against the background, never mint. Front three-quarter side view at chest height, full body and all equipment in frame, figure centered with margin around it. Seamless dark studio background (#0E1116), hard rim light from the left, soft fill light, soft floor shadow, clean minimal high-contrast look, square 1:1 image. Correct anatomy: two arms, two legs, five fingers on each hand. No text, numbers or logos, no halo or neon outline, no gym clutter, no other people.
```

### Final

```text
3D render for a fitness app exercise illustration: a stylized faceless mannequin (smooth featureless head, no hair), gender-neutral athletic build, matte graphite grey surface with softly sculpted muscles, performing a standing dumbbell lateral raise, shown in the end position. Standing tall with feet hip width apart, torso still. Both arms raised out to the sides to shoulder height, slightly in front of the body, elbows slightly bent, palms facing the floor, dumbbells level with the shoulders and not higher, shoulders down and not shrugged. Target muscles glowing soft mint green (#4CC38A), lit from within the muscle surface with clean edges: side deltoids (lateral deltoids, the outer caps of both shoulders). Every other muscle stays matte graphite grey. Equipment: two light hexagonal dumbbells, realistically proportioned, in dark charcoal and brushed steel, clearly readable against the background, never mint. Front three-quarter side view at chest height, full body and all equipment in frame, figure centered with margin around it. Seamless dark studio background (#0E1116), hard rim light from the left, soft fill light, soft floor shadow, clean minimal high-contrast look, square 1:1 image. Correct anatomy: two arms, two legs, five fingers on each hand. No text, numbers or logos, no halo or neon outline, no gym clutter, no other people. Keep the exact same mannequin, camera angle, framing and lighting as the start image earlier in this chat; only the pose changes.
```

**Revisa especialmente**

- Brazos hasta la altura del hombro, no por encima; codos ligeramente flexionados (ni rectos ni a 90°).
- Hombros bajos, sin encogerlos hacia las orejas, y tronco quieto sin balanceo.
- Arriba las palmas miran al suelo; si miran al techo o hacia delante, regenera.

---

## 9. Curl de bíceps con mancuernas

- **Slug:** `curl-biceps-mancuernas`
- **Archivos:** `ex_curl-biceps-mancuernas_start_v1.png` · `ex_curl-biceps-mancuernas_end_v1.png`
- **Iluminar en menta:** bíceps
- **Secundarios (quedan en gris):** antebrazos

### Inicio

```text
3D render for a fitness app exercise illustration: a stylized faceless mannequin (smooth featureless head, no hair), gender-neutral athletic build, matte graphite grey surface with softly sculpted muscles, performing a standing dumbbell biceps curl, shown in the start position. Standing tall with feet hip width apart, knees soft, torso upright. Arms fully extended at the sides with the elbows close to the torso, one dumbbell in each hand with palms facing forward (supinated grip). Target muscles glowing soft mint green (#4CC38A), lit from within the muscle surface with clean edges: biceps (front of both upper arms). Every other muscle stays matte graphite grey. Equipment: two hexagonal dumbbells, realistically proportioned, in dark charcoal and brushed steel, clearly readable against the background, never mint. Front three-quarter side view at chest height, full body and all equipment in frame, figure centered with margin around it. Seamless dark studio background (#0E1116), hard rim light from the left, soft fill light, soft floor shadow, clean minimal high-contrast look, square 1:1 image. Correct anatomy: two arms, two legs, five fingers on each hand. No text, numbers or logos, no halo or neon outline, no gym clutter, no other people.
```

### Final

```text
3D render for a fitness app exercise illustration: a stylized faceless mannequin (smooth featureless head, no hair), gender-neutral athletic build, matte graphite grey surface with softly sculpted muscles, performing a standing dumbbell biceps curl, shown in the end position. Standing tall, torso upright without leaning back. Both dumbbells curled up to the front of the shoulders, elbows fully bent and still pinned beside the torso, palms facing up toward the shoulders, wrists straight. Target muscles glowing soft mint green (#4CC38A), lit from within the muscle surface with clean edges: biceps (front of both upper arms). Every other muscle stays matte graphite grey. Equipment: two hexagonal dumbbells, realistically proportioned, in dark charcoal and brushed steel, clearly readable against the background, never mint. Front three-quarter side view at chest height, full body and all equipment in frame, figure centered with margin around it. Seamless dark studio background (#0E1116), hard rim light from the left, soft fill light, soft floor shadow, clean minimal high-contrast look, square 1:1 image. Correct anatomy: two arms, two legs, five fingers on each hand. No text, numbers or logos, no halo or neon outline, no gym clutter, no other people. Keep the exact same mannequin, camera angle, framing and lighting as the start image earlier in this chat; only the pose changes.
```

**Revisa especialmente**

- Codos pegados al tronco en el final. Si se adelantan mucho o suben, regenera.
- Palmas hacia delante al inicio y hacia los hombros al final (supinación), no agarre martillo.
- Tronco vertical, sin echar la espalda atrás para subir el peso.

---

## 10. Extensión de tríceps en polea

- **Slug:** `extension-triceps-polea`
- **Archivos:** `ex_extension-triceps-polea_start_v1.png` · `ex_extension-triceps-polea_end_v1.png`
- **Iluminar en menta:** tríceps

### Inicio

```text
3D render for a fitness app exercise illustration: a stylized faceless mannequin (smooth featureless head, no hair), gender-neutral athletic build, matte graphite grey surface with softly sculpted muscles, performing a cable triceps pushdown with a rope attachment, shown in the start position. Standing close to and facing the high pulley, feet hip width apart, knees soft, torso leaning forward about 10 degrees with a neutral spine. Holding the rope with both hands, palms facing each other, upper arms vertical and pinned to the sides, elbows bent about 90 degrees, hands at lower chest height, forearms roughly parallel to the floor. Target muscles glowing soft mint green (#4CC38A), lit from within the muscle surface with clean edges: triceps (back of both upper arms). Every other muscle stays matte graphite grey. Equipment: a cable machine with a high pulley and a rope attachment on a taut cable, realistically proportioned, in dark charcoal and brushed steel, clearly readable against the background, never mint. Side three-quarter view from slightly behind the figure at chest height, so the back of the arms is visible, full body and all equipment in frame, figure centered with margin around it. Seamless dark studio background (#0E1116), hard rim light from the left, soft fill light, soft floor shadow, clean minimal high-contrast look, square 1:1 image. Correct anatomy: two arms, two legs, five fingers on each hand. No text, numbers or logos, no halo or neon outline, no gym clutter, no other people.
```

### Final

```text
3D render for a fitness app exercise illustration: a stylized faceless mannequin (smooth featureless head, no hair), gender-neutral athletic build, matte graphite grey surface with softly sculpted muscles, performing a cable triceps pushdown with a rope attachment, shown in the end position. Standing close to and facing the high pulley with the same slight forward lean. Elbows fully extended, the rope pulled down to the front of the thighs with the rope ends spread slightly apart, palms turned toward the floor, upper arms still vertical and pinned to the sides, wrists straight. Target muscles glowing soft mint green (#4CC38A), lit from within the muscle surface with clean edges: triceps (back of both upper arms). Every other muscle stays matte graphite grey. Equipment: a cable machine with a high pulley and a rope attachment on a taut cable, realistically proportioned, in dark charcoal and brushed steel, clearly readable against the background, never mint. Side three-quarter view from slightly behind the figure at chest height, so the back of the arms is visible, full body and all equipment in frame, figure centered with margin around it. Seamless dark studio background (#0E1116), hard rim light from the left, soft fill light, soft floor shadow, clean minimal high-contrast look, square 1:1 image. Correct anatomy: two arms, two legs, five fingers on each hand. No text, numbers or logos, no halo or neon outline, no gym clutter, no other people. Keep the exact same mannequin, camera angle, framing and lighting as the start image earlier in this chat; only the pose changes.
```

**Revisa especialmente**

- Brazos quietos y pegados al cuerpo: solo se mueven los antebrazos.
- Cable tenso y conectado desde la polea alta hasta la cuerda, sin cables sueltos ni que atraviesen el cuerpo.
- En el final codos extendidos y extremos de la cuerda algo separados delante de los muslos.

---

## 11. Sentadilla goblet

- **Slug:** `sentadilla-goblet`
- **Archivos:** `ex_sentadilla-goblet_start_v1.png` · `ex_sentadilla-goblet_end_v1.png`
- **Iluminar en menta:** cuádriceps, glúteos
- **Secundarios (quedan en gris):** aductores, abdominales

### Inicio

```text
3D render for a fitness app exercise illustration: a stylized faceless mannequin (smooth featureless head, no hair), gender-neutral athletic build, matte graphite grey surface with softly sculpted muscles, performing a dumbbell goblet squat, shown in the start position. Standing tall with feet shoulder width apart, toes turned out about 20 degrees. One dumbbell held vertically against the chest, both hands cupping the underside of its top end, elbows pointing down, torso upright, hips and knees extended. Target muscles glowing soft mint green (#4CC38A), lit from within the muscle surface with clean edges: quadriceps (front of both thighs) and glutes (gluteus maximus). Every other muscle stays matte graphite grey. Equipment: one hexagonal dumbbell, realistically proportioned, in dark charcoal and brushed steel, clearly readable against the background, never mint. Front three-quarter side view at hip height, full body and all equipment in frame, figure centered with margin around it. Seamless dark studio background (#0E1116), hard rim light from the left, soft fill light, soft floor shadow, clean minimal high-contrast look, square 1:1 image. Correct anatomy: two arms, two legs, five fingers on each hand. No text, numbers or logos, no halo or neon outline, no gym clutter, no other people.
```

### Final

```text
3D render for a fitness app exercise illustration: a stylized faceless mannequin (smooth featureless head, no hair), gender-neutral athletic build, matte graphite grey surface with softly sculpted muscles, performing a dumbbell goblet squat, shown in the end position. Bottom of the squat: hips sat down and back until the thighs are at or just below parallel to the floor, knees pushed out in line with the toes, heels flat on the floor, torso fairly upright with a neutral spine. The dumbbell is still held vertically against the chest, elbows pointing down just inside the knees. Target muscles glowing soft mint green (#4CC38A), lit from within the muscle surface with clean edges: quadriceps (front of both thighs) and glutes (gluteus maximus). Every other muscle stays matte graphite grey. Equipment: one hexagonal dumbbell, realistically proportioned, in dark charcoal and brushed steel, clearly readable against the background, never mint. Front three-quarter side view at hip height, full body and all equipment in frame, figure centered with margin around it. Seamless dark studio background (#0E1116), hard rim light from the left, soft fill light, soft floor shadow, clean minimal high-contrast look, square 1:1 image. Correct anatomy: two arms, two legs, five fingers on each hand. No text, numbers or logos, no halo or neon outline, no gym clutter, no other people. Keep the exact same mannequin, camera angle, framing and lighting as the start image earlier in this chat; only the pose changes.
```

**Revisa especialmente**

- Talones apoyados y rodillas en la dirección de las puntas de los pies, sin cerrarse hacia dentro.
- Muslos al menos paralelos al suelo en el final, espalda neutra y torso bastante erguido.
- Mancuerna vertical pegada al pecho, sujeta por el disco superior, no colgando con los brazos estirados.

---

## 12. Prensa de piernas

- **Slug:** `prensa-piernas`
- **Archivos:** `ex_prensa-piernas_start_v1.png` · `ex_prensa-piernas_end_v1.png`
- **Iluminar en menta:** cuádriceps, glúteos
- **Secundarios (quedan en gris):** aductores, isquiotibiales

### Inicio

```text
3D render for a fitness app exercise illustration: a stylized faceless mannequin (smooth featureless head, no hair), gender-neutral athletic build, matte graphite grey surface with softly sculpted muscles, performing a 45-degree leg press, shown in the start position. Seated in the leg press with the back and hips pressed flat against the reclined seat pad, hands on the side handles. Feet flat on the middle of the footplate, between hip and shoulder width apart, toes slightly out. Legs extended pushing the sled up, knees almost straight but not locked. Target muscles glowing soft mint green (#4CC38A), lit from within the muscle surface with clean edges: quadriceps (front of both thighs) and glutes (gluteus maximus). Every other muscle stays matte graphite grey. Equipment: a plate-loaded 45-degree leg press machine with a reclined padded seat, side handles and a sled footplate on diagonal rails, realistically proportioned, in dark charcoal and brushed steel, clearly readable against the background, never mint. Side three-quarter view from slightly above, showing the whole machine, full body and all equipment in frame, figure centered with margin around it. Seamless dark studio background (#0E1116), hard rim light from the left, soft fill light, soft floor shadow, clean minimal high-contrast look, square 1:1 image. Correct anatomy: two arms, two legs, five fingers on each hand. No text, numbers or logos, no halo or neon outline, no gym clutter, no other people.
```

### Final

```text
3D render for a fitness app exercise illustration: a stylized faceless mannequin (smooth featureless head, no hair), gender-neutral athletic build, matte graphite grey surface with softly sculpted muscles, performing a 45-degree leg press, shown in the end position. Seated with the back and hips still pressed flat against the reclined seat pad, hands on the side handles. The sled is lowered until the knees are bent about 90 degrees, thighs coming toward the chest, knees in line with the toes, feet fully flat on the footplate, lower back not rounding off the pad. Target muscles glowing soft mint green (#4CC38A), lit from within the muscle surface with clean edges: quadriceps (front of both thighs) and glutes (gluteus maximus). Every other muscle stays matte graphite grey. Equipment: a plate-loaded 45-degree leg press machine with a reclined padded seat, side handles and a sled footplate on diagonal rails, realistically proportioned, in dark charcoal and brushed steel, clearly readable against the background, never mint. Side three-quarter view from slightly above, showing the whole machine, full body and all equipment in frame, figure centered with margin around it. Seamless dark studio background (#0E1116), hard rim light from the left, soft fill light, soft floor shadow, clean minimal high-contrast look, square 1:1 image. Correct anatomy: two arms, two legs, five fingers on each hand. No text, numbers or logos, no halo or neon outline, no gym clutter, no other people. Keep the exact same mannequin, camera angle, framing and lighting as the start image earlier in this chat; only the pose changes.
```

**Revisa especialmente**

- Arriba rodillas casi rectas pero sin bloquear; abajo zona lumbar y cadera siguen pegadas al respaldo.
- Plataforma sobre carriles a 45° y pies enteros sobre ella, con los talones apoyados.
- Rodillas alineadas con los pies, sin cerrarse hacia dentro.

---

## 13. Peso muerto rumano con barra

- **Slug:** `peso-muerto-rumano`
- **Archivos:** `ex_peso-muerto-rumano_start_v1.png` · `ex_peso-muerto-rumano_end_v1.png`
- **Iluminar en menta:** isquiotibiales, glúteos
- **Secundarios (quedan en gris):** zona lumbar

### Inicio

```text
3D render for a fitness app exercise illustration: a stylized faceless mannequin (smooth featureless head, no hair), gender-neutral athletic build, matte graphite grey surface with softly sculpted muscles, performing a barbell Romanian deadlift, shown in the start position. Standing tall with feet hip width apart, knees slightly bent about 15 degrees, chest up and shoulders back, neutral spine. Overhand grip at shoulder width, arms straight, the bar resting against the front of the thighs at hip level. Target muscles glowing soft mint green (#4CC38A), lit from within the muscle surface with clean edges: hamstrings (back of both thighs) and glutes (gluteus maximus). Every other muscle stays matte graphite grey. Equipment: an Olympic barbell loaded with plates, realistically proportioned, in dark charcoal and brushed steel, clearly readable against the background, never mint. Side three-quarter view at hip height, close to a side profile so the hip hinge is clear, full body and all equipment in frame, figure centered with margin around it. Seamless dark studio background (#0E1116), hard rim light from the left, soft fill light, soft floor shadow, clean minimal high-contrast look, square 1:1 image. Correct anatomy: two arms, two legs, five fingers on each hand. No text, numbers or logos, no halo or neon outline, no gym clutter, no other people.
```

### Final

```text
3D render for a fitness app exercise illustration: a stylized faceless mannequin (smooth featureless head, no hair), gender-neutral athletic build, matte graphite grey surface with softly sculpted muscles, performing a barbell Romanian deadlift, shown in the end position. Hips pushed far back with the knees still only slightly bent and the shins nearly vertical, torso hinged forward to about 60 degrees from vertical with a flat neutral back and the neck in line with the spine. Arms hanging straight down, overhand grip at shoulder width, the bar just below the knees and touching or almost touching the legs, weight over the mid-foot. Target muscles glowing soft mint green (#4CC38A), lit from within the muscle surface with clean edges: hamstrings (back of both thighs) and glutes (gluteus maximus). Every other muscle stays matte graphite grey. Equipment: an Olympic barbell loaded with plates, realistically proportioned, in dark charcoal and brushed steel, clearly readable against the background, never mint. Side three-quarter view at hip height, close to a side profile so the hip hinge is clear, full body and all equipment in frame, figure centered with margin around it. Seamless dark studio background (#0E1116), hard rim light from the left, soft fill light, soft floor shadow, clean minimal high-contrast look, square 1:1 image. Correct anatomy: two arms, two legs, five fingers on each hand. No text, numbers or logos, no halo or neon outline, no gym clutter, no other people. Keep the exact same mannequin, camera angle, framing and lighting as the start image earlier in this chat; only the pose changes.
```

**Revisa especialmente**

- Espalda plana y cuello alineado con la columna. Si se redondea, regenera.
- Rodillas apenas flexionadas y espinillas casi verticales: si la cadera baja y las rodillas avanzan, es un peso muerto convencional o una sentadilla.
- Barra pegada a las piernas y brazos verticales; abajo queda justo bajo las rodillas, sin tocar el suelo.

---

## 14. Zancadas con mancuernas

- **Slug:** `zancadas`
- **Archivos:** `ex_zancadas_start_v1.png` · `ex_zancadas_end_v1.png`
- **Iluminar en menta:** cuádriceps, glúteos
- **Secundarios (quedan en gris):** aductores, isquiotibiales

### Inicio

```text
3D render for a fitness app exercise illustration: a stylized faceless mannequin (smooth featureless head, no hair), gender-neutral athletic build, matte graphite grey surface with softly sculpted muscles, performing a forward dumbbell lunge, shown in the start position. Standing tall with feet hip width apart, torso upright, arms hanging straight at the sides with one dumbbell in each hand, palms facing the body. Target muscles glowing soft mint green (#4CC38A), lit from within the muscle surface with clean edges: quadriceps (front of both thighs) and glutes (gluteus maximus). Every other muscle stays matte graphite grey. Equipment: two hexagonal dumbbells, realistically proportioned, in dark charcoal and brushed steel, clearly readable against the background, never mint. Side three-quarter view at hip height, full body and all equipment in frame, figure centered with margin around it. Seamless dark studio background (#0E1116), hard rim light from the left, soft fill light, soft floor shadow, clean minimal high-contrast look, square 1:1 image. Correct anatomy: two arms, two legs, five fingers on each hand. No text, numbers or logos, no halo or neon outline, no gym clutter, no other people.
```

### Final

```text
3D render for a fitness app exercise illustration: a stylized faceless mannequin (smooth featureless head, no hair), gender-neutral athletic build, matte graphite grey surface with softly sculpted muscles, performing a forward dumbbell lunge, shown in the end position. Bottom of the lunge after a long step forward with the right leg: both knees bent about 90 degrees, front thigh parallel to the floor, front knee over the middle of the foot with the front heel flat, back knee hovering just above the floor with the back heel raised onto the ball of the foot. Feet stay hip width apart side to side, torso upright, dumbbells hanging straight at the sides, palms facing the body. Target muscles glowing soft mint green (#4CC38A), lit from within the muscle surface with clean edges: quadriceps (front of both thighs) and glutes (gluteus maximus). Every other muscle stays matte graphite grey. Equipment: two hexagonal dumbbells, realistically proportioned, in dark charcoal and brushed steel, clearly readable against the background, never mint. Side three-quarter view at hip height, full body and all equipment in frame, figure centered with margin around it. Seamless dark studio background (#0E1116), hard rim light from the left, soft fill light, soft floor shadow, clean minimal high-contrast look, square 1:1 image. Correct anatomy: two arms, two legs, five fingers on each hand. No text, numbers or logos, no halo or neon outline, no gym clutter, no other people. Keep the exact same mannequin, camera angle, framing and lighting as the start image earlier in this chat; only the pose changes.
```

**Revisa especialmente**

- Rodilla trasera cerca del suelo pero sin apoyarla, con el talón trasero levantado.
- Rodilla delantera sobre el pie (no muy por delante de la punta) y talón delantero apoyado.
- Torso vertical y pies separados a lo ancho de cadera, no en línea como sobre una cuerda floja.

---

## 15. Hip thrust con barra

- **Slug:** `hip-thrust`
- **Archivos:** `ex_hip-thrust_start_v1.png` · `ex_hip-thrust_end_v1.png`
- **Iluminar en menta:** glúteos
- **Secundarios (quedan en gris):** isquiotibiales

### Inicio

```text
3D render for a fitness app exercise illustration: a stylized faceless mannequin (smooth featureless head, no hair), gender-neutral athletic build, matte graphite grey surface with softly sculpted muscles, performing a barbell hip thrust, shown in the start position. Seated on the floor with the upper back, just below the shoulder blades, resting against the long edge of the flat bench. Knees bent, feet flat on the floor about shoulder width apart. The padded barbell rests across the hip crease with both hands holding the bar just outside the hips. Hips lowered close to the floor, chin tucked. Target muscles glowing soft mint green (#4CC38A), lit from within the muscle surface with clean edges: glutes (gluteus maximus). Every other muscle stays matte graphite grey. Equipment: a flat bench placed sideways behind the figure and an Olympic barbell loaded with plates, with a thick foam pad around the bar, realistically proportioned, in dark charcoal and brushed steel, clearly readable against the background, never mint. Side three-quarter front view with the camera low, at bench height, full body and all equipment in frame, figure centered with margin around it. Seamless dark studio background (#0E1116), hard rim light from the left, soft fill light, soft floor shadow, clean minimal high-contrast look, square 1:1 image. Correct anatomy: two arms, two legs, five fingers on each hand. No text, numbers or logos, no halo or neon outline, no gym clutter, no other people.
```

### Final

```text
3D render for a fitness app exercise illustration: a stylized faceless mannequin (smooth featureless head, no hair), gender-neutral athletic build, matte graphite grey surface with softly sculpted muscles, performing a barbell hip thrust, shown in the end position. Upper back pivoting on the bench edge just below the shoulder blades, hips driven up until shoulders, hips and knees form a straight line parallel to the floor. Shins vertical with the knees bent about 90 degrees, feet flat, the padded barbell still across the hip crease held by both hands, ribs down and chin tucked, no overarching of the lower back. Target muscles glowing soft mint green (#4CC38A), lit from within the muscle surface with clean edges: glutes (gluteus maximus). Every other muscle stays matte graphite grey. Equipment: a flat bench placed sideways behind the figure and an Olympic barbell loaded with plates, with a thick foam pad around the bar, realistically proportioned, in dark charcoal and brushed steel, clearly readable against the background, never mint. Side three-quarter front view with the camera low, at bench height, full body and all equipment in frame, figure centered with margin around it. Seamless dark studio background (#0E1116), hard rim light from the left, soft fill light, soft floor shadow, clean minimal high-contrast look, square 1:1 image. Correct anatomy: two arms, two legs, five fingers on each hand. No text, numbers or logos, no halo or neon outline, no gym clutter, no other people. Keep the exact same mannequin, camera angle, framing and lighting as the start image earlier in this chat; only the pose changes.
```

**Revisa especialmente**

- Arriba espinillas verticales y rodillas a 90°, con tronco y muslos en línea paralela al suelo.
- Sin hiperextensión lumbar: costillas abajo y barbilla recogida, no la cabeza echada hacia atrás.
- Banco bajo los omóplatos (no en la nuca ni en la zona lumbar) y barra con almohadilla sobre la cadera.

---

## 16. Curl femoral sentado en máquina

- **Slug:** `curl-femoral-sentado`
- **Archivos:** `ex_curl-femoral-sentado_start_v1.png` · `ex_curl-femoral-sentado_end_v1.png`
- **Iluminar en menta:** isquiotibiales

### Inicio

```text
3D render for a fitness app exercise illustration: a stylized faceless mannequin (smooth featureless head, no hair), gender-neutral athletic build, matte graphite grey surface with softly sculpted muscles, performing a seated machine leg curl, shown in the start position. Seated with the back against the backrest, knees lined up with the machine's pivot axis, thighs held down by the padded bar just above the knees. Legs extended straight out in front, the ankle roller resting against the back of the lower legs just above the heels, hands on the side handles. Target muscles glowing soft mint green (#4CC38A), lit from within the muscle surface with clean edges: hamstrings (back of both thighs). Every other muscle stays matte graphite grey. Equipment: a seated leg curl machine with a backrest, a padded thigh hold-down bar, a padded ankle roller and side handles, realistically proportioned, in dark charcoal and brushed steel, clearly readable against the background, never mint. Side three-quarter view at seat height, with both legs fully visible, full body and all equipment in frame, figure centered with margin around it. Seamless dark studio background (#0E1116), hard rim light from the left, soft fill light, soft floor shadow, clean minimal high-contrast look, square 1:1 image. Correct anatomy: two arms, two legs, five fingers on each hand. No text, numbers or logos, no halo or neon outline, no gym clutter, no other people.
```

### Final

```text
3D render for a fitness app exercise illustration: a stylized faceless mannequin (smooth featureless head, no hair), gender-neutral athletic build, matte graphite grey surface with softly sculpted muscles, performing a seated machine leg curl, shown in the end position. Seated with the back against the backrest, hips on the seat and thighs still held down by the padded bar. Knees bent to about 90 degrees or more, the lower legs pulling the ankle roller down and back beneath the seat, feet relaxed, hands on the side handles. Target muscles glowing soft mint green (#4CC38A), lit from within the muscle surface with clean edges: hamstrings (back of both thighs). Every other muscle stays matte graphite grey. Equipment: a seated leg curl machine with a backrest, a padded thigh hold-down bar, a padded ankle roller and side handles, realistically proportioned, in dark charcoal and brushed steel, clearly readable against the background, never mint. Side three-quarter view at seat height, with both legs fully visible, full body and all equipment in frame, figure centered with margin around it. Seamless dark studio background (#0E1116), hard rim light from the left, soft fill light, soft floor shadow, clean minimal high-contrast look, square 1:1 image. Correct anatomy: two arms, two legs, five fingers on each hand. No text, numbers or logos, no halo or neon outline, no gym clutter, no other people. Keep the exact same mannequin, camera angle, framing and lighting as the start image earlier in this chat; only the pose changes.
```

**Revisa especialmente**

- Rodillas alineadas con el eje de la máquina y almohadilla sujetando los muslos justo por encima de las rodillas.
- El rodillo va por detrás de las piernas, sobre los talones (tendón de Aquiles); si va delante de las espinillas es una extensión de cuádriceps.
- Cadera pegada al asiento en el final.

---

## 17. Elevación de gemelos de pie en máquina

- **Slug:** `elevacion-gemelos`
- **Archivos:** `ex_elevacion-gemelos_start_v1.png` · `ex_elevacion-gemelos_end_v1.png`
- **Iluminar en menta:** gemelos (gastrocnemio y sóleo)

### Inicio

```text
3D render for a fitness app exercise illustration: a stylized faceless mannequin (smooth featureless head, no hair), gender-neutral athletic build, matte graphite grey surface with softly sculpted muscles, performing a standing machine calf raise, shown in the start position. Standing upright under the machine with the padded yokes on top of the shoulders, hands on the handles, torso vertical, knees straight but not locked. Only the balls of the feet are on the edge of the foot block, feet hip width apart with toes pointing forward, heels lowered below the block for a full stretch. Target muscles glowing soft mint green (#4CC38A), lit from within the muscle surface with clean edges: calves (gastrocnemius and soleus, the back of both lower legs). Every other muscle stays matte graphite grey. Equipment: a standing calf raise machine with padded shoulder yokes, a weight stack and a raised foot block, realistically proportioned, in dark charcoal and brushed steel, clearly readable against the background, never mint. Rear three-quarter side view at hip height, so the calves are clearly visible, full body and all equipment in frame, figure centered with margin around it. Seamless dark studio background (#0E1116), hard rim light from the left, soft fill light, soft floor shadow, clean minimal high-contrast look, square 1:1 image. Correct anatomy: two arms, two legs, five fingers on each hand. No text, numbers or logos, no halo or neon outline, no gym clutter, no other people.
```

### Final

```text
3D render for a fitness app exercise illustration: a stylized faceless mannequin (smooth featureless head, no hair), gender-neutral athletic build, matte graphite grey surface with softly sculpted muscles, performing a standing machine calf raise, shown in the end position. Standing upright under the padded shoulder yokes, hands on the handles, knees straight but not locked. Heels raised as high as possible, balancing on the balls of the feet on the edge of the foot block, ankles fully extended, body and yokes lifted vertically. Target muscles glowing soft mint green (#4CC38A), lit from within the muscle surface with clean edges: calves (gastrocnemius and soleus, the back of both lower legs). Every other muscle stays matte graphite grey. Equipment: a standing calf raise machine with padded shoulder yokes, a weight stack and a raised foot block, realistically proportioned, in dark charcoal and brushed steel, clearly readable against the background, never mint. Rear three-quarter side view at hip height, so the calves are clearly visible, full body and all equipment in frame, figure centered with margin around it. Seamless dark studio background (#0E1116), hard rim light from the left, soft fill light, soft floor shadow, clean minimal high-contrast look, square 1:1 image. Correct anatomy: two arms, two legs, five fingers on each hand. No text, numbers or logos, no halo or neon outline, no gym clutter, no other people. Keep the exact same mannequin, camera angle, framing and lighting as the start image earlier in this chat; only the pose changes.
```

**Revisa especialmente**

- Solo la parte delantera del pie sobre el bloque; al inicio los talones quedan por debajo del borde.
- Rodillas extendidas y quietas en las dos imágenes: el movimiento es solo del tobillo.
- Almohadillas sobre los hombros (no en el cuello) y cuerpo vertical.

---

## 18. Plancha

- **Slug:** `plancha`
- **Archivos:** `ex_plancha_start_v1.png` · final: no aplica (posición isométrica, una sola imagen)
- **Iluminar en menta:** abdominales

### Prompt único (inicio)

```text
3D render for a fitness app exercise illustration: a stylized faceless mannequin (smooth featureless head, no hair), gender-neutral athletic build, matte graphite grey surface with softly sculpted muscles, performing a forearm plank hold, shown in the held position. Forearm plank on the floor: forearms flat and parallel, elbows directly under the shoulders, hands relaxed in front. Body in one straight line from head to heels, weight on the forearms and toes, feet hip width apart, glutes squeezed and pelvis slightly tucked, neck neutral with the gaze on the floor just ahead of the hands. Target muscles glowing soft mint green (#4CC38A), lit from within the muscle surface with clean edges: abdominals (rectus abdominis, the front of the belly). Every other muscle stays matte graphite grey. No equipment: the figure is on the bare studio floor. Front three-quarter side view with the camera low, near floor level, full body in frame, figure centered with margin around it. Seamless dark studio background (#0E1116), hard rim light from the left, soft fill light, soft floor shadow, clean minimal high-contrast look, square 1:1 image. Correct anatomy: two arms, two legs, five fingers on each hand. No text, numbers or logos, no halo or neon outline, no gym clutter, no other people.
```

### Final

No aplica.

**Revisa especialmente**

- Codos justo debajo de los hombros, no adelantados.
- Cadera en línea con hombros y talones: ni hundida ni elevada.
- Cuello neutro, sin levantar la cabeza para mirar al frente.

---

## 19. Crunch en polea alta de rodillas

- **Slug:** `crunch-polea`
- **Archivos:** `ex_crunch-polea_start_v1.png` · `ex_crunch-polea_end_v1.png`
- **Iluminar en menta:** abdominales
- **Secundarios (quedan en gris):** oblicuos

### Inicio

```text
3D render for a fitness app exercise illustration: a stylized faceless mannequin (smooth featureless head, no hair), gender-neutral athletic build, matte graphite grey surface with softly sculpted muscles, performing a kneeling cable crunch with a rope attachment, shown in the start position. Kneeling on the floor facing the high pulley about an arm's length away, knees hip width apart, thighs vertical with the hips stacked above the knees. Holding the rope with both hands, rope ends beside the head at forehead level, elbows bent and pointing forward, torso tall and slightly forward with a long spine, cable taut. Target muscles glowing soft mint green (#4CC38A), lit from within the muscle surface with clean edges: abdominals (rectus abdominis, the front of the belly). Every other muscle stays matte graphite grey. Equipment: a cable machine with a high pulley and a rope attachment on a taut cable, realistically proportioned, in dark charcoal and brushed steel, clearly readable against the background, never mint. Side three-quarter front view at hip height of the kneeling figure, full body and all equipment in frame, figure centered with margin around it. Seamless dark studio background (#0E1116), hard rim light from the left, soft fill light, soft floor shadow, clean minimal high-contrast look, square 1:1 image. Correct anatomy: two arms, two legs, five fingers on each hand. No text, numbers or logos, no halo or neon outline, no gym clutter, no other people.
```

### Final

```text
3D render for a fitness app exercise illustration: a stylized faceless mannequin (smooth featureless head, no hair), gender-neutral athletic build, matte graphite grey surface with softly sculpted muscles, performing a kneeling cable crunch with a rope attachment, shown in the end position. Kneeling facing the high pulley, thighs still nearly vertical with the hips staying high above the knees. The spine is curled forward, rib cage pulled toward the pelvis, head tucked, elbows driven down toward the middle of the thighs, hands and rope ends still fixed beside the head, cable taut. Target muscles glowing soft mint green (#4CC38A), lit from within the muscle surface with clean edges: abdominals (rectus abdominis, the front of the belly). Every other muscle stays matte graphite grey. Equipment: a cable machine with a high pulley and a rope attachment on a taut cable, realistically proportioned, in dark charcoal and brushed steel, clearly readable against the background, never mint. Side three-quarter front view at hip height of the kneeling figure, full body and all equipment in frame, figure centered with margin around it. Seamless dark studio background (#0E1116), hard rim light from the left, soft fill light, soft floor shadow, clean minimal high-contrast look, square 1:1 image. Correct anatomy: two arms, two legs, five fingers on each hand. No text, numbers or logos, no halo or neon outline, no gym clutter, no other people. Keep the exact same mannequin, camera angle, framing and lighting as the start image earlier in this chat; only the pose changes.
```

**Revisa especialmente**

- La flexión sale de la columna (aquí la espalda redondeada es correcta); la cadera no se sienta sobre los talones.
- Manos fijas junto a la cabeza en las dos imágenes: no se tira con los brazos.
- Figura de rodillas, no de pie, y cable tenso desde la polea alta.

---

## 20. Paseo del granjero

- **Slug:** `paseo-granjero`
- **Archivos:** `ex_paseo-granjero_start_v1.png` · `ex_paseo-granjero_end_v1.png`
- **Iluminar en menta:** antebrazos, trapecio, abdominales
- **Secundarios (quedan en gris):** glúteos, cuádriceps

### Inicio

```text
3D render for a fitness app exercise illustration: a stylized faceless mannequin (smooth featureless head, no hair), gender-neutral athletic build, matte graphite grey surface with softly sculpted muscles, performing a farmer's walk, shown in the start position. Standing tall and still, feet hip width apart, one heavy dumbbell in each hand hanging at the sides with a neutral grip (palms facing the body), arms straight, shoulders level and set back, chest up, spine neutral, gaze forward. Target muscles glowing soft mint green (#4CC38A), lit from within the muscle surface with clean edges: forearm muscles, upper trapezius (between the neck and the shoulders) and abdominals. Every other muscle stays matte graphite grey. Equipment: two heavy hexagonal dumbbells, realistically proportioned, in dark charcoal and brushed steel, clearly readable against the background, never mint. Front three-quarter side view at hip height, full body and all equipment in frame, figure centered with margin around it. Seamless dark studio background (#0E1116), hard rim light from the left, soft fill light, soft floor shadow, clean minimal high-contrast look, square 1:1 image. Correct anatomy: two arms, two legs, five fingers on each hand. No text, numbers or logos, no halo or neon outline, no gym clutter, no other people.
```

### Final

```text
3D render for a fitness app exercise illustration: a stylized faceless mannequin (smooth featureless head, no hair), gender-neutral athletic build, matte graphite grey surface with softly sculpted muscles, performing a farmer's walk, shown in the end position. Walking forward mid-stride with a short controlled step: left foot in front landing heel first, right foot behind pushing off the ball of the foot. Torso tall and upright without leaning to either side, shoulders level and set back, arms straight with the heavy dumbbells hanging still beside the thighs, neutral grip, gaze forward. Target muscles glowing soft mint green (#4CC38A), lit from within the muscle surface with clean edges: forearm muscles, upper trapezius (between the neck and the shoulders) and abdominals. Every other muscle stays matte graphite grey. Equipment: two heavy hexagonal dumbbells, realistically proportioned, in dark charcoal and brushed steel, clearly readable against the background, never mint. Front three-quarter side view at hip height, full body and all equipment in frame, figure centered with margin around it. Seamless dark studio background (#0E1116), hard rim light from the left, soft fill light, soft floor shadow, clean minimal high-contrast look, square 1:1 image. Correct anatomy: two arms, two legs, five fingers on each hand. No text, numbers or logos, no halo or neon outline, no gym clutter, no other people. Keep the exact same mannequin, camera angle, framing and lighting as the start image earlier in this chat; only the pose changes.
```

**Revisa especialmente**

- Torso vertical y hombros nivelados, sin inclinarse hacia un lado ni hacia delante.
- Brazos rectos con las mancuernas quietas junto a los muslos, sin balanceo.
- Paso corto en el final: el pie delantero apoya el talón y el trasero despega con la punta, sin zancada larga.
