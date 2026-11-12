// Visor de caminar por el barrio (revisión de diseño): la casa y los sitios con su calle, el trayecto, la espera, el otro barrio.
//   python3 scripts/test.py t/t_caminar_ver.js 3
//   python3 t/cdpshot.py "file://$PWD/t/_run_t_caminar_ver.html#fuera=bar&e=dentro&h=19" 7 /tmp/t131/x.png 420,860
// Parámetros (tras #): h hora · wd día (0 = lunes) · casa=tipo de vivienda (por defecto viejo) · w tiempo (sol, lluvia…)
//   fuera=lugar · e=ida|dentro|vuelta · f=fracción (0–1) de la ida/vuelta o minutos dentro (dentro: min tras entrar) · ir=lugar sin interior (e=dentro) · stay=minutos de estancia
//   barrio=1 abre el plano del barrio (zoom z) · dentro=lugar (mirar dentro desde el mapa) · rot=n (giros de la casa) · vista=casa (la casa mientras ella está fuera)
setTimeout(()=>{try{const q=new URLSearchParams(location.hash.slice(1));window.__errs=window.__errs||[];
 let seed=7;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 S=newState('normal');S.char={...randomChar(),g:'f'};S.char.beard='no';S.ideo='socialdemocrata';S.pol.comp=2;initPeople();applyHome(q.get('casa')||'viejo');startTrack(q.get('track')||'oficina',true);rollWeather();S.weather={k:q.get('w')||'sol',t:20};newToday();storyStart();S.autoHome=false;
 const wd=+(q.get('wd')||0);S.day=1;while(dateOf(S.day).wd!==wd||festivo(S.day))S.day++;S.t=+(q.get('h')||12)*60;if(q.get('h')==='gente'){let b=0,bm=360;for(let m=360;m<1320;m++){const n=cmPlanGente(cdHome(),m/60,wd).length;if(n>b){b=n;bm=m;}}S.t=bm;window.__gente=b;}
 mode='live';menu.classList.remove('open');speed=0;
 const st=document.createElement('style');st.textContent='#toasts{display:none!important}';document.head.appendChild(st);
 const s=S.sim;s.exit=[+(q.get('ex')||10),19];
 const d=q.get('fuera');
 if(d){const stay=+(q.get('stay')||120);s.outingActive=(PLACES[d]&&(PLACES[d].outs||[])[0])||'amigos';s.dest=d;
   if(q.get('track')==='work'||q.get('trabajo')){s.outingActive=null;}
   cmDefine(s,d,stay,'casa');const tr=s.tr,e=q.get('e')||'dentro',f=+(q.get('f')||.5);
   let el=e==='ida'?f*tr.a:e==='vuelta'?(tr.a+stay+f*tr.b):(tr.a+(q.get('f')!=null?f:stay/2));
   if(q.get('tramo')){const Rr=cmRuta('casa',d),tot=Rr.legs.reduce((a,l)=>a+l.min,0);let acc=0,want=null;const t=q.get('tramo');
     Rr.legs.forEach((l,i)=>{if(want!=null)return;if(t==='espera'&&l.k==='espera')want=acc+l.min*.5;else if(t==='viaje'&&l.k==='viaje')want=acc+l.min*.5;else if(t==='llega'&&i>0&&Rr.legs[i-1].k==='viaje'&&l.k==='pie')want=acc+l.min*.1;acc+=l.min;});
     if(want!=null)el=want/tot*tr.a;}
   s.work=s.awayTotal-el;}
 if(q.get('ir')){const id=q.get('ir');s.irA=id;s.dest=id;s.outingActive='ir';cmDefine(s,id,45,'casa');s.work=s.awayTotal-(s.tr.a+5);}
 if(q.get('rot'))rot=+q.get('rot');
 if(q.get('z')&&!q.get('barrio')&&!(S.sim.work>0&&q.get('vista')!=='casa')){cam.z=+q.get('z');centerOnWorld(10,12);}
 hud();
 if(S.sim.work>0&&q.get('vista')!=='casa'){placeAuto=true;viewPlace=false;savedCam={x:cam.x,y:cam.y,z:cam.z};enterScene();const p=cmPos();if(p){CW.camBar=p.b;const T=cmObjetivo(p);cam.x=T.x;cam.y=T.y;cam.z=T.z;}}
 if(q.get('barrio')){bmOpen();bmVerBarrio(q.get('barrio'));if(q.get('z'))bmCenter(...(()=>{const [u,v]=screenToView(W/2,H*.5);return v2w(u,v);})(),+q.get('z'));if(q.get('dentro'))bmLook(q.get('dentro'));}
 setTimeout(()=>{const p=S.sim.work>0?cmPos():null;document.title='OK '+(d||'casa')+' '+(p?p.k+'/'+(p.leg?p.leg.k:'')+'@'+p.b:'')+' errs='+window.__errs.length+' '+(window.__errs[0]||'');},900);
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,300)}},300);
