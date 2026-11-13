# Casita 3D · prueba de Godot (GD-1 → GD-2)

La Ribera en 3D, leída de `data/*.json`, para compararla en el móvil con el juego web. Godot 4.3, renderizador **Compatibility** (WebGL2), vertical, táctil, exportación web **sin hilos** (GitHub Pages no manda las cabeceras de aislamiento que piden los hilos).

## Qué hay
- `project.godot`, `export_presets.cfg` (preset «Web», sin hilos, salida `../play3d/index.html`).
- `scripts/main.gd` (mundo, personaje, cámara, reloj, necesidades, interacciones, vecinos, interfaz), `scripts/grafo.gd` (camino por calles, port de `cdGrafo`/`cdCamino` de `mods/barrio.js`), `scripts/datos.gd` (lector de JSON). (`grafo.gd` ya no existe: el movimiento es libre, ver GD-2.)
- `fonts/emoji.ttf`: Noto Emoji (OFL) recortado a los emojis que usan los datos (~120 KB). El texto normal usa la fuente por defecto de Godot.
- `data/` NO se versiona: lo genera `scripts/godot_datos.py` copiando `ciudad`, `lugares`, `barrio`, `personas`, `reglas` e `interiores` de `data/`.

## Instalar (una vez)
```
mkdir -p /home/claude/godot-bin/4.3 && cd /home/claude/godot-bin/4.3
curl -L -O https://github.com/godotengine/godot/releases/download/4.3-stable/Godot_v4.3-stable_linux.x86_64.zip && unzip Godot_v4.3-stable_linux.x86_64.zip
curl -L -O https://github.com/godotengine/godot/releases/download/4.3-stable/Godot_v4.3-stable_export_templates.tpz   # 1 GB
mkdir -p ~/.local/share/godot/export_templates/4.3.stable
unzip -j Godot_v4.3-stable_export_templates.tpz templates/web_nothreads_release.zip templates/web_nothreads_debug.zip templates/version.txt -d ~/.local/share/godot/export_templates/4.3.stable
rm Godot_v4.3-stable_export_templates.tpz
```
Con otro binario: `GODOT=/ruta/godot scripts/godot_export.sh`.

## Exportar
```
scripts/godot_export.sh          # datos -> import -> exporta a play3d/ (index.html, .js, .wasm, .pck…)
```
Publicar = hacer commit de `play3d/` (cuando se decida): `https://elfen93.github.io/casita/play3d/`. Los `.wasm` pesan ~35 MB sin comprimir.

## Probar en local
```
python3 -m http.server 8731          # desde la raíz del repo
# abrir http://127.0.0.1:8731/play3d/index.html (móvil en la misma red: http://IP-del-PC:8731/play3d/index.html)
python3 t/cdpshot.py "http://127.0.0.1:8731/play3d/index.html" 25 /tmp/x.png 420,860   # captura con Chrome sin pantalla
```
En la web, `window.casita_cmd('ir','bar')`, `('hora',22)`, `('vel',5)`, `('zoom',30)`, `('vecino',3)`, `('boton',0)`, `('estado')` sirven para probar sin tocar.

## Controles
Un dedo arrastra la cámara, dos dedos hacen zoom (rueda del ratón en el ordenador). Tocar una calle o un edificio: el personaje va andando; en el bar, el súper y casa aparece el menú. Tocar a un vecino: su ficha. **Con el dedo**: dos toques seguidos, o dejar el dedo quieto medio segundo, mandan andar a ese punto aunque haya algo debajo (un mueble, una persona, un edificio). **Con ratón**: botón derecho anda, izquierdo elige. 1× / 5× cambian la velocidad (un día = 16 min a 1×).

## Qué sale de los datos y qué no
De `data/`: calles, puertas, huellas (`rb`), colores, nombres, descripciones y horarios de apertura, casa del jugador (vivienda «viejo» → La Ribera), censo del barrio y sus horarios, tasas de necesidades (`reglas.json`), efecto del bar (`salidas_necesidades.amigos`). Provisional en el código: precios (bar 6 €, súper 12 €), efecto del súper y del sueño, alturas de los cubos.


