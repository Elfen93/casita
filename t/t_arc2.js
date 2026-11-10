setTimeout(()=>{try{
 S=newState('soul');S.char={...randomChar()};S.traits=['sociable'];S.ideo='libertaria';S.pol.comp=2;initPeople();startTrack('reparto',true);rollWeather();newToday();storyStart();S.autoHome=true;ex().dmode='ana';
 const errs=[];const oe=console.error;console.error=(...a)=>{errs.push(a.map(x=>x&&x.stack?x.stack.slice(0,300):String(x)).join(' '));};
 for(let k=0;k<480*62;k++){update(3);dlgTick();}
 document.title='OK '+JSON.stringify({errs:errs.slice(0,6),tmp:[JSON.stringify(S.tmp)],dq:[JSON.stringify(ex().dq)],dlg:[JSON.stringify(ex().dlg)]});
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,600)}},300);
