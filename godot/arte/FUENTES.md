# Fuentes del arte libre (verificadas leyendo el archivo de licencia de cada repo)

| Paquete | URL | Licencia (literal) | Qué cubre | Formato | Tamaño repo | Bajado |
|---|---|---|---|---|---|---|
| Quaternius, «Animated Men Characters» y «Animated Women Characters» (Feb 2019), dentro del espejo de GitHub `beep2bleep/FreeAssetsByKenneyNLandQuaternius` | https://github.com/beep2bleep/FreeAssetsByKenneyNLandQuaternius | `License.txt`: «CC0 1.0 Universal (CC0 1.0) Public Domain Dedication https://creativecommons.org/publicdomain/zero/1.0/» (copia en `licencias/Quaternius-License.txt`). Ojo: es un espejo de terceros; el origen es quaternius.com | Personas: 4 cuerpos de hombre + 4 de mujer con ropa de diario, esqueleto de 42 huesos, 11 animaciones | FBX (Blend/OBJ también) | ~360 MB (el repo entero; solo bajé 9 FBX de ~2 MB) | Sí (8 FBX) |
| KayKit «Restaurant Bits 1.0» | https://github.com/KayKit-Game-Assets/KayKit-Restaurant-Bits-1.0 | `LICENSE.txt`: «License: (Creative Commons Zero, CC0) http://creativecommons.org/publicdomain/zero/1.0/» | Cocina/restaurante (mostradores, sillas, mesas, nevera, fogones, puerta) | glTF + FBX | 9,8 MB | Sí (se usan pocos; ver `muebles/modelos/restaurante`) |
| KayKit «Furniture Bits 1.0» | https://github.com/KayKit-Game-Assets/KayKit-Furniture-Bits-1.0 | `LICENSE.txt`: «License: (Creative Commons Zero, CC0)» | Cama, sofá, sillas, mesas, lámparas, estanterías | glTF + FBX | 3,5 MB | Sí |
| KayKit «City Builder Bits 1.0» | https://github.com/KayKit-Game-Assets/KayKit-City-Builder-Bits-1.0 | `LICENSE.txt`: «License: (Creative Commons Zero, CC0)» | Edificios pequeños, coches, banco, farola, papelera, boca de incendios | glTF + FBX | 4,8 MB | Sí |
| KayKit «Character Pack: Adventurers 1.0» | https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0 | `LICENSE.txt`: «License: (Creative Commons Zero, CC0)» | Personajes de fantasía (caballero, mago…) con 75 animaciones; NO sirve por estética | glTF + FBX | 24 MB | Clonado, descartado (no se usa nada) |
| Quaternius «Universal Animation Library» (standard) | https://github.com/J-Ponzo/gltf-universal-animation-library | Licencia del repo: CC0 (según GitHub; no abierta en esta sesión) | ~120 animaciones sobre un maniquí (sentarse, beber, interactuar…) | glTF | 3,4 MB | NO bajado. Candidato claro para la siguiente fase: daría «beber», «usar», «hablar» y «dormir» reales, pero exige reasignar el esqueleto (otro rig) |
| Quaternius «Ultimate Modular Men/Women», «Modular Street Pack», «Furniture Pack», «Buildings Pack», «Public Transport Pack», «TreePack» | mismo espejo `beep2bleep/...` (carpetas «Characters and Animals», «Home and Buildings», «Vehicles», «Nature») | CC0 (mismo `License.txt`) | Más muebles, calles, coches, árboles | FBX/OBJ/Blend | — | No bajados por tiempo (los listé en el árbol) |

## Para bajar a mano (red restringida: solo GitHub)
- Kenney.nl (Furniture Kit, City Kit Commercial/Suburban, Mini Characters, Food Kit): https://kenney.nl/assets — CC0.
- Quaternius oficial (Universal Base Characters, Modular Characters, Ultimate Buildings, City pack): https://quaternius.com — CC0 en los packs gratuitos (los «Pro» son de pago).
- KayKit extras: https://kaylousberg.itch.io — CC0 los gratuitos.
- poly.pizza, itch.io, sketchfab: mezcla de licencias; mirar la de cada modelo (CC-BY exige atribución).

