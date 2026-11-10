# Encargo: que las escenas de Casita parezcan vivas y reales

Casita es un simulador de vida en español (tipo Sims, isométrico, canvas 2D, un solo HTML: `/home/claude/casita.html`).
Cuando el personaje (por defecto Ana) sale de casa, el juego dibuja una **escena** del sitio al que va: el súper donde trabaja de cajera, el bar donde queda con amigas, el local del sindicato, la comisaría si la detienen, etc.
Hoy las escenas son pobres: una caja con cuatro muebles y dos muñecos quietos. El objetivo es que cada una parezca un sitio **vivo y real**.

## Reglas de trabajo (importante: trabajáis varios agentes a la vez)
- Edita **solo** tus archivos `/home/claude/mods/scenes/<clave>.js`. **No toques** `casita.html` ni archivos de otras escenas.
- Todos los archivos de escena se concatenan en el mismo ámbito. Cualquier función o constante a nivel de archivo debe llevar un prefijo único: `sc_<clave>_...` (p. ej. `sc_bar_taburete`). Mejor aún, declara las ayudas dentro de la propia función de la escena.
- Si echas en falta una primitiva, créala en tu archivo con prefijo. No modifiques las globales.
- Prueba con: `python3 /home/claude/scripts/scene_shot.py <clave> act:hora:crisis:clima ...` → genera `/home/claude/t/scenes/<clave>_N.png` (900×700) y muestra errores. Mira las capturas con la herramienta Read y repite hasta que quede bien. Prueba siempre de día, de noche y con crisis alta, y cada `act` que use tu escena.
- Al terminar, comprueba la sintaxis del conjunto: `cd /home/claude && cp casita.html /tmp/chk_<clave>.html && python3 scripts/build_scenes.py /tmp/chk_<clave>.html && sed -n '/<script>/,/<\/script>/p' /tmp/chk_<clave>.html | sed '1d;$d' > /tmp/chk_<clave>.js && node --check /tmp/chk_<clave>.js` (si falla por el archivo de *otra* escena, ignóralo: no es tuyo).

## Contrato de cada escena
```js
SCENES['clave']=function(E){
  // E = {tt (segundos, para animar), night (0 día … 1 noche), act ('work' o la actividad), w (mundo: crisis, mov, gov, era, manif, gs, elec), npc (12 personajes de ejemplo), cp (compañera de trabajo o undefined), h (hora decimal), key}
  return {W, D,          // tamaño de la sala en casillas (cabe bien hasta ~12×9)
          floor, wall,   // colores
          out,           // true = exterior (sin paredes)
          tile,          // dibujar juntas de baldosa
          decor,         // función: lo que va pegado a las paredes / fondo (se dibuja antes que lo demás)
          items,         // [{d: x+y, f: ()=>dibujar}] ordenados por profundidad (x+y), los mete el motor en orden
          ana,           // {x,y,pose:'stand'|'sit'|'walk',act,front,right,prop?,z?,walkPh?,helmet?,vest?,sad?}
          drawBase?,     // opcional: sustituye suelo+paredes por defecto (sFloor/sWalls)
          after? };      // opcional: capa final (luz, lluvia en ventanas, viñeta…)
};
```
Coordenadas: `x` hacia la derecha-abajo, `y` hacia la izquierda-abajo, `z` en píxeles hacia arriba. Las paredes por defecto están en y=0 (pared del fondo, de x=0 a W) y x=0 (pared izquierda). `P(x,y,z)` → píxel. Lo que está más cerca de la cámara tiene x+y mayor.

