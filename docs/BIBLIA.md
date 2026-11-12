# Casita · la biblia

Lo que es el juego, cómo se escribe y cómo se programa. Todo lo que entre en el juego pasa por aquí.

## 1. Qué es Casita

Un simulador de vida isométrico, en castellano, sobre **vivir siendo clase trabajadora**: el curro, el alquiler, la madre, el barrio, el cuerpo, la cabeza, la gente. Se juega en móvil, en ratos cortos. Un día de juego dura 16 minutos reales a 1×.

No es Los Sims con pobreza. Es un juego sobre **de dónde viene el dinero y adónde va, y quién decide**. El jugador vive la vida de Ana (u Oury, o quien cree) y el juego le enseña, sin sermones, que casi nada de lo que le pasa es culpa suya.

## 2. La mirada (lo que nunca se negocia)

- **El sistema tiene nombre.** Cuando algo sale mal, el texto nombra quién decide y quién cobra: el casero, el banco, el encargado, el fondo, Hacienda, la ordenanza. Nunca «la vida», «las cosas», «el mercado».
- **No se culpa al personaje.** Engorda por el horario, no por falta de voluntad. Se deprime por el paro, no por debilidad. Bebe para aguantar. Si un texto suena a «si te esforzaras más», está mal.
- **Lo colectivo funciona.** Organizarse tiene coste y tiene efecto. Sol@ se aguanta; junt@s se gana algo. El juego no es nihilista.
- **Sin sermón.** La política está en los hechos y en una frase seca al final, nunca en un párrafo. Una buena frase: «La conciliación en este país se llama abuela». Una mala: tres líneas explicando el patriarcado.
- **Con humor.** Ternura y mala leche a partes iguales. La gente del barrio es gente, no víctimas ni héroes.
- **Nunca cruel con el jugador.** El juego puede ser duro; no puede ser humillante. Las derrotas se cuentan con respeto.

## 3. Cómo se escribe

- Castellano de España, natural, de barrio. Tú, no usted. Tacos pocos y bien puestos.
- **Frases cortas. Un dato concreto por frase.** «Multa de 300 por dormir en la calle. A quien no tiene casa, por no tener casa.»
- Género: usar `oa()` ('a'/'o'/'e'), `ga(f,m,x)` y `${CH().name}`. Nunca «Ana» a pelo en textos nuevos.
- Tres registros, y no se mezclan:
  - `toast()`: una línea, lo que pasa ahora («🏠 Alquiler: 95»). Sin literatura.
  - `tell(txt,icono)`: el diario. Una a tres frases con voz. Es donde vive la escritura del juego.
  - `chapter(id,título,texto)`: un hito. Una vez por id. Párrafo con peso; aquí sí cabe la frase política.
- Los personajes hablan poco y bien: burbujas de dos o tres palabras, mensajes de móvil de una línea con emoji.
- Números: siempre con `fmt()`. Precios de servicios en **horas de salario** (`hrs(n)`), nunca en «precio del mundo» (`PM()`); PM es solo para cosas del catálogo de muebles.

## 4. Cómo se programa

- Un solo script, sin módulos ES. Los **módulos** viven en `mods/*.js` y se concatenan en el orden de `build.json`. Cada módulo es autónomo y se engancha al motor **envolviendo funciones**, nunca editando el núcleo:
  ```js
  {const _f=nombre;nombre=function(...a){/* antes */const r=_f.apply(this,a);/* después */return r;};}
  ```
  Las `const` del núcleo no se pueden reasignar; para esas, buscar el multiplicador o el hook que ya exista (`payMul`, `reserveMoney`, `OUT`, `ACTV`, `DLG`, `SCENES`, `PLACES`, `HOMES`, `OBJ`).
