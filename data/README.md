# data/ — el contenido de Casita

Aquí vive **lo que el juego cuenta y ofrece**: lugares, gente, trabajos, objetos, libros, estudios, interacciones, ideologías, gobiernos y reglas básicas. El código (`src/core`, `mods`) pone la lógica; estos archivos, el contenido.

Lo leen dos juegos: el web (hoy) y el de Godot (`godot/`, cuando exista). Lo que se añada aquí vale para los dos.

## Cómo llega al juego

- `python3 build.py` comprueba los archivos (`scripts/datos.py`), los junta y los incrusta al principio del script como `const DATA={archivo:{sección:…}}`. Sigue siendo un solo HTML, sin red.
- El código lee de ahí con el nombre de siempre: `const PLACES=DATA.lugares.lugares;`. Para saber qué tabla del código es cada sección, busca la sección: `grep -rn "DATA.lugares.salidas" src mods`.
- Godot leerá estos mismos `.json` tal cual.

## Normas

1. **JSON normal**, sin comentarios. La clave `"_"` de cada archivo es su descripción; el juego la ignora.
2. **Los identificadores no se cambian** (`super`, `marxista`, `nevera`…): las partidas guardadas los llevan dentro. Añadir, sí; renombrar o borrar, no.
3. **El orden cuenta**: es el orden en que salen en menús y listas. Lo nuevo, al final de su sección, salvo que haya una lista `orden`.
4. **Los nombres cortos de los campos** (`n`, `e`, `d`…) son los que ya usaba el código. Abajo están los principales; para cualquier otro, búscalo en el código (`grep -n "\.tox" -r src mods`).
5. **Textos** como en `docs/BIBLIA.md`: castellano de España, frases cortas, femenino genérico (la función `L()` los adapta al personaje).
6. **Aquí no hay lógica.** Si una ficha necesita una condición o un efecto con código, la ficha va aquí y la función se queda en el código, unida con `conLogica(tabla,{id:{campo:función}})` (ver `OUT` y `GEST`).
7. **Textos con huecos.** Cuando una frase lleva dentro un nombre o una cifra, se escribe con huecos entre llaves: `"{p} sale del cole a las cinco."`. El código la rellena con `huecos(texto,{p:nombre})`. Hay dos huecos que se rellenan solos: `{n}`, el nombre del personaje, y `{o}`, la terminación de su género. Las condiciones (si llueve, si está en paro) no van en el texto: el código elige entre frases enteras.
8. Antes de entregar: `python3 scripts/datos.py` (comprueba sintaxis y que cada referencia exista) y `python3 scripts/datos.py --fmt` (deja el formato de la casa: una ficha por línea si cabe en 300 caracteres).
9. Un dato, un sitio. Si un módulo quiere cambiar un precio o añadir una ficha, se cambia aquí, no con `OBJ.x.p=…` al cargar.

## Qué hay en cada archivo

Campos comunes: `n` nombre · `e` emoji · `d` descripción.

### lugares.json
| Sección | En el código | Qué es |
|---|---|---|
| `lugares` | `PLACES` | Edificios del barrio. `r` rectángulo en el mapa `[x0,y0,x1,y1]` en casillas (la parcela de la casa va de 0 a 20) · `h` altura · `c` color · `roof`, `acc` colores de tejado y detalle · `glass`, `obra`, `park` aspecto · `outs` salidas que se hacen ahí. |
| `trabajo_en` | `destOf('work')` | A qué lugar va a trabajar cada sector. `_ride` = en la calle, repartiendo. |
| `salidas` | `OUT` | Lo que se hace fuera de casa. `dur` minutos · `h` horario `[desde,hasta]` · `wd` días de la semana (0 = lunes) · `days:'libre'` solo en días libres · `flex` se adapta al turno · `why` para qué sirve. La condición para poder ir (`req`) es código. |
| `salidas_necesidades` | `OUT_LIVE` | Lo que cada salida da o quita a cada necesidad por minuto. |
| `salidas_grupos` | `OUT_GROUPS` | Cómo se agrupan en el menú de salidas. |

