// Visor de «tratar con los vecinos» para la revisión de diseño.
//   python3 scripts/test.py t/t_tratover.js 3
//   python3 t/cdpshot.py "file://$PWD/t/_run_t_tratover.html#d=super&h=10&wd=1&conoce=paca&rel=55&ficha=paca" 7 /tmp/t122/x.png 420,860
// Parámetros (tras #): d lugar · h hora · wd día (0 = lunes) · conoce=id,id (los presenta) · rel=N · ficha=id (toca su figura y abre la ficha)
//   modo=favor (abre el submenú de pedir un favor) · acto=N (botón N de Trato) o data-tr (ejecuta ese botón de la ficha y deja la tarjeta de resultado)
//   pide=id:favor (te pide ese favor y abre la ficha con la petición) · msg=id:favor (te lo pide por el móvil y abre el hilo) · debe=id (te debe una y se lo recuerda)
//   rom=id (cita con ese adulto libre; etapa=pareja…) · huerto=1 (con huerto) · hijos=1 (con una cría) · gente=1 (pestaña Gente) · pe=id (menú «Opciones» de esa persona) · casa=id (visita a su casa)
setTimeout(()=>{try{const q=new URLSearchParams(location.hash.slice(1));window.__errs=window.__errs||[];
 let seed=+(q.get('seed')||7);Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 S=newState('normal');S.char={...randomChar(),g:'f',age:30};S.char.beard='no';S.ideo='socialdemocrata';S.pol.comp=2;S.life={orient:'hombres',rel:'estable',kids:'quiza',boda:'igual'};initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();S.weather={k:'sol',t:20};newToday();storyStart();S.autoHome=false;
 const wd=+(q.get('wd')||1);S.day=1;while(dateOf(S.day).wd!==wd||festivo(S.day))S.day++;S.t=+(q.get('h')||10)*60;
 if(q.get('hijos'))S.kids=[{n:'Lía',g:'f',born:S.day-60*6,hap:50}];
 if(q.get('huerto'))S.obj[5]={t:'huerto',r:0,q:3,c:100,crop:{k:Object.keys(CROPS)[0],g:.1,w:10,wd:0,dry:0}};
 const st=document.createElement('style');st.textContent='#toasts{display:none!important}';document.head.appendChild(st);
 const quieto=()=>{try{clearTimeout(sfxT);sfxT=setTimeout(()=>{},1e9);}catch(e){}};
 for(const id of (q.get('conoce')||'').split(',').filter(Boolean)){const v=vecinoPorId(id);const p=vcConocer(v);if(p&&q.get('rel'))p.rel=+q.get('rel');}
 if(q.get('rom')){const v=vecinoPorId(q.get('rom'));S.life.orient=v.g==='f'?'mujeres':v.g==='m'?'hombres':'ambos';const p=vcPer(v.id)||vcConocer(v);p.rel=60;p.love=45;p.dates=2;p.chispa=3;setStage(p,q.get('etapa')||'cita');trEnsure(p);}
 if(sfxEl)sfxEl.classList.remove('on');
 const d=q.get('d')||'super';const s=S.sim;s.exit=[0,10];s.work=200;s.awayTotal=400;s.route=null;
 const a=q.get('casa')?'visita':((PLACES[d]&&PLACES[d].outs)||[])[0]||null;s.outingActive=a;
 if(q.get('casa')){const p=vcPer(q.get('casa'))||vcConocer(vecinoPorId(q.get('casa')));if(q.get('rel'))p.rel=+q.get('rel');S.outWith=p.k;if(sfxEl)sfxEl.classList.remove('on');}
 s.dest=q.get('casa')?'hogar':d;
 if(q.get('debe')){const v=vecinoPorId(q.get('debe'));trFav(v.id).te=1;trFav(v.id).hist.push([S.day-3,'cuidaste a su cría']);}
 const pq=q.get('pide');if(pq){const [id,fid]=pq.split(':');const v=vecinoPorId(id);trPide(v,vcPer(id),fid,'enc');}
 mode='live';menu.classList.remove('open');enterScene();hud();
 setTimeout(()=>{try{
  if(q.get('msg')){const [id,fid]=q.get('msg').split(':');const v=vecinoPorId(id),p=vcPer(id);trPide(v,p,fid,'msg');leaveScene();s.work=0;s.dest=null;phOpen('msg');phThread=p.k;phRender();}
  if(q.get('ficha')){const v=vecinoPorId(q.get('ficha')),n=RT.names.find(x=>x.vid===v.id);
   if(n){const h=RT.heads[n.id];lastPtr=[h.x,h.y+h.h*1.5];liveTap(0,0);}else vcOpen(v);
   if(q.get('modo')==='favor'){TRUI.mode='favor';vcOpen(v);}
   if(q.get('acto')){const f=/^\d+$/.test(q.get('acto'))?vcEl.querySelectorAll('.trb .trbtn')[+q.get('acto')]:vcEl.querySelector('[data-tr="'+q.get('acto')+'"]');if(f){quieto();f.click();quieto();}else document.title='ERR sin botón '+q.get('acto');}}
  if(q.get('pe')){openMenu('gente');openPe('v_'+q.get('pe'));}
  if(q.get('gente')){openMenu('gente');if(q.get('scroll'))card.scrollTop=+q.get('scroll')||1e5;}
  if(document.title.indexOf('ERR')!==0)document.title='OK '+sceneKey+' errs='+window.__errs.length+' vid='+RT.names.filter(x=>x.vid!=null).map(x=>x.vid).join(',');
 }catch(e){document.title='ERR '+e.message+' '+e.stack.slice(0,300);}},900);
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,300)}},300);
