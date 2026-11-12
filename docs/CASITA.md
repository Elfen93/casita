# CASITA — documento maestro

**Léeme primero.** Quien llegue al proyecto (una persona, un chat nuevo, un agente de la fábrica) empieza aquí y luego abre solo los documentos que su tarea necesite.

Última revisión: 12 de noviembre de 2026.

---

## 1. Qué es

Casita es un simulador de vida ambientado en un barrio español de hoy. Se parece a Los Sims en la forma (una casa que construyes, un personaje con necesidades, gente alrededor) y se diferencia en el fondo: aquí la vida depende del sueldo, el alquiler, el contrato, el casero, el sindicato y el gobierno que toque. El personaje no es un consumidor con caprichos: es alguien que trabaja.

- **Dónde se juega:** en el móvil, como app web instalable (PWA). <https://elfen93.github.io/casita/>
- **Copia privada:** artefacto de claude.ai `a656492a-5082-4225-95ab-ee60c4e381a0`.
- **Repositorio:** `Elfen93/casita` (rama `main`). GitHub Pages sirve `index.html` directamente.
- **Proyecto de claude.ai:** «Sims realistas» (lleva una copia de este documento y de `SISTEMAS.md`).

## 2. Fuente de verdad

1. **El repositorio manda.** Código y `docs/`. Si un chat, un resumen o una copia en el proyecto de claude.ai dicen otra cosa, gana el repo.
2. **Este documento** es la puerta de entrada y se actualiza cuando cambia algo importante (una decisión, un sistema nuevo, el plan), no con cada arreglo.
3. **`docs/CHANGELOG.md`** recoge cada cambio publicado, una línea por cambio.
4. Los juegos se guardan en el navegador del jugador (`localStorage`). **No se pueden romper partidas existentes**: todo estado nuevo se crea con valores por defecto cuando falta.

## 3. Reglas que no se tocan

Detalle completo en `docs/BIBLIA.md`. Lo esencial:

1. **La mirada.** El juego está del lado de quien trabaja, alquila y cuida. Nombra las relaciones de poder con claridad (quién decide, quién gana, quién paga) y con humor seco, sin sermones.
2. **Ningún sistema es un monigote.** Cada gobierno tiene una época dorada real y una crisis que nace de ella (`docs/SISTEMAS.md`). Liberal, austeridad, socialdemócrata, consejos, comunas y socialismo de mercado tienen ganadores y perdedores de verdad. Sin sesgo occidental ni propaganda.
3. **Realismo español.** Moneda en euros. Sueldos, alquileres, precios, impuestos y cotizaciones como los de España en 2026. Un fogón malo cuesta 120 €, no 3.000.
4. **Nada da dinero porque sí.** El dinero viene del trabajo, las ayudas, las deudas o vender algo. Cumplir un deseo da ánimo, no euros.
5. **El tiempo político es lento.** Legislaturas de cuatro años, ciclos de 3 a 6 años, influencia personal que se gana en años de militancia.
6. **Que se vea.** Toda acción del jugador tiene respuesta visible: una tarjeta con el resultado, un cambio en una barra, alguien que camina hasta donde va. Nada de efectos a ciegas ni teletransportes.
7. **Lógica cotidiana.** Se cocina y después se come. Se friega. Los obreros vienen de 8 a 18. Las visitas se sientan. Nadie se duerme en la acera.
8. **Sin marcas ni personas reales.** Bancos, tiendas y empresas inventados («Banco Atlántico», «FitBarrio»). Nada copiado de Los Sims: ni nombres, ni iconos, ni interfaz.
9. **Texto.** Castellano de España, frases cortas, concretas. Los textos se escriben en femenino genérico y la función `L()` los adapta al género del personaje.

## 4. Cómo está hecho

Un solo archivo HTML con todo dentro. Sin servidor, sin dependencias en tiempo de ejecución.

