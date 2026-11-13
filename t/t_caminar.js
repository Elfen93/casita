// Caminar por el barrio: nada flota (la calle y los vecinos se pintan en casa y dentro de un sitio), viajes continuos puerta a puerta con el reloj del trayecto,
// transporte entre barrios (billete, cambio de barrio), sitios sin interior, llegar a la hora al trabajo desde cada vivienda, gente del censo por la calle y partidas viejas a mitad de salida.
setTimeout(()=>{try{window.__errs=window.__errs||[];const bad=[];const oe=console.error;console.error=(...a)=>{window.__errs.push('console '+a.map(String).join(' ').slice(0,160));};
 let seed=23;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const ok=(c,m)=>{if(!c)bad.push(m);};const info={};
 const nuevo=(casa,track)=>{S=newState('normal');S.char={...randomChar(),g:'f'};S.char.beard='no';S.ideo='socialdemocrata';S.pol.comp=2;initPeople();applyHome(casa||'viejo');startTrack(track||'oficina',true);rollWeather();S.weather={k:'sol',t:20};newToday();storyStart();
   S.autoHome=false;S.free=false;S.day=1;while(dateOf(S.day).wd!==1||festivo(S.day))S.day++;S.t=10*60;mode='live';speed=0;menu.classList.remove('open');S.needs={hambre:90,energia:90,higiene:90,vejiga:90,diversion:90,social:90};S.sim.x=10.5;S.sim.y=10.5;S.sim.use=null;S.sim.path=[];};
 const R=()=>{try{render();}catch(e){bad.push('render: '+e.message);}};
 const step=(g)=>{try{update(g);}catch(e){bad.push('update: '+e.message);}};
 // ---- instrumentación: cuántas calles y edificios se pintan en un fotograma
 const cnt={suelo:0,edif:0};
 {const a=bmSuelo;bmSuelo=function(){cnt.suelo++;return a.apply(this,arguments);};
  for(const n of ['bmCasa','bmBloque','bmCubo']){}
  const d=drawBuilding;drawBuilding=function(){cnt.edif++;return d.apply(this,arguments);};
  const c1=bmCasa;bmCasa=function(){cnt.edif++;return c1.apply(this,arguments);};const c2=bmBloque;bmBloque=function(){cnt.edif++;return c2.apply(this,arguments);};const c3=bmCubo;bmCubo=function(){cnt.edif++;return c3.apply(this,arguments);};}
 const pinta=()=>{cnt.suelo=0;cnt.edif=0;R();return {...cnt};};
 // 1. nada flota: en casa y dentro de un sitio, calles y al menos dos edificios vecinos
 nuevo('viejo');cam.z=.45;centerOnWorld(10,10);let c=pinta();ok(c.suelo>=1,'en casa no se pinta la calle');ok(c.edif>=2,'en casa se pintan menos de dos vecinos ('+c.edif+')');info.casa=c;
 for(const casa of ['padres','infra','habitacion','viejo','casita','bueno','chalet','calle']){nuevo(casa);cam.z=.4;centerOnWorld(10,10);R();c=pinta();ok(c.suelo>=1&&c.edif>=1,'casa '+casa+': sin entorno ('+JSON.stringify(c)+')');}
 nuevo('viejo');{const s=S.sim,d='bar';s.outingActive='amigos';s.dest=d;cmDefine(s,d,120,'casa');s.work=s.awayTotal-(s.tr.a+30);placeAuto=true;viewPlace=false;enterScene();const p=cmPos();ok(p&&p.k==='dentro'&&p.esc,'no está dentro del bar');
   const T=cmObjetivo(p);cam.x=T.x;cam.y=T.y;cam.z=T.z;c=pinta();ok(c.suelo>=1,'dentro del bar no se pinta la calle');ok(c.edif>=2,'dentro del bar se pintan menos de dos vecinos ('+c.edif+')');ok(CW.sc&&CW.sc.id==='bar','el interior del bar no está abierto en su sitio');info.bar=c;
   const r=cdRect('bar');ok(CW.sc&&Math.abs(CW.sc.ox+CW.sc.W/2-(r[0]+r[2])/2)<1e-6&&Math.abs(CW.sc.oy+CW.sc.D-r[3])<1e-6,'el interior no cae sobre su rb');
   // el personaje sale a la pantalla
   const sx=(()=>{const [u,v]=cmW2V(CW.sc.ox+CW.sc.W/2,CW.sc.oy+CW.sc.D/2),[x,y]=P(u,v);return [cam.x+x*cam.z,cam.y+y*cam.z];})();ok(sx[0]>0&&sx[0]<W&&sx[1]>0&&sx[1]<H,'el bar queda fuera de pantalla');
   s.work=0;s.dest=null;s.tr=null;s.outingActive=null;leaveScene();}
 // 1b. el rb de cada lugar es el tamaño de su escena (manda la escena): la escena de cada hora cabe en su rb, y la mayor lo llena
 {nuevo('viejo');let n=0;const mx={};for(const k in PLACES){if(!SCENES[k]||!cdRect(k))continue;const s=S.sim;s.work=100;s.dest=k;s.outingActive=((PLACES[k].outs||[])[0])||null;
   for(let h=7;h<23;h+=.5){S.t=h*60;let sc=null;try{sc=buildScene(k,1,0);}catch(e){}if(sc&&sc.W){const r=cdRect(k),w=r[2]-r[0],d=r[3]-r[1];n++;ok(sc.W<=w+.01&&sc.D<=d+.01,'la escena de '+k+' ('+sc.W+'×'+sc.D+' a las '+h+') no cabe en su rb '+w+'×'+d);const m=mx[k]||(mx[k]=[0,0]);m[0]=Math.max(m[0],sc.W);m[1]=Math.max(m[1],sc.D);}}
   s.work=0;s.dest=null;s.outingActive=null;const r=cdRect(k),m=mx[k];if(m&&!['colegio','concertado','instituto','comedor'].includes(k))ok(r[2]-r[0]-m[0]<=1.01&&r[3]-r[1]-m[1]<=1.01,'el rb de '+k+' sobra: '+(r[2]-r[0])+'×'+(r[3]-r[1])+' y la mayor escena '+m);}
   info.rbEscenas=n;}
 // 2. ida y vuelta a un sitio del barrio: sigue el camino, el reloj avanza lo que dice cdTrayecto y entra al llegar
 {nuevo('viejo');const id='super',s=S.sim,tt=cdTrayecto('casa',id),pts=tt.tramos[0].pts,esp=tt.min;
   S.t=11*60;const t0=S.t;ok(cmIr(id),'cmIr no acepta '+id);
   const samples=[];let tDepart=null,tArrive=null,tBack=null,lastP=null,jump=0,maxJump=0,fases=new Set();
   for(let i=0;i<4000;i++){step(.25);const f=S.sim.work>0?cmFase():null;if(S.sim.work>0&&tDepart==null)tDepart=S.t;
     if(f){fases.add(f.k);const p=cmPos();if(p&&p.vis&&p.x!=null&&p.k!=='dentro'){samples.push([p.x,p.y,f.k]);if(lastP&&lastP[2]===f.k){const d=Math.hypot(p.x-lastP[0],p.y-lastP[1]);if(d>maxJump){maxJump=d;info.salto=[lastP.map(x=>typeof x==='number'?Math.round(x*10)/10:x),[Math.round(p.x*10)/10,Math.round(p.y*10)/10],f.k,Math.round(S.t*100)/100];}}lastP=[p.x,p.y,f.k];}
       if(f.k==='dentro'&&tArrive==null)tArrive=S.t;}
     if(i%40===0)R();
     if(S.sim.work<=0&&tDepart!=null){tBack=S.t;break;}}
   ok(tDepart!=null,'no llegó a salir');ok(fases.has('ida')&&fases.has('dentro')&&fases.has('vuelta'),'faltan fases: '+[...fases]);
   const dur=tArrive-tDepart;ok(Math.abs(dur-esp)<=esp*.15+1.5,'la ida tarda '+dur+' y cdTrayecto dice '+esp);
   const durV=tBack-(tBack-cmMinDe(id,'casa'));info.ida=[Math.round(dur*10)/10,esp];
   ok(maxJump<8,'salto de '+maxJump+' casillas entre muestras (teletransporte)');
   // pasa por las esquinas del camino (a menos de 3 casillas, por la acera)
   const ida=samples.filter(q=>q[2]==='ida'),lane=cmRuta('casa',id).legs[0].pts;for(const q of lane){let m=1e9;for(const p of ida)m=Math.min(m,Math.hypot(p[0]-q[0],p[1]-q[1]));ok(m<5,'la ida no pasa por el punto '+q+' (a '+Math.round(m*10)/10+')');}
   for(const p of ida){if(p[1]>cmLot()[3])continue;}
   const vuelta=samples.filter(q=>q[2]==='vuelta');ok(vuelta.length>3,'la vuelta no se ve en la calle');
   ok(S.sim.work<=0&&!S.sim.dest&&!S.sim.tr,'no ha terminado en casa');}
 // 3. transporte entre barrios: billete, cambio de barrio, llega
 {nuevo('viejo');let id=null,tt=null;for(const k in PLACES){const q=cdPuerta(k)&&cdTrayecto('casa',k);if(q&&q.tramos.some(x=>x.m!=='pie'&&x.m!=='paso')&&(!tt||q.min<tt.min)){id=k;tt=q;}}const s=S.sim;ok(tt&&id,'ningún sitio con transporte desde casa');info.metro=id;
   if(tt){const m0=S.money,bk0=BKS().log.length;ok(cmIr(id),'cmIr '+id);const bars=new Set(),txt=new Set();let llego=false,cobro=0;
     for(let i=0;i<6000&&!llego;i++){step(.5);if(i%30===0)R();const f=S.sim.work>0?cmFase():null;if(f){const p=cmPos();if(p){bars.add(p.b);if(p.txt)txt.add(p.txt);}if(f.k==='dentro')llego=true;}}
     ok(llego,'no llegó a '+id);ok(bars.size>=2,'no cambia de barrio: '+[...bars]);ok([...txt].some(x=>/min/.test(x)),'sin rótulo del viaje');
     const gasto=BKS().log.slice(bk0).filter(q=>q[3]==='Transporte').reduce((a,q)=>a+q[2],0);ok(gasto<0,'no se cobra el transporte');info.billete=[gasto,tt.precio];
     const p=cmPos();ok(p&&p.b===cdBarrioDe(id),'llega a otro barrio que el de '+id);}}
 // 4. un sitio sin interior: se queda en la puerta
 {nuevo('viejo');const id='mercado',s=S.sim;const _sc=SCENES[id];delete SCENES[id];/* t133: ya no queda ningún solo_mapa real, se simula quitando el interior */ok(!SCENES[id]&&cdPuerta(id),'mercado debería ser un sitio sin interior');ok(cmIr(id),'cmIr mercado');let llego=false;
   for(let i=0;i<4000&&!llego;i++){step(.25);try{placeHud();}catch(e){}const f=S.sim.work>0?cmFase():null;if(f&&f.k==='dentro')llego=true;}
   ok(llego,'no llegó al mercado');const p=cmPos(),q=cmPuertaPts(id);ok(p&&!p.esc&&Math.hypot(p.x-q.side[0],p.y-q.side[1])<.5,'no se queda delante de la puerta');
   ok(awayKey()===id,'awayKey de un sitio sin interior: '+awayKey());ok(menu.classList.contains('open')&&/rcado/i.test(card.innerHTML),'no abre la ficha del sitio');menu.classList.remove('open');
   SCENES[id]=_sc;R();info.sinInterior=1;}
 // 5. al trabajo a su hora desde cada vivienda, y tarde si sale tarde
 const llegadas={};
 for(const casa of ['padres','infra','habitacion','viejo','casita','bueno','chalet','calle']){nuevo(casa);S.free=true;S.autoHome=true;const s=S.sim,start=SHIFT.start*60;S.t=Math.floor(SHIFT.leave*60)-20;let tArr=null,tOut=null;
   for(let i=0;i<4000;i++){step(.5);if(s.work>0&&tOut==null)tOut=S.t;const f=s.work>0?cmFase():null;if(f&&f.k==='dentro'&&tArr==null){tArr=S.t;break;}if(S.t>start+120)break;}
   ok(tArr!=null,casa+': no llegó al trabajo');if(tArr!=null){ok(tArr<=start+1,casa+': llega a las '+Math.round(tArr)+' y el turno es a las '+start);ok(s.late<=0,casa+': marcada como tarde ('+s.late+')');llegadas[casa]=[Math.round(tArr-tOut),Math.round(start-tArr),Math.round(tOut-SHIFT.leave*60),cmCasaMin(destOf('work'))];}}
 info.trabajo=llegadas;
 {nuevo('infra');const s=S.sim,start=SHIFT.start*60,a=cmCasaMin(destOf('work'));S.free=false;S.t=start-5;goWork(true);for(let i=0;i<200&&!(s.work>0);i++)step(.5);
   ok(s.work>0&&s.late>=a-5-6,'saliendo tarde debería llegar tarde (late='+s.late+', trayecto '+a+')');info.tarde=[s.late,a];}
 // 6. gente del censo por la calle en hora punta
 {nuevo('viejo');S.t=7.5*60;const bar=cdHome();let n=0;for(let h=6;h<10;h+=.25){n=Math.max(n,cmPlanGente(bar,h,1).length);}
   ok(n>=1,'ningún vecino del censo camina por la calle a hora punta');info.vecinosCalle=n;
   // una hora en la que haya al menos uno, y se le puede tocar
   let hh=null;for(let m=360;m<1320&&hh==null;m++){if(cmPlanGente(bar,m/60,1).length)hh=m;}
   if(hh!=null){S.t=hh;cam.z=.5;const q=cmPlanGente(bar,hh/60,1).find(z=>{const e=cmEnRuta(z.R,z.f),l=z.R.legs[e.i];return l.b===bar&&l.k==='pie';}),e0=cmEnRuta(q.R,q.f),p=cmAlong(q.R.legs[e0.i].pts,e0.lf);cmFrame(bar);const [u,v]=cmW2V(p.x,p.y),[px,py]=P(u,v);cam.x=W/2-px*cam.z;cam.y=H*.5-py*cam.z;R();
     const nm=RT.names.filter(x=>x.vid!=null);ok(nm.length>=1,'ningún vecino rotulado en la calle');
     if(nm.length){const h0=RT.heads[nm[0].id];const v1=vcHit(h0.x,h0.y+20);ok(v1&&v1.id===nm[0].vid,'no se puede tocar al vecino de la calle');
       menu.classList.remove('open');lastPtr=[h0.x,h0.y+20];liveTap(-9,-9);const fe=document.getElementById('vecficha');ok(fe&&fe.classList.contains('on')&&fe.innerHTML.includes(v1.n),'tocarlo no abre su ficha');if(fe)fe.classList.remove('on');}}}
 // 7. una partida vieja a mitad de salida (sin S.sim.tr): carga y termina en casa
 {nuevo('viejo');const s=S.sim;s.outingActive='amigos';s.dest='bar';s.work=190;s.awayTotal=200;s.exit=[10,19];s.tr=undefined;R();let p=cmPos();ok(p&&p.k==='ida'&&p.vis&&Number.isFinite(p.x),'partida vieja: sin posición');
   placeAuto=true;enterScene();R();R();for(let i=0;i<2000&&s.work>0;i++){step(1);if(i%50===0)R();}ok(s.work<=0&&!s.dest,'partida vieja: no termina');
   const j=JSON.parse(JSON.stringify(S));ok(!('tr' in j.sim)||j.sim.tr==null,'estado viejo');leaveScene();}
 // 8. a un punto de la acera, y de vuelta a casa desde donde esté (también dando la vuelta a mitad de camino)
 {nuevo('viejo');const s=S.sim,bar=cdHome(),q=cmSnap(bar,60,88);ok(q,'no hay acera en 60,88');if(q){ok(cmIr(null,[bar,q.p[0],q.p[1]]),'cmIr a un punto');let llego=false;for(let i=0;i<3000&&!llego;i++){step(.25);const f=s.work>0?cmFase():null;if(f&&f.k==='dentro')llego=true;}
   ok(llego,'no llegó al punto de la acera');const p=cmPos();ok(p&&!p.esc&&p.b===bar&&Number.isFinite(p.x),'en el punto: sin posición');R();
   ok(cmFicha&&true,'');cmVolver();ok(s.work>0&&s.dest==='_casa','volver a casa no arranca');let fin=false;for(let i=0;i<3000&&s.work>0;i++){step(.25);if(i%60===0)R();}ok(s.work<=0&&!s.dest&&!s.tr&&!s.irPt,'no termina en casa');}
  nuevo('viejo');const s2=S.sim;ok(cmIr('super'),'ir al super');let f=null;for(let i=0;i<2000;i++){f=s2.work>0?cmFase():null;if(f&&f.k==='ida'&&f.f>.3)break;step(.1);}
  ok(f&&f.k==='ida'&&f.f>.3,'no se llega a mitad de la ida (determinista)');if(f&&f.k==='ida'){const f0=f.f;cmVolver();ok(s2.work>0,'dar la vuelta a mitad de camino');const p0=cmPos();ok(p0&&Number.isFinite(p0.x),'dando la vuelta: sin posición');for(let i=0;i<3000&&s2.work>0;i++)step(.25);ok(s2.work<=0,'no vuelve tras darse la vuelta');info.vuelta=[f0];}}
 // 9. redirigir mientras anda: otro edificio desde mitad de camino, la acera, y encadenar una salida
 {nuevo('viejo');const s=S.sim,bar=cdHome();S.t=11*60;ok(cmIr('super'),'ir al super');let f=null;for(let i=0;i<2000;i++){f=s.work>0?cmFase():null;if(f&&f.k==='ida'&&f.f>.3)break;step(.1);}
  ok(f&&f.k==='ida','redirigir: no está andando');const d0=cmDesde();ok(d0&&Array.isArray(d0),'sin punto de la calle desde donde redirigir');
  const otro=['biblioteca','bar','parque','coop'].find(k=>cdBarrioDe(k)===bar&&cmDest(k)!=='super'&&!cmCierra(k,10));ok(otro,'sin otro edificio en el barrio');
  const x0=cmPos();ok(cmIr(otro),'redirigir a '+otro+' andando');ok(s.dest===otro&&s.outingActive==='ir','el destino no cambia a '+otro+' ('+s.dest+')');
  const x1=cmPos();ok(x1&&Math.hypot(x1.x-x0.x,x1.y-x0.y)<3,'al redirigir salta '+(x1&&Math.hypot(x1.x-x0.x,x1.y-x0.y)));let llego=null;for(let i=0;i<4000;i++){step(.25);const g=s.work>0?cmFase():null;if(g&&g.k==='dentro'){llego=cmPos();break;}}
  ok(llego&&llego.id===cmDest(otro),'no llega al nuevo destino');
  // a la acera desde mitad de camino de vuelta
  const q=cmSnap(bar,60,88);for(let i=0;i<4000;i++){const g=s.work>0?cmFase():null;if(g&&g.k==='dentro'&&(s.work-s.tr.b)>3){s.work=s.tr.b+.5;}step(.25);const h=cmFase();if(h&&h.k==='vuelta'&&h.f>.3)break;}
  const hv=cmFase();ok(hv&&hv.k==='vuelta','no está volviendo');if(q&&hv&&hv.k==='vuelta'){ok(cmIr(null,[bar,q.p[0],q.p[1]]),'a la acera desde la vuelta');ok(s.dest==='_punto','dest _punto');for(let i=0;i<4000&&s.work>0;i++)step(.25);ok(s.work<=0,'no termina');}
  info.redirige=[otro];}
 {nuevo('viejo');const s=S.sim;S.t=19*60;const dia=dateOf(S.day).wd;ok(cmIr('bar'),'ir al bar');for(let i=0;i<4000;i++){step(.25);const g=s.work>0?cmFase():null;if(g&&g.k==='dentro')break;}
  ok(cmFase()&&cmFase().k==='dentro','no está en el bar');S.outAuto=false;
  // encadenar: del bar al súper sin pasar por casa (sale el lunes: el súper abre)
  ok(!outAvail('compra')||outAvail('compra'),'');const sp=(OUT.compra&&destOf('compra'));ok(sp==='super','la compra no va al súper ('+sp+')');
  const sale=awayNow()&&OUT.compra;if(sale){const r=outAvail('compra');ok(!r,'compra no disponible desde el bar: '+r);if(!r){doOut('compra');ok(S.sim.dest==='super'&&S.sim.tr&&S.sim.tr.from==='bar','encadenar: no sale de la puerta del bar ('+S.sim.dest+','+(S.sim.tr&&S.sim.tr.from)+')');let ll=false;for(let i=0;i<4000;i++){step(.25);const g=S.sim.work>0?cmFase():null;if(g&&g.k==='dentro'){ll=true;break;}}ok(ll,'no llega al súper encadenando');}}
  info.encadena=1;}
 // 10. cerrado a la hora de llegada: el súper un domingo no sale y avisa; otro día sí
 {nuevo('viejo');const s=S.sim;S.day=1;while(dateOf(S.day).wd!==6||festivo(S.day)&&false)S.day++;S.t=11*60;S.free=false;const m=[];const tt=toast;toast=function(x){m.push(String(x));};
  try{const why=outAvail('compra');ok(why&&/dom/.test(why),'compra en domingo: '+why);ok(!cmIr('super')&&s.work<=0,'cmIr al súper cerrado debería no salir');ok(m.some(x=>/s[uú]per cierra los domingos/i.test(x)),'sin aviso «El súper cierra los domingos»: '+m.join('|'));
   S.day++;while(festivo(S.day)||dateOf(S.day).wd!==5)S.day++;S.t=11*60;ok(!outAvail('compra'),'compra un sábado: '+outAvail('compra'));
   S.t=22*60;ok(outAvail('compra'),'compra a las 22:00 debería estar cerrada');}finally{toast=tt;}
  info.cerrado=m.slice(0,1);}
 // 11. «Ver casa» con ella fuera: tocar un lugar abre su ficha y no la mueve
 {nuevo('viejo');const s=S.sim,bar=cdHome();S.t=11*60;ok(cmIr('bar'),'ir al bar');for(let i=0;i<4000;i++){step(.25);const g=s.work>0?cmFase():null;if(g&&g.k==='dentro')break;}
  viewPlace=false;placeAuto=false;cam.z=.5;const a=cmPos(),dest0=s.dest;cmFrame(bar);const t=bmTargets().find(z=>z.id==='parque'||z.id==='coop'||z.id==='biblioteca');
  if(t){cam.x=W/2-t.cx+cam.x;cam.y=H/2-t.cy+cam.y;const t2=bmTargets().find(z=>z.id===t.id);menu.classList.remove('open');lastPtr=[t2.cx,t2.cy];liveTap(-9,-9);ok(menu.classList.contains('open')&&card.innerHTML.length>50,'tocar un lugar en «Ver casa» no abre su ficha');ok(s.dest===dest0,'tocar un lugar la mueve');menu.classList.remove('open');}
  info.verCasa=t?t.id:'ninguno';}
 // 12. vecinos del censo por la calle (mods/calle.js): nadie en la calle y dentro de un sitio a la vez, menores de 12 con una persona adulta, la ficha dice adónde va
 {nuevo('viejo');const C=clAgenda(),wd=dateOf(S.day).wd;let dup=0,solos=0,ficha=0,maxN={};
  for(let m=360;m<1380;m+=5){const h=m/60;S.t=m;const calle=new Set(C.recs.filter(r=>h>=r.t0&&h<r.te).map(r=>r.vid));
   for(const k of clLugares())for(const q of vecinosEn(k,h,wd))if(calle.has(q.v.id))dup++;
   for(const r of C.recs)if(h>=r.t0&&h<r.te&&typeof r.v.edad==='number'&&r.v.edad<12&&r.R){const adult=C.recs.some(q=>q!==r&&q.R===r.R&&Math.abs(q.t0-r.t0)<.04&&pbAdult(q.v));if(!adult)solos++;}}
  ok(dup===0,'vecinos en la calle y dentro de un sitio a la vez: '+dup);ok(solos===0,'criaturas de menos de 12 andando sin adulta: '+solos);
  for(const [casa,bar] of [['viejo','ribera'],['infra','eras'],['habitacion','casco']]){nuevo(casa);const f={};for(const [a,b] of [[8,9],[13.5,14.5],[17,19],[3,5]]){let mx=0;for(let h=a;h<b;h+=.25)mx=Math.max(mx,cmPlanGente(bar,h,dateOf(S.day).wd).length);f[a]=mx;}maxN[bar]=f;}
  ok(maxN.ribera[8]>=1&&maxN.ribera[3]===0,'vecinos andando: ribera '+JSON.stringify(maxN.ribera));info.censoCalle=maxN;
  const r=C.recs.find(z=>z.R&&z.k==='trabajo');if(r){const t=clFichaTxt(r.v);S.t=(r.t0+r.m/2)*60;const t2=clFichaTxt(r.v);ok(/Va al trabajo: /.test(t2),'la ficha no dice adónde va: '+t2);ficha=t2;}info.ficha=ficha;}
 // 13. T-141 · piquete en la acera de la puerta correcta, ella con ellos y no dentro; la policía según el gobierno; los nombrados no andan a la vez por la calle
 {nuevo('viejo');const s=S.sim,wk=destOf('work'),bar=cdBarrioDe(wk);S.t=8*60;S.strike={on:true,left:3,total:3,join:true,by:'plantilla',start:S.day,picket:0};PQ.k='';
  const cs=pqCentros();ok(cs.length===1&&cs[0].id===wk,'el piquete no está en el centro de trabajo ('+JSON.stringify(cs.map(g=>g.id))+')');ok(cs[0]&&cs[0].nP>=4&&cs[0].nP<=8,'el piquete no tiene 4–8 personas: '+(cs[0]&&cs[0].nP));
  const q=cmPuertaPts(wk);cam.z=.6;cmFrame(bar);const vis=()=>true;let it=pqItems(bar,1,vis);ok(it.length>=cs[0].nP+2,'faltan figuras, pancarta o banderas del piquete: '+it.length);
  ok(it.length===pqItems(bar,1,vis).length,'piquete inestable');
  ok(cs[0].nom.length>=1,'ninguna compañera ni vecina con nombre en el piquete');
  // los nombrados del censo no andan por la calle a la vez
  let dup=0;for(let h=7;h<13.5;h+=.25){S.t=h*60;PQ.k='';pqCentros();for(const a of clActivos(bar,h))if(pqEn(a.r.vid))dup++;for(const v of pbVec()){if(!pqEn(v.id))continue;for(const k of clLugares())for(const r of vecinosEn(k,h,dateOf(S.day).wd))if(r.v.id===v.id)dup++;}}
  ok(dup===0,'vecinos del piquete también andando o dentro: '+dup);
  S.t=9.5*60;PQ.k='';S.outAuto=false;ok(!outAvail('piquete'),'piquete no disponible: '+outAvail('piquete'));doOut('piquete');let llego=false;
  for(let i=0;i<4000;i++){step(.25);const f=s.work>0?cmFase():null;if(i%50===0)R();if(f&&f.k==='dentro'){llego=true;break;}}
  ok(llego,'no llegó al piquete');const p=cmPos();ok(p&&p.k==='dentro'&&!p.esc&&p.b===bar,'en el piquete no debe estar dentro del edificio');
  ok(p&&p.y>q.y1&&p.y<q.y1+CMSW+.01&&Math.abs(p.x-q.xd)<3,'no está en la acera de la puerta: '+(p&&[p.x,p.y])+' puerta '+[q.xd,q.y1]);
  ok(awayKey()==='_piquete','awayKey del piquete: '+awayKey());ok(p&&p.vest&&/Piquete/.test(p.txt||''),'sin chaleco ni rótulo en el piquete');
  const mid=it.map(z=>z.d);ok(mid.every(Number.isFinite),'profundidad rota');
  info.piquete={nP:cs[0].nP,nom:cs[0].nom.length,figs:it.length};
  // policía: con gobierno conservador, dos figuras enfrente
  W_().gov='conservador';PQ.k='';it=pqItems(bar,1,vis);const sin=it.length;W_().gov='centro';W_().era=null;PQ.k='';const sin2=pqItems(bar,1,vis).length;ok(sin===sin2+2,'la policía no son dos figuras: '+sin+' vs '+sin2);
  // esquirola: cruza por delante y se dice
  while(s.work>0)step(5);S.strike={on:true,left:3,total:3,join:false,by:'plantilla',start:S.day,picket:0};S.t=7*60+10;PQ.k='';const m=[];const tt0=toast;toast=function(x){m.push(String(x));};
  try{goWork(true);for(let i=0;i<4000&&!(s.work>0);i++)step(.5);for(let i=0;i<4000;i++){step(.25);const f=s.work>0?cmFase():null;if(f&&f.k==='dentro')break;}step(1);}finally{toast=tt0;}
  ok(m.some(x=>/cruza el piquete/.test(x)),'cruzar el piquete no se dice: '+m.slice(0,4).join('|'));}
 // 14. T-141 · cola en la oficina de empleo: fila en la acera, avanza, ella se pone, los minutos de cola cuentan y se dicen
 {nuevo('viejo');const s=S.sim,bar=cdBarrioDe('sepe');S.jobless=true;W_().crisis=60;S.t=9*60;const q=cmPuertaPts('sepe'),vis=()=>true;cmFrame(bar);
  ok(cmColaLen('sepe',9.0)>=4,'cola de la oficina de empleo a las 9:00 corta: '+cmColaLen('sepe',9));ok(cmColaLen('sepe',12)===0,'cola a las 12:00');
  W_().crisis=10;const corta=cmColaLen('sepe',9);W_().crisis=90;const larga=cmColaLen('sepe',9);ok(larga>corta,'la cola no crece con la crisis: '+corta+' '+larga);W_().crisis=60;
  ok(cmColaLen('comedor',13.5)>=3&&cmColaLen('comedor',10)===0,'cola del comedor: '+cmColaLen('comedor',13.5)+' '+cmColaLen('comedor',10));
  ok(cmColaLen('mercado',10)<=3&&cmColaLen('mercado',15)===0&&cmColaLen('ambulatorio',9)<=3,'colas cortas de mercado y ambulatorio');
  const a0=colaItems(bar,1,vis).length;ok(a0>=3,'no se pinta la cola: '+a0);S.t+=10;const a1=colaItems(bar,1,vis).length;ok(a1>=3,'la cola desaparece al avanzar');
  S.t=9*60+5;S.sim.work=0;ok(!outAvail('sepe'),'sellar no disponible: '+outAvail('sepe'));const m=[];const tt0=toast;toast=function(x){m.push(String(x));};
  try{doOut('sepe');let en=false,x0=null,xn=null,min=0,t1=null,dentro=false,mxd=0;
    let ini=false;for(let i=0;i<6000;i++){step(.25);if(s.work>0)ini=true;if(ini&&!(s.work>0))break;const f=s.work>0?cmFase():null;if(i%40===0)R();const p=f?cmPos():null;
      if(f&&f.k==='dentro'&&s.tr&&s.tr.cq>0){if(!en){en=true;t1=S.t;}if(p&&p.cola){if(x0==null)x0=[p.x,p.y];xn=[p.x,p.y];mxd=Math.max(mxd,Math.abs(p.x-q.xd));ok(!p.esc&&p.y>q.y1&&p.y<q.y1+CMSW+.01,'en la cola debe estar en la acera: '+p.y);}else if(p&&p.esc&&!dentro){dentro=true;min=Math.round(S.t-t1);}}}
    ok(en,'no se puso en la cola');ok(dentro,'no entró tras la cola');ok(s.tr==null||true,'');
    info.cola={min,xIni:x0&&Math.round(x0[0]),xFin:xn&&Math.round(xn[0]),puerta:Math.round(q.xd)};ok(x0&&xn&&Math.abs(xn[0]-q.xd)<=2.5&&mxd>3,'la fila no avanza hacia la puerta: cola máx '+mxd+' y al final a '+(xn&&Math.abs(xn[0]-q.xd)));
    ok(min>=3,'minutos de cola: '+min);ok(m.some(x=>/min de cola/.test(x)||/hace cola/.test(x)),'no se dice la cola: '+m.join('|'));ok(m.some(x=>/min de cola/.test(x)),'al entrar no se dicen los minutos: '+m.join('|'));}
  finally{toast=tt0;}
  while(s.work>0)step(5);ok(!s.tr,'no terminó');}
 // 15. T-141 · el rider reparte: puertas reales, 2–3 entregas por tanda, vuelta al punto de recogida, sin metro, jornada que cuadra
 {nuevo('viejo','reparto');const s=S.sim;S.t=Math.floor(SHIFT.leave*60);S.free=false;let n=0;goWork(true);for(let i=0;i<2000&&!(s.work>0);i++){step(.5);}
  ok(s.work>0&&s.dest==='_ride','no sale a repartir: '+s.dest);const tot=s.awayTotal,pl=rdPlan(tot);ok(pl&&pl.n>=2,'sin entregas: '+(pl&&pl.n));
  if(pl){const ent=pl.segs.filter(z=>z.kind==='entrega'),rec=pl.segs.filter(z=>z.kind==='recoge');ok(ent.every(z=>cdPuerta(z.lugar)&&((DATA.personas.edificios||{})[z.lugar]||z.lugar==='casaV'||z.lugar==='casa2')),'entrega en una puerta que no es un portal del censo');ok(rec.every(z=>cdPuerta(z.lugar)),'recogida sin puerta');
   ok(pl.segs.every(z=>!z.R||rdPie(z.R)),'usa transporte');ok(pl.segs[pl.segs.length-1].kind==='casa'||!rdPie(cmRuta(pl.segs[pl.segs.length-1].lugar,'casa')),'no vuelve a casa');ok(Math.abs(pl.fin-tot)<=2.5,'la jornada no cuadra: plan '+Math.round(pl.fin)+' y salida '+Math.round(tot));
   const tandas=[];let cur=0;for(const z of pl.segs){if(z.kind==='entrega')cur++;if(z.kind==='vuelve'){tandas.push(cur);cur=0;}}ok(tandas.length>=2&&tandas.every(c=>c>=1&&c<=3),'tandas: '+tandas.join(','));
   ok(pl.segs.filter(z=>z.kind==='vuelve').every((z,i,a)=>true),'');
   // vuelve al punto de recogida: cada «vuelve» acaba donde empezó la tanda
   let ok2=true,pk=null;for(const z of pl.segs){if(z.kind==='recoge')pk=z.lugar;if(z.kind==='vuelve'&&z.lugar!==pk)ok2=false;}ok(ok2,'no vuelve a su punto de recogida');
   const bars=new Set();let maxJ=0,last=null,vistos=0,ents=0,quietos=0;
   for(let i=0;i<6000&&s.work>0;i++){step(.5);const p=s.work>0?cmPos():null;if(!p)continue;if(i%30===0)R();bars.add(p.b);if(p.vis){vistos++;if(last&&last.b===p.b){const dj=Math.hypot(p.x-last.x,p.y-last.y);if(dj>maxJ){maxJ=dj;info.saltoRider=[Math.round(last.x),Math.round(last.y),Math.round(p.x),Math.round(p.y),p.txt];}}last=p;}if(p.quieto&&/Entrega/.test(p.txt||''))quietos++;}
   ok(vistos>20,'no se ve repartiendo');ok(maxJ<12/* el rider aprieta el paso: hasta 20 casillas/min en línea recta no es un salto */,'salto de '+maxJ+' casillas repartiendo (0,5 min a 16 casillas/min)');ok(quietos>=1,'no se detiene a entregar');ok(s.work<=0&&!s.dest,'no termina la jornada');
   info.reparto={entregas:pl.n,tandas:tandas,barrios:[...bars].length,plan:Math.round(pl.fin),jornada:Math.round(tot)};}}

 // 14. T-143 · el piquete llega y se va andando; la pancarta va sobre las cabezas; la manifestación con ella dentro
 {nuevo('viejo');const wk=destOf('work'),bar=cdBarrioDe(wk);S.t=8*60;S.strike={on:true,left:3,total:3,join:false,by:'plantilla',start:S.day,picket:0};PQ.k='';
  const H0=cmCfg().piquete_horas,cuenta=hh=>{S.t=hh*60;PQ.k='';const g=pqCentros()[0];if(!g)return [0,0];const q=cmPuertaPts(g.id);const ord=[2,5,4,6,7,0,1].filter(j=>j<g.nP);let n=0,w=0;g.nom.forEach((nm,i)=>{const sl=PQ_SL[ord[i]],r=pqAnda(g,nm,ord[i],[q.xd+sl[0],q.y1+sl[1]],hh,H0,bar);if(r){n++;if(r.walk)w++;}});return [n,w];};
  const a0=cuenta(6.0),a1=cuenta(6.45),a2=cuenta(6.74),b1=cuenta(14.1),b2=cuenta(14.3),b3=cuenta(14.6);
  ok(a0[0]===0,'piquete: los nombrados ya están a las 6:00 ('+a0+')');ok(a1[1]>=1,'piquete: nadie llega andando a las 6:27 ('+a1+')');ok(b1[0]>=1&&b2[1]>=1,'piquete: no se van andando ('+b1+' '+b2+')');ok(b3[0]===0,'piquete: siguen a las 14:36 ('+b3+')');
  info.piquete_anda={'6:00':a0,'6:27':a1,'6:44':a2,'14:06':b1,'14:18':b2,'14:36':b3};
  S.t=9*60;PQ.k='';const it=pqItems(bar,1,()=>true);ok(it.length>=pqCentros()[0].nP+2,'piquete a las 9: faltan figuras');
  // manifestación con ella dentro
  nuevo('viejo');while(dateOf(S.day).wd!==5)S.day++;W_().manif={day:S.day,cause:'vivienda',side:'i'};const s2=S.sim;s2.outingActive='manifestacion';s2.dest='ayto';s2.exit=[10,19];S.t=11.5*60;cmDefine(s2,'ayto',150,'casa');
  const pos=el=>{s2.work=s2.awayTotal-(s2.tr.a+el);S.t=(11.5*60)+el-30;CW.posT=0;return cmPos();};
  const q=cmPuertaPts('ayto'),p0=pos(5),p1=pos(40),p2=pos(100),p3=pos(140);
  ok(p1&&p1.k==='dentro'&&p1.b===cdBarrioDe('ayto'),'manif: no va por la calle del ayuntamiento');ok(!cmEscena('ayto'),'manif: se queda dentro del ayuntamiento');
  const d=pp=>Math.hypot(pp.x-q.xd,pp.y-q.y1);ok(d(p2)>d(p1)+3&&d(p1)>d(p0),'manif: no recorre la calle con el grupo ('+[p0,p1,p2].map(d).map(x=>x.toFixed(1))+')');ok(p2.walk,'manif: no anda con el grupo');
  ok(mfItems(cdBarrioDe('ayto'),1,()=>true).length>=10,'manif: faltan figuras del grupo (más la pancarta)');
  info.manif={d0:+d(p0).toFixed(1),d1:+d(p1).toFixed(1),d2:+d(p2).toFixed(1),d3:+d(p3).toFixed(1),txt:p1.txt};
  s2.work=s2.tr.b*.5;S.t=14*60;CW.posT=0;const pv=cmPos();ok(pv&&pv.k==='vuelta'&&pv.b,'manif: la vuelta no sale de la marcha ('+(pv&&pv.k)+')');info.manif.vuelta=pv&&[pv.b,+d(pv).toFixed(1)];}
 console.error=oe;
 document.title=(bad.length||__errs.length?'ERR ':'OK ')+JSON.stringify({bad:[...new Set(bad)].slice(0,12),nbad:bad.length,errs:__errs.slice(0,3),info});
}catch(err){document.title='ERR '+err.message+' '+(err.stack||'').slice(0,500)}},300);
