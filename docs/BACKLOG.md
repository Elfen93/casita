# Casita · backlog

Orden = prioridad. Cada tarea: rol, qué, hecho cuando, no tocar. Las marcadas ⚡ son independientes entre sí y pueden ir en paralelo.

## Ahora: mundo creíble

### ⚡ T-001 · Población en las escenas
Rol: escenas. Las escenas existentes (obra, súper, bar, torre, residencia, biblioteca, parque, sindicato, ateneo, comedor, coop, sala, parroquia, comisaría, gym, gymbueno) tienen pocas figuras. Hacer un helper común `crowd(E,{n,hours,spots,acts})` que ponga de 5 a 15 figuras por hora punta, en grupos (dos hablando, uno esperando, uno andando entre dos puntos), y que a veces sean **conocidos** (gente de `S.people` con `p.ch`, con su nombre encima). Hecho cuando: cada escena tiene densidad por hora, captura antes/después de 4 escenas, test t/t_scenes.js que abre todas sin errores. No tocar: reglas, textos.

### ⚡ T-002 · Escuela de adultos
Rol: escenas. `PLACES.instituto` (edificio en el mapa) + `SCENES['instituto']`: aula de noche con pupitres, pizarra con el tema del día (según el programa de `ED().cur`), pasillo con máquina de café, profesora, 8–14 compañeros de 19 a 55 años; versión «examen» (silencio, mesas separadas) cuando `ED().cur.h` está cerca del total. `destOf('clase')` → 'instituto' (y 'uni' si el programa es de grado: misma escena con otro rótulo). Hecho cuando: capturas mañana/tarde/examen; `t/t_edu.js` pasa; un `tell` del primer día (// GUION:revisar).

### ⚡ T-003 · Centro de salud y oficina del paro
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
