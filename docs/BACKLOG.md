# Casita · backlog

Orden = prioridad. Cada tarea: rol, qué, hecho cuando, no tocar. Las marcadas ⚡ son independientes entre sí y pueden ir en paralelo.

## Ahora: mundo creíble

Orden del frente A (12 nov 2026): 1 población · 2 lugares · 3 interacciones y gente con la que tratar. Detalle en `docs/CASITA.md` §7.

### ✅ T-101 · El censo del barrio (46 personas, 15 hogares, 8 edificios: `data/personas.json`)
### ✅ T-102 · La gente del censo en las escenas (`mods/poblacion.js`, `t/t_censo.js`)
### ✅ T-103 · Casas visitables (`mods/hogares.js`)

### ✅ T-110 · Colegio público, concertado e instituto (`mods/escuela.js`) · ✅ T-112 · Universidad pública y privada (`mods/universidad.js`)
### ✅ T-104 · Rótulos que no se pisan y gente bien colocada (`mods/rotulos.js`, `mods/poblacion.js`) · ✅ T-105 y T-106 · Pulido en móvil de salud, empleo, casas y aulas

### ✅ T-107 · Huéspedes que duermen y se ven, acogida que dura (`mods/huesped.js`, `t/t_huesped.js`) · calentador de alquiler con decisión (`mods/hogar.js`, dilema `calentador`)

### T-121 · Pulido del mapa y de los vecinos
Rol: escenas + guion. Edificios de lugar con dibujo propio por tipo (hoy son cajas con rótulo); rótulos de las casas del censo que no tapen tejados; horario de súper, bar y obra en la ficha; romance con vecinos adultos; `SCENES.comedor` falla con acciones que no son suyas (hoy se esquiva desde `barrio.js`).

### ✅ (hecho) T-130 · La ciudad por barrios (`data/ciudad.json`, `mods/barrio.js`)

### ✅ (hecho) T-133 · Lugares nuevos con interior y vida de barrio (`mods/barrios_vida.js`, `data/barrios_vida.json`)

### ✅ (hecho) T-140 censo ampliado · T-141 piquetes, colas y rider · T-142 romance en Gente, ficha de barrio y equilibrio

### GD-10 · Godot, lo que queda de la fase 2 y arte
- Pintar paredes y cambiar suelos por estancia; recolorear muebles; levantar y tirar tabiques, puertas y ventanas.
- Prueba de aspecto: la misma habitación con el arte de ahora y «vestida» (texturas en suelos y paredes, luz suave, sombras de contacto), con peso y fluidez en móvil, para decidir el estilo.
- Solo tienen acciones los muebles del piso inicial; lavadora, sillón, escritorio, bañera, espejo, estantería y demás se compran y colocan pero no hacen nada todavía.
- La comida no cuesta dinero (nevera sin despensa). Las sillas no son sólidas. La cama no se puede girar 180° en el modo muebles (acceso por celdas de 1 m).
- Las personas no se estorban (el jugador puede quedar encima de la camarera).
- De lejos, el solar marrón de casa se vuelve verde (pelea de profundidad con la hierba).
- Catálogo de ciudad: faltan edificios singulares; coches de 2.000-2.500 triángulos; kits de tren y fábrica sin convertir.

### T-144 · Lo que quedó de la ciudad habitada
Rol: motor + datos. Hecho en T-143: averías por barrio, piquete que llega y se va, pancarta, manifestación con el personaje. Queda: (1) el rider cobra por entrega con la misma paga media (`profesiones.json` → `reparto`, `gig`); (2) menores de 12 yendo al colegio con su adulta y los 49 que trabajan «fuera» saliendo del portal a la parada (hoy 214 de 263 vistos en una semana); (3) convivir con vecinos que viven solos o en piso compartido; (4) con la manifestación, la barra de arriba sigue diciendo el destino anterior en el visor: comprobar jugando; (5) capturas pendientes: piquete del súper, rider entregando, aula con el censo nuevo.

### ✅ (hecho, `mods/caminar.js`) T-131 · Caminar por la ciudad
Rol: motor. El personaje va andando por las calles de `ciudad.json` de puerta a puerta (`cdCamino`, `cdTrayecto`), y en transporte entre barrios. Sustituir los usos del `r` antiguo en `src/core/047` y borrarlo. Dibujo mínimo.

