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
| `lugares` | `PLACES` | Edificios de la ciudad. `barrio` id de `ciudad.json` (`@casa` en `casaV` y `casa2`: están en el barrio donde vive el personaje) · `rb` rectángulo `[x0,y0,x1,y1]` en casillas locales de su barrio (el que usa el mapa) · `h` altura · `c` color · `roof`, `acc` colores de tejado y detalle · `glass`, `obra`, `park` aspecto · `outs` salidas que se hacen ahí · `abre` cuándo está abierto al público: `[[desde,hasta,[días]],…]`, horas de 0 a 24 (puede ser decimal: 21.5 = 21:30), días con 0 = lunes. Una franja por tramo (un súper de 9 a 21:30 de lunes a sábado es `[[9,21.5,[0,1,2,3,4,5]]]`; un comercio con cierre a mediodía lleva dos). Un `hasta` mayor de 24 cierra de madrugada del día siguiente (`26` = las 2:00). Los días que no salen en ninguna franja, cerrado; los festivos cuentan como domingo salvo en lo que está abierto los siete días. Lo llevan todos los lugares menos las casas particulares (`casaV`, `casa2`). Hoy solo lo lee la ficha del mapa (`mods/barrio.js`); el horario de cada salida sigue siendo el `h` y `wd` de la salida, que es el que manda al jugar. `colegio` (público, 3 a 11 años), `concertado` (3 a 16) e `instituto` (12 a 17) son los tres centros de estudios: su gente y sus escenas, en `mods/escuela.js`. |
| `solo_mapa` | `DATA.lugares.solo_mapa` (`mods/barrio.js`) | Lugares nuevos que solo existen en el mapa: sin escena interior, sin salidas, no están en `PLACES`. `n`, `e`, `d`, `abre` (como en `lugares`), `barrio`, `rb`, `h` altura, `c` color y `solar` (un descampado con vallas en vez de un cubo). Entre 6 y 12. En su ficha: horario y «Sin interior». |
| `trabajo_en` | `destOf('work')` | A qué lugar va a trabajar cada sector. `_ride` = en la calle, repartiendo. |
| `salidas` | `OUT` | Lo que se hace fuera de casa. `dur` minutos · `h` horario `[desde,hasta]` · `wd` días de la semana (0 = lunes) · `days:'libre'` solo en días libres · `flex` se adapta al turno · `why` para qué sirve. `cole` (recoger a la criatura a la salida) y `tutoria` (de 16 a 18) solo salen si el personaje tiene una criatura en edad escolar. La condición para poder ir (`req`) es código. |
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
| `vecinos` | `VECINOS` (`mods/poblacion.js`) | El censo de la ciudad (263 personas en 113 hogares y 38 edificios, repartidos por los cinco barrios residenciales; `scripts/datos.py` comprueba nombres sin repetir, nadie en dos sitios a la vez, un puesto de trabajo en cada lugar con escena, todo menor con colegio o instituto, y las proporciones de paro y jubilación). `n` nombre o mote · `g` género · `edad` · `oficio` `[femenino, masculino]` · `ideo` ideología · `d` frase · `donde` `[[lugar, desde, hasta, [días]]]` (horas de 0 a 24, 0 = lunes; sin pisarse entre sí) · `hogar` id de `hogares` · `rol` su papel en casa · `trabajo` `null` o `{lugar, puesto [f,m], h [desde,hasta], dias}` (`lugar` es un lugar, que debe estar en `donde` a esas horas, o `"fuera"`, y entonces `donde` no lo pisa) · `estudia` `null`, `cole`, `instituto`, `fp` o `uni` (en horario de clase no salen en `donde`) · `centro` (quien estudia `uni`: `uni_publica` o `uni_privada`, y en horario de clase está allí, de `mods/universidad.js`; quien estudia `cole` o `instituto`:) `colegio`, `concertado` o `instituto`: dónde pasa la mañana de lunes a viernes no festivo (cole 9–14, con comedor hasta las 16 para parte; instituto 8:30–14:30), de `mods/escuela.js`. Quien trabaja en un centro lo lleva en `trabajo.lugar` · `historia` dos o tres frases · `lazos` `[[id, tipo]]` (el tipo es lo que es la otra persona para esta: `pareja`, `hija`, `hijo`, `madre`, `padre`, `hermana`, `hermano`, `abuela`, `abuelo`, `nieta`, `nieto`, `amiga`, `ex`, `casera`, `inquilina`, `jefa`, `empleada`, `mal_rollo`). Menores de 16: `oficio`, `ideo` y `trabajo` a `null`. Situación (no hay campo propio, sale del `oficio`): `jubilada…` (jubilación), `parada…` (paro), `cuidadora en casa` (cuidados sin pagar), `… sin contrato` (economía sumergida, con `trabajo.lugar` `fuera`), o `estudia`. El primer `puesto` de `trabajo` (forma femenina) es la clave de `trato.oficios`. Menores de 18: solo salen en parque, biblioteca, super, tienda, parroquia, comedor, ateneo, ambulatorio y gymbueno (desde los 14), y nunca después de las 22. |
| `edificios` | — | Dónde vive la gente. `n` nombre · `tipo` `bloque` o `casa` · `plantas` · `d` frase. |

