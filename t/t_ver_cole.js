// Visor: la decisión de colegio abierta. v=tres (a los 3 años) · doce · doce_con · cambio · cambio_con
//   python3 scripts/test.py t/t_ver_cole.js 3 && python3 t/cdpshot.py "file://$PWD/t/_run_t_ver_cole.html#v=tres" 6 /tmp/t113/x.png 420,860
setTimeout(()=>{try{const q=new URLSearchParams(location.hash.slice(1));window.__errs=window.__errs||[];
 let seed=11;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 S=newState('normal');S.char={...randomChar(),g:'f'};S.char.beard='no';S.ideo='marxista';initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();S.weather={k:'sol',t:20};newToday();storyStart();S.autoHome=false;S.t=11*60;
 const v=q.get('v')||'tres',ed={tres:3,doce:12,doce_con:12,cambio:8,cambio_con:8}[v];
 S.kids=[{n:'Nora',g:'f',born:S.day-60*ed-1,ch:{...randomChar(),g:'f',name:'Nora',beard:'no'},centro:v.endsWith('_con')?'concertado':v==='doce'?'colegio':v==='cambio'?'colegio':undefined,pagado:v==='cambio_con'?980:0,debe:v==='cambio_con'?1:0}];
 mode='live';speed=0;hud();menu.classList.remove('open');const st=document.createElement('style');st.textContent='#toasts{display:none!important}';document.head.appendChild(st);
 askDilemma(v.startsWith('cambio')?'cr_cole_cambio':'cr_cole',{i:0,e:v.startsWith('cambio')?'cambio':v.startsWith('doce')?'cole12':'cole3'});dlgTick();
 setTimeout(()=>{document.title='OK '+JSON.stringify({dlg:!!(ex().dlg),errs:window.__errs.slice(0,2)});},900);
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,300)}},300);
