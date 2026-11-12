setTimeout(()=>{try{S=newState('normal');S.char={...randomChar(),g:'f'};S.ideo='marxista';initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();S.autoHome=false;S.r3d='simple';S.t=10*60;S.weather={k:'sol',t:20};S.day=70;S.jobless=true;
 const s=S.sim;s.work=70;s.awayTotal=120;s.dest='sepe';s.outingActive='sepe';s.exit=[9,19];enterScene();menu.classList.remove('open');document.head.insertAdjacentHTML('beforeend','<style>#toasts{display:none!important}</style>');
 setTimeout(()=>{document.title='OK '+sceneKey+' '+window.__errs.length+' '+(window.__errs[0]||'');},900);
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,300)}},300);