### barrio.json
| Sección | En el código | Qué es |
|---|---|---|
| `edificios` | `mods/barrio.js` | Dónde se ve en el mapa cada edificio de `personas.edificios` (ni uno más ni uno menos). `barrio` id de `ciudad.json` · `rb` rectángulo `[x0,y0,x1,y1]` en casillas locales de su barrio, sin pisar calles ni otros edificios · `rotulo` nombre corto del rótulo · `c` color de la fachada · `roof` tejado (casas) · `det` detalle dibujado: `local`, `huerto`, `parra`, `patio` o `adosada`. Su puerta está en `ciudad.json`, en la calle que dice su nombre. |
| `hogares` | — | Quién vive junto. `n` nombre · `edificio` · `puerta` (solo en bloques) · `cls` 0 a 4 como en `viviendas` · `tipo` `familia`, `monoparental`, `pareja`, `sola`, `compartido` o `tres_generaciones` · `d` frase · `miembros` ids de `vecinos` (cada uno con su `hogar` de vuelta; todo menor de 18 con una persona adulta). Un hogar sin miembros (un piso turístico, por ejemplo) lleva `vacio` con su texto y no tiene gente. |
| `personaje_base` | `DEFCHAR` | El personaje por defecto. |
| `orientacion`, `estilo_relacion`, `quiere_hijos`, `quiere_boda`, `etapas` | `ORIENT`, `RELSTYLE`, `KIDSW`, `BODAW`, `STAGE` | Opciones de vida y etapas de una relación, con su etiqueta. |
| `clases` | `CLASSN` | Nombre de cada posición de clase. |
| `rasgos` | `TRAITS` | Rasgos de personalidad. `no` rasgo incompatible · `cat` categoría · `hid` no se elige en el creador: se descubre jugando. |
| `rasgos_categorias`, `rasgos_objetos` | `TRAIT_CATS`, `FAVS` | Categorías del creador y objetos favoritos de cada rasgo. |

### ciudad.json
La ciudad por barrios (`mods/barrio.js`; `scripts/datos.py` la comprueba entera). Cada barrio tiene su propia cuadrícula de calles en casillas locales (1 casilla = 5 m, la misma de la casa y de las escenas) y un rectángulo en el plano de la ciudad (1 unidad = 100 m, así que un barrio de 6×5 unidades mide 120×100 casillas). Andando, 12 min por km.
| Sección | Qué es |
|---|---|
| `ciudad` | `n` nombre · `m_casilla`, `m_plano` metros · `min_km` minutos a pie por km (12). |
| `orden`, `vivienda` | Orden de los barrios y barrio de cada tipo de `viviendas` (el personaje vive ahí, y ahí están `casaV` y `casa2`). |
| `barrios` | `n` · `tipo` (`centro`, `nuevo`, `residencial`, `obrero`, `marginal`, `industrial`) y `tipo_n` · `e` emoji · `c` color · `alquiler` (1 = la media de la ciudad) · `d` quién vive y quién manda, `bueno`, `cuesta` · `plano` `[x0,y0,x1,y1]` · `calles` `[{n, a, b, w}]` rectas horizontales o verticales (de `a` a `b`, `w` ancho; se cruzan y se tocan en nodos sin más) · `puertas` `{id: [x, y, calle]}`: el punto del eje de la calle donde está la entrada de cada lugar, edificio del censo y casa (a menos de `w/2+2,5` de su fachada; los del censo, en la calle de su dirección) · `casa` `{casa, casaV, casa2}` rectángulos, solo en los barrios de `vivienda` · `arboles`. |
| `enlaces.pie` | Barrios que se tocan a pie: `a`, `b`, `pa`, `pb` (el punto de paso en cada uno, sobre una calle y en el mismo sitio del plano) y `m` metros del paso. |
| `enlaces.lineas` | `id`, `n`, `modo` (`metro`, `bus`, `tren`), `c` color, `cada` minutos entre coches (se espera la mitad), `precio_h` horas de salario por billete (`hrs(precio_h)` en euros), `paradas` `[{b, n, p}]` y `min` (minutos entre paradas consecutivas). De cualquier barrio se llega a cualquier otro (lo comprueba `datos.py`, que además avisa de quién vive y trabaja en barrios distintos). |

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
| `privada` | `UNI_D` | Pública o privada para los programas con `place: 'uni'`. `centros` nombre, lugar, tamaño de grupo y cansancio extra por hora de clase · `mult` cuánto se multiplica `cost` en la privada, por nivel · `sched`, `days` su horario · `examenes` meses (0 = enero) y día del mes desde el que hay exámenes. La elección se guarda en la matrícula (`cur.centro`; si falta, pública). |
| `requisitos`, `sueldo` | `EDU_REQ`, `EDU_PAY` | Estudios que pide cada sector y cuánto sube el sueldo con cada título. |