## Primitivas disponibles (globales, solo lectura)
- Geometría: `P(x,y,z)`, `poly(pts,fill,stroke)`, `prism(x0,y0,x1,y1,z0,z1,col)`, `sBox(...)` (= prismG, con degradado), `topQuad(x0,y0,x1,y1,z,col)`, `sTop`, `cyl(cx,cy,r,z0,z1,col,topCol)`, `isoEll(cx,cy,z,r,col)`, `circ(x,y,r,col)` (en píxeles), `capsule(x1,y1,x2,y2,w,col)`, `emoji(e,x,y,size)`, `label(text,x,y,bg,fg,size)`, `shade(hex,f)`, `mixHex(a,b,t)`, `hash(i)` (0..1 determinista).
- Muebles: `sFloor, sWalls(W,D,h,col,night,win)`, `sPoster(x,z,col,txt,onX)`, `sBanner(x0,x1,z,txt)`, `sChair, sTable, sDesk, sShelf(x,y,len,dirX), sCaja, sBed, sArm, sPew, sTree, sBench, sScaffold, sBricks, sBoxes`.
- Gente: `sPerson(x,y,ch,{act,pose,front,right,ph,name,prop,shirt,mood,sad,helmet,vest})`. `act` puede ser: `type, talk, eat, phone, book, stir, hammer, dig, strum, watch, cheer, paint` (mira `drawAna` en casita.html, línea ~660, para ver qué hace cada uno). `pose:'walk'` con `ph:tt*6+k` para que caminen. `npc[k]` (k=0..11) son personajes variados; puedes clonarlos y cambiarles ropa/pelo (`{...npc[3],shirt:'#2a9d8f'}`). `elder(k)` da una persona mayor. Peinados admitidos en `style`: corto, media, melena, coleta, mono, rizos, afro, rapado, calvo.
- Coches: `drawCar(u,v,col,[u2,v2],night)` (en coordenadas de vista; en una escena vale pasar x,y directamente).
- Estado: `S` (partida), `CH()` (personaje: name, g), `P_('madre'|'amiga'|'vecina'|'compi')` (gente con `.n` nombre), `S.weather.k` ('sol','lluvia','nieve'…), `S.snow`, `seasonOf()` ('pri','ver','oto','inv'), `dateOf(S.day)` ({wd,dm,m}), `dayType(S.day)` ('work','weekend','fest','vac'), `W_()` (crisis 0..100, mov 0..100 movimiento social, gov, era 'represion'…), `S.strike` (huelga en curso, `.join`), `TOX()` (0..1 toxicidad del trabajo), `office()` (`.n` nombre de la empresa), `S.track`, `CAREER[S.career].t`, `S.ideo`.
- Actividades (`E.act`) y a dónde llevan: mira `destOf` en casita.html (~línea 3255) y el objeto `OUT` (~línea 2900). Trabajo según oficio: oficina/tech→torre, super→super, hostelería→bar, obra→obra, cuidados→residencia, función pública→ayto, rider→_ride, arte→sala, negocio→tienda, coop→coop. `amigos` puede ir a bar, sala o parque; `eat`→bar; `militancia`→ateneo (izquierda), parroquia (conservadora), torre (liberal), ayto (socialdemócrata); `manifestacion`→ayto; `voluntariado`→comedor o parroquia; `deporte`→parque; `networking`→torre; `misa`→parroquia; `biblioteca`; `comedor` (comer en el comedor social); `piquete`→_piquete; detenida→comisaria (act 'calabozo').

## Qué significa «vivo y real»
1. **Arquitectura creíble**: zócalos, puertas, ventanas con marco, luz que entra, techos/lámparas, suelo con material (madera, baldosa, terrazo, asfalto), detalles de pared (cuadros, carteles, extintor, enchufes, reloj, radiadores). Rótulos en español.
2. **Mobiliario y atrezo denso pero legible**: lo que de verdad hay en ese sitio en España (un bar de barrio tiene barra con tapas, tirador de cerveza, máquina tragaperras, tele con fútbol, servilletas en el suelo…).
3. **Gente haciendo cosas distintas** y algunos caminando (pose walk con ph animado y posición que cambia con `tt`). Variedad: edades, ropa de trabajo cuando toca (batas, chalecos, uniformes). Nombres solo para gente conocida (`cp.n`, `P_('amiga').n`).
4. **Que responda al juego**: hora (mañana tranquila, tarde llena, noche con luz artificial cálida y ventanas oscuras), clima (paraguas, ventanas con lluvia, nieve fuera), estación, crisis (más cola en el comedor, carteles de ERE, estanterías medio vacías, local cerrado), movimiento social/huelga (pancartas, carteles de asamblea), el `act` (Ana trabajando vs. de visita: posición, pose y acción distintas).
5. **Animación sutil** con `tt`: vapor de café, parpadeo de pantallas, gente que entra y sale, coches/bicis pasando por la ventana, humo, hojas.
6. **Ana bien colocada** y visible (que no la tape un mueble), con la acción adecuada.
7. **Rendimiento**: nada de bucles enormes por fotograma; la escena entera debería dibujarse en unos pocos milisegundos. Usa `hash()` para variación estable, no `Math.random()` (parpadearía cada fotograma).

## Entrega
Cuando termines, responde con un resumen breve (máx. 10 líneas) por escena: qué hay ahora, cómo reacciona al estado del juego, y cualquier problema que no hayas podido resolver. No pegues código en la respuesta.
