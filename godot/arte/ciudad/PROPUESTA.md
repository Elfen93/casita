# Propuesta de uso del catálogo de ciudad (GD-9)

Todo en `ciudad/INDICE.json` (escena, tamaño real, huella, plantas, puerta, triángulos, variantes). Las piezas se pueden **recolorear por parámetro** (`ShaderMaterial` de `kit.gdshader`: `c_muro`, `c_tejado`, `c_persiana`, `c_toldo`, `c_cristal`, `c_zocalo`, `c_carroceria`); cada edificio trae 3 escenas hermanas (`_a`, `_b`, `_c`) con paletas distintas (ocre, blanco roto, ladrillo, salmón, crema…). Escala 1 u = 1 m, origen en el suelo y centro de la huella, fachada hacia -Z.

## Qué pieza para qué lugar
| Lugar (`data/lugares.json`) | Pieza |
|---|---|
| Portales y pisos (Casco, Ribera, Ensanche; casa del personaje en bloque) | `bloque_a/b/d/f/g/h/i` (4-5 plantas, bajos con cristalera) |
| Bar Manolo, bar_esperanza, bar_cruce, tienda, locutorio, super, FitBarrio | `bloque_c`, `bloque_e_ancho` (comercio en 3 plantas con toldo); el rótulo se pone encima con un `Label3D` |
| Ayuntamiento, juzgados, comisaría, biblioteca, sepe | `bloque_e_ancho` o `bloque_g` en color crema claro + rótulo (sin pieza institucional propia en los packs) |
| Torre de oficinas, Campus Nébula, Gran Plaza (Ensanche) | `rascacielos_a` / `rascacielos_c` (solo uno o dos en toda la ciudad) |
| Chalet, Club Aqua, concertado, residencia (Los Pinares) | `casa_*` (1-2 plantas, tejado de teja), residencia = `casa_g`/`casa_m` (las más anchas) |
| Casas bajas de Las Eras y la Ribera | `casa_h/i/q` (una planta) o `bloque_d/h` |
| Naves de logística, cooperativa, sindicato, ITV (Polígono) | `nave_h/i/j/k/o/p/s/g/e`; oficinas del polígono: `nave_oficinas_a/f`; depósito y chimenea como decorado |
| Calles | `calle_recta` (módulo 6 m = 2 carriles de 3 m), `calle_cruce`, `calle_T`, `calle_curva`, `calle_paso_cebra`, `calle_fin`, `calle_entrada_garaje`; aceras: hacen falta cajas o un módulo propio (el pack no trae acera suelta útil) |
| Mobiliario | `farola_*`, `semaforo`, `senal_*`, `poste_electrico`, `contenedor_obra`, `valla_obra` (Obra en construcción), `valla_pared` |
| Tráfico | `coche_berlina`, `coche_suv`, `coche_utilitario`, `coche_taxi` (siempre blanco), `furgoneta`, `furgoneta_reparto`, `camion` |

## Lo que falta y cómo resolverlo
- **Iglesia (parroquia), colegios, instituto, universidad, centro de salud, mercado de abastos, comisaría, biblioteca, parque**: no hay nada así en los packs. Opciones: pieza genérica (`bloque_e_ancho` o `bloque_g`) recoloreada y con rótulo/pictograma, o seguir con el generador de fachadas actual (`fachada.gd`), que ya sabe hacer volúmenes con ventanas. Para la iglesia, una caja con torre (campanario) hecha con primitivas.
- **Aceras, bordillos, alcorques y pasos peatonales**: se montan con cajas (como en la muestra); los tramos de Kenney traen asfalto, no acera española.
- **Persianas enrollables, rejas, aires acondicionados, ropa tendida, azulejos, rótulos**: no existen; se pueden añadir como pequeñas piezas propias en las fachadas.
- **Aspecto**: son cubos de estilo «juguete» con cornisas gordas, no se leen como arquitectura española de cerca. Funcionan a distancia de juego (30-60 m). Las casas de Kenney son de suburbio (garaje, jardín con arbustos); los adosados reales necesitarían un módulo propio de medianera.

## Packs de `entrada/` que no sirven para esto
`coaster-kit`, `graveyard-kit`, `holiday-kit`, `mini-arcade`, `space-station-kit`, `watercraft-pack` (no son de ciudad española). `3d-road-tiles`: duplica City Kit Roads con nombres numéricos. `food-kit` y `furniture-kit` son de interior (otra tarea). `train-kit` y `factory-kit` valen para el Polígono, sin convertir por tiempo.