### viviendas.json
| Sección | En el código | Qué es |
|---|---|---|
| `viviendas` | `HOMES` | Tipos de casa. `rent` alquiler semanal de base · `price` precio de compra de base · `buy` si se puede comprar · `build` qué se puede cambiar (`objs` solo muebles, `all` también obra) · `need` ingresos que pide el casero, en veces el alquiler · `cls` nivel de la vivienda (de −1, la calle, a 4) · `mates` cuántas personas más comparten el piso · `damp` humedades · `start` frase del primer capítulo. |
| `orden` | `HOME_ORDER` | Orden en el creador y al mudarse. |
| `compra` | `HOUSE` | Por dificultad: suministros (`util`), precio de la casa (`house`), entrada (`down`), interés (`rate`), años y gastos de compra (`closing`). |

### personas.json
| Sección | En el código | Qué es |
|---|---|---|
| `nombres`, `nombres_peques` | `NAMES`, `KIDNAMES` | Nombres por género (`f`, `m`, `x`). |
| `madres`, `amistades`, `vecindario`, `companeros` | `initPeople()` | De dónde salen las cuatro personas del principio. En las parejas `[nombre, letra]` la letra es la terminación (`a`, `o`, `e`). |
| `jefes_nombres`, `jefes_trato` | `BOSSN`, `BOSST` | Nombres de jefes y cómo se les llama en cada sector `[femenino, masculino]`. |
| `obreros` | `BUILDERS` | Nombres de quien viene a hacer obras. |
| `oficios`, `oficios_piso` | `newPerson()`, `MATE_JOBS` | Oficios de la gente que se conoce y de quien comparte piso `[femenino, masculino]`. |
| `vecinos` | `VECINOS` (`mods/poblacion.js`) | El censo del barrio (46 personas). `n` nombre o mote · `g` género · `edad` · `oficio` `[femenino, masculino]` · `ideo` ideología · `d` frase · `donde` `[[lugar, desde, hasta, [días]]]` (horas de 0 a 24, 0 = lunes; sin pisarse entre sí) · `hogar` id de `hogares` · `rol` su papel en casa · `trabajo` `null` o `{lugar, puesto [f,m], h [desde,hasta], dias}` (`lugar` es un lugar, que debe estar en `donde` a esas horas, o `"fuera"`, y entonces `donde` no lo pisa) · `estudia` `null`, `cole`, `instituto`, `fp` o `uni` (en horario de clase no salen en `donde`) · `historia` dos o tres frases · `lazos` `[[id, tipo]]` (el tipo es lo que es la otra persona para esta: `pareja`, `hija`, `hijo`, `madre`, `padre`, `hermana`, `hermano`, `abuela`, `abuelo`, `nieta`, `nieto`, `amiga`, `ex`, `casera`, `inquilina`, `jefa`, `empleada`, `mal_rollo`). Menores de 16: `oficio`, `ideo` y `trabajo` a `null`. Menores de 18: solo salen en parque, biblioteca, super, tienda, parroquia, comedor, ateneo, ambulatorio y gymbueno (desde los 14), y nunca después de las 22. |
| `edificios` | — | Dónde vive la gente. `n` nombre · `tipo` `bloque` o `casa` · `plantas` · `d` frase. |
| `hogares` | — | Quién vive junto. `n` nombre · `edificio` · `puerta` (solo en bloques) · `cls` 0 a 4 como en `viviendas` · `tipo` `familia`, `monoparental`, `pareja`, `sola`, `compartido` o `tres_generaciones` · `d` frase · `miembros` ids de `vecinos` (cada uno con su `hogar` de vuelta; todo menor de 18 con una persona adulta). |
| `personaje_base` | `DEFCHAR` | El personaje por defecto. |
| `orientacion`, `estilo_relacion`, `quiere_hijos`, `quiere_boda`, `etapas` | `ORIENT`, `RELSTYLE`, `KIDSW`, `BODAW`, `STAGE` | Opciones de vida y etapas de una relación, con su etiqueta. |
| `clases` | `CLASSN` | Nombre de cada posición de clase. |
| `rasgos` | `TRAITS` | Rasgos de personalidad. `no` rasgo incompatible · `cat` categoría · `hid` no se elige en el creador: se descubre jugando. |
| `rasgos_categorias`, `rasgos_objetos` | `TRAIT_CATS`, `FAVS` | Categorías del creador y objetos favoritos de cada rasgo. |