### interacciones.json
| Sección | En el código | Qué es |
|---|---|---|
| `gestos` | `GEST` | Lo que se hace con alguien que está en casa. Cuándo se puede y qué pasa (`ok`, `cost`, `run`) es código, en `mods/relaciones.js` e `intimo.js`. |
| `menu_persona` | `PE_LBL` | Etiquetas del menú de cada persona. |
| `convivencia_frases`, `convivencia_dialogos` | `CV_LINES`, `CV_PAIR` | Lo que se dice en casa: `[frase, respuesta]` por tipo de conviviente, y entre convivientes. |
| `movil_respuestas` | `PH_REP` | Por tipo de mensaje, las respuestas posibles: `[etiqueta del botón, efecto en la relación, acción (código), lo que contesta la otra persona, lo que escribe el personaje]`. Sin último valor, escribe lo que va entre «» en la etiqueta. `{o}` se cambia por la terminación del personaje. |
| `agenda`, `agenda_horas` | `AG_ITEMS`, `AG_SLOTS` | Lo que se puede poner en el horario semanal `[clave, emoji, nombre, qué hace falta]` (`out` = es una salida; si no, el mueble o la situación que necesita) y las horas disponibles. |
| `vecinos_ficha` | `VCF()` (`mods/vecinos.js`) | Conocer a los vecinos del censo. Etiquetas de la ficha (`presentarse`, `charlar`, `ficha`, `cerrar`, `ir_casa`), `estudia` (qué se dice de quien estudia, por `estudia` del censo), `hijo_de` / `nieto_de` `[femenino, masculino]` con `{quien}` (lo que dice la ficha de una criatura de menos de 12), `lazo` por tipo de lazo `[si la otra es mujer o neutro, si es hombre]`, `via` el botón de «conocer a través de» `[ella, él]`, y las frases de resultado `bien`, `saludo`, `via_bien`, `via_saludo`, `charla` como `[título, línea]` con `{v}` (el vecino) y `{via}` (quien presenta). Lo que se ve de cada uno lo decide la relación: oficio al conocerle, historia con 35 o más, lazos con 55 o más (constantes `VC_HIST` y `VC_LAZOS`). |

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

El dilema `calentador_plazo` (diez días después del burofax) y los de colegio (`cr_cole`, `cr_cole_cambio`) siguen el mismo patrón; sus cifras (`{c}`, `{m}`, `{t}`, `{p}`, `{n}`…) las pone el código con `huecos()`.

La sección `centros` son los textos del curso de cada colegio (`colegio`, `concertado`, `instituto`), de `mods/escuela.js`: `sucesos` (`id`, `p` probabilidad por día lectivo, `tell` con `{k}` la criatura, `{c}` el coste, `{v}` un compañero del censo, `hap` y `social` lo que cambia, `gasto` en horas de salario), `puerta` (con quién coincide el personaje en la verja: `{a}` adulto del censo, `{v}` su criatura) y `mes` (el aviso del recibo mensual). Fuera de los tres, `huelga` (la huelga educativa de la pública, por cómo se cubre el día), `puntos` (las listas de admisión) y `impago`.

El dilema `calentador` lleva además `fin_burofax` y `fin_sindicato`: la frase del día en que por fin lo arreglan, según lo que se eligió. Y `toast` (el aviso corto de que ya hay agua caliente) y `vida` (`burofax enviado hace {d} días (plazo: {p})`, la línea de Vida → En casa).

### trato.json
Tratar con los vecinos (`mods/trato.js`). Secciones:
- `oficios`: por primer puesto del censo (`cajera`, `albañil`...), `acciones` con `id`, `e` (icono), `n` (nombre), `rel` (relación mínima), `p` (probabilidad de salir bien), `req` (condiciones), `ok` y `ko` como `[título, línea]`, `fx` y `fxko` (efectos). `nota` es una línea de contexto sin acción.
- `lugares`: lo mismo, según dónde está el vecino (`bar`, `super`, `parque`...). Las claves son ids de `lugares.json`.
- `favores`: `pedir` (le pides algo) y `pide` (te lo pide a ti, con `modo` `ya` o `visita`). Cada uno con `msg`, `ok`, `ko` o `rechazo`, `fx`, `mem` (la nota de «te debe una» / «le debes una»).
- `cotilleo`: textos del chisme que descubre una `historia` o un `lazo` real del censo.
- `politica`: afinidad entre ideologías (`cercanas`, claves de `ideologias.json`), reacciones y textos de organizar el bloque.
- `romance`: `edad_min` (nunca menos de 18), `dif_edad`, pesos de `orientacion` (suman 1) y rechazos.
- `buscan`: mensajes del móvil (`mensajes`, con `rel`, `req`, `resp`) y visitas (`visita`).
- `ficha`: textos de la interfaz y del diario.

