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
 {nuevo('viejo');const id='mercado',s=S.sim;ok(!SCENES[id]&&cdPuerta(id),'mercado debería ser un sitio sin interior');ok(cmIr(id),'cmIr mercado');let llego=false;
   for(let i=0;i<4000&&!llego;i++){step(.25);try{placeHud();}catch(e){}const f=S.sim.work>0?cmFase():null;if(f&&f.k==='dentro')llego=true;}
   ok(llego,'no llegó al mercado');const p=cmPos(),q=cmPuertaPts(id);ok(p&&!p.esc&&Math.hypot(p.x-q.side[0],p.y-q.side[1])<.5,'no se queda delante de la puerta');
   ok(awayKey()===id,'awayKey de un sitio sin interior: '+awayKey());ok(menu.classList.contains('open')&&/rcado/i.test(card.innerHTML),'no abre la ficha del sitio');menu.classList.remove('open');
   R();info.sinInterior=1;}
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
  nuevo('viejo');const s2=S.sim;ok(cmIr('super'),'ir al super');for(let i=0;i<400&&!(s2.work>0&&cmFase().f>.3);i++)step(.25);let f=cmFase();if(f&&f.k==='ida'){const f0=f.f;cmVolver();ok(s2.work>0,'dar la vuelta a mitad de camino');const p0=cmPos();ok(p0&&Number.isFinite(p0.x),'dando la vuelta: sin posición');for(let i=0;i<3000&&s2.work>0;i++)step(.25);ok(s2.work<=0,'no vuelve tras darse la vuelta');info.vuelta=[f0];}}
 console.error=oe;
 document.title=(bad.length||__errs.length?'ERR ':'OK ')+JSON.stringify({bad:[...new Set(bad)].slice(0,12),nbad:bad.length,errs:__errs.slice(0,3),info});
}catch(err){document.title='ERR '+err.message+' '+(err.stack||'').slice(0,500)}},300);