### profesiones.json
| Sección | En el código | Qué es |
|---|---|---|
| `sectores` | `TRACKS` | `sh` turno `[entrada,salida]` · `days` días (0 = lunes) · `levels` escalera de puestos: `t` puesto, `pay` sueldo por jornada de base, `req` jornadas (`shifts`) y habilidades para llegar · `cos` empresas · `tox` ambiente `[mín,máx]` · `org` facilidad para organizarse · `lay` riesgo de despido · `risk` accidentes. Marcas: `gig`, `auto`, `self`, `coop`, `opos`, `tips`; `needs` objeto imprescindible. |
| `orden`, `prob_contrato` | `TRK_ORDER`, `SEEK_BASE` | Orden en pantalla y probabilidad diaria de encontrar trabajo. |
| `habilidades` | `SKILLS` | `[id, emoji, nombre]`. |
| `empresas` | `COMPANIES` | Nombres para ofertas de trabajo. |
| `oficio_por_objeto` | `CRAFT` | Para montar o fabricar cada objeto: `[habilidad, nivel para montarlo, nivel para fabricarlo]`. |

### objetos.json
| Sección | En el código | Qué es |
|---|---|---|
| `objetos` | `OBJ` | Catálogo. `p` precio de lista en euros · `h` altura y `c` color del dibujo · `ins` margen dentro de la casilla · `need` lo que da a cada necesidad por minuto de uso · `verb` y `b` lo que se lee y el bocadillo mientras se usa · `sk` habilidad que entrena · `cat` pestaña de la tienda · `decor` puntos de decoración. Marcas: `quick` vale para una necesidad leve · `bed` sirve para dormir · `table` mesa con sillas · `food` coste de comida al usarlo · `wx` depende del tiempo · `lux`/`pobre` marcan clase · `green`, `light`, `flat`, `big`, `chair`. |
| `actividades` | `ACTV` | Lo que se puede hacer con cada objeto: `[clave, emoji, nombre, minutos, habilidad, nivel mínimo, coste, {necesidad: cambio por minuto}, final]`. `final` es la clave del efecto al terminar (código). |
| `calidades` | `TIERS` | De peor a mejor: multiplicadores de precio (`price`), eficacia (`eff`) y desgaste (`wear`). |
| `desgaste` | `WEARMUL` | Cuánto se gasta cada objeto con el uso. |
| `zonas`, `zonas_orden` | `ZONES`, `ZONE_ORDER` | Tipos de habitación y tamaños que propone la obra. |
| `zonas_por_objeto`, `zona_de`, `grupo`, `habitacion_de` | `OBJ_ZONES`, `ZONE_OF`, `GROUP`, `ROOM_FOR` | Dónde puede ir cada objeto, qué habitación define y cómo se agrupa. |
| `compra_por_necesidad` | `NEED_BUY` | Qué comprar primero para cada necesidad. |
| `suelos`, `suelos_orden`, `paredes` | `FLOORS`, `FLOOR_ORDER`, `WALLCOLS` | Suelos (`p` precio por casilla, `pat` dibujo) y colores o papeles de pared `[color, nombre, dibujo, color del dibujo]`. |
| `cultivos` | `CROPS` | Huerto. `d` días que tarda en crecer · `s` estaciones buenas para sembrarlo · `y` cosecha. |

### libros.json
| Sección | En el código | Qué es |
|---|---|---|
| `catalogo` | `BOOKCAT` | `[título, minutos de lectura, emoji, categoría, precio base, efecto]`. Categorías: `novela`, `ensayo`, `manual`, `oficio`, `texto`. Efectos: `sk` habilidad, `wr` escribir, `art` pintar. |
| `fichas` | `BOOK_META` | Por título: `[autor, reseña]`. |
| `en_casa` | `BOOKS` | Los que ya hay en casa al empezar. |
| `cursos`, `recetas` | `COURSES`, `RECIPES` | Cursos online `[nombre, minutos, habilidad]` y recetas `[nombre, nivel de cocina, emoji]`. |
| `escritos`, `titulos`, `canciones`, `prendas` | `WR_KINDS`, `WR_TITLES`, `SONGW`, `ARTW` | Lo que el personaje escribe (`h` horas), y títulos para lo que escribe, compone y cose. |