Efectos (`fx`): rel, social, diversion, hambre, energia, coste_h, fiar_h, presta_h, presto_h, pista, despensa, agua, hijos_hap, mov, sol, te, chisme. Condiciones (`req`): huerto, hijos_cole, con_trabajo, en_paro, trabajo_dentro, ella_hijos, bloque, politica, justa, solvente. Huecos: `{v}`, `{x}`, `{y}`, `{k}`, `{c}`, `{n}`, `{o}`, `{quien}`, `{sitio}`, `{frase}`, `{que}`, `{st}`, `{l}`, `{why}`. `datos.py` lo comprueba todo.

<!-- p0b -->
### textos_mods_ag.json
Los textos sueltos de los módulos de `mods/` de la «a» a la «g» (`agenda` … `gym`): lo que cuentan `tell()`, `toast()` y `chapter()`, las líneas del móvil, las fichas de interfaz y los dilemas de la comunidad. Una sección por módulo, con el nombre del módulo (`colectivo`, `comunidad`, `crianza`, `curro`, `entrevista`, `ducha`, `energia`, `facturas`, `ciclos`, `gobierno`, `fiscal`, `banco`, `banco2`, `banco3`, `casa`, `comidas`, `estudios`, `final`, `fregar`, `cocinar`, `convivencia`, `gente_menu`, `encadenar`, `agenda`, `body3d`); la clave `_` es la nota del archivo. Cada módulo lo lee con `const {modulo:TX_modulo}=DATA.textos_mods_ag;` al principio.
- Una frase es un texto; una variante al azar es una lista que el código elige con `pickR(TX_x.clave)` en el mismo punto donde antes estaba la lista (el orden de los sorteos no cambia).
- Huecos: `{clave}` los rellena el código con `huecos(texto,{clave:…})`; `{n}` es el nombre del personaje y `{o}` la terminación de su género (donde el original usaba `oa()`). El resto del género (`ga`, `L`, `.replace(…,ga(…))`) se queda en el código: la palabra variable llega como hueco (`{rev}`, `{otras}`) o como lista de tres formas (`reventado_g`: `[ella, él, elle]`).
- `comunidad`: `tipos` y `nombres` (las fichas de cada tipo de comunidad) y `dilemas` (`UT_DIL`): `t` título y `o` opciones `{t, r}` donde `r` es el texto del resultado o un objeto con un texto por desenlace; los efectos siguen en `UT_FX`, en el código.
- `banco`: `bancos` (`pub`/`priv`: nombre y rótulos de cada modo, que `gobierno` también lee), `mov` (los conceptos de los movimientos con huecos `{emp}`, `{arr}`, `{banco}`) y `categorias`.
- `final`: el texto del final de la partida, por piezas que `finalText()` junta con `huecos()`.
- Se queda en el código lo que es una clave hacia otro módulo (el id de un lugar, una acción, un tipo de objeto), el dibujo (`SCENES`, `MDRAW`, `LOOKS`, colores y rótulos pintados en el canvas) y los trozos de HTML que son estructura sin texto propio.
- `datos.py` comprueba que cada sección es un módulo de `build.json`, que el módulo la lee, que las claves son legibles y que ningún texto está vacío, lleva `${…}` o tiene llaves sin cerrar. `t/t_txt_p0b.js` comprueba que cada texto de más de 12 caracteres que había en esos módulos antes de moverlos sigue existiendo, igual, en el código o aquí.
<!-- /p0b -->
<!-- p0c begin: textos de los módulos de la «h» a la «z» -->
### movil.json
Todo lo que dice el móvil (`mods/movil.js`). Los pesos de cada mensaje, las condiciones para que salga (en paro, en huelga, de noche…) y el azar son código; el texto, aquí. Huecos: `{n}` el personaje, `{o}` su terminación, `{kid}` «hijo/hija/hije», `{nov}` «novio/novia/novie», `{po}` y `{po2}` la terminación de la otra persona, `{p}` su nombre.
| Sección | Qué es |
|---|---|
| `apps` | Las aplicaciones de la pantalla de inicio: `[clave, emoji, nombre, color]` (`APPS`). |
| `plantillas` | Los mensajes que escribe la gente, por tipo de persona (`madre`, `amor`, `compi`, `vecina`, `amiga`, `ex`, `conocida`) y mensaje: `t` el texto y `r` el tipo de respuesta (una clave de `interacciones.movil_respuestas`) o la lista de respuestas `[etiqueta, relación, acción, lo que contesta, lo que escribe]`. |
| `libre` | Lo que contesta la gente cuando escribes tú, por palabra clave (`perdon`, `gracias`, `estudio`, `plan`, `afecto`…): un objeto con una entrada por tipo de persona (`madre`, `amor`, `compi`, `amiga`) y `otro` para el resto; cadena = una frase, lista = al azar. `rapidas` son las respuestas a los tres botones de «¿Qué tal?»; `sin_plan`, a un plan que no puede ser. |
| `noticias` | Las noticias del día: cada bloque lleva su emoji (`e`), la frase o lista de frases (`frases`, que se elige por el día) y el subtítulo (`sub`). `crisis_alta`, `crisis_media` y `crisis_baja` son `[emoji, titular, subtítulo]`. |
| `feed`, `publicar` | Publicaciones de la gente (por tipo de persona) y lo que publica el personaje. |
| `llamada`, `avisos`, `ui` | Las llamadas, los avisos cortos y todas las etiquetas del móvil (mensajes, banco, red social). |

