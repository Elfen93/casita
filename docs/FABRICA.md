# Casita · la fábrica

> Antes de nada: lee `docs/CASITA.md` (documento maestro).

Cómo trabajan varios agentes a la vez sin pisarse.

## Estructura del repo

```
build.py          junta todo → casita.html (dev) e index.html + sw.js (PWA)
build.json        orden de los módulos
data/*.json       el contenido (data/README.md); scripts/datos.py lo comprueba y lo formatea
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
| **Integradora** (Claude principal) | reparte tareas, hace la revisión de diseño con la última palabra, junta, publica | escribir sistemas grandes ella misma; dejar pasar un defecto que se ve |
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
- Un agente, un módulo nuevo o uno existente; nunca dos agentes en el mismo fichero. Vale también para `data/`: dos tareas que tocan el mismo archivo de datos no van en la misma tanda.
- El contenido (fichas, nombres, frases de lista) se entrega en `data/`, con `python3 scripts/datos.py --fmt` pasado; el módulo lleva solo la lógica.
- Si necesita un cambio en `src/core`, lo pide a la integradora con la línea exacta.
- Textos nuevos: etiqueta `// GUION:revisar` hasta que guion los lea.
- La integradora junta en `main`, corre `test.py all`, publica (GitHub Pages + artifact) y apunta en `CHANGELOG.md`.

## Revisión de diseño: la última palabra

Quien integra revisa cada entrega como la diseñadora del juego que firma lo que sale, no como quien comprueba que las pruebas pasan. **Un defecto que un jugador vería no se publica y no se apunta como «a tener en cuenta»: se arregla antes.** Se devuelve al agente con el fallo exacto o va a un agente de pulido en la misma tanda.

Bloquea la publicación:
- Nombres o textos que se pisan, se cortan o tapan a un personaje.
- Figuras encima de muebles, de paredes o de otras figuras; gente flotando o fuera del suelo.
- Algo que el encargo pedía y no se ve en la captura (la médica que llama, el casco en la obra).
- Objetos que no se leen como lo que son (sillas que parecen mesas).
- Contenido al que no se puede llegar jugando.
- Incoherencias de mundo: alguien en dos sitios a la vez, una criatura sola, un sitio cerrado lleno de gente.
- Escenas o variantes entregadas sin mirar.

Cómo se revisa:
- Cada escena nueva o tocada se mira en captura **a tamaño de móvil (420×860)**, que es donde se juega, en hora punta y en hora floja, de día y de noche, y en cada variante que tenga. `t/cdpshot.py … 420,860` da ese tamaño de verdad, y `t/t_ver.js` pone cualquier escena a cualquier hora sin escribir una prueba (instrucciones en su cabecera). La referencia de escala es el bar: la escena llena el ancho y una persona de pie mide unos 30 px; una escena nueva no puede verse más pequeña.
- Los nombres de persona van siempre por los rótulos (`sPerson` con `name`, o `rotular()` si la figura se pinta a escala propia): letra fija, sin pisarse, encima de todo. Una escena no pinta etiquetas de nombre por su cuenta.
- Nada compartido en `/tmp` entre agentes: cada cual guarda sus scripts dentro de su copia.
- La integradora abre las capturas ella misma. No vale el «las he mirado» del agente.
- Los textos nuevos se leen contra la BIBLIA antes de publicar; `// GUION:revisar` no sale a `main`.
- Si algo se deja fuera, es una decisión: se dice por qué y se abre tarea en el backlog. Nunca en silencio.

## Ciclo

1. Integradora elige 3–5 tareas **independientes** del backlog (distintos ficheros).
2. Lanza los agentes en paralelo con el prompt = tarea + «lee docs/BIBLIA.md y docs/FABRICA.md».
3. Tester recibe cada entrega y la rompe 10 minutos: partida auto 60 días + manual con capturas.
4. Revisora lee textos y mirada.
5. Integradora junta, prueba todo, publica, cierra tareas.

## Lo que la fábrica no decide

Qué es el juego (la biblia), qué entra y qué no (el backlog lo ordena la persona), y nada que cueste dinero o toque claves (OpenAI, etc.) sin pedirlo.
