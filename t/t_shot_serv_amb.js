setTimeout(()=>{try{S=newState('normal');S.char={...randomChar(),g:'f'};S.ideo='marxista';initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();S.autoHome=false;S.r3d='simple';S.t=10*60;S.weather={k:'sol',t:20};S.day=55;S.jobless=true;
 const s=S.sim;s.work=55;s.awayTotal=90;s.dest='ambulatorio';s.outingActive='medico';s.exit=[9,19];enterScene();menu.classList.remove('open');
 setTimeout(()=>{document.title='OK '+sceneKey+' '+window.__errs.length+' '+(window.__errs[0]||'');},900);
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,300)}},300);
