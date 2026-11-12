setTimeout(()=>{try{S=newState('normal');S.char={...randomChar(),g:'f'};S.ideo='marxista';initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();S.autoHome=false;S.r3d='simple';S.t=19*60;S.day=Math.max(S.day,1);
const s=S.sim;s.work=60;s.awayTotal=150;s.dest='parque';s.outingActive=((PLACES['parque']&&PLACES['parque'].outs)||[])[0]||null;s.exit=[9,19];enterScene();menu.classList.remove('open');
setTimeout(()=>{document.title='OK parque '+window.__errs.length;},900);
}catch(err){document.title='ERR '+err.message}},300);