### ✅ (hecho) T-122 · Tratar con los vecinos (`mods/trato.js`, `data/trato.json`) · horarios `abre` en lugares · burofax con plazo

Pendiente menor: «Hacer la compra» deja ir en domingo aunque el súper cierre (unificar salidas con `abre`); botones de romance con vecinos solo en Opciones; unificar en el núcleo la comprobación `k.startsWith('p')` del romance.

### ✅ (hecho, `mods/escuela.js`) T-113 · Elegir colegio para los hijos
Rol: sistemas + guion. Hoy los hijos del personaje van a la pública. Poder elegir concertado (cuota «voluntaria» mensual, uniforme) con consecuencias reales y sin monigotes.

### T-114 · Escenas grandes en el móvil
Rol: motor. Las escenas de 12×9 casillas (patios, súper) se ven algo más pequeñas que el bar en vertical. Estudiar que la cámara de escena acerque más y siga al personaje, con arrastre para ver el resto.

### (hecho) T-110 · Colegio e instituto
Rol: escenas. Dos lugares con escena (patio y aula; pasillo con taquillas). Las criaturas y adolescentes del censo que tienen `estudia: 'cole'|'instituto'` están allí en horario de clase; a la salida, adultas de su hogar en la puerta. Hecho cuando: capturas de entrada, recreo y salida; `t/t_censo.js` pasa con los nuevos lugares.

### ✅ (hecho, `mods/barrio.js`) T-111 · El mapa del barrio vuelve a pintarse
Rol: motor. `barrioItems`/`drawBarrioGround` existen en `src/core/047` pero nada los llama. Recuperar la vista del barrio (al salir de casa o con un botón), con los edificios de `lugares` y los del censo (`edificios`: bloques y casas) y tocar un edificio para verlo. Hecho cuando: captura del barrio con bloques y casas; no baja el rendimiento en la vista de casa.

### ✅ (hecho, `mods/vecinos.js`) T-120 · Conocer a los vecinos
Rol: sistemas + guion. En una escena, tocar a un vecino con nombre: ficha (oficio, una frase) y «Presentarse». Al conocerle pasa a `S.people` con `vid` (su id del censo) y `hogar`, y `hogarDe(p)` ya le lleva a su casa de verdad. Sus lazos se van descubriendo (`lazos`). Partidas guardadas: nada obligatorio. Hecho cuando: prueba que conoce a tres vecinos, visita una casa del censo y ve a su familia.

### ✅ T-001 · Población en las escenas (hecho el 12 nov 2026: `mods/poblacion.js`, `data/personas.json` → vecinos)
Rol: escenas. Las escenas existentes (obra, súper, bar, torre, residencia, biblioteca, parque, sindicato, ateneo, comedor, coop, sala, parroquia, comisaría, gym, gymbueno) tienen pocas figuras. Hacer un helper común `crowd(E,{n,hours,spots,acts})` que ponga de 5 a 15 figuras por hora punta, en grupos (dos hablando, uno esperando, uno andando entre dos puntos), y que a veces sean **conocidos** (gente de `S.people` con `p.ch`, con su nombre encima). Hecho cuando: cada escena tiene densidad por hora, captura antes/después de 4 escenas, test t/t_scenes.js que abre todas sin errores. No tocar: reglas, textos.