### textos_mods_hz.json
Los textos sueltos (`tell`, `toast`, `chapter`, etiquetas y texto dentro de las fichas HTML) de los módulos `mods/` de la «h» a la «z» (hogar, hogares, huelga, huesped, intimo, jornada, lectura, libros, marginal, mente, obras, patrimonio, peso, poblacion, productos, relaciones, reparto, resvida, rutina, servicios, social_fx, texto, tocar, trato, universidad, vecinos, visitas, voces…). Una sección por módulo, con su nombre; dentro, una clave por texto. El código los lee con `TXHZ.modulo.clave` (`TXHZ` se declara en `mods/resvida.js`). Las cadenas con cifras o nombres llevan huecos `{clave}` y el código las rellena con `huecos(TXHZ.hogar.calentador_muerto,{enero:…,quien:…})`; las variantes al azar son listas (`pickR(TXHZ.mente.…_lista)`). Cuando una frase cambia según el caso, cada caso es su propia clave y el código elige entre ellas. `datos.py` comprueba que cada clave que lee el código existe y que cada hueco del texto lo rellena alguien.
Quedan en el código, a propósito: las palabras clave con las que `phFree` entiende lo que escribe el jugador (`te echo de menos`, `buenas noches`…), los identificadores y las claves de estado que se comparan (`solo en días libres`, `amig`+terminación…), y el esqueleto HTML (etiquetas, clases y estilos).
<!-- p0c end -->
<!-- p0a:inicio -->
### sucesos.json (secciones `nucleo_*`, paso 0 segunda pasada, parte `p0a`)
Las tablas de sucesos del núcleo (`src/core`). Aquí van los textos y las cifras; las condiciones y los efectos siguen en el código y se unen por `id` (`conLogica`, o `porId` para listas de fichas con `id`). Los textos llevan huecos `{k}` que rellena `huecos()`; `{n}` es el nombre del personaje y `{o}` su terminación si el código no los da.
| Sección | En el código | Qué es |
|---|---|---|
| `nucleo_consecuencias` | `CQ` (059, 069) | Los textos de las consecuencias que llegan más tarde, por id. |
| `nucleo_golpes` | `GOLPES` (066) | Golpes de dinero: cifras (`k`, `a`, `v`) y textos. |
| `nucleo_personal` | `PERSONAL` (067) | Golpes personales (`madre`, `vecina`, `amiga`…). |
| `nucleo_incidentes` | `INCID` (065) | Incidentes por oficio. |
| `nucleo_hitos` | `BEATS` (064) | Hitos de la temporada. |
| `nucleo_arcos` | `ARCS` (043) | Arco de cada ideología: lista de fichas con `id`. |
| `nucleo_rasgos_ocultos` | `HID` (053) | Rasgos ocultos de la gente: `d`, `txt`, `izq` y los campos fijos; `rev`, `onRev`… siguen en el código. |
| `nucleo_aspiraciones` | `ASP`, `ASPS`, `ASP_CAT` (073) | `lista` (fichas con `id`), `sin`, `categorias`. |
| `nucleo_objetivos` | `GOALS` (091) | `lista` de objetivos de la casa (`id`, `t`, `r`) y `toast`. La condición `ok` es código. |

### textos_nucleo.json (paso 0 segunda pasada, parte `p0a`)
Textos sueltos del núcleo: lo que dicen `tell`, `toast`, `chapter`, `remember` y las etiquetas de interfaz. Una sección por archivo de `src/core`, con nombre legible; el código los lee de `const TXN=DATA.textos_nucleo` (`TXN.sección.clave`). Un texto es una cadena (con huecos `{k}` si lleva nombres o cifras), una lista (el código elige con `pickR`) o un objeto indexado por un id que el código ya tiene. Las claves no empiezan por cifra. Lo que no es texto (ids de etapa, claves de estado, comparaciones) se queda en el código.
| Sección | Archivo del núcleo |
|---|---|
| `ordenes` · `vivienda` · `suministros` · `trabajo_y_sucesos` | 026 · 027 · 028 · 029 |
| `historia` · `diario` · `pensamientos` · `jardin` · `profesiones` | 037 · 038 · 039 · 040 · 041 |
| `politica` · `sindicato` · `mundo` · `escenas` | 044 · 045 · 046 · 047 (solo textos, nada de dibujo) |
| `acciones` · `acciones_semana` · `visitas` · `gente` | 048 · 049 · 050 · 051 |
| `rasgos_ana` · `ideologia` · `desgaste` | 054 · 055 · 056 |
| `dilemas_motor` · `autodescubrimiento` · `interfaz_ana` · `consecuencias_nuevas` | 058 · 060 · 062 · 069 |
| `efectos` · `plantillas` · `obras` · `alquiler_compra` · `convivientes` | 073 · 074 · 075 · 076 · 077 |
| `tipos_de_casa` · `mudarse` · `interfaz_casa` | 078 · 079 · 080 |