```
casita/
  build.py            une todo → casita.html (desarrollo) e index.html + sw.js (publicación)
  build.json          orden de los módulos
  data/*.json         el contenido: lugares, gente, trabajos, objetos, libros, estudios, interacciones,
                      ideologías, gobiernos, reglas y sucesos (data/README.md). Lo comparten el juego web y Godot
  src/head.html, src/tail.html
  src/core/NNN_*.js   núcleo: 99 archivos numerados (motor, dibujo, casa, trabajo, mundo…)
  mods/*.js           69 módulos que amplían el núcleo, en el orden de build.json
  mods/movil.css      estilos de todas las ventanas
  p3d/, q3d/          librería 3D y modelos de los personajes
  pwa/                registro del service worker
  scripts/test.py     lanza una prueba en Chrome sin pantalla
  scripts/datos.py    comprueba data/ (lo llama build.py) y le da formato
  scripts/comparar.py dice si un cambio que no debía notarse se nota (120 días de 11 partidas con el azar sembrado)
  t/                  pruebas (t_casa.js es la regresión básica) y utilidades de captura
  godot/              (frente B) el proyecto de Godot, cuando exista
  docs/               esta documentación
```

**Contenido y lógica van separados.** `build.py` incrusta `data/*.json` como `const DATA={archivo:{sección:…}}` y el código lee de ahí con el nombre de siempre (`const PLACES=DATA.lugares.lugares`). Añadir un lugar, un objeto, un libro o una frase es editar `data/`; el código solo se toca si hace falta lógica nueva. Cuando una ficha necesita una función (una condición, un efecto), la ficha va en `data/` y la función en el código, unida con `conLogica(tabla,{id:{campo:función}})`.

**Cómo amplía un módulo al núcleo.** Envuelve funciones globales:

```js
{const _f=dailyEvents;dailyEvents=function(){const r=_f.apply(this,arguments);try{/* lo nuevo */}catch(e){}return r;};}
```

Normas: no se reasignan funciones declaradas con `const`; el estado nuevo vive en `S.algo` y se crea si falta; todo lo que toca dinero pasa por `bkAdd(etiqueta, ±cantidad)`; los precios de servicios se expresan en horas de salario mínimo con `hrs(n)`; el contenido va en `data/` y un módulo no cambia al cargar lo que ya está allí (nada de `OBJ.x.p=…`: se cambia el dato).

**Puntos de enganche más usados:** `update(gm)` (cada minuto de juego), `dailyEvents()` (cada medianoche), `worldWeekly()` (cada lunes), `payRent()`, `finishWork()`, `vidaTab()` / `genteTab()` / `openMenu()` (interfaz), `tell(texto, icono)` (Historia) y `toast()` (aviso breve).

**Tiempo.** A velocidad 1×, un día dura 16 minutos reales. Velocidades 1×, 2×, 5×, 12×. Semana: 0 = lunes … 6 = domingo.

**Ciclo de trabajo de cada cambio:**

```
cd casita
python3 build.py                                # comprueba data/ y la sintaxis, y construye
python3 scripts/test.py t/t_casa.js 120        # regresión: debe dar "errs":[]
python3 scripts/test.py t/t_loquesea.js 10     # prueba propia del cambio
echo "- Qué cambió." >> docs/CHANGELOG.md
git add -A && git commit && git push origin main   # publica en GitHub Pages
# y publicar index.html en el artefacto de claude.ai
```

## 5. Mapa de sistemas

Estado: ✅ funciona · 🟡 funciona pero corto · ⬜ pendiente.