### ⚡ T-002 · Escuela de adultos
Rol: escenas. `PLACES.instituto` (edificio en el mapa) + `SCENES['instituto']`: aula de noche con pupitres, pizarra con el tema del día (según el programa de `ED().cur`), pasillo con máquina de café, profesora, 8–14 compañeros de 19 a 55 años; versión «examen» (silencio, mesas separadas) cuando `ED().cur.h` está cerca del total. `destOf('clase')` → 'instituto' (y 'uni' si el programa es de grado: misma escena con otro rótulo). Hecho cuando: capturas mañana/tarde/examen; `t/t_edu.js` pasa; un `tell` del primer día (// GUION:revisar).

### ✅ T-003 · Centro de salud y oficina del paro (hecho el 12 nov 2026: `mods/servicios.js`)
Rol: escenas. Dos escenas: `ambulatorio` (sala de espera con números, pantalla de turnos, 10+ personas, médica que llama) a la que va `hpVisit`/`hpAsk`; `sepe` (cola, ventanillas, «vuelva mañana»), a la que van `autoSeek` cuando está en paro y `ssociales`. Hecho cuando: capturas; las visitas al médico y al paro son salidas con escena (`OUT.medico`, `OUT.sepe`) y no instantáneas.

### ⚡ T-004 · Construcción cómoda
Rol: motor/UI. En modo Construir: deshacer/rehacer fiable, rotar con un toque, mover habitaciones enteras, previsualización con coste antes de confirmar, materiales (ladrillo/pladur/madera) con precio y tiempo, obras que duran días y molestan (vecinos, polvo, hambre). Hecho cuando: vídeo/gif de un flujo completo en móvil; `t/t_casa.js` pasa; no hay forma de perder dinero sin confirmar.

### ⚡ T-005 · Catálogo con procedencia
Rol: sistemas + guion. Cada mueble se puede conseguir de 4 formas: tienda (precio lista), segunda mano (40 %, condición 50–80, aparece y desaparece, hay que ir a por él), regalo/herencia (eventos: tu madre, un amigo que se muda), hecho en el banco de trabajo (ya existe). Los muebles recuerdan de dónde vienen (`o.src`) y lo cuentan al tocarlos. Hecho cuando: pestaña Comprar con las cuatro fuentes; 10 textos de procedencia; `t/t_casa.js` pasa.

### ⚡ T-006 · Iconos propios
Rol: UI. Sustituir emojis por SVG inline propios en: barras de necesidades, HUD, pestañas del menú, apps del móvil, botones de Vida. Un sprite `src/icons.svg` + helper `ic('nombre')`. Hecho cuando: capturas de HUD, Vida y móvil sin emojis en controles (los emojis en textos de diario pueden quedarse).

## Después: ritmo y tiempo

### T-010 · Calendario anual
Fiestas del barrio (junio), Navidad (gastos, familia, la madre), verano (calor sin aire, el bloque vacío), vuelta al cole, Semana Santa. Cada una con 2–3 eventos y una escena o variación.

### T-011 · Envejecer
Edad real que avanza (365 días = 1 año, con la opción de «saltar un año» con resumen), la madre que envejece y necesita cuidados (quién, cuánto, con qué dinero), el cuerpo que no aguanta la obra a los 55, hijos que crecen y se van. Conecta con el final (`mods/final.js`).

### T-012 · Barrios
Tres plantillas de barrio (bloques obreros, pueblo con polígono, centro gentrificándose) con locales, precios, trabajos y gente distintos. Se elige al crear la partida.

### T-013 · Trabajos nuevos con escena
Limpieza de edificios, almacén logístico, teleoperadora, cuidadora interna, conductora de autobús, interina en el cole. Cada uno con 3 eventos de jornada propios.

## Identidad: lo colectivo jugable

### T-020 · La asamblea como escena jugable
Propuestas, votar, perder, gente que se quema, decisiones con consecuencia a dos semanas.

### T-021 · Campañas por fases
Firmas → manifestación → negociación → resultado; el barrio cambia visiblemente (local que abre, alquiler que baja, cámara que quitan).

### T-022 · El barrio cambia
Locales que cierran y abren según crisis y movimiento; un fondo compra el bloque; huerta comunitaria si se gana.

## Producto

### T-030 · Primer cuarto de hora
Un primer día guiado: tres objetivos, tres pantallas, nada más. El resto de sistemas se desbloquean cuando tocan.

### T-031 · Guardados múltiples y exportar/importar partida.
### T-032 · Sonido ambiente por escena y música propia.
### T-033 · Un solo sistema de cuerpos (Quaternius + fallback plano); fuera el procedural 3D.
### T-034 · Inglés.
### T-035 · Retratos con la API de OpenAI (clave del jugador, guardada solo en su móvil), para el personaje y la gente. Solo si la persona lo pide.
