# PathUp · Documento de producto

> **Tu camino, hacia arriba.**
> La app gratuita en español que junta el registro de entreno de Hevy, los programas guiados de las apps de influencers y un check-in de bienestar que adapta tu día.

Estado: borrador v1 · 2026-09-14

## 1. Por qué existe

Hoy una persona que quiere ponerse en forma necesita tres o cuatro apps:

| Necesidad | App típica | Problema |
|---|---|---|
| Apuntar el entreno | Hevy, Strong | Excelentes, pero en inglés primero y con funciones bloqueadas tras pago |
| Saber qué entrenar | Apps de influencers (Jeff Nippard, Built With Science, Sweat, Centr) | De pago, rígidas y atadas a una sola persona |
| Comer bien | MyFitnessPal, Yazio | Anuncios y obsesión por la caloría |
| Dormir y gestionar el estrés | Headspace, Oura, Bearable | Otra app más, que no habla con tu entreno |

PathUp no inventa nada: **copia lo que ya funciona en cada una y lo junta en una sola app, gratis, en español y sin anuncios.**

## 2. Para quién

Cualquier persona **de 16 años o más**, de cualquier nivel.

| Persona | Situación | Lo que necesita de PathUp |
|---|---|---|
| **Lucía, 19** | Primer mes en el gimnasio, no sabe qué hacer | Programa guiado, modo principiante, técnica con imagen |
| **Marcos, 32** | Tres años entrenando, usa Hevy o Excel | Registro rápido, récords, gráficas sin pagar |
| **Carmen, 52** | Quiere estar en forma y dormir mejor | Letra grande, rutinas suaves o en casa, check-in y hábitos |
| **Álex, 17** | Quiere ganar músculo | Lo mismo que Marcos, con salvaguardas de edad |

## 3. Principios (deciden los empates)

1. **Registrar una serie en dos toques como máximo.**
2. **Explicado para el principiante, invisible para el experto.** Todo lo técnico va detrás del modo principiante.
3. **Gratis de verdad.** Nada bloqueado tras pago.
4. **Los datos de salud son sensibles.** Privado por defecto, en la UE, borrables en un toque.
5. **Accesible.** WCAG 2.2 AA, texto que respeta el tamaño del sistema, objetivos táctiles de 44 px o más.

## 4. Copiar y mejorar, módulo a módulo

### 4.1 Entreno

**Copiamos de Hevy y Strong**
- Entreno vacío o desde una rutina; añadir ejercicios; series de peso × repeticiones.
- Tipos de serie: calentamiento, normal, drop set, al fallo. Superseries. Notas por ejercicio.
- **Valores de la sesión anterior** en gris dentro de cada serie.
- Temporizador de descanso automático por ejercicio, con aviso.
- Rutinas en carpetas: duplicar, reordenar y editar.
- Historial, calendario, récords (peso máximo, 1RM estimado, repeticiones, volumen) y gráfica por ejercicio.
- Medidas corporales y fotos de progreso privadas.
- Calculadora de discos y ejercicios personalizados.

**Mejoramos**
- **Sugerencia del peso para la siguiente sesión** (doble progresión con RIR opcional), explicada en una frase.
- **Modo principiante**: qué es una serie, qué es el RIR, cuánto descansar y la técnica siempre visible.
- **Cambiar un ejercicio por otro** según el material disponible, en un toque.
- Sin límite de rutinas y sin gráficas bloqueadas.

### 4.2 Programas guiados

**Copiamos de las apps de influencers**
- Programas de N semanas con fases y semana de descarga.
- Ficha de ejercicio con imagen, claves de técnica y músculos trabajados.
- Objetivo de repeticiones y RIR por serie.
- Catálogo filtrable por objetivo, nivel, días y lugar.

**Mejoramos**
- **Gratis** y sin depender de ningún influencer.
- **Recomendado por un cuestionario** (días, material, nivel, objetivo, minutos por sesión).
- **"Por qué funciona"**: cada programa explica su lógica con referencias científicas.
- **Si faltas un día, el programa se reajusta** en vez de perder la semana.

**Programas del MVP (propios)**