## Atribución
Todo lo incluido es CC0: no exige atribución. Se agradece igualmente: Quaternius (quaternius.com) y Kay Lousberg (kaylousberg.com).
Lo propio (muebles de bar procedurales, árbol, papelera, sombreador de fachada, código) lo he escrito yo para este proyecto.

## GD-7 (muebles de casa): sin descargas nuevas
Todo lo añadido sale de los glTF KayKit ya incluidos (Furniture Bits / Restaurant Bits, CC0) o está construido con primitivas propias. Del pack: sillón (`armchair`), mesa baja (`table_low`), alfombra (`rug_rectangle_A`), lámpara de pie y de mesa (`lamp_standing`, `lamp_table`), fregadero (`kitchencounter_sink`). Con primitivas: váter, lavabo, mesa de comedor, tele con mueble, armario, mesilla, estantería (con libros), lavadora, escritorio con ordenador, planta, espejo de pie, cubo de basura. Los packs KayKit/Quaternius/Kenney consultados por GitHub no traen váter, lavabo, lavadora ni tele CC0 utilizables. Generador: `herramientas/generar_muebles_casa.gd`.

## GD-9 (catálogo de ciudad): packs Kenney, todos CC0
Origen: los `.zip` que el autor dejó en `arte/entrada/` (kenney.nl). Licencia de cada uno (`License.txt`, «Creative Commons Zero, CC0», copia en `licencias/Kenney-*-License.txt`). Se convierten con `herramientas/generar_ciudad_kenney.gd` (mallas `.res` con el color de paleta horneado en los vértices y un sombreador propio `ciudad/kit.gdshader`; no se copia ninguna textura ni modelo original).

| Pack | Qué se ha cogido | Qué no |
|---|---|---|
| Kenney «City Kit (Commercial) 2.1» | 9 bloques/edificios (building-a…i), 2 rascacielos, toldo | casi todos los `low-detail-*` (siluetas de fondo), 3 rascacielos, torres l/m/k/n/j (muy pesadas), sombrillas, voladizos |
| Kenney «City Kit (Suburban) 2.0» | 16 casas/chalets (building-type-*), valla | árboles, caminos, vados, resto de vallas |
| Kenney «City Kit (Industrial) 2.0» | 10 naves, 2 naves con oficinas, depósito, chimenea, contenedor marítimo | molinos, paneles solares, torre de agua, resto de chimeneas |
| Kenney «City Kit (Roads) 2.2» | 14 tramos de calle (recta, cruce, T, curva, paso de cebra…), 3 farolas, 2 semáforos, 3 señales, poste eléctrico, contenedor de obra, cono, valla de obra | rampas, puentes, barreras, señales de autovía |
| Kenney «Car Kit» | 7 vehículos (berlina, SUV, SUV de lujo, taxi, furgoneta, furgoneta de reparto, camión) | karts, coches de carreras, tractores, policía, bomberos, ambulancia, basura (peso), ruedas y restos |
| Kenney «3D Road Tiles» | nada: 80+ piezas con nombres numéricos (`roadTile_001`…), repite lo del City Kit Roads |  |
| Kenney «Train Kit», «Factory Kit» | no dio tiempo (prioridad 4) | |
## GD-8c (muebles de casa con modelos de verdad): Kenney Furniture Kit 2.0
| Paquete | URL | Licencia | Cogido |
|---|---|---|---|
| Kenney «Furniture Kit» 2.0 (`entrada/kenney_furniture-kit.zip`) | https://kenney.nl/assets/furniture-kit | CC0 1.0 (`licencias/Kenney-FurnitureKit-License.txt`, copia del `License.txt` del zip) | glTF `Models/GLTF format/`: toilet, bathroomSink, bathtub, washer, cabinetTelevisionDoors, televisionModern, kitchenStove, kitchenSink, kitchenFridge, kitchenMicrowave, table, bookcaseClosedDoors, bookcaseOpen, cabinetBedDrawer, desk, computerScreen, computerKeyboard, pottedPlant, trashcan |

