# PathUp · Hoja de ruta

Ritmo: **5-8 h por semana**. Objetivo: **MVP para enseñar en entrevistas el 2 de noviembre de 2026**. Después, nutrición y social mientras envías candidaturas: así el repositorio muestra actividad constante.

Reparto: **tú** te encargas de las cuentas, las pruebas en el móvil, la generación de imágenes y las decisiones; **Claude** del código, los tests, las migraciones y la documentación.

## Resumen

| Semana | Fechas | Fase | Resultado |
|---|---|---|---|
| 1 | 14-20 sep | **0 · Cimientos** | La app abre en Android y en Safari con tema oscuro, 5 pestañas y CI en verde |
| 2 | 21-27 sep | **1a · Cuenta y ejercicios** | Registro con consentimiento, onboarding, biblioteca de ejercicios en español |
| 3 | 28 sep-4 oct | **1b · Registro de entreno** | Entreno completo sin red: series, descanso, valores anteriores, guardado |
| 4 | 5-11 oct | **2a · Rutinas y progreso** | Rutinas, historial, calendario, récords, gráfica por ejercicio |
| 5 | 12-18 oct | **2b · Programas y "Hoy"** | 4 programas propios, cuestionario, sugerencia de peso, pantalla Hoy |
| 6 | 19-25 oct | **3 · Bienestar** | Check-in, preparación que ajusta la sesión, respiración, hábitos |
| 7 | 26 oct-1 nov | **4 · Listo para el CV** | Cuenta demo, web publicada, APK, E2E, accesibilidad, README con GIF |
| — | **2 nov** | **MVP enseñable** | Enlace en el CV y en LinkedIn |
| 8-10 | 2-22 nov | **5 · Nutrición** | Objetivos, búsqueda, escáner, comidas guardadas, agua, peso |
| 11-13 | 23 nov-13 dic | **6 · Social** | Seguir, feed, me gusta, comentarios, tarjetas compartibles, retos |
| 14 | 14-21 dic | Colchón | Correcciones de los probadores |
| 2027 | — | 7 · Opcional | Coach IA, Health Connect y HealthKit, publicar en Google Play |

## Detalle por fase

Cada fase termina con una **puerta**. Si no se cumple, no se empieza la siguiente: se recorta alcance.

### Fase 0 · Cimientos (semana 1)
- **Tú:** cuentas de GitHub, Supabase y Expo; Expo Go en Android. Paso a paso en [04-paso-a-paso-fase-0.md](04-paso-a-paso-fase-0.md).
- **Claude:**
  - Limpiar la plantilla y fijar TypeScript estricto, ESLint, Prettier y Jest.
  - Tokens de diseño, fuentes y navegación con 5 pestañas.
  - Cliente de Supabase, primera migración (`profiles` + RLS) y GitHub Actions.
- **Puerta:** la app abre en tu Android y en Safari del iPhone, y el CI está en verde.

### Fase 1a · Cuenta y ejercicios (semana 2) · código hecho el 14 sep
- [x] Registro e inicio de sesión con email, con fecha de nacimiento, bloqueo de menores de 16 (en la app y en la base de datos) y consentimiento de salud. Sin confirmación por email hasta la fase 4 ([decisión 0003](decisiones/0003-registro-sin-confirmacion-email.md)).
- [x] Onboarding en 5 pasos: objetivo (sin "perder grasa" para menores), nivel, días, material y cuestionario de salud basado en el PAR-Q+.
- [x] **20 ejercicios curados**, escritos para PathUp, con instrucciones, claves de técnica, errores frecuentes y alternativas. Los 40 restantes llegan en la fase 2b, junto a los programas que los usan.
- [x] Biblioteca: búsqueda sin tildes (también en inglés y por músculo), filtros por grupo muscular y "solo con mi material", ficha del ejercicio con chips de músculos. El mapa muscular SVG pasa a la fase 2a.
- [ ] **Tú:** generas las imágenes de los 20 ejercicios con [los prompts ya preparados](prompts/ejercicios-01-20.md).
- [ ] **Puerta:** te registras en el móvil, completas el onboarding y encuentras "press banca" en menos de 5 s.

### Fase 1b · Registro de entreno (semana 3) · código hecho el 20 sep
- [x] Empezar un entreno vacío, añadir ejercicios y apuntar series de peso × repeticiones.
- [x] Valores de la sesión anterior en gris (guardados en el móvil, sin depender del servidor).
- [x] Temporizador de descanso automático al marcar una serie, con +15 s y saltar.
- [x] La sesión sobrevive a cerrar la app; al terminar se guarda en el móvil y se sube sola.
- [x] Subida idempotente: reintentar no duplica nada, porque los identificadores se generan en el móvil.
- [x] Resumen al terminar: duración, volumen, series y mejor serie por ejercicio.
- [x] Tipo de serie (calentamiento, drop, al fallo) y RIR desde la app, descanso configurable y vibración al acabar (21 sep).
- [x] Una serie sin repeticiones ya no se puede marcar: antes llegaba a la cola, la base de datos la rechazaba y atascaba la subida del resto (21 sep).
- [ ] Superseries: fuera de alcance según la lista de recortes.
- [ ] **Tú:** entrenas una sesión real en el gimnasio con la app, **con el modo avión puesto**.
- [ ] **Puerta:** la sesión completa llega a Supabase al recuperar la red, sin series perdidas ni duplicadas.

