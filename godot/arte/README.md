# godot/arte — canal de arte libre (G2B)

Todo con licencia CC0 (ver `FUENTES.md`, copias de licencias en `licencias/`). Escala: 1 u = 1 m, origen en el suelo, **frente hacia -Z**.

## Qué hay
- `personaje/persona.tscn` + `persona.gd` (`class_name Persona`): persona de 1,70 m. 8 cuerpos (4 hombre, 4 mujer) de Quaternius, sin textura: los colores de piel, pelo, ropa de arriba/abajo y calzado se cambian por material. `cuerpos/*.scn` son los modelos sin animación y `anims.res` la biblioteca de animaciones compartida (todo ~0,8 MB).
- `muebles/*.tscn` + `INDICE.json` (tipo -> escena, tamaño en m, puntos de uso): barra (módulo 1 m), taburete, mesa de bar, silla, estante con botellas, grifo, cafetera, coctelera, tragaperras, cama, sofá, nevera, cocina, ducha. `muebles/modelos/` guarda los glTF de KayKit usados (silla, cama, sofá, banco, farola, coches) con la paleta a 512 px.
- `ciudad/`: `fachada.gdshader` + `fachada.gd` (material procedural: plantas, ventanas, portal, forjados, balcones, ventanas que se encienden de noche), `bloque_pisos.tscn` (plantas apilables), `casa_baja.tscn`, y en `objetos/` banco, árbol, farola (con OmniLight `Luz`), papelera.
- `muestra.tscn` + `muestra.gd`: calle, 2 bloques, casa baja, farola, banco, árbol, coches, rincón de bar y 6 personas. Web: `#noche`, `#cerca`, `#acera` en la URL; toque izquierdo = día/noche, derecho = plano cercano.
- `herramientas/`: `convertir_personas.gd` (FBX -> cuerpos .scn + anims.res) y `generar_muebles.gd` (genera los .tscn de muebles e INDICE.json). Los FBX originales NO se versionan (se bajan de `FUENTES.md` y se copian a `res://scratch/`).

## API de `Persona`
```gdscript
var p: Persona = preload("res://arte/personaje/persona.tscn").instantiate()
add_child(p)
p.position = Vector3(3, 0, 2)
p.set_aspecto({"genero": "f", "edad": 34, "piel": 2, "pelo": "castano",
	"ropa": {"variante": 2, "arriba": Color("c0504d"), "abajo": Color("2f3b52")}, "semilla": 7})
p.set_nombre("Marisa")
p.anim("andar")                 # "parado","andar","correr","sentado","usar","beber","hablar","dormir"
p.mirar_a(Vector3(0, 0, 0))     # gira sobre Y hacia un punto global
var silla = preload("res://arte/muebles/silla.tscn").instantiate(); add_child(silla)   # origen en el suelo, frente -Z
```
- `set_aspecto`: `genero` ("h"/"f"), `edad` (años; <14 = criatura más pequeña y cabeza proporcionalmente mayor, ≥62 pelo canoso por defecto), `piel` (índice 0-5, float 0..1 o Color), `pelo` ("negro","castano","rubio","pelirrojo","canoso","blanco" o Color), `ropa` (int = variante 0-3, Color = camiseta, o Dictionary `variante/arriba/abajo/calzado`), `semilla` (rellena al azar lo no dado, repetible), `nombre` opcional.
- `anim(nombre, velocidad=1.0, brazos="")`: con `"sentado"` y `brazos` = "beber"/"usar"/"hablar" se sienta con los brazos haciendo eso. `set_altura_asiento(h)` (silla 0,43; taburete 0,75; sofá 0,40) coloca el cuerpo a la altura del asiento, con el origen de la persona en el suelo. «dormir» tumba a la persona boca arriba, centrada, con la cabeza hacia +Z, a 0,14 m: ponerla en `cama.tscn` a y=altura del colchón (0,38).
- Animaciones: REALES del paquete: parado (Idle), andar (Walk), correr (Run), sentado (Sitting, pose fija, ya sentado). PROPIAS (no vienen en el paquete; son «Idle» con los brazos colocados por código hueso a hueso con una oscilación): usar, beber, hablar. «dormir» = pose Idle tumbada (el paquete solo trae «Death», boca abajo). Faltan de verdad: coger, sentarse/levantarse (transición), brindar.

## Cómo comprobarlo
Copia mínima del proyecto con `res://arte` enlazado, `--export-release` con preset Web sin hilos; ver `/tmp/g2b/` en la sesión original. Pesa: la muestra completa ocupa **1,75 MB de .pck** (incluye código y escenas); lo que añade `godot/arte` al juego ronda 1,6 MB (el .wasm no cambia).

## Valoración honesta
- Las personas de Quaternius se leen bien como personas corrientes de hoy (camiseta, jersey, vestido, traje) a distancia de juego y cerca; los colores por material dan variedad suficiente de ropa, piel y pelo. Con 8 cuerpos, la repetición se nota si hay más de ~10 a la vista; los rostros son idénticos (cara plana) y no hay vejez ni cuerpos grandes/delgados distintos más allá de la escala.
- Al zoom por defecto del juego (dist 62) una persona mide ~13 px en un móvil de 420 px: son manchas de color; el arte solo luce a dist ≤ 30.
- Las animaciones de caminar/correr son buenas; las de gestos (beber, usar, hablar) son rudimentarias (solo brazos, sin manos), y faltan transiciones (sentarse, levantarse) y acciones con objetos.
- Los muebles KayKit tienen estética «cartoon» de fantasía/restaurante, no de bar español: la barra, el estante, el taburete y las máquinas los hice yo con primitivas y se ven esquemáticos (sin ceniceros, azulejos, carteles, jamones…). La fachada procedural funciona bien para bloques, pero es repetitiva y sin balcones/comercios con identidad.
- Para un barrio español creíble haría falta un pack de pago o encargo: personajes con cuerpos y caras variadas y ropa modular (p. ej. Synty «POLYGON Modern Civilians», o Mixamo/ReadyPlayerMe para animaciones realistas, revisando licencia), y un kit de ciudad europea/mediterránea (Synty «POLYGON City/Town», «Modular Spanish/European Street» de la Unity/Unreal Store, con licencia de uso comercial).