## GD-2 (G2A): escala humana, movimiento libre, interior del bar y sistema de acciones
- **Regla de escala** (un solo sitio: `scripts/escala.gd`): 1 unidad de Godot = 1 m; el personaje mide 1,7 m. Las coordenadas del dato se multiplican por `M_UNIDAD = 3` (1 casilla de 6 m = 2 unidades del dato): La Ribera (120×100 unidades) mide 360×300 m. Calzada 8 m, aceras 3 m; velocidad 3,5 m/s, 7 m/s si el destino está a más de 60 m.
- **Reloj al andar**: el trayecto por la calle NO corre a ritmo normal: cobra `Escala.MIN_POR_UNIDAD = 0,119` min de juego por unidad del dato recorrida (10 m a 84 m/min), repartidos a lo largo de lo que dura verlo. Cruzar el barrio entero (≈120 unidades) cuesta ~14 min de juego.
- **Movimiento libre** (`scripts/nav.gd`): rejilla de 1 m con `AStarGrid2D` (diagonales sin cortar esquinas, tirón de cuerda). Edificios, muebles, vallas y troncos son sólidos; la calzada cuesta 3× (se prefieren aceras y pasos de cebra). Los vecinos usan el mismo sistema (una ruta por fotograma).
- **Interiores**: `data/interiores.json` define el plano y los muebles; `scripts/interior.gd` los construye (paredes con hueco de puerta, techo que se oculta y paredes de delante que se aplastan al entrar). Solo el bar tiene interior hoy; el resto de edificios son cubos macizos.
- **Objetos y acciones**: `scripts/objeto.gd` (mueble con puntos de uso), `scripts/acciones.gd` (condiciones y efectos), `scripts/cola.gd` (cola de hasta 6 acciones del jugador), `scripts/bar.gd` (camarero y clientes del censo). Qué acciones tiene cada mueble, cuánto duran, cuestan y dan, está en los datos.
- **Figuras**: se crean en un único punto, `scripts/figura.gd` (`Figura.crear`), para sustituir luego el dibujo.
- **Provisional**: el botón «Trabajas en el bar (prueba)» hasta que exista el trabajo en Godot. El puente `casita_cmd` añade `ir_xy`, `poner`, `accion`, `accion_cliente`, `trabaja`, `clientes`.
- **Prueba automática**: `python3 t/g2a_prueba.py [carpeta]` (usa `t/g2a_cdp.py`).

## GD-3 (G3): el arte libre dentro del juego
- **Personas** (`scripts/figura.gd`, `actor.gd`): cada vecino/jugador/camarero/cliente es una `Persona` de `arte/personaje` con aspecto estable (género, edad y semilla del id). La animación sale del estado real (`Actor.anim_tick`): andar, correr, sentado (con brazos al beber/hablar, a la altura del asiento del modelo), usar (con barra de progreso), beber, hablar. Los menores son más pequeños.
- **LOD** (`main.gd::_lod`, cada 0,25 s): solo las personas a ≤ 70 m de la cámara y dentro de pantalla, como mucho 25 (las más cercanas), llevan esqueleto y AnimationPlayer; el resto es una cápsula de una malla, la persona se oculta y su proceso se desactiva (`PROCESS_MODE_DISABLED`). La persona se crea la primera vez que hace falta. Sombra propia solo a < 35 m. Los muebles del bar y su luz se ocultan a > 55 m de la cámara y no proyectan sombra.
- **Bar**: `data/interiores.json` → `tipos[tipo].modelo` (`escena`, `modulos`, `sobre`, `escala`, `asiento`, `alto`); un tipo sin `modelo` sigue siendo caja. Suelo de baldosas (`suelo2`), zócalo, luz cálida (`luz`) y ventanas que se encienden de noche.
- **Calle**: `scripts/calle.gd` (MultiMesh de árboles, bancos, farolas y papeleras; bombillas emisivas y 7 OmniLight como mucho en las farolas más cercanas), fachadas con `Fachada.material` y `Fachada.set_noche`.
- **Tu casa**: bloque de 4 plantas de 14 × 10 m con su portal; el resto de la parcela, patio.
- **Cámara**: `DIST_CALLE = 18`, `DIST_INTERIOR = 13`; los rótulos de las personas crecen con la distancia.
- **Puente de pruebas**: `casita_cmd('rend')` (fps, personas, con esqueleto, objetos y dibujos), `('donde')` (posición de los vecinos visibles), `('dbg','fachadas'|'multi'|'sombra'|'luces'|'personas')` (alterna grupos para medir).

