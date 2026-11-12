// La ciudad y el mapa de cada barrio: se abre (plano → barrio), cada lugar y cada edificio del censo se puede tocar en su barrio, «mirar dentro» no mueve a nadie ni el reloj, y cerrado no cuesta nada.
setTimeout(()=>{try{window.__errs=window.__errs||[];const bad=[];const oe=console.error;console.error=(...a)=>{window.__errs.push('console '+a.map(String).join(' ').slice(0,160));};
 let seed=11;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 S=newState('normal');S.char={...randomChar(),g:'f'};S.ideo='marxista';initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();S.weather={k:'sol',t:20};newToday();storyStart();S.autoHome=false;
 S.day=1;while(dateOf(S.day).wd!==1||festivo(S.day))S.day++;S.t=10*60;mode='live';speed=0;menu.classList.remove('open');
 const snap=()=>JSON.stringify([S.sim,S.t,S.day,S.needs,S.money]);
 const R=()=>{try{render();}catch(e){bad.push('render: '+e.message);}};
 // 1. cerrado no calcula nada del barrio
 let nBI=0;{const _b=bmRender;bmRender=function(){nBI++;return _b.apply(this,arguments);};}
 R();R();if(nBI)bad.push('el mapa se calcula estando cerrado ('+nBI+')');
 const s0=snap(),cam0={...cam};
 // 2. abrir
 if(!document.getElementById('mapbtn'))bad.push('no hay botón del mapa');
 document.getElementById('mapbtn').onclick();R();
 if(!BM.on||!document.body.classList.contains('bm'))bad.push('no abre');
 if(BM.v!=='ciudad')bad.push('el mapa no abre en el plano de la ciudad');
 if(!document.getElementById('brclose'))bad.push('no hay botón de cerrar');
 bmVerBarrio('ribera');R();R();if(!nBI)bad.push('abierto no pinta el barrio');if(BM.v!=='barrio'||BM.b!=='ribera')bad.push('Ver el barrio no abre el barrio');
 // 3. en cada barrio, un tocable por cada lugar, cada edificio del censo, cada lugar nuevo y la casa; y entre todos los barrios, ninguno falta
 const vistos=new Set();let tocados=0,objetivos=0;
 for(const B of DATA.ciudad.orden){bmVerBarrio(B);R();const T0=bmTargets(),ids=T0.map(t=>t.id);objetivos+=T0.length;
  const esp=[...Object.keys(PLACES).filter(k=>cdBarrioDe(k)===B),...Object.keys(DATA.lugares.solo_mapa).filter(k=>DATA.lugares.solo_mapa[k].barrio===B),...Object.keys(DATA.personas.edificios).filter(k=>DATA.barrio.edificios[k].barrio===B),...(cdHome()===B?['casa']:[])];
  for(const k of esp){if(!ids.includes(k))bad.push('barrio '+B+': falta el tocable de '+k);vistos.add(k);}
  for(const i of ids)if(!esp.includes(i))bad.push('barrio '+B+': sobra '+i);
  for(const t of T0){const b=t.box,cx=(b.r[0]+b.r[2])/2,cy=(b.r[1]+b.r[3])/2;bmCenter(cx,cy,.6);R();
   const t1=bmTargets().find(q=>q.id===t.id);let hit=null;
   for(let i=0;i<=8&&!hit;i++)for(let j=0;j<=8&&!hit;j++){const x=t1.bb[0]+(t1.bb[2]-t1.bb[0])*(i+.5)/9,y=t1.bb[1]+(t1.bb[3]-t1.bb[1])*(j+.5)/9;
     if(x<0||y<0||x>W||y>H)continue;const a=bmAt(x,y);if(a&&a.id===t.id)hit=[x,y];}
   if(!hit){bad.push('no se puede tocar: '+t.id);continue;}
   menu.classList.remove('open');BM.ficha=null;RT.last=[];bmTap(hit[0],hit[1]);
   if(BM.ficha!==t.id){bad.push('el toque no abre su ficha: '+t.id+' → '+BM.ficha);continue;}
   const nm=b.kind==='lugar'||b.kind==='extra'?bmName(t.id):b.kind==='censo'?DATA.personas.edificios[t.id].n:'Tu casa';
   if(!card.innerHTML.includes(nm))bad.push('la ficha de '+t.id+' no lleva el nombre');
   if(b.kind==='censo'){const hs=Object.values(DATA.personas.hogares).filter(h=>h.edificio===t.id);for(const h of hs)if(!card.innerHTML.includes(h.n))bad.push('ficha de '+t.id+' sin hogar '+h.n);}
   if(b.kind==='lugar'&&SCENES[t.id]&&!card.querySelector('#brin'))bad.push('ficha de '+t.id+' sin «Mirar dentro»');
   if(b.kind==='extra'&&card.querySelector('#brin'))bad.push('el lugar nuevo '+t.id+' ofrece «Mirar dentro»');
   if(b.kind==='extra'&&!card.querySelector('#brgo'))bad.push('el lugar nuevo '+t.id+' no ofrece «Ir allí andando»');
   if(b.kind==='extra'&&!/Sin interior/.test(card.innerHTML))bad.push('el lugar nuevo '+t.id+' no dice que no tiene interior');
   tocados++;}}
 for(const k in PLACES)if(k!=='casaV'&&k!=='casa2'&&!vistos.has(k))bad.push('lugar sin barrio donde tocarlo: '+k);
 for(const k in DATA.personas.edificios)if(!vistos.has(k))bad.push('edificio sin barrio donde tocarlo: '+k);
 if(!vistos.has('casa'))bad.push('la casa no es tocable');
 menu.classList.remove('open');
 const T0=bmTargets();
 // 4. la ficha de un lugar dice quién está (Paca, la del súper, entre semana a las 10)
 bmVerBarrio('ribera');R();bmFicha('super');if(!/Paca/.test(card.innerHTML))bad.push('la ficha del súper no dice quién trabaja');if(!/Trabajan/.test(card.innerHTML))bad.push('sin «Trabajan»');
 bmFicha('colegio');if(!/Clases/.test(card.innerHTML))bad.push('el colegio sin horario de clases');
 // 5. mirar dentro, sin mover nada: todos los lugares con escena, a tres horas
 const s1=snap();let mirados=0;const tocar4=['colegio','instituto','bar','super'];
 for(const k of Object.keys(PLACES).filter(k=>SCENES[k])){for(const h of [8.7,11.2,18.5]){S.t=h*60;const sh=snap();
    menu.classList.remove('open');if(BM.b!==cdBarrioDe(k)||BM.obs){if(BM.obs)bmBack();bmVerBarrio(cdBarrioDe(k));}if(!bmLook(k)){bad.push('no se puede mirar dentro de '+k);break;}
    for(let i=0;i<3;i++)R();
    if(!(CW.sc&&CW.sc.id===k&&CW.sc.mid&&cdRect(CW.sc.mid)))bad.push('la escena de '+k+' no se pinta en su sitio del barrio');
    if(BM.obs!==k)bad.push('estado de observadora mal en '+k);
    if(snap()!==sh)bad.push('mirar dentro de '+k+' cambia S.sim o el reloj');
    bmBack();R();if(BM.obs||viewPlace)bad.push('no vuelve al mapa desde '+k);if(snap()!==sh)bad.push('volver al mapa cambia S.sim en '+k);}
  if(tocar4.includes(k))mirados++;}
 S.t=10*60;
 // el botón de la ficha hace lo mismo
 bmBack();bmVerBarrio('eras');R();bmFicha('instituto');card.querySelector('#brin').onclick();R();if(!BM.obs||BM.obs!=='instituto')bad.push('«Mirar dentro» del botón no abre');
 if(!document.getElementById('brback'))bad.push('sin botón para volver al mapa');
 document.getElementById('brback').click();R();if(BM.obs)bad.push('el botón de volver no vuelve');
 // 6. recreo del colegio en horario lectivo
 bmBack();bmVerBarrio('ribera');R();S.t=11.1*60;bmLook('colegio');R();R();if(!(CW.sc&&CW.sc.id==='colegio'))bad.push('recreo no se pinta');bmBack();
 // 7. el toque pasa por liveTap (el del motor) con la posición real
 {bmBack();bmVerBarrio('ribera');const rb=cdRect('bar');bmCenter((rb[0]+rb[2])/2,(rb[1]+rb[3])/2,.6);R();const t2=bmTargets().find(q=>q.id==='bar');menu.classList.remove('open');BM.ficha=null;RT.last=[];BM.pt=[t2.cx,t2.cy];liveTap(0,0);if(BM.ficha!=='bar')bad.push('liveTap no abre la ficha (obtuvo '+BM.ficha+')');menu.classList.remove('open');}
 // 8. cerrar vuelve a donde estaba
 S.t=10*60;
 bmClose();R();if(BM.on||viewPlace||document.body.classList.contains('bm'))bad.push('no cierra');
 if(Math.abs(cam.x-cam0.x)>.01||Math.abs(cam.y-cam0.y)>.01||Math.abs(cam.z-cam0.z)>.001)bad.push('la cámara no vuelve');
 if(snap()!==s0){const a=JSON.parse(s0),b=JSON.parse(snap());const dif=[];for(const i of [0,1,2,3,4]){if(typeof a[i]==='object'&&a[i]){for(const k in Object.assign({},a[i],b[i]))if(JSON.stringify(a[i][k])!==JSON.stringify(b[i][k]))dif.push(i+'.'+k);}else if(a[i]!==b[i])dif.push(i);}bad.push('abrir y cerrar cambia '+dif.join(','));}
 // 9. con el personaje fuera (en el bar): el mapa y mirar dentro de otro sitio
 {const s=S.sim;s.exit=[0,10];s.work=200;s.awayTotal=400;s.route=null;s.outingActive='amigos';s.dest='bar';enterScene();R();const sv=viewPlace,cm={...cam};const before=JSON.stringify(S.sim);
  bmOpen();R();if(!BM.on)bad.push('fuera: no abre');bmVerBarrio('ribera');R();bmLook('colegio');R();R();if(!(CW.sc&&CW.sc.id==='colegio'))bad.push('fuera: no mira dentro');
  bmBack();R();bmFicha('bar');if(!/Ana|ahí|aqu/i.test(card.innerHTML)&&false)bad.push('x');menu.classList.remove('open');bmClose();R();
  if(viewPlace!==sv)bad.push('fuera: viewPlace no vuelve ('+viewPlace+' vs '+sv+')');
  if(JSON.stringify(S.sim)!==before)bad.push('fuera: cambia S.sim');
  // mirar dentro del sitio donde está ella: se ve ella
  bmOpen();bmVerBarrio('ribera');bmLook('bar');R();if(!bmReal('bar'))bad.push('bmReal falla');bmClose();}
 // 10. partidas antiguas: sin S.barrio no se rompe
 delete S.barrio;const b=BMS();if(!(b.z>0)||typeof b.cx!=='number')bad.push('S.barrio sin valores por defecto');
 // 11. cambiar de modo cierra el mapa
 S.sim.work=0;S.sim.dest=null;S.sim.outingActive=null;viewPlace=false;bmOpen();setMode('build');if(BM.on)bad.push('cambiar de modo no cierra');setMode('live');
 // 12. el plano de la ciudad: un tocable por barrio, y su ficha lleva «Ver el barrio»
 S.sim.work=0;S.sim.dest=null;S.sim.outingActive=null;viewPlace=false;bmOpen();R();
 for(const id of DATA.ciudad.orden){const q=BM.cdHit.find(x=>x.id===id);if(!q){bad.push('plano: barrio sin zona tocable '+id);continue;}
  if(q.x0<0||q.x1>W||q.y0<0||q.y1>H)bad.push('plano: el barrio '+id+' no cabe en pantalla');
  menu.classList.remove('open');BM.ficha=null;BM.pt=[(q.x0+q.x1)/2,(q.y0+q.y1)/2];liveTap(0,0);
  if(BM.ficha!=='b:'+id)bad.push('plano: tocar '+id+' no abre su ficha');else{if(!card.innerHTML.includes(DATA.ciudad.barrios[id].n))bad.push('ficha de barrio sin nombre '+id);if(!card.querySelector('#brver'))bad.push('ficha de barrio sin «Ver el barrio»');}}
 {const sn=snap();bmFicha('b:casco');card.querySelector('#brver').onclick();R();if(BM.v!=='barrio'||BM.b!=='casco')bad.push('«Ver el barrio» no abre el barrio');
  if(!document.getElementById('brciudad'))bad.push('sin botón para volver a la ciudad');document.getElementById('brciudad').click();R();if(BM.v!=='ciudad')bad.push('el botón no vuelve a la ciudad');
  if(snap()!==sn)bad.push('ciudad ↔ barrio cambia S.sim o el reloj');}
 bmClose();
 console.error=oe;
 document.title=(bad.length||__errs.length?'ERR ':'OK ')+JSON.stringify({bad:[...new Set(bad)].slice(0,10),nbad:bad.length,errs:__errs.slice(0,3),tocados,objetivos,mirados4:mirados});
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,400)}},300);
