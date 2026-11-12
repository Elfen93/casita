// Visor del mapa de la ciudad y de los barrios para la revisión de diseño (como t_ver.js, pero con el mapa).
//   python3 scripts/test.py t/t_barrio_ver.js 3
//   python3 t/cdpshot.py "file://$PWD/t/_run_t_barrio_ver.html#barrio=ribera&h=12&wd=0" 6 /tmp/t130/x.png 420,860
// Parámetros (tras #): h hora · wd día (0 = lunes) · barrio=id (el mapa de ese barrio; sin él, el plano de la ciudad) · z zoom · cx,cy centro del mapa
//   ficha=id (un lugar, un edificio del censo, «casa», «b:barrio», «p:barrio» una señal de paso o «s:L1:1» una parada) · dentro=lugar (mirar dentro)
//   fuera=lugar (el personaje está allí) · casa=tipo de vivienda (padres, infra, habitacion, viejo, casita, bueno, chalet; por defecto viejo) · sin=1 (la casa, sin abrir el mapa) · w tiempo (sol, lluvia…)
setTimeout(()=>{try{const q=new URLSearchParams(location.hash.slice(1));window.__errs=window.__errs||[];
 let seed=7;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 S=newState('normal');S.char={...randomChar(),g:'f'};S.char.beard='no';S.ideo='socialdemocrata';S.pol.comp=2;initPeople();applyHome(q.get('casa')||'viejo');startTrack('oficina',true);rollWeather();S.weather={k:q.get('w')||'sol',t:20};newToday();storyStart();S.autoHome=false;
 const wd=+(q.get('wd')||0);S.day=1;while(dateOf(S.day).wd!==wd||festivo(S.day))S.day++;S.t=+(q.get('h')||12)*60;
 mode='live';menu.classList.remove('open');
 if(q.get('fuera')){const d=q.get('fuera'),s=S.sim;s.exit=[0,10];s.work=200;s.awayTotal=400;s.route=null;s.outingActive=(PLACES[d].outs||[])[0]||null;s.dest=d;}
 speed=0;const st=document.createElement('style');st.textContent='#toasts{display:none!important}';document.head.appendChild(st);
 hud();if(q.get('sin')){document.title='OK sin mapa';return;}bmOpen();
 if(q.get('barrio')){bmVerBarrio(q.get('barrio'));if(q.get('cx')&&q.get('cy'))bmCenter(+q.get('cx'),+q.get('cy'),+q.get('z')||cam.z);else if(q.get('z'))bmCenter((cam.x*0+1)&&(()=>{const [u,v]=screenToView(W/2,H*.5);return v2w(u,v)[0];})(),(()=>{const [u,v]=screenToView(W/2,H*.5);return v2w(u,v)[1];})(),+q.get('z'));}
 if(q.get('dentro'))bmLook(q.get('dentro'));
 setTimeout(()=>{if(q.get('ficha'))bmFicha(q.get('ficha'));document.title='OK '+(BM.obs||BM.ficha||BM.b||'ciudad')+' errs='+window.__errs.length+' '+(window.__errs[0]||'');},900);
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,300)}},300);
