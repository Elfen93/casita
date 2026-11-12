// Visor de «conocer a los vecinos» para la revisión de diseño.
//   python3 scripts/test.py t/t_vecver.js 3
//   python3 t/cdpshot.py "file://$PWD/t/_run_t_vecver.html#d=bar&h=20&wd=4&ficha=paca" 6 /tmp/t120/x.png 420,860
// Parámetros (tras #): d lugar · h hora · wd día (0 = lunes) · ficha=id (abre su ficha; si el lugar lo tiene a la vista, tocándole de verdad)
//   conoce=id,id (los presenta antes) · rel=N (relación de los conocidos) · presenta=id (se presenta y deja la tarjeta de resultado)
//   gente=1 (abre la pestaña Gente) · casa=id (visita a su casa, hogar del censo)
setTimeout(()=>{try{const q=new URLSearchParams(location.hash.slice(1));window.__errs=window.__errs||[];
 let seed=+(q.get('seed')||7);Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 S=newState('normal');S.char={...randomChar(),g:'f'};S.char.beard='no';S.ideo='socialdemocrata';S.pol.comp=2;initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();S.weather={k:'sol',t:20};newToday();storyStart();S.autoHome=false;
 const wd=+(q.get('wd')||4);S.day=1;while(dateOf(S.day).wd!==wd||festivo(S.day))S.day++;S.t=+(q.get('h')||20)*60;
 const st=document.createElement('style');st.textContent='#toasts{display:none!important}';document.head.appendChild(st);
 const sfxQuieto=()=>{try{clearTimeout(sfxT);sfxT=setTimeout(()=>{},1e9);}catch(e){}};
 for(const id of (q.get('conoce')||'').split(',').filter(Boolean)){const v=vecinoPorId(id);const p=vcConocer(v);if(p&&q.get('rel'))p.rel=+q.get('rel');}
 if(sfxEl)sfxEl.classList.remove('on');
 const d=q.get('d')||'bar';const s=S.sim;s.exit=[0,10];s.work=200;s.awayTotal=400;s.route=null;
 const a=q.get('casa')?'visita':((PLACES[d]&&PLACES[d].outs)||[])[0]||null;s.outingActive=a;
 if(q.get('casa')){const p=vcPer(q.get('casa'))||vcConocer(vecinoPorId(q.get('casa')));if(q.get('rel'))p.rel=+q.get('rel');S.outWith=p.k;if(sfxEl)sfxEl.classList.remove('on');}
 s.dest=q.get('casa')?'hogar':d;
 mode='live';menu.classList.remove('open');enterScene();hud();
 setTimeout(()=>{try{
  if(q.get('ficha')){const v=vecinoPorId(q.get('ficha')),n=RT.names.find(x=>x.vid===v.id);
   if(n){const h=RT.heads[n.id];lastPtr=[h.x,h.y+h.h*1.5];liveTap(0,0);}else vcOpen(v);}
  if(q.get('presenta')){const v=vecinoPorId(q.get('presenta'));vcConocer(v);}
  if(q.get('gente')){openMenu('gente');if(q.get('scroll'))card.scrollTop=+q.get('scroll')||1e5;}
  document.title='OK '+sceneKey+' errs='+window.__errs.length+' vid='+RT.names.filter(x=>x.vid!=null).map(x=>x.vid).join(',');
 }catch(e){document.title='ERR '+e.message+' '+e.stack.slice(0,300);}},900);
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,300)}},300);