## GD-5: tu casa por dentro (el motor)
- **Varios interiores a la vez**: `main.gd` guarda `interiores_v` (todos) e `interior` (aquel en el que está el jugador, `null` fuera). Corte de paredes, rótulos, LOD, toques sobre muebles, `accion`/`pant` funcionan con el actual (`_objeto_por_id` busca en todos). `BarCtl` es solo del bar.
- **El piso** (`data/interiores.json` → `interiores.casa`, `lugar: "casa"`): 9 × 7 m, el bajo del bloque, junto a la puerta de siempre. Salón con cocina, baño y dormitorio. El bloque de 4 plantas (cáscara de fuera) se oculta entero al entrar (plantas y tejado); desde fuera se ve como antes, algo más estrecho.
- **Tabiques** (`tabiques` en el interior, documentados en `data/README.md`, validados en `scripts/datos.py`): paredes interiores con huecos de ≥ 1 m. En la rejilla ocupan una hilera de celdas de 1 m (sólidas salvo el hueco). Con `paredes_bajas`, al entrar TODAS las paredes y tabiques bajan a medio muro.
- **Cama**: acciones `dormir` (`Dormir 8 horas`, `Echar una siesta (1 h)`) → salto de tiempo con velo (`main.dormir_cama`); el personaje se tumba (`postura` `tumbado`). El panel antiguo de «Tu casa» ya no existe: tocar el bloque lleva a la puerta y se entra andando. Nevera, cocina, sofá y ducha están colocados pero aún sin acciones.
- **Prueba**: `python3 t/g2a_casa.py [carpeta]`.
## GD-8a: vivir en casa
- **Piso reorganizado** (`interiores.casa`): salón de 5 m (el tabique este pasó a x=3,5; baño y dormitorio de 3 m, estancias actualizadas). Salón con nevera, cocina, fregadero y tele en la pared norte, sofá mirando a la tele, `mesa_comedor` con dos `silla` junto a la puerta; baño con ducha, `vater`, `lavabo`; dormitorio con cama (huella 0,98 × 1,9 para ocupar una sola hilera), `mesilla` y `armario` (estos dos sin acciones). Los tipos tienen el nombre y modelo del INDICE.
- **Acciones** (todo en `data/interiores.json`): `picar` (nevera), `cocinar` (cocina, tipo `tirar`: deja un `plato` en la mano), `comer` (tipo nuevo `comer`: mesa de comedor y sofá sentado, +60; `comer_pie` en la mesa solo si `sin_sitio`, +40; al comer queda `platos_sucios`), `fregar` (fregadero, solo con platos sucios; mientras los haya no se cocina), `ducharse`, `lavarse`, `usar_vater`, sofá `descansar` y `tele` (con `efectos_min`: el efecto sube poco a poco y se queda lo acumulado si se cancela).
- **Campos nuevos**: `asientos` en un tipo (`[x, y, z, giro extra]` por cada punto de `uso`: sofá de dos plazas, mesa con dos sillas), `efectos_min`, `estado` (bandera de `main.estado_casa`, p. ej. `{"platos_sucios": true}`), condiciones `plato_mano`, `platos_sucios`, `sin_platos_sucios`, `hay_tele`, `sin_sitio`, `agotado`, y `interiores.necesidades` (`umbral`, `avisos`, `percance`).
- **Necesidades**: el HUD enseña las seis (hambre, energía, diversión, social, vejiga, higiene; los iconos se ven como pictogramas de línea). Por debajo de 15: aviso una vez (se rearma al subir de 25). Vejiga a 0: percance (higiene −40, vejiga a 40). Energía a 0: solo dormir, sentarse o comer (`Acciones.motivo_agotado`).
- **Detalles**: el aro amarillo del jugador se oculta tumbado; sentado usa `asiento_mundo(i)`/`giro_asiento(i)`; el plato no se lleva con brazos de beber.
- **Pendiente**: `platos_sucios` no se guarda (`guardado.gd` no se toca aquí). Puente nuevo: `nec`, `vaciar`. Prueba: `python3 t/g2a_vivir.py /tmp/gd8a`.

## GD-6: guardar la partida
- Todo en `scripts/guardado.gd` (`Guardado`); en `main.gd` solo hay ganchos marcados `# --- guardado ---` (declaración, 4 líneas al final de `_ready`, `tick` en `_process`, `cmd` al inicio de `_cmd_js`, `en_ui` en `_en_ui`).
- **Dónde**: en web, `localStorage` clave `casita3d_partida` (la clave del juego antiguo, `casita-save-v1`, no se lee ni se toca); fuera de web, `user://partida.json`. Si el texto está corrupto: partida nueva y el texto roto queda en `casita3d_partida_rota` (o `user://partida_rota.json`).
- **Formato**: `{"v":1,"t":<unix>,"secciones":{"reloj":{"v":1,"minutos":..,"vel":..}, "cartera":{..}, "necesidades":{..}, "habilidades":{..}, "trabajo":{..}, "jugador":{"x","z"}, "camara":{"libre","dist"}}}`. Sección desconocida: se ignora. Sección o campo ausente: queda el valor por defecto. La posición se respeta solo si es transitable (si no, o dentro de un edificio, puerta de casa). La cola de acciones no se guarda.
- **Registrar una sección nueva** (muebles comprados, relaciones…): `guardado.registrar("muebles", 1, fn_guardar, fn_aplicar)`. `fn_guardar() -> Dictionary` (Guardado añade `v`); `fn_aplicar(d)` debe leer con `d.get(campo, valor_actual)`. Hay que registrarla antes de `cargar_inicio()`.
- **Cuándo**: cada 2 min reales, al terminar un salto de tiempo (dormir, comer…), al ocultarse o cerrarse la página (`visibilitychange`/`pagehide`) y con «Guardar ahora» del botón «Menú». Nunca en mitad de un salto con velo.
- **Puente**: `casita_cmd('guardar')`, `('cargar')`, `('borrar_partida')`. Prueba: `python3 t/g2a_guardar.py /tmp/gd6`.
