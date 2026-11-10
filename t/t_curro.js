setTimeout(()=>{try{S=newState('normal');S.char={...randomChar(),g:'m'};initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();S.t=8.5*60;S.needs.vejiga=35;S.needs.energia=45;S.needs.higiene=50;depart();for(let k=0;k<700;k++){update(1);if(S.sim.work<=0)break;}
 document.title='OK W='+JSON.stringify(S.curro)+' needs='+JSON.stringify(Object.fromEntries(Object.entries(S.needs).map(([k,v])=>[k,Math.round(v)])))+' work='+S.sim.work+' errs='+window.__errs.length;
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,300)}},300);