| Sistema | Dónde | Estado |
|---|---|---|
| Casa: construir, muebles, desgaste, averías, obras contratadas en horario | núcleo, `casa`, `hogar`, `obras`, `horario_obras`, `pintar` | ✅ (construcción incómoda: ver T-004) |
| Necesidades y energía, autonomía, agenda semanal | núcleo, `rutina`, `energia`, `agenda`, `encadenar` | ✅ |
| Comida: despensa, tres comidas, cocinar→comer, fregar, nutrición | `comidas`, `cocinar`, `fregar` | ✅ |
| Cuerpo: peso con objetivo, gimnasio, problemas de salud, médico (cita, espera y visita al centro de salud) | `salud`, `peso`, `gym`, `servicios` | ✅ |
| Mente: ánimo, depresión, terapia, adicciones, camello, cárcel | `mente` | ✅ |
| Trabajo: profesiones, jornada, ascensos, baño y café, entrevista, oficina de empleo en paro | núcleo, `jornada`, `curro`, `entrevista`, `servicios` | ✅ |
| Dinero: banco según sistema, ahorro, depósito, préstamos, deudas, patrimonio | `banco`, `productos`, `banco2`, `banco3`, `patrimonio` | ✅ |
| Impuestos: nómina bruta/neta, IRPF, IVA, IBI, renta, negro, autónomos | `fiscal` | ✅ |
| Vivienda: alquiler, compra, hipoteca, desahucio, calle, albergue | núcleo, `marginal`, `reparto`, `facturas` | ✅ |
| Gente: relaciones, pareja, intimidad, visitas, hijos, convivencia | `relaciones`, `intimo`, `visitas`, `invitados`, `crianza`, `convivencia`, `resvida` | ✅ |
| Interacciones visibles y menú por persona, ideologías y voces | `gente_menu`, `social_fx`, `voces` | ✅ |
| Móvil del juego: mensajes, noticias, banco | `movil` | ✅ |
| Estudios y libros: programas, clase en aula, universidad pública o privada, biblioteca, manuales, escribir, pintar | `estudios`, `aula`, `universidad`, `libros`, `lectura` | ✅ |
| Sindicato, huelga, favores colectivos | núcleo, `huelga`, `colectivo` | ✅ |
| Gobiernos y ciclos: tensión, señales, crisis, pulso de actores, presión exterior | núcleo (`046`), `ciclos`, `ritmo` | ✅ |
| Consejos y comunas por fases: vivienda, trabajo, compra y banco | `gobierno` | ✅ |
| Socialismo de mercado | `ciclos`, `fiscal` | 🟡 solo se llega desde la crisis de los consejos |
| Comunidad propia (socialismo utópico), semilla de las comunas | `comunidad` | ✅ |
| Gobierno progresista y conservador en la vida diaria | `ciclos`, `fiscal` | 🟡 impuestos y pulso sí; faltan efectos en vivienda, servicios y calle |
| Deseos del personaje, objetivos, temporadas, final | núcleo, `deseos`, `final` | ✅ |
| Mundo: lugares visitables y escenas interiores con gente según la hora; nombres en pantalla que no se pisan | núcleo (`047`), `gym`, `aula`, `poblacion`, `rotulos`, `servicios`, `escuela`, `universidad` | 🟡 un solo barrio; el mapa del barrio existe en el código (`barrioItems`) pero no se pinta: solo se ve un lugar cuando el personaje está en él (por eso el recreo y las aulas de colegio e instituto aún no se ven jugando: T-111) |
| Censo del barrio: 46 vecinos en 15 hogares (trabajo, historia, lazos, niños y adolescentes) y sus casas por dentro | `data/personas.json`, `poblacion`, `hogares` | 🟡 se les ve en su sitio y en su casa, pero aún no se les puede conocer; «Ir a su casa» usa el censo solo cuando la persona tenga `hogar` |
| Otras ciudades y barrios | — | ⬜ |
| Envejecer, calendario anual de fiestas | — | ⬜ |

Abreviaturas del estado que más aparecen: `S` (partida), `S.sim` (el personaje en el mapa), `S.needs`, `S.people`, `W_()` (mundo: gobierno, crisis, movimiento), `HP()` cuerpo, `MT()` mente, `CM()` comidas, `BKS()` y `BP()` banco, `FS()` fiscal, `CY()` ciclo, `GV()` gobierno de consejos, `UT()` comunidad, `LB()` libros, `ED()` estudios, `AG()` agenda, `VS()` visitas.

## 6. Decisiones tomadas y por qué

