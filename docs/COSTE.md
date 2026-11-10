# Casita · gastar lo mínimo

Reglas para que la fábrica consuma lo menos posible. Se aplican siempre, salvo que la persona diga lo contrario.

## Modelos por defecto
- **Haiku**: capturas, renombrar, mover, listas, resúmenes, comprobar que un test pasa.
- **Sonnet, esfuerzo bajo/medio**: escenas, población, tester, UI sencilla, tareas con plantilla clara.
- **Opus, esfuerzo medio**: construcción, reglas con muchas interacciones, guion.
- **Fable**: solo la integradora, y solo para integrar. Nunca para tareas de volumen.

## Prompts cerrados
Un agente que explora el repo por su cuenta es lo que más quema. Cada prompt lleva:
1. Qué hacer, en 5 líneas.
2. **Los ficheros exactos** que puede leer (normalmente 2–4) y el único que puede escribir.
3. El test que debe pasar y cómo correrlo (una línea).
4. «No leas nada más. No expliques el código. Entrega: diff + resultado del test + una captura si es visual.»
Las plantillas están en `docs/prompts/`.

## Tandas pequeñas
- 2 o 3 agentes a la vez, no más. Cada uno en su worktree.
- La integradora lee **el resumen y el `git diff --stat`**, no el código entero, salvo que el test falle.
- Nada de re-lanzar un agente para «mejorar»: si falla el test, se devuelve con el error exacto y nada más.

## Sesiones cortas
- Una conversación larga cuesta más por mensaje. Cada tanda, en conversación nueva, con `docs/` como memoria.
- La integradora no pega código en el chat; apunta en `CHANGELOG.md` y publica.

## Lo que no se hace
- Pruebas visuales a mano cuando hay test automático.
- Reescribir módulos enteros: se envuelven funciones (ver BIBLIA §4).
- Pedir a un modelo caro que haga de tester.