- **Contenido**: nombres, precios, catálogos, frases de lista y tablas van en `data/*.json` (qué hay y qué significa cada campo: `data/README.md`), no en el código. Las tablas de siempre (`PLACES`, `OUT`, `OBJ`, `ACTV`, `TRACKS`, `IDEOS`, `GOVS`…) salen de ahí. Un módulo no añade ni cambia fichas al cargar: se editan los datos. Si una ficha necesita una función, la ficha va en `data/` y la función aquí: `conLogica(OUT,{clase:{req:()=>!!ED().cur}})`.
- **Estado**: todo lo que debe sobrevivir al guardado va en `S` (se serializa a JSON; nada de funciones ni clases). Cada módulo tiene su bolsa con getter perezoso: `const XX=()=>{if(!S.xx)S.xx={...};return S.xx;}`.
- **Tiempo**: `S.day`, `S.t` (minutos), `dateOf(S.day)` → `{wd,dm,m}`, `dayType(day)` → work/weekend/fest/vac, `SHIFT.start/end`, `festivo(day)`.
- **Ganchos útiles**: `dailyEvents` (una vez al día), `payRent` (semanal, lunes 8:00), `update(gm)` (cada tick, gm minutos), `autonomy()` (cuando Ana no tiene nada que hacer), `outBack(k)` (al volver de una salida), `actFinish(u,frac)` (al acabar una actividad de objeto), `vidaTab()`, `genteTab()`, `openMenu(tab)`, `bindSociety()` (para enganchar botones de Vida).
- **Salidas**: `OUT[k]={n,e,dur,h:[ini,fin],why,wd?}` en `data/lugares.json` (y `req` con `conLogica`), `destOf(k)` → escena, `outAvail(k)` → null o motivo, `doOut(k)`.
- **Objetos**: `OBJ[t]`, `ACTV[t]=[[clave,emoji,nombre,min,habilidad,nivelMin,coste,ritmos{need:+/-min},efecto]]`, `MDRAW[t]` para dibujarlo, `findObjs(pred)`, `usable(o)`.
- **Gente**: `S.people` (cada uno `{k,n,g,rel,love,stage,ch,…}`), `partner()`, `liveIn()`, `P_('madre')`, residentes en `S.res`.
- **Escenas**: `SCENES[key]=E=>({W,D,drawBase,decor,items:[{d,f}],ana,after})` con primitivas `sBox, poly, P, LP, cyl, sPerson, emoji, label`. Mirar `SCENES['gym']` como plantilla corta y `SCENES['sindicato']` como larga.
- **Dinero**: nunca `S.money-=x` a pelo en código nuevo; `bkAdd('Concepto',±x)` para que salga en el banco. Conceptos en `BK_CAT`.
- **Prohibido**: `alert/confirm`, dependencias externas, llamadas de red (salvo los .glb de q3d), tocar `src/core` si se puede resolver con un módulo, textos en inglés.

## 5. Estética

- Isométrico limpio, colores cálidos y planos, sombras suaves. Paleta base: tinta `#2b2533`, papel `#fffdf8`, naranja `#ff8a5b`, lila `#7a4fa0`, rojo `#c0262d`, verde `#2e8b57`.
- Fuente Nunito. Títulos 900, texto 700.
- Emojis como iconos son **provisionales**: donde haya ocasión, sustituirlos por iconos propios (SVG inline) en HUD, Vida y móvil.
- Las escenas tienen hora y clima: día/noche, lluvia, estación. Toda escena nueva lo respeta.
- Población: un sitio vacío es un sitio roto. Mínimo 5–6 figuras, más a las horas punta.

## 6. Definición de «hecho»

Una tarea está hecha cuando:
1. `python3 build.py` pasa (datos y sintaxis).
2. `python3 scripts/test.py all` pasa sin errores (`errs:[]`, `werrs:[]`).
3. Tiene su test en `t/` si añade sistema, o una captura en `docs/capturas/` si es visual.
4. Los textos cumplen el punto 2 y 3 de esta biblia.
5. Pasa la revisión de diseño (`docs/FABRICA.md`): nada que un jugador vería mal se publica. Nombres que se pisan, figuras sobre muebles, cosas que no se leen como lo que son, contenido al que no se llega jugando: se arreglan antes, no se apuntan.
6. Está en `docs/CHANGELOG.md` en una línea.