| Decisión | Por qué |
|---|---|
| Todo en un HTML, módulos que envuelven funciones | Se publica con un `git push`, funciona sin conexión y permite añadir sin reescribir. |
| El contenido en `data/*.json`, incrustado al construir | Un solo sitio para cada dato, legible sin saber programar, y el mismo para el juego web y para Godot. JSON porque los dos lo leen sin librerías. Sigue siendo un solo HTML sin red. |
| Euros y precios reales en todas las dificultades | La dificultad está en el sueldo y el alquiler, no en inflar precios. |
| Precios de servicios en horas de salario mínimo | Se mantienen proporcionados aunque cambien dificultad o sueldos. |
| Los cambios de gobierno llegan por fases y con ventana «Qué ha cambiado» | Antes una revolución era una bandera; ahora se nota en el alquiler, el curro y la nevera. |
| Cada sistema es un ciclo con su tensión | Evita el cliché: el auge de cada modelo prepara su crisis. |
| El socialismo de mercado es un sistema propio | No es «la degeneración» de los consejos; tiene su lógica, sus logros y sus costes. |
| El socialismo utópico es un proyecto del jugador | Son comunidades dentro de cualquier sistema, no un gobierno. |
| Cumplir deseos da ánimo, no dinero | Regla 4. |
| Con consejos y socialismo de mercado no hay huelgas | No hay patrón (consejos) o el sindicato es oficial (mercado). |
| No usar el conector de Zapier | Es de la empresa del autor. |
| Godot y no Unity para el salto gráfico | Se puede compilar y exportar desde un servidor sin pantalla, es libre y exporta a Android y web. |
| Godot en este mismo repositorio, en `godot/` | Los dos juegos leen el mismo `data/` y se publican juntos; con dos repos habría que copiar los datos y se desincronizarían. |
| Empezar con arte libre | Paquetes libres de calidad (CC0 o con atribución, apuntada en el README) para edificios, muebles y animaciones. Los de pago se valoran cuando la prueba pequeña convenza. |
| No invertir en dibujo nuevo del juego web mientras se decide Godot (12 nov 2026) | El dibujo está hecho a mano para este motor y no se puede llevar; reglas, datos y textos sí. El frente A sigue solo con eso. |
| La fábrica usa modelos baratos para volumen y el modelo caro solo integra | Ver `docs/COSTE.md`. |

## 7. El plan

### Paso 0 — Datos fuera del código
Sacar el contenido a una carpeta `data/` en un formato legible. El juego web pasa a leer de ahí sin cambiar por fuera. Es la pieza que comparten los dos frentes.

- ✅ **Primera pasada (12 nov 2026):** 107 secciones en 11 archivos: lugares y salidas, viviendas, personas, profesiones, objetos y lo que se hace con ellos, libros, estudios, interacciones, ideologías, gobiernos (ciclos e impuestos) y reglas básicas. Comprobado con `scripts/comparar.py`: 11 partidas de 120 días con el azar sembrado dan el mismo estado, el mismo diario y las mismas pantallas que antes.
- ✅ **Segunda pasada (13 nov 2026):** sucesos, textos del núcleo y de los módulos y todo el móvil están en `data/` (`sucesos.json`, `textos_nucleo.json`, `textos_mods_ag.json`, `textos_mods_hz.json`, `movil.json`), leídos con `huecos()`. En el código quedan dibujo, rótulos de lienzo, estructura HTML, estilos e identificadores. Prueba de equivalencia: `python3 t/probe.py casita.html t/probe_long.js salida.json` (40 partidas de 100 días, todos los mensajes), antes y después de cualquier cambio que no deba notarse.

La fábrica y la prueba de Godot ya pueden empezar con lo que hay: lo que necesitan (lugares, gente, trabajos, objetos, necesidades, interacciones) está en `data/`.

### Frente A — La fábrica de contenido (juego web)
Agentes en paralelo, cada uno en su copia del repo y con un encargo cerrado (`docs/FABRICA.md`, plantilla en `docs/prompts/PLANTILLA.md`, tareas en `docs/BACKLOG.md`). Orden (decidido el 12 nov 2026):
1. **Población.** Gente con trabajo, historia y casa; hogares de varios tipos; niños y adolescentes; unos en casas y otros en bloques.
   - ✅ El censo: 46 personas en 15 hogares y 8 edificios (`data/personas.json` → `vecinos`, `hogares`, `edificios`), con trabajo y horario, historia y lazos; 10 niñas y niños y 7 adolescentes.
   - ✅ En las escenas: cada cual donde le toca a su hora, quien trabaja en su puesto, las criaturas con una adulta de su casa (`mods/poblacion.js`).
   - ✅ Casas visitables: el piso o la casa de cada hogar por dentro, según su nivel y quién vive allí (`mods/hogares.js`).
