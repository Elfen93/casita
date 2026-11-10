# Casita · la fábrica

Cómo trabajan varios agentes a la vez sin pisarse.

## Estructura del repo

```
build.py          junta todo → casita.html (dev) e index.html + sw.js (PWA)
build.json        orden de los módulos
src/head.html     HTML + CSS del juego
src/core/NNN_*.js el motor, partido por secciones (tocar lo mínimo)
src/tail.html     cierre
mods/*.js         un módulo por sistema (aquí se trabaja)
mods/movil.css    CSS de los módulos
p3d/ q3d/         three.js, personajes 3D, animaciones (CC0)
t/*.js            tests headless; scripts/test.py los corre
docs/             BIBLIA, FABRICA, BACKLOG, CHANGELOG, capturas
```

Comandos: `python3 build.py` · `python3 scripts/test.py all` · `python3 scripts/test.py t/t_x.js 60` · captura: `python3 t/cdpshot.py file://…/t/_run_x.html 6 salida.png 420x860`.

## Roles

| Rol | Hace | No hace |
|---|---|---|
| **Integradora** (Claude principal) | reparte tareas, revisa, junta, publica | escribir sistemas grandes ella misma |
| **Sistemas** | reglas, números, equilibrio; tests de simulación | textos largos, UI |
| **Guion** | todos los `tell`/`chapter`/dilemas/mensajes; revisa textos ajenos | tocar lógica |
| **Escenas y población** | lugares nuevos, gente, hora/clima, paleta | reglas de juego |
| **Motor y UI** | construcción, rendimiento, móvil, iconos, bugs | contenido |
| **Tester** | juega (auto y a mano), busca bucles y absurdos, verifica entregas con captura | arreglar: solo reporta |
| **Revisora** | lee cada entrega contra la BIBLIA antes de integrar | nada más |

## Una tarea

Se escribe así (en `docs/BACKLOG.md` o en el prompt del agente):

```
### T-042 · Escuela de adultos
Rol: escenas. Prioridad: alta.
Qué: PLACES.instituto + SCENES['instituto'] (aula de noche, pasillo, máquina de café, 8–14 figuras, profesora, compañeros de 19 y de 52). destOf('clase') → 'instituto' salvo online.
Hecho cuando: captura día y noche en docs/capturas/instituto_*.png; test t/t_edu.js sigue pasando; un `tell` nuevo al primer día de clase (guion lo revisa).
No tocar: src/core, movil.js.
```

Reglas:
- Cada agente trabaja en **su worktree** (rama `fab/T-042-instituto`) y entrega un diff + capturas + resultado de tests. No publica.
- Un agente, un módulo nuevo o uno existente; nunca dos agentes en el mismo fichero.
- Si necesita un cambio en `src/core`, lo pide a la integradora con la línea exacta.
- Textos nuevos: etiqueta `// GUION:revisar` hasta que guion los lea.
- La integradora junta en `main`, corre `test.py all`, publica (GitHub Pages + artifact) y apunta en `CHANGELOG.md`.

## Ciclo

1. Integradora elige 3–5 tareas **independientes** del backlog (distintos ficheros).
2. Lanza los agentes en paralelo con el prompt = tarea + «lee docs/BIBLIA.md y docs/FABRICA.md».
3. Tester recibe cada entrega y la rompe 10 minutos: partida auto 60 días + manual con capturas.
4. Revisora lee textos y mirada.
5. Integradora junta, prueba todo, publica, cierra tareas.

## Lo que la fábrica no decide

Qué es el juego (la biblia), qué entra y qué no (el backlog lo ordena la persona), y nada que cueste dinero o toque claves (OpenAI, etc.) sin pedirlo.