### estudios.json
| Sección | En el código | Qué es |
|---|---|---|
| `niveles`, `orden` | `EDU_LV`, `EDU_ORDER` | Niveles de estudios (`o` altura del nivel). |
| `programas` | `EDU_PROGS` | `lv` nivel que da (o `cert`, un certificado) · `h` horas · `cost` matrícula · `req` niveles previos · `sk` habilidad · `sched` horario y `days` días de clase · `place` dónde. |
| `requisitos`, `sueldo` | `EDU_REQ`, `EDU_PAY` | Estudios que pide cada sector y cuánto sube el sueldo con cada título. |

### interacciones.json
| Sección | En el código | Qué es |
|---|---|---|
| `gestos` | `GEST` | Lo que se hace con alguien que está en casa. Cuándo se puede y qué pasa (`ok`, `cost`, `run`) es código, en `mods/relaciones.js` e `intimo.js`. |
| `menu_persona` | `PE_LBL` | Etiquetas del menú de cada persona. |
| `convivencia_frases`, `convivencia_dialogos` | `CV_LINES`, `CV_PAIR` | Lo que se dice en casa: `[frase, respuesta]` por tipo de conviviente, y entre convivientes. |
| `movil_respuestas` | `PH_REP` | Por tipo de mensaje, las respuestas posibles: `[etiqueta del botón, efecto en la relación, acción (código), lo que contesta la otra persona, lo que escribe el personaje]`. Sin último valor, escribe lo que va entre «» en la etiqueta. `{o}` se cambia por la terminación del personaje. |
| `agenda`, `agenda_horas` | `AG_ITEMS`, `AG_SLOTS` | Lo que se puede poner en el horario semanal `[clave, emoji, nombre, qué hace falta]` (`out` = es una salida; si no, el mueble o la situación que necesita) y las horas disponibles. |

### ideologias.json
| Sección | En el código | Qué es |
|---|---|---|
| `ideologias` | `IDEOS` | `fx` lo que se cuenta al elegirla · `tracks` sectores afines · `union`, `strike` propensión a afiliarse y a la huelga · `neg` negociación a solas · `org`, `inf` cuánto organiza e influye · `act` salidas preferidas con su peso · `vote` gobierno al que vota · `org_n` cómo llama a su organización · `th` pensamientos en voz alta. |
| `orden`, `compromiso`, `izquierda`, `derecha` | `IDEO_ORDER`, `COMP`, `LEFT`, `RIGHT` | Orden en pantalla, grados de compromiso y bloques. |
| `reparto` | `IDEO_DIST` | Peso de cada ideología entre la gente del barrio. |
| `cambio`, `motivos` | `SHIFT_TXT`, `WHYTXT` | Textos de cuando el personaje cambia de ideas (`L` izquierda, `R` derecha, `A` apolítica) y de por qué. |
| `voces` | `VOZ` | Lo que escribe la gente al móvil: por gobierno o era, y por ideología de quien escribe. En `comunas` se usan las de `consejos`. |
| `local` | `POL_X` | El local político de cada ideología: colores, retratos, libros, pancarta. |

### gobiernos.json
| Sección | En el código | Qué es |
|---|---|---|
| `gobiernos` | `GOVS` | Nombre y resumen (`fx`) de cada gobierno o era. |
| `ciclos` | `CYS` | El ciclo de cada sistema (`docs/SISTEMAS.md`): `t` nombre de su tensión · `v` velocidad a la que crece · `sig` las tres señales que avisan, en orden. |
| `smi_anual` | `FS_SMI` | Salario mínimo anual de referencia. |
| `fiscal` | `FS_GOV` | Impuestos de cada gobierno, completos (sin herencias entre fichas): `tr` tramos de IRPF `[hasta, tipo]` · `ssw`, `sse` cotizaciones de quien trabaja y de la empresa · `min` mínimo exento · `smiTo` renta anual por debajo de la que no se paga IRPF · `iva` · `ah` tramos de rentas del capital · `ibi` · `soc` sociedades · `gana`, `pierde` a quién beneficia y a quién no. |
| `fases_consejos` | `GV_PH` | Las fases por las que llega el gobierno de consejos: `[días desde el cambio, título, qué cambia]`. |
| `quejas_consejos`, `quejas_mercado` | `REV_QUEJAS`, `MER_QUEJAS` | Lo que se oye en la calle en esos sistemas. |
| `banco` | `BKM` | Productos del banco según sea privado, público o estatal. |

