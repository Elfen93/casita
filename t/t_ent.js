setTimeout(()=>{try{
 const [hh,rr,zz]=(location.hash.slice(1)||'11,0,0.55').split(',');
 S=newState('normal');S.char={...randomChar()};S.traits=[];initPeople();startTrack('super',true);rollWeather();newToday();storyStart();
 for(let k=0;k<480*3;k++)update(3);
 S.t=(+hh)*60;S.sim.work=0;menu.classList.remove('open');rot=+rr;cam.z=+zz;centerOnWorld(N/2,N/2);
 setTimeout(()=>{document.title='OK '+JSON.stringify(__errs);},500);
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,500)}},300);