### Ronda web (20 sep) · la web como app de primera clase
- [x] Paquete de JavaScript de 4,2 MB a 2,4 MB (560 KB transferidos): iconos importados uno a uno y eliminación de código muerto forzada.
- [x] Fuentes en woff2 solo para web: 96 KB en vez de cerca de 1 MB.
- [x] Landing generada como HTML (se ve sin esperar al JavaScript) y con metadatos para buscadores y enlaces compartidos.
- [x] Instalable como app (PWA) con manifiesto, iconos propios y service worker que guarda el armazón para abrir sin conexión.
- [x] Menú lateral en pantallas de 960 px o más, en vez de la barra de pestañas de móvil.
- [x] Ratón y teclado: estados al pasar por encima, cursor, Enter para completar serie y enviar formularios, Escape para cerrar.
- [ ] Pendiente: aviso de hidratación en la landing compilada y comprobar el service worker en Chrome ([decisión 0004](decisiones/0004-web-primero.md)).

### Fase 2a · Rutinas y progreso (semana 4)
- [x] Rutinas en carpetas: crear desde cero o desde un entreno, reordenar y duplicar; al empezarlas se rellenan con tus pesos de la última vez ([decisión 0007](decisiones/0007-rutinas-sin-pesos.md), 21 sep).
- [x] Historial, calendario y detalle de cada sesión, con "Repetir entreno" y borrar (21 sep). Funciona sin conexión con una copia en el móvil ([decisión 0006](decisiones/0006-historial-y-records-en-el-movil.md)).
- [x] Racha semanal, entrenos y volumen de la semana (21 sep).
- [x] Récords automáticos (1RM estimado, peso máximo, mejor serie y repeticiones) que salen en el resumen aunque no haya red, y gráfica por ejercicio con 1RM estimado, peso máximo y volumen (21 sep).
- [x] Medidas corporales: peso, % de grasa y seis perímetros, una entrada por día, gráfica (el peso con media de 7 días) y cambio en 4 semanas (21 sep).
- [ ] **Tú:** creas tus rutinas reales (PPLUL) y entrenas con ellas.
- **Puerta:** creas tu rutina real y ves tu progreso en press tras 2 sesiones.

### Fase 2b · Programas y pantalla "Hoy" (semana 5)
- Los 4 programas propios, con su explicación basada en evidencia.
- Cuestionario que recomienda uno; seguir el programa semana a semana, con reajuste si faltas.
- Sugerencia de peso para la siguiente sesión (doble progresión).
- **Pantalla Hoy:** qué toca, el check-in y la racha.
- **Tú:** portadas de los 4 programas y las imágenes de los ejercicios 21 a 60.
- **Puerta:** un amigo o amiga sin experiencia elige programa y termina su primera sesión sin preguntarte nada.

### Fase 3 · Bienestar (semana 6)
- Check-in de 20 s y puntuación de preparación.
- **Ajuste de la sesión de hoy** según la preparación, con explicación y opción de ignorarlo.
- Respiración guiada (caja y 4-7-8) con animación y vibración.
- Hábitos con rachas, podómetro y agua. Recordatorios locales.
- **Puerta:** 7 días seguidos de check-in tuyos y un ajuste de sesión que tenga sentido.

### Fase 4 · Listo para el CV (semana 7)
- **Botón "Probar con cuenta demo"** con datos realistas de 8 semanas.
- Web publicada con dominio gratuito; APK firmado descargable desde la sección Releases de GitHub.
- Tarea keep-alive de Supabase.
- Flujos E2E con Maestro: registro, entreno sin red y check-in.
- Revisión de accesibilidad: lector de pantalla, contraste y tamaño de texto.
- Pantallas de privacidad: exportar datos y borrar cuenta. Política de privacidad publicada.
- README con GIF, capturas, diagrama, decisiones técnicas y enlace a la demo.
- **Tú:** 10 probadores durante 2 semanas (amistades, gente del gimnasio).
- **Puerta:** un reclutador abre el enlace y en 60 s está viendo un entreno registrado.

### Fase 5 · Nutrición (semanas 8-10)
- Objetivo calculado con salvaguardas y modo "solo proteína".
- Búsqueda en una base de alimentos genéricos (USDA FoodData Central, dominio público, traducida) y escáner de código de barras con Open Food Facts.
- Comidas del día, recientes y favoritos; comidas guardadas; agua; peso con tendencia y ajuste semanal.

### Fase 6 · Social (semanas 11-13)
- Perfil público o privado y seguir (con solicitud si el perfil es privado).
- Feed, me gusta y comentarios.
- Tarjeta compartible generada como imagen y retos semanales.
- Reportar y bloquear.

## Si vas tarde: qué recortar (en este orden)

1. Superseries y calculadora de discos → pasan a la fase 5.
2. Fotos de progreso → fase 5.
3. El programa "Empezar suave" → fase 5 (se quedan 3 programas).
4. Podómetro y agua → fase 5.
5. **Nunca se recorta:** registro sin red, cuenta demo, tests y README. Es lo que se ve en una entrevista.

## Ritual de cada sesión (5-8 h a la semana dan para 3-4 sesiones)

1. Abrir la tarea de la fase (tablero de GitHub Projects).
2. Trabajar en **una sola** tarea.
3. Commit y una línea en `docs/diario.md`: qué avanzó y qué se ve ahora que antes no se veía.
