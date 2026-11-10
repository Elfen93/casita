setTimeout(()=>{try{
 const mode=location.hash.slice(1)||'cre';
 S=newState('normal');S.char={...randomChar(),name:'Ana',g:'f'};S.traits=['sociable'];S.ideo='marxista';S.pol.comp=2;initPeople();startTrack('super',true);rollWeather();newToday();storyStart();S.autoHome=true;ex().dmode='ana';
 for(let k=0;k<480*12;k++){update(3);dlgTick();}
 menu.classList.remove('open');
 if(mode==='cre'){openCreator('normal',false);}
 else if(mode==='dlg'){S.t=20*60;S.sim.work=0;ex().dmode='preguntar';askDilemma('golpe',{v:'caldera',m:260});}
 else if(mode==='work'){S.t=10*60;}
 setTimeout(()=>{document.title='OK '+JSON.stringify(__errs);},600);
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,600)}},300);
