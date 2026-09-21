# 0006 · Historial y récords calculados en el móvil

- **Fecha:** 2026-09-21
- **Estado:** aceptada

## Contexto

La fase 2a añade historial, calendario, récords automáticos y gráficas por ejercicio. El registro de entrenos ya funciona sin conexión (cola en el móvil, identificadores generados en el dispositivo); si el progreso dependiera del servidor, al terminar un entreno en el gimnasio sin cobertura no verías ni el récord que acabas de batir ni la sesión en tu historial.

## Decisión

- **Supabase sigue siendo la fuente de verdad**, pero el historial se descarga entero (hasta 500 entrenos, años de uso) y se guarda una **copia en el móvil**. Si no hay red, la app enseña esa copia con un aviso.
- Lo que se ve es siempre **copia descargada + cola pendiente**, unidos por identificador: un entreno aparece en el historial en cuanto lo terminas, suba o no.
- **Récords, gráficas, racha y calendario son funciones puras** en `src/domain/progress.ts`, calculadas en el móvil a partir de esa lista. No hay tablas de récords en la base de datos que mantener sincronizadas.
- Tipos de récord: 1RM estimado (Epley, series de hasta 12 repeticiones), peso máximo, mejor serie (peso × repeticiones) y, en ejercicios sin carga, más repeticiones. La primera vez que haces un ejercicio fija tus marcas, pero no cuenta como récord batido.
- Al cerrar sesión se borra del dispositivo todo lo de esa cuenta (cola, copia del historial, valores anteriores y entreno en curso), avisando antes si queda algo sin subir. Así otra persona que entre en el mismo móvil nunca ve ni sube entrenos ajenos.
- Las gráficas se dibujan con `react-native-svg`, que ya estaba instalado: sin librería de gráficas (menos peso en web) y con el color de la serie validado para el fondo oscuro.

## Consecuencias

- Todo el progreso funciona sin conexión y los récords salen en el resumen del entreno aunque no haya red.
- Borrar un entreno sí necesita conexión: se borra en el servidor y después en la copia local.
- Con más de 500 entrenos habrá que paginar o precalcular récords en el servidor. Queda muy lejos del uso real del MVP.