`scripts/datos.py` comprueba que cada `TXN.sección.clave` del código exista, que no haya llaves sueltas ni claves que empiecen por cifra y que estén las secciones `nucleo_*`.
<!-- p0a:fin -->
<!-- p0d begin: textos de src/core 081–098 -->
### textos_nucleo.json · secciones de `src/core` 081–098 (paso 0, parte `p0d`)
Las secciones nuevas del mismo archivo (mismo patrón y misma lectura, `TXN.sección.clave`): lo que ve el jugador en la obra con el dedo, la ropa, los muebles nuevos, los retratos, los planes de Ana, el panel, el creador y el calendario. Lo que no es texto (ids, colores, dibujo, CSS, el esqueleto del HTML) se queda en el código; en las plantillas HTML largas (`096`, `097`, `098`) sale el texto de dentro, por tramos. Los huecos `{clave}` los rellena el código con `huecos()`; una frase que cambia según el caso son claves distintas y el código elige entre ellas.
| Sección | Archivo | Qué hay |
|---|---|---|
| `obra_tactil` | 081 | Tira de ayuda de la obra («Toca el inicio y luego el final…»), botones de la barra (Mover, Girar, Vender, Cancelar…), avisos de por qué no se puede construir (`no_llega`, `fuera_zona`…). |
| `ropa` | 082 | `outfits` (nombre y emoji de cada estilo; es la tabla `OUTFITS`), `accesorios` (`ACCS`), `ranuras` (`OSLOTS`: qué se elige en cada estilo), `mono` (nombres de los colores del estilo monocromo) y las etiquetas del creador. |
| `muebles_nuevos` | 084 | `deseos`: el porqué de cada compra que quiere Ana («para escuchar vinilos»), y los avisos de usar el mueble (siesta, abono, ropa arreglada). |
| `looks` | 089 | Por id de retrato: `n` nombre, `job` oficio y `bio` historia (las lee la tabla `LOOKS`, que conserva sus colores y rasgos de dibujo); `nombres_f` (nombres que se toman como femeninos) y las etiquetas de la tira de retratos. |
| `planes_ana` | 090 | Lo que Ana quiere hacer (`pasos`: nombre de cada paso de obra; `deseos` en claves sueltas), el aviso de cada obra y de cada arreglo, la etiqueta de lo que hace ahora (`uso_*`). |
| `deshacer` · `entrada` | 092 · 094 | Un aviso cada uno. |
| `construir_comprar` | 093 | Avisos al comprar y construir, medidas de la vista previa (`valla_1`, `valla_n`, `pared_1`, `pared_n`…), y lo que dice Ana al tocar un mueble. |
| `interfaz` | 096 | El panel: pestañas (`pestanas`: `[id, emoji, nombre]`), perfil, historia, trabajo, casa, ajustes, elegir dificultad y los avisos de copiar y pegar la partida. |
| `creador` | 097 | El creador de personaje: etiquetas, opciones sueltas de raya, pendientes y gafas (`[id, texto]`) y lo que se cuenta al guardar. |
| `calendario` | 098 | Pantalla de calendario, barra de herramientas (`cats_obra`, `cats_compra`, `herr_*`), ayuda de cada herramienta (`h_*`), línea de «qué hace ahora» y el primer capítulo. |