2. **Lugares visitables: primero los lugares.** ✅ Centro de salud y oficina de empleo. ✅ Colegio público, colegio concertado e instituto (las criaturas del censo van a clase; con hijos propios, «Recoger del cole» y «Reunión con la tutora»). ✅ Universidad pública y privada (se elige al matricularse: mismo título, otro precio y otro horario). ✅ El mapa del barrio, con «Mirar dentro» de cualquier lugar (`mods/barrio.js`, `data/barrio.json`). ✅ La ciudad por barrios: Riobravo, seis barrios con sus calles, lo repartido con lógica de ciudad, transporte entre barrios y plano de ciudad (`data/ciudad.json`). ✅ Mundo continuo: los interiores y la casa se pintan en su calle, se va andando de puerta a puerta y en transporte entre barrios, y el trayecto gasta tiempo y dinero (`mods/caminar.js`). ✅ Los doce lugares nuevos con interior y salidas, y vida de barrio (`mods/barrios_vida.js`). Queda T-134 (vecinos visibles por la calle, piquetes en la puerta, rider, equilibrio). Después: mercado, polideportivo y más bares; después, otros barrios y ciudades.
3. **Interacciones y personajes con los que se puede tratar**, entre toda la población nueva: ✅ conocer a los vecinos del censo: ficha, presentarse, pasan a Gente con su hogar, visitarles, lazos que se descubren (`mods/vecinos.js`). ✅ Tratar con ellos: opciones por oficio y lugar, favores con memoria, cotilleo que descubre, política y sindicato del bloque, romance con adultos, vecinos que te buscan (`mods/trato.js`, `data/trato.json`). ✅ Elegir colegio para los hijos; horarios de los lugares como dato.

Reglas de la fábrica: 2 o 3 agentes por tanda, cada uno en su worktree (`git worktree add ../wt/t0NN -b fab/t0NN main`); cada agente lee solo los documentos que su tarea cite; entrega con prueba propia y regresión en verde; el integrador revisa, junta y publica. La revisión es de diseño y tiene la última palabra: un defecto que se ve no se publica ni se apunta, se arregla antes (`docs/FABRICA.md`, «Revisión de diseño»).

### Frente B — Godot
1. Montar Godot en modo sin pantalla y un proyecto en `godot/` dentro de este mismo repo (decidido).
2. **Prueba pequeña:** un barrio en 3D, la casa, el personaje con sus necesidades y tres o cuatro interacciones, leyendo `data/`.
3. Publicarla en la web (`/godot/`) para compararla en el móvil con el juego actual.
4. Si convence, **migrar por bloques**: vida diaria → trabajo y dinero → política. El juego web sigue vivo mientras tanto.

Arte: se empieza con paquetes libres de calidad (edificios, muebles, animaciones), decidido; más adelante se valora alguno de pago. El salto gráfico depende más del arte que del motor.

### Pendiente fuera de los frentes
- Progresista y conservador en la vida diaria (vivienda, servicios, calle).
- Llegar al socialismo de mercado por más de un camino.
- Construcción cómoda (T-004), catálogo con procedencia (T-005), iconos propios (T-006).
- Calendario anual y envejecer (T-010, T-011).
- La etiqueta de «Ir a clase» aún dice «Biblioteca municipal».

## 8. Los demás documentos

| Documento | Para qué |
|---|---|
| `data/README.md` | Qué hay en cada archivo de datos, qué significa cada campo y qué queda por sacar. |
| `docs/BIBLIA.md` | Tono, mirada, normas de escritura y de programación. |
| `docs/SISTEMAS.md` | Diseño de gobiernos, impuestos, ciclos, presión exterior y pulso de actores. |
| `docs/FABRICA.md` | Roles, formato de tarea y ciclo de trabajo de los agentes. |
| `docs/BACKLOG.md` | Tareas pendientes, por prioridad. |
| `docs/COSTE.md` | Qué modelo usar para qué y cómo gastar poco. |
| `docs/prompts/` | Encargos listos para lanzar y la plantilla. |
| `docs/CHANGELOG.md` | Historial de cambios publicados. |
