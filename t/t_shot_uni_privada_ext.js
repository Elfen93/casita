setTimeout(()=>{try{S=newState('normal');S.char={...randomChar(),g:'f'};S.ideo='marxista';initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();S.autoHome=false;S.r3d='simple';S.money=30000;S.weather={k:'sol',t:20};
 document.querySelectorAll('.diffov,#diffov,#intro,#welcome').forEach(e=>e.remove());menu.classList.remove('open');
 S.day=100;S.t=1035;S.jobless=true;const k='grado_enf';ED().cur={k,h:0,need:3200,since:S.day,miss:0,centro:"privada"};
 const s=S.sim;s.work=40;s.awayTotal=300;s.dest=destOf("clase");s.outingActive='clase';s.exit=[9,19];UNI.force='exterior';enterScene();
 
 setTimeout(()=>{document.title='OK '+sceneKey+' '+window.__errs.length+' '+(window.__errs[0]||'');},900);
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,300)}},300);