Se queda en el código, a propósito: las palabras con las que el creador busca sus propios títulos en pantalla (`'Cara'`, `'Compl'`), los textos que son solo emoji o símbolo, y el dibujo (`LOOKS` sin `n`/`job`/`bio`, `LOOK_SRC`, `MDRAW`, `FPAT`). `scripts/datos.py` (bloque `p0d`) comprueba que las secciones existen, que cada hueco del texto lo rellena el código (y al revés) y que no hay textos vacíos ni `${…}`. `t/t_txt_p0d.js` comprueba que cada texto que había en esos archivos antes de moverlos sigue existiendo, igual, en el código o aquí.
<!-- p0d end -->
<!-- p0e -->
### Remate de los textos de `mods/` (paso 0, segunda pasada, parte `p0e`)
Sin archivos nuevos: claves nuevas en las secciones que ya había de `textos_mods_ag.json` (módulos de la «a» a la «g», `TX_modulo.clave`), `textos_mods_hz.json` (`TXHZ.modulo.clave`) y `movil.json` (`TXMV`). Lo que quedaba en el código era texto mezclado con concatenaciones y con el esqueleto HTML: se ha sacado por tramos (el marcado se queda, el texto sale), con `huecos()` donde llevaba cifras o nombres.
| Archivo | Sección | Qué se añadió |
|---|---|---|
| `textos_mods_ag.json` | `escuela` (nueva) | Lo que se cuenta al recoger a la criatura del cole (`cole_sale`) y en la tutoría (`tutoria`), con sus colas por tipo de centro (`cole_ext_publico`, `cole_ext_concertado`, `tutoria_ext_publico`, `tutoria_ext_concertado`; listas de 3 que el código elige con `pickR`), los nombres cortos de los centros, `la_criatura`, `una_companera` y los pronombres. |
| `textos_mods_ag.json` | `agenda` | La ficha «Mi semana»: título, «seguirla», la nota de la franja, «Trabajo de {a}:00 a {b}:00», «clase de», los tres botones y «Montar el horario». |
| `textos_mods_ag.json` | `banco` | `iban` (`ES21 0182 4411 {h} **** 2714`) y siete conceptos más en `mov` (`Devolución`, `Matrícula`, `Cuota autónomos`, `Transporte`, `Comedor del centro`, `Comunidad`, `Café`): antes salían en mayúsculas por el camino de «concepto desconocido» y ahora tienen su línea, con el mismo resultado. |
| `textos_mods_ag.json` | `colectivo`, `casa`, `estudios`, `gobierno` | `sol_planto` y `sol_desahucio` (las razones que apunta la red de solidaridad) y la conjunción de las listas («A y B», «A o B»): clave `y` u `o`. |
| `textos_mods_hz.json` | `libros`, `lectura`, `salud`, `productos`, `universidad`, `relaciones`, `patrimonio`, `trato`, `mente`, `social_fx`, `jornada`, `obras`, `texto`, `reparto`, `salidas`, `hogares`, `tocar`, `vecinos` | Las líneas de las tiendas y fichas de libros, la biblioteca y las pestañas de lectura, la ficha del cuerpo y los botones de gimnasio, seguro y dieta, el diagnóstico, las tarjetas de ahorro, inversión y préstamo, la matrícula en la pública y la privada, y las frases sueltas que quedaban en `tell()` y `toast()`. |
| `movil.json` | `ui` | `visto`. |
- Los textos que el código compara con un texto de otro archivo (las comparaciones de `outAvail(...)` con «solo en días libres») leen ahora `TXN.politica.solo_libres`, que ya estaba en `textos_nucleo.json`. Los títulos que los módulos usan como ancla para insertarse en una ficha (`<h3>🌍 El mundo</h3>`, `<h3>🫀 Cuerpo</h3>`, `<h3>🤝 Red</h3>`, `<h3>📚 Libros</h3>`) se construyen con la clave de datos que los pinta, no con una copia del texto.
- Se queda en el código, a propósito: ids, claves de estado y conceptos bancarios que se guardan en la partida (`bkAdd('Hucha',…)`, `Nómina`, `calentador`…), nombres de clase CSS y estilos, el esqueleto HTML, las palabras clave de `phFree`, los patrones con los que un módulo busca un texto que pinta otro (`replace(/EURÍBOR …/)`, `Comprar la casa`), la terminación de género que se resuelve con `ga()`, `L()` o un ternario sobre una sola letra, y todo lo que se pinta en el lienzo (rótulos y carteles de las escenas: `gText`, `eTxt`, `uT`, `svText`, `label`, `fillText`).
- `scripts/datos.py` (bloque `p0e`) comprueba que cada `TX_modulo.clave` y cada `TXN.sección.clave` que el código lee existe, que los huecos de `escuela.cole_sale` y `escuela.tutoria` los rellena el código y que cada concepto de `bkAdd`/`withCtx` tiene su línea en `banco.mov`. `t/t_txt_p0e.js` comprueba que cada texto de más de 12 caracteres que había en los módulos antes de moverlos, y cada texto corto que salió del código, sigue existiendo, igual, en el código o en `data/`.
<!-- /p0e -->

## Lo que todavía está en el código

Queda para la segunda pasada del paso 0, porque ahí el texto va mezclado con condiciones y efectos:

