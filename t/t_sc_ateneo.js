setTimeout(()=>{try{S=newState('normal');S.char={...randomChar(),g:'m'};S.ideo='marxista';initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();S.autoHome=false;S.r3d='simple';S.t=19*60;HP().gymGood=('ateneo'==='gymbueno');
 const s=S.sim;s.work=60;s.awayTotal=150;s.dest='ateneo';s.outingActive='ateneo'==='ateneo'?'militancia':'gimnasio';s.exit=[9,19];enterScene();menu.classList.remove('open');setTimeout(()=>{placeAuto=false;cam.z=2.4;cam.x=innerWidth/2+120;cam.y=innerHeight/2+80;},300);
 setTimeout(()=>{document.title='OK '+sceneKey+' '+window.__errs.length+' '+(window.__errs[0]||'');},900);
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,300)}},300);
