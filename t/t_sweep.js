setTimeout(()=>{try{
 const mode=location.hash.slice(1)||'main';
 S=newState('normal');S.char={...randomChar(),name:'Ana',g:'f'};S.traits=['sociable','manitas'];S.ideo='marxista';S.pol.comp=2;initPeople();startTrack('super',true);rollWeather();newToday();storyStart();S.autoHome=true;ex().dmode='ana';
 for(let k=0;k<480*25;k++){update(3);dlgTick();}
 S.t=11*60;S.sim.work=0;S.sim.outingActive=null;
 menu.classList.remove('open');
 if(mode==='main'){} else if(mode==='build'){setMode('build');} else if(mode==='buy'){setMode('buy');} else if(mode==='cal'){openCalendar&&openCalendar();} else openMenu(mode);
 setTimeout(()=>{document.title='OK '+JSON.stringify(__errs);},600);
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,600)}},300);