Los `.glb` NO se versionan: `herramientas/generar_muebles_kenney.gd` los lee del zip descomprimido (`glb=/ruta/Models/GLTF format/`, por defecto `/tmp/gd8c/k/...`), guarda cada malla como `muebles/modelos/kenney_hogar/<modelo>_<n>.res` (~130 KB en total) y reescribe los `.tscn` con escala real y materiales propios (blanco roto, gris, madera). Muebles cambiados (mismo nombre de tipo y de archivo): vater, lavabo, lavadora, tele, cocina, fregadero, nevera, mesa_comedor, armario, mesilla, estanteria, escritorio, planta, cubo_basura; nuevos: banera, microondas (`sobre: encimera`). Sin cambiar: espejo (el de Kenney es de pared). Escala: los modelos de Kenney son ~la mitad de grandes y se escalan por eje a medidas reales.

## Humano · MakeHuman (GD-10a)
Fuente: https://github.com/makehumancommunity/makehuman (rama principal, clon parcial). Todo lo usado es CC0 (cabeceras de los ficheros: «explicitly released as CC0 in september 2020»; texto en `licencias/MakeHuman-CC0-LICENSE.ASSETS.md`).
Usado:
- `makehuman/data/3dobjs/base.obj` (malla base alpha_7, solo el grupo `body`; los helpers y joints no se exportan; los joints de ojos se usan solo para colocar los ojos).
- `makehuman/data/targets/`: `macrodetails/` (raza, universal, height), `breast/`, `measure/` (cintura, cadera, hombros, piernas), `stomach/`, `head/`, `cheek/`, `nose/`, `mouth/`, `eyes/`, `chin/`, `expression/units/caucasian/` (expresiones). `eyebrows/` solo para pruebas.
- `makehuman/data/rigs/default_weights.mhw`: solo para clasificar zonas del cuerpo al generar la ropa (no hay esqueleto en el resultado).
Generado por nosotros (derivado de la malla CC0, sin recursos externos): ropa y pelo (carcasas de la propia malla), pieles 1024 px (ruido procedural sobre 4 tonos), textura del ojo, cejas (degradado en color de vértice). Generador: `arte/herramientas/generar_humano.py`.
Descartado por licencia: nada (no se ha mirado nada que no fuese CC0). Descartado por NO ESTAR disponible: pelo, ropa, pieles con textura, pestañas y dientes de MakeHuman viven en `makehuman-assets` (no accesible desde aquí: 404 por el proxy; `mpfb2` tampoco los trae). `eyes/` del repo (hm08) no encaja con la base alpha_7 y no se usa.
Parte 2 (animaciones): Universal Animation Library [Standard] de Quaternius (CC0; `arte/entrada/Universal Animation Library[Standard].zip`, ya con su licencia en `licencias/Quaternius-License.txt`). Solo se usan 5 animaciones de UAL1_Standard.glb (Idle_Loop, Walk_Loop, Sitting_Idle_Loop, Jog_Fwd_Loop, Idle_Talking_Loop), retargeteadas por `generar_humano.py` a nuestro esqueleto y guardadas dentro de `humano.glb`. El esqueleto (26 huesos con nombres UAL) sale de `rigs/default.mhskel` + `default_weights.mhw` (CC0) simplificado; `game_engine.mhskel` no está en el repo.