- **Sucesos con decisiones**: consecuencias (`CQ`), golpes e incidentes (`GOLPES`, `PERSONAL`, `INCID`), hitos (`BEATS`), arcos de ideología (`ARCS`), rasgos ocultos de la gente (`HID`), aspiraciones y objetivos (`ASP`, `GOALS`), dilemas de la comunidad (los textos de `UT_DIL` ya están en `textos_mods_ag.json`; los efectos siguen en `UT_FX`).
- **Sucesos con decisiones**: consecuencias (`CQ`), golpes e incidentes (`GOLPES`, `PERSONAL`, `INCID`), hitos (`BEATS`), arcos de ideología (`ARCS`), rasgos ocultos de la gente (`HID`), aspiraciones y objetivos (`ASP`, `GOALS`), dilemas de la comunidad (`UT_DIL`).
- **Escenas** (`SCENES`): los interiores se dibujan con código; sus carteles y su gente van dentro.
- **Sucesos con decisiones**: los dilemas de la comunidad (`UT_DIL`).
- **Textos sueltos dentro de funciones**: los `tell()`, `toast()` y `chapter()` de los mods, y las plantillas de mensajes y noticias del móvil (los de `src/core` 081–098 ya están en `textos_nucleo.json`).
- **Textos sueltos dentro de funciones**: los `tell()`, `toast()` y `chapter()` de los archivos de `src/core` desde el 081 (obra, ropa, muebles, looks, planes, creador, calendario…).
- **Escenas** (`SCENES`): los interiores se dibujan con código; los carteles y rótulos de cadena suelta ya están en `textos_nucleo.escenas`, el dibujo y su gente siguen dentro.
- **Aspecto**: peinados, caras, ropa y retratos (`LOOKS`, `LOOK_SRC`; los nombres, oficios y biografías de los retratos y los nombres de los estilos de ropa ya están en `textos_nucleo.json`), y el dibujo de cada mueble (`MDRAW`).
- Tablas menores por objeto (`BACKD`, `ACTS`, `ELECTRIC`, `SMALL_ITEMS`, `MUEB_NEW`) y los eslóganes de las ideologías en las pancartas.

## Para caminar (nota para quien haga que el personaje ande por la calle)

Todo lo que hace falta está en `mods/barrio.js` (funciones puras, sin `S`, probadas en `t/t_ciudad.js`):
- `cdBarrioDe(id)` → id del barrio de un lugar, un edificio del censo, un lugar de `solo_mapa` o `'casa'` (`casaV`/`casa2` van con la casa). `cdRect(id)` → su rectángulo local.
- `cdPuerta(id)` → `{b, p:[x,y], c}`: el barrio, el punto de la entrada (en el eje de la calle `c`) y el nombre de la calle. Es donde el personaje entra y sale; desde la fachada hasta ahí son 2–4 casillas rectas (la fachada visible es la del lado `y` mayor).
- `cdGrafo(b)` → `{nodes, adj}`: nodos en las puntas de calle, cruces, puertas, pasos y paradas; `adj` lleva `{k, l (casillas), c (calle)}`. Las calles son rectas horizontales o verticales: andar es ir de punto a punto.
- `cdCamino(b, a, c)` → `[[x,y],…]`: extremos y esquinas del camino a pie más corto entre dos puertas (ids) o puntos de nodo. `cdLong(pts)` casillas y `cdMinPie(pts)` minutos (0,12 min por casilla).
- `cdTrayecto(idA, idB)` → `{min, h, precio, tramos}`; tramos `pie` (`b`, `pts`), `paso` (de un barrio al vecino: `pa` en `de`, `pb` en `a`) y `metro|bus|tren` (`linea`, `de`, `a`, `paradas`, `espera`, `viaje`, `h`). Minutos de juego = minutos a pie; la espera es `cada/2`. Misma lógica en `datos.py` (`trayecto_py`).
- Ya se anda por la ciudad (`mods/caminar.js`): `r` y `routeTo` de `src/core/047` ya no existen; el sitio de cada lugar es `rb`. Las puertas del barrio de la casa son `casa`, `casaV` y `casa2`.
- `rb` sale del tamaño de la escena interior (la de `src/core/047`, a escala 1 casilla = 5 m): ancho y fondo de la planta, con la puerta centrada en el lado `y` mayor, a `ancho de la calle/2 + 1,6` casillas del eje (la acera mide 1,6). Si una escena cambia de tamaño, se cambia `rb` y se vuelve a pasar `scripts/datos.py`. La parcela de la casa (`casa` en `ciudad.json`) es de 20×20, como la cuadrícula de la casa; la de los vecinos (`casaV`, `casa2`) y los edificios del censo, de 11×8.
- Andar: `cmRuta(a, b)` (puertas o puntos `[barrio,x,y]`) devuelve los tramos con los puntos de la acera (`cmLane`: calles horizontales por el norte, verticales por la derecha); `cmFase()` y `cmPos()` dicen dónde está según los minutos que lleva fuera (`S.sim.tr = {a, b, from, pg}`: minutos de ida y de vuelta, origen y billetes ya pagados). Sin `tr` (partidas viejas) vale el viaje de siempre.
- Dibujo: `drawEntorno` (fase 0: el barrio con `bmSuelo`/`bmItems`, el interior abierto del sitio donde está, la gente por la calle; fase 1: ella y los rótulos). Los textos de caminar, en `data/caminar.json`.
- Dibujo: el barrio se pinta en `bmSuelo` (calles), `bmItems` (edificios por profundidad `x1+y1`) y `bmEspeciales` (postes de paso y paradas); una figura andando entra en `bmItems` con `d = x+y`.
- Prueba: `python3 scripts/test.py t/t_ciudad.js 60`; mapa a ojo: `t/t_barrio_ver.js` (cabecera con parámetros).
