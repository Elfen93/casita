// La ciudad como dato: todo lugar y edificio tiene barrio y puerta; camino a pie entre todas las parejas de puertas de cada barrio;
// trayecto entre todos los barrios (y entre todas las parejas de sitios); el plano → barrio → ficha → mirar dentro → volver sin tocar S.sim ni S.t;
// partidas antiguas sin estado nuevo; y que lo que se ve en cada barrio no se pisa.
setTimeout(()=>{try{window.__errs=window.__errs||[];const bad=[];const oe=console.error;console.error=(...a)=>{window.__errs.push('console '+a.map(String).join(' ').slice(0,160));};
 let seed=5;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 S=newState('normal');S.char={...randomChar(),g:'f'};S.ideo='marxista';initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();S.weather={k:'sol',t:20};newToday();storyStart();S.autoHome=false;
 S.day=1;while(dateOf(S.day).wd!==1||festivo(S.day))S.day++;S.t=10*60;mode='live';speed=0;menu.classList.remove('open');
 const R=()=>{try{render();}catch(e){bad.push('render: '+e.message);}};
 const C=DATA.ciudad,ok=(c,m)=>{if(!c)bad.push(m);};
 // ---- 1. datos: cada lugar y edificio, con barrio y puerta ----
 ok(C.orden.length>=5&&C.orden.length<=7,'entre 5 y 7 barrios');
 const todos=[...Object.keys(PLACES).filter(k=>k!=='casaV'&&k!=='casa2'),...Object.keys(DATA.lugares.solo_mapa),...Object.keys(DATA.personas.edificios)];
 for(const k of todos){const b=cdBarrioDe(k);ok(b&&C.barrios[b],'sin barrio: '+k);const r=cdRect(k);ok(r&&r.length===4,'sin rectángulo local: '+k);const p=cdPuerta(k);ok(p&&p.b===b&&p.p.length===2&&p.c,'sin puerta: '+k);}
 const nx=Object.keys(DATA.lugares.solo_mapa).length;ok(nx>=6&&nx<=12,'lugares nuevos entre 6 y 12 ('+nx+')');
 for(const k in DATA.lugares.solo_mapa){ok(!SCENES[k]&&!PLACES[k],'lugar nuevo con escena: '+k);ok(!(DATA.lugares.solo_mapa[k].outs||[]).length,'lugar nuevo con salidas: '+k);}
 for(const b of C.orden){ok(cdEspeciales(b).some(s=>s.t==='parada'),'barrio sin parada: '+b);}
 // la vivienda del jugador: cada tipo cae en su barrio con casa y vecinas
 for(const t in HOMES){const hb=C.vivienda[t];ok(hb&&C.barrios[hb],'vivienda sin barrio: '+t);S.home=S.home||{};const old=S.home.type;S.home.type=t;
  ok(cdHome()===hb,'cdHome de '+t);ok(cdBarrioDe('casa')===hb&&cdBarrioDe('casaV')===hb&&cdBarrioDe('casa2')===hb,'casa y vecinas no están en el barrio de '+t);
  for(const k of ['casa','casaV','casa2']){ok(cdPuerta(k)&&cdRect(k),'sin puerta o rect de '+k+' con '+t);}S.home.type=old;}
 ok(cdBarrioDe('casa')===C.vivienda.viejo,'casa del personaje base');
 // ---- 2. camino a pie entre todas las parejas de puertas de cada barrio ----
 let parejas=0,rotulos=0;
 for(const b of C.orden){const ks=Object.keys(C.barrios[b].puertas);
  for(const a of ks)for(const c of ks){const p=cdCamino(b,a,c);parejas++;if(!p){bad.push('sin camino '+b+': '+a+'→'+c);continue;}
   const da=C.barrios[b].puertas[a],dc=C.barrios[b].puertas[c];
   if(p[0][0]!==da[0]||p[0][1]!==da[1]||p[p.length-1][0]!==dc[0]||p[p.length-1][1]!==dc[1])bad.push('el camino no empieza o acaba en las puertas '+b+': '+a+'→'+c);
   const man=Math.abs(da[0]-dc[0])+Math.abs(da[1]-dc[1]);if(cdLong(p)<man-1e-6)bad.push('camino más corto que la distancia: '+a+'→'+c);
   for(let i=1;i<p.length;i++){if(p[i][0]!==p[i-1][0]&&p[i][1]!==p[i-1][1])bad.push('tramo en diagonal '+b+': '+a+'→'+c);
     const m=[(p[i][0]+p[i-1][0])/2,(p[i][1]+p[i-1][1])/2];if(!C.barrios[b].calles.some(cl=>cdOn(cl,m)))bad.push('el camino sale de las calles '+b+': '+a+'→'+c);}
   const q=cdCamino(b,c,a);if(!q||Math.abs(cdLong(q)-cdLong(p))>1e-6)bad.push('camino no simétrico '+a+'↔'+c);}}
 {const p=cdCamino('ribera','super','bar');const l=cdLong(p);p[0][0]=-99;p.pop();if(cdLong(cdCamino('ribera','super','bar'))!==l)bad.push('cdCamino devuelve el grafo, no una copia');}
 ok(cdCamino('ribera','super','nave_que_no_existe')===null,'camino a un id que no existe debe dar null');
 ok(Math.abs(cdMinPie([[0,0],[1000/CDX().ciudad.m_casilla,0]])-12)<1e-9,'1 km de casillas (casilla de 5 m): 12 min a pie ('+cdMinPie([[0,0],[1000/CDX().ciudad.m_casilla,0]])+')');
 // ---- 3. trayecto entre todas las parejas de sitios ----
 let trayectos=0,conTransporte=0;
 for(let i=0;i<todos.length;i++)for(let j=i+1;j<todos.length;j++){const a=todos[i],c=todos[j],t=cdTrayecto(a,c);trayectos++;
  if(!t){bad.push('sin trayecto '+a+'→'+c);continue;}
  const u=cdTrayecto(c,a);if(!u||Math.abs(u.min-t.min)>.65)bad.push('trayecto no simétrico '+a+'↔'+c+': '+t.min+' vs '+(u&&u.min));
  const s=t.tramos.reduce((x,y)=>x+y.min,0);if(Math.abs(s-t.min)>.05*t.tramos.length+.05)bad.push('los tramos no suman '+a+'→'+c+': '+s+' vs '+t.min);
  if(!(t.min>=0&&t.tramos.length))bad.push('trayecto vacío '+a+'→'+c);
  if(t.tramos.some(x=>x.m!=='pie'&&x.m!=='paso'))conTransporte++;
  const ph=t.tramos.reduce((x,y)=>x+(y.h||0),0);if(Math.abs(ph-t.h)>1e-6||(t.h>0&&!(t.precio>0)))bad.push('precio incoherente '+a+'→'+c);
  const f=t.tramos[0];if(f.m==='pie'){const d=cdPuerta(a).p;if(f.pts[0][0]!==d[0]||f.pts[0][1]!==d[1])bad.push('el trayecto no sale de la puerta de '+a);}
  const l=t.tramos[t.tramos.length-1];if(l.m==='pie'){const d=cdPuerta(c).p,q=l.pts[l.pts.length-1];if(q[0]!==d[0]||q[1]!==d[1])bad.push('el trayecto no llega a la puerta de '+c);}
  // a pie ~12 min/km: nunca menos que la distancia en línea recta entre barrios
  if(cdBarrioDe(a)===cdBarrioDe(c)&&t.tramos.length!==1)bad.push('en el mismo barrio es un solo tramo a pie');}
 ok(conTransporte>20,'casi nadie usa transporte ('+conTransporte+')');
 // el mismo cálculo que scripts/datos.py (trayecto_py), calculado allí
 for(const [a,c,m,pr] of [['super','torre',9.7,0],['b_olivo','obra',16.7,0],['parroquia','coop',25.4,.2],['c_noria','ayto',14.4,0],['instituto','glorieta',17.5,0],['itv','uni_privada',26.2,0],['bar','locutorio',16.1,0],['descampado','gymbueno',18.8,.2]]){
  const t=cdTrayecto(a,c);if(!t||Math.abs(t.min-m)>.11||Math.abs(t.h-pr)>1e-6)bad.push('distinto de datos.py: '+a+'→'+c+' da '+(t&&t.min)+'/'+(t&&t.h)+' y debería dar '+m+'/'+pr);}
 {const t=cdTrayecto('parroquia','coop');ok(t.tramos.some(x=>x.m==='metro'&&x.linea==='L1'&&x.espera>0&&x.paradas.length>=2),'parroquia→coop debería llevar un tramo de metro con espera');
  ok(typeof t.precio==='number'&&t.precio>0,'precio en euros con hrs()');}
 ok(cdTrayecto('super','super')&&cdTrayecto('super','super').min===0,'de un sitio a sí mismo: 0 min');
 // ---- 4. el mapa: ciudad → barrio → ficha → mirar dentro → volver, sin cambiar S.sim ni S.t ----
 const snap=()=>JSON.stringify([S.sim,S.t,S.day,S.needs,S.money]);const s0=snap();
 bmOpen();R();ok(BM.on&&BM.v==='ciudad','abre en la ciudad');
 {const q=BM.cdHit.find(x=>x.id==='ribera');BM.pt=[(q.x0+q.x1)/2,(q.y0+q.y1)/2];liveTap(0,0);ok(BM.ficha==='b:ribera','tocar el barrio abre su ficha');
  const h=card.innerHTML;for(const w of ['La Ribera','Obrero','Lo bueno','Lo que cuesta','Qué hay','Cómo se llega'])ok(h.includes(w),'ficha de barrio sin «'+w+'»');ok(/Vive aquí del censo/.test(h),'ficha de barrio sin gente del censo');
  card.querySelector('#brver').onclick();R();ok(BM.v==='barrio'&&BM.b==='ribera','Ver el barrio');
  bmFicha('colegio');ok(card.querySelector('#brin'),'ficha del colegio con Mirar dentro');card.querySelector('#brin').onclick();R();R();ok(BM.obs==='colegio'&&CW.sc&&CW.sc.id==='colegio','mirar dentro del colegio (abierto en su sitio del barrio)');
  document.getElementById('brback').click();R();ok(!BM.obs&&BM.v==='barrio','vuelve al barrio');
  document.getElementById('brciudad').click();R();ok(BM.v==='ciudad','vuelve a la ciudad');
  bmVerBarrio('casco');R();bmFicha('mercado');ok(card.querySelector('#brx')&&!card.querySelector('#brin')&&/Sin interior/.test(card.innerHTML),'mercado: ficha sin interior');
  ok(/Abierto/.test(card.innerHTML)&&/8:30/.test(card.innerHTML),'mercado: ficha con horario');
  bmClose();R();ok(!BM.on,'cierra');}
 if(snap()!==s0)bad.push('abrir y cerrar el mapa cambia S.sim, S.t o el dinero');
 // ---- 5. partidas antiguas: sin estado nuevo, o con el estado del mapa de antes ----
 delete S.barrio;bmOpen();R();bmVerBarrio('eras');R();bmClose();
 S.barrio={z:.3,cx:20,cy:20};bmOpen();R();bmVerBarrio('pinares');R();ok(S.barrio.cam&&typeof S.barrio.cam==='object','estado antiguo sin cam: se crea');bmClose();
 ok(JSON.stringify(S.barrio).length<300,'el estado del mapa en S es pequeño');
 // ---- 6. legibles: en cada barrio, con zoom de salida y con el barrio entero, los rótulos de edificios no se pisan y están todos ----
 for(const B of C.orden){bmOpen();bmVerBarrio(B);
  for(const zz of [0,.26]){if(zz)bmCenter(...cdTam(B).map(x=>x/2),zz);else{bmCenter(...cdTam(B).map(x=>x/2),bmFitZ());}R();R();
   const pl=RT.last||[];rotulos+=pl.length;const ids=bmTargets().filter(t=>bmSee(t.bb)).map(t=>t.id),got=new Set(pl.map(p=>p.bmid));
   for(let i=0;i<pl.length;i++){const a=pl[i];if(a.x0<0||a.x1>W||a.y0<0||a.y1>H)bad.push(B+' z'+zz+': rótulo fuera de pantalla '+a.name);
     for(let j=i+1;j<pl.length;j++){const c=pl[j];if(a.x0<c.x1&&c.x0<a.x1&&a.y0<c.y1&&c.y0<a.y1)bad.push(B+' z'+zz+': rótulos que se pisan: '+a.name+' / '+c.name);}}
   if(zz===0)for(const id of ids)if(!got.has(id))bad.push(B+' con el barrio entero: falta el rótulo de '+id);}
  bmClose();}
 console.error=oe;
 document.title=(bad.length||__errs.length?'ERR ':'OK ')+JSON.stringify({bad:[...new Set(bad)].slice(0,12),nbad:bad.length,errs:__errs.slice(0,3),parejas,trayectos,conTransporte,rotulos});
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,400)}},300);