## Humano · MakeHuman, recursos reales (GD-11)
Fuente: los repos de assets de MakeHuman en CC0 (`makehuman_system_assets_cc0`, `shirts01_cc0`, `dress01_cc0`, `shoes01_cc0`, `skins01_cc0`, `skins02_cc0`; copiados en local en `/home/claude/mh_assets/`, solo lectura). Licencia de cada recurso comprobada en el `packs/*.json` del repo (campo `license`: CC0 en todos los usados) y en la cabecera de cada `.mhclo` («explicitly released as CC0 in september 2020»). Copia de los `packs/*.json` en `licencias/makehuman-packs/`; texto CC0 en `licencias/MakeHuman-CC0-LICENSE.ASSETS.md`.
Usado (carpeta, autor):
- Pieles (texturas, 1024 px JPG): `young_caucasian_f/m` (clara), `young_asian_f/m` (media), `toigo_light_skin_female_bronze` y `toigo_light_skin_male_bronze` (morena, MargaretToigo), `young_african_f/m` (oscura), `old_caucasian_f/m`, `middleage_asian_f/m`, `old_asian_f/m`, `old_african_f/m` (las versiones «mayor»). Autor `makehuman_system` salvo las dos de toigo.
- Ojos `eyes/low-poly` con `brown`, `green`, `blue`; cejas `eyebrow001`, `eyebrow004`, `eyebrow007`; pestañas `eyelashes02`; dientes `teeth_base`. Autor `makehuman_system`.
- Pelo: `short02` (corto), `short04` (corto2), `bob01` (media), `long01` (largo), `ponytail01` (coleta), `afro01` (afro). Autor `makehuman_system`; texturas pasadas a gris+alfa WebP para teñirlas.
- Ropa: `elvs_crude_t-shirt_male` (camiseta, Elvaerwyn), `toigo_fisherman_sweater` (sudadera), `toigo_basic_tucked_t-shirt` (blusa), `toigo_camisole_dress_with_full_skirt` cortado a la cintura (falda), `toigo_ankle_boots_female` (botines) (todas MargaretToigo); `male_casualsuit02` cortado a la cintura (vaqueros), `female_sportsuit01` cortado (chándal), `shoes05` (zapatillas), `shoes01` (zapatos) (`makehuman_system`).
- Ajuste al cuerpo: ficheros `.mhclo` leídos por `herramientas/humano_assets.py`; los `delete_verts` ocultan la piel tapada.
Descartado por licencia: `culturalibre_heroine_boots_4` (única entrada CC-BY de `shoes01`; no se usa ni se copia). Descartado por peso (CC0 y listo): `toigo_shift_dress`, `male_elegantsuit01`, `male_worksuit01`, `namuhekam_male_polo_shirt`, `toigo_ballet_flats` y el vestido de tirantes entero; cada uno pesaba 40-170 mil vértices×formas de blend shapes en el .scn.

## Personaje «Autumn» (chica hecha en Blender; rama `claude/chica-autumn`) — EXPERIMENTAL, LICENCIA SIN ACLARAR
Fuente: archivos de trabajo de la serie de vídeos de TomCAT «Stylized character» (22 vídeos): cuerpo, cabeza, ojos, dientes, pestañas, cejas y texturas de piel son del autor de la serie. **No hemos encontrado una licencia que permita redistribuirlos**: se usan solo para probar, por decisión expresa del dueño del proyecto («fase experimental, no vamos a vender el juego»). Antes de publicar el juego en serio hay que sustituir esas piezas o conseguir permiso.
Hecho por nosotros sobre esa base: ropa (top, vaqueros, zapatillas), pelo (mechones horneados a textura), ajuste del esqueleto Rigify, expresiones y las 52 formas de cara (nombres ARKit; al juego van 18, las demás quedan en el `.blend` y salen con `--todas`), y el esqueleto de juego (solo huesos de deformación, raíz única).
En el repo: `arte/personajes/autumn/autumn.glb` (3,9 MB; suma ~7 MB a `play3d/index.pck`: 5.509 vértices de cuerpo, 20.721 de ropa, 17.820 de pelo; texturas WebP hasta 2048 px) y `persona_autumn.gd` (misma API que `Persona`; anima los huesos por código, sin animaciones importadas). Se regenera con `arte/herramientas/blender/exportar_autumn.py [--todas] <mujer_arkit.blend> <salida.glb>` (Blender 5.x); el `.blend` no está en el repo.
Dónde se usa: solo el personaje jugador (`Figura.aspecto_jugador` pone `"modelo": "autumn"`); los vecinos siguen siendo las personas de Quaternius (CC0).
