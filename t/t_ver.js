// Visor para la revisión de diseño: pone cualquier escena a la hora que se pida y sin avisos emergentes.
//   python3 scripts/test.py t/t_ver.js 3
//   python3 t/cdpshot.py "file://$PWD/t/_run_t_ver.html#d=bar&h=14&wd=0" 6 docs/capturas/x.png 420,860
// Parámetros (tras #): d lugar · h hora · wd día (0 = lunes) · a salida (por defecto, la primera del lugar) · con = clave de alguien de S.people para «visita»
//   hijos=N añade N criaturas en edad escolar · paro=1 · g=f|m|x · casa=tipo de vivienda
setTimeout(()=>{try{const q=new URLSearchParams(location.hash.slice(1));window.__errs=window.__errs||[];
 let seed=7;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 S=newState('normal');S.char={...randomChar(),g:q.get('g')||'f'};if(S.char.g==='f')S.char.beard='no';S.ideo='socialdemocrata';S.pol.comp=2;initPeople();applyHome(q.get('casa')||'viejo');startTrack('oficina',true);rollWeather();S.weather={k:q.get('w')||'sol',t:20};newToday();storyStart();S.autoHome=false;
 if(q.get('paro'))S.jobless=true;
 const wd=+(q.get('wd')||0);S.day=1;while(dateOf(S.day).wd!==wd||festivo(S.day))S.day++;S.t=+(q.get('h')||11)*60;
 for(let i=0;i<+(q.get('hijos')||0);i++){S.kids=S.kids||[];S.kids.push({n:['Lola','Leo','Vera'][i%3],g:i%2?'m':'f',born:S.day-60*(6+i*3)});}
 const d=q.get('d')||'bar';const s=S.sim;s.exit=[0,10];s.work=200;s.awayTotal=400;s.route=null;
 const a=q.get('a')||((PLACES[d]&&PLACES[d].outs)||[])[0]||null;s.outingActive=a;
 if(q.get('con')||a==='visita'){const p=S.people.find(x=>x.k===(q.get('con')||'amiga'));if(p)S.outWith=p.k;}
 s.dest=q.get('dest')||(a&&!PLACES[d]?destOf(a):d);
 mode='live';menu.classList.remove('open');enterScene();hud();
 const st=document.createElement('style');st.textContent='#toasts{display:none!important}';document.head.appendChild(st);
 setTimeout(()=>{document.title='OK '+sceneKey+' errs='+window.__errs.length+' '+(window.__errs[0]||'');},900);
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,300)}},300);
