# 0008 · Programas guiados: el progreso se cuenta en sesiones, no en fechas

- **Fecha:** 2026-09-22
- **Estado:** aceptada

## Contexto

Las apps de influencers reparten el programa por días del calendario: si el martes tocaba pierna y no vas, pierdes esa sesión y la semana queda coja. Es la queja más repetida de quien las deja. PathUp prometía en el documento de producto que "si faltas un día, el programa se reajusta".

## Decisión

- Un programa es **una lista de sesiones por semana** (las mismas cada semana) más un **plan semanal** que ajusta las series y el RIR: dos semanas de aprender, acumulación, semana de descarga y semanas de apretar.
- El progreso **no se guarda**: cada entreno lleva `program_slug` y `program_session` (`w3-b`), y la siguiente sesión es **la primera del plan que no esté hecha**. Faltar un día no pierde la semana: esa sesión sigue siendo la próxima.
- Como los entrenos ya suben por la cola sin conexión, el progreso del programa se actualiza solo, aunque entrenes en modo avión.
- La tabla `program_enrollments` solo guarda **en qué programa estás** (uno a la vez, con un índice único parcial) y desde cuándo.
- **Sugerencia de peso por doble progresión**: mientras no llegues al tope del rango, la app te pide una repetición más; cuando todas las series llegan al tope, sube el salto más pequeño que permite el material (2,5 kg en barra y máquina, 2 kg en mancuernas) y vuelve a la parte baja del rango. En ejercicios sin carga la progresión sigue por repeticiones.
- Cada programa explica **por qué funciona** y enlaza los estudios en los que se apoya, en lenguaje llano.

## Consecuencias

- La pantalla Hoy puede decir siempre qué toca, sin pedir permisos de calendario ni notificaciones.
- Saltarse una sesión "desordena" el plan a propósito: primero se recupera la pendiente. Es lo que espera quien falta un día, y se explica en la ficha del programa.
- Cambiar de programa deja el anterior como abandonado; los entrenos hechos siguen en el historial y cuentan para récords y gráficas.