### reglas.json
| Sección | En el código | Qué es |
|---|---|---|
| `necesidades` | `NEEDS` | `[id, emoji, nombre, caída por minuto]`. |
| `peso_necesidad`, `verbo_necesidad`, `pista_necesidad`, `ordenes` | `WEIGHT`, `NEEDNAME`, `HINT`, `CMDS` | Prioridad de cada necesidad, cómo se nombra y los botones de orden directa. |
| `dificultades`, `dificultades_orden` | `DIFF`, `DIFF_ORDER` | Multiplicadores de sueldo (`pay`), precios (`price`) y alquiler (`rent`), dinero inicial (`money`) y descripción. |
| `dias`, `dias_corto`, `meses`, `festivos`, `tipo_dia` | `WDL`, `WDS`, `MONTHS`, `FESTIVOS`, `DAYNAME` | Calendario. Festivos: `[mes desde 0, día, nombre]`. |
| `estaciones`, `tiempo`, `tiempo_prob` | `SEASONS`, `WX`, `WXP` | Estaciones, tipos de tiempo y su peso en cada estación. |
| `salud` | `HP_DEF` | Problemas de salud. `med` coste semanal de la medicación (`med`/8 horas de salario) · `chronic` si es para siempre. |
| `diario_actividad`, `diario_apertura` | `ACTIVITY`, `OPEN` | Frases con las que el diario resume lo que se hizo y abre el día según el tiempo. |

### sucesos.json
| Sección | En el código | Qué es |
|---|---|---|
| `dilemas` | `DLG` (`DT` en el código) | Los textos de cada dilema, por id: `t` título · `x` cuerpo (si cambia según el caso, un objeto con una frase por caso) · `o` opciones `[{t, s, …}]`: `t` etiqueta, `s` letra pequeña, y las frases de lo que pasa al elegir con nombre propio: `tell`, `tell_ok`/`tell_ko`, `chose`, `rem` (`remember`), `cap`/`capx` (título y texto de `chapter`). Si las opciones dependen del caso, `o` es un objeto con una lista por caso (`contra`, `incidente`) y `o_sin` es la opción de relleno cuando falta la persona. Las listas de frases al azar (`casos`, `dias`, `tareas`…) las elige `pickR`. Condiciones, efectos y `auto` son código, en `src/core/058`, `068`, `mods/jornada.js` y `mods/crianza.js`. |

## Lo que todavía está en el código

Queda para la segunda pasada del paso 0, porque ahí el texto va mezclado con condiciones y efectos:

- **Sucesos con decisiones**: consecuencias (`CQ`), golpes e incidentes (`GOLPES`, `PERSONAL`, `INCID`), hitos (`BEATS`), arcos de ideología (`ARCS`), rasgos ocultos de la gente (`HID`), aspiraciones y objetivos (`ASP`, `GOALS`), dilemas de la comunidad (`UT_DIL`).
- **Textos sueltos dentro de funciones**: los `tell()`, `toast()` y `chapter()` de cada módulo, y las plantillas de mensajes y noticias del móvil.
- **Escenas** (`SCENES`): los interiores se dibujan con código; sus carteles y su gente van dentro.
- **Aspecto**: peinados, caras, ropa y retratos (`LOOKS`, `LOOK_SRC`), y el dibujo de cada mueble (`MDRAW`).
- Tablas menores por objeto (`BACKD`, `ACTS`, `ELECTRIC`, `SMALL_ITEMS`, `MUEB_NEW`) y los eslóganes de las ideologías en las pancartas.
