# 0007 · Las rutinas guardan la receta, no los pesos

- **Fecha:** 2026-09-21
- **Estado:** aceptada

## Contexto

En Hevy o Strong una rutina guarda cada serie con su peso. A las pocas semanas esos pesos ya no son los tuyos: o editas la rutina cada vez que subes, o empiezas cada entreno corrigiendo números. Además, la fase 2b trae la doble progresión (subir peso cuando llegas al tope de repeticiones), que necesita un rango de repeticiones por ejercicio.

## Decisión

- Una rutina guarda **ejercicios, número de series y rango de repeticiones** (por ejemplo 3 × 8-12), en carpetas opcionales y con un orden propio.
- Al empezarla, cada serie se rellena con **lo que hiciste la última vez** en ese ejercicio (sin contar calentamientos). Si nunca lo has hecho, las repeticiones empiezan en el tope del rango y el peso queda para ti.
- Se puede crear desde cero o **desde un entreno del historial** ("Guardar como rutina"): se copian los ejercicios, las series efectivas y el rango de repeticiones que realmente hiciste.
- Como los entrenos, los identificadores se generan en el móvil y guardar es un `upsert` idempotente. Las tablas tienen RLS por usuario y claves foráneas compuestas `(id, user_id)`, igual que en la [migración de entrenos](../../supabase/migrations/20260920164840_workouts.sql).
- Hay una copia de las rutinas en el móvil: **empezar una rutina funciona sin conexión**; crearla, editarla, duplicarla o reordenarla necesita red y lo dice claramente si falla.

## Consecuencias

- Empezar una rutina es "lo mismo que la última vez" y solo tocas lo que sube: menos toques por serie que en las apps de referencia.
- La fase 2b puede sugerir el peso de la próxima sesión a partir del rango sin cambiar el modelo de datos.
- Editar rutinas sin conexión queda fuera del MVP: se hace pocas veces y casi siempre en casa.