| Programa | Días | Nivel | Lugar | Semanas |
|---|---|---|---|---|
| Primeros pasos · cuerpo completo | 3 | Principiante | Gimnasio | 8 |
| Torso / Pierna | 4 | Intermedio | Gimnasio | 8 |
| En casa con mancuernas | 3 | Principiante-intermedio | Casa | 6 |
| Empezar suave | 2 × 40 min | Sedentario o +50 | Gimnasio o casa | 6 |

### 4.3 Bienestar

**Copiamos de Oura y Whoop (preparación), Bearable (check-in), Headspace (respiración) y Streaks (hábitos)**
- **Check-in de 20 segundos**: horas y calidad de sueño, energía, estrés, ánimo y agujetas, en escalas de 1 a 5.
- Puntuación diaria de preparación (0-100).
- Respiración guiada: caja 4-4-4-4 y 4-7-8.
- Hábitos con rachas, pasos (podómetro) y agua.

**Mejoramos**
- **La puntuación ajusta la sesión de hoy.** Si has dormido mal, propone mantener pesos o quitar una serie. Esto solo lo hacen apps de pago con pulsera; aquí basta con el check-in.
- **Tendencias cruzadas**: "las semanas que duermes menos de 6 h rindes un 8 % menos en press".
- **Sin culpa**: los días de descanso planificados no rompen la racha.

### 4.4 Nutrición (fase 5)

**Copiamos de MyFitnessPal, Yazio y MacroFactor**
- Objetivo de calorías y macros calculado.
- Búsqueda de alimentos y escáner de código de barras (Open Food Facts).
- Comidas del día, recientes, favoritos y comidas guardadas.
- Agua y peso corporal con línea de tendencia.

**Mejoramos**
- Sin anuncios.
- **Modo "solo proteína"** para quien no quiere contar calorías.
- **Ajuste semanal del objetivo** según la tendencia real de peso (la idea de MacroFactor, simplificada).
- Mínimos seguros y salvaguardas de edad (ver sección 6).

### 4.5 Social (fase 6)

**Copiamos de Hevy y Strava**
- Perfil, seguir a otras personas, feed de entrenos, "me gusta" y comentarios.
- **Tarjeta compartible** de entreno o récord, lista para Instagram.
- Buscar usuarios.

**Mejoramos**
- **Privado por defecto**: los datos de salud (check-in, peso, fotos) nunca aparecen en el feed.
- **Retos semanales entre amigos** (sesiones, volumen, pasos).
- Reportar y bloquear desde el primer día (lo exigen las tiendas de apps).

## 5. Fuera de alcance (contrato)

No entra nada de esto hasta que el MVP esté publicado y enseñándose en entrevistas:

- IA generativa dentro de la app (coach por chat, fotos de comida).
- Pagos o suscripciones.
- Chat privado entre usuarios.
- Relojes y pulseras (Apple Watch, Garmin, Health Connect).
- Menús o planes de dieta cerrados.
- Vídeos largos de clases.

## 6. Salud, edad y seguridad

- **Edad mínima: 16 años**, comprobada con la fecha de nacimiento al registrarse.
- **Usuarios de 16 y 17 años**: no pueden fijar objetivos con déficit calórico, su perfil es privado siempre y no ven fotos de progreso ajenas.
- **Para todos**:
  - Mínimo calórico seguro y aviso si la pérdida de peso supera el 1 % semanal.
  - Lenguaje sin culpa.
  - Enlace a recursos de ayuda sobre trastornos de la conducta alimentaria (a definir en la fase 5).
- **Cuestionario de aptitud física** en el onboarding, basado en el PAR-Q+. Si hay alguna respuesta de riesgo, recomienda consultar con un médico antes de empezar.
- **Aviso claro**: PathUp no sustituye el consejo médico.

## 7. Cómo sabremos que funciona

| Métrica | Objetivo MVP |
|---|---|
| Probadores reales | 10 personas usándolo 2 semanas |
| Tiempo en registrar una serie | ≤ 3 s |
| Sesiones perdidas por falta de red | 0 |
| Accesibilidad | Sin errores AA en las pantallas principales |
| Tests | CI en verde; lógica de progresión y preparación con cobertura ≥ 90 % |
