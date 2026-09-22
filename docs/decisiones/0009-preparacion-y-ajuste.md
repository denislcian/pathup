# 0009 · Preparación diaria sin pulsera, y ajustes pequeños

- **Fecha:** 2026-09-22
- **Estado:** aceptada

## Contexto

Oura o Whoop calculan una "preparación" con el pulso y la variabilidad cardiaca, y cobran por ello. El documento de producto prometía lo mismo con un check-in de 20 segundos y, sobre todo, **que esa puntuación sirviera para algo**: ajustar la sesión del día.

## Decisión

- El check-in pregunta **horas de sueño y cinco escalas de 1 a 5** (calidad del sueño, energía, estrés, agujetas y ánimo). Una entrada por día; volver a contestar el mismo día sustituye la anterior.
- La **preparación (0-100)** pondera sueño (25 % calidad + 20 % horas), energía (25 %), estrés (15 %) y agujetas (15 %). El ánimo se guarda para las tendencias, pero no puntúa: es el dato más ruidoso y el que menos dice del rendimiento de hoy.
- Las horas de sueño puntúan 0 con 4 horas o menos y 100 desde 7,5; por encima no suma más.
- El ajuste de la sesión es **deliberadamente pequeño**: por encima de 60 no se toca nada; entre 40 y 59 se quita una serie por ejercicio; por debajo de 40 se quita una serie y se bajan los pesos un 10 %. Nunca se propone saltarse el entreno, y siempre se puede **empezar sin ajustar**.
- El consejo dice **por qué** ("sobre todo por las horas de sueño"): se calcula qué respuesta restó más puntos.
- La puntuación se guarda junto al check-in, para que el historial conserve el número que la persona vio aunque la fórmula cambie.

## Consecuencias

- Toda la lógica vive en `src/domain/wellness.ts` y es probable con tests; la app no necesita ningún dispositivo.
- La fórmula es una convención razonable, no una medida clínica: hay que revisarla cuando haya semanas reales de datos (de Denis y de los probadores).
- La respiración guiada (caja 4-4-4-4 y 4-7-8) comparte pantalla con el check-in porque resuelve lo mismo: bajar pulsaciones antes de dormir o después de entrenar.
