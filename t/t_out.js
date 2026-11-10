setTimeout(()=>{try{S=newState('normal');S.char={...randomChar(),g:'m'};initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();S.autoHome=false;S.money=500;S.jobless=true;
 S.t=18*60;S.needs.diversion=20;S.needs.social=20;doOut('amigos');const tr=[];for(let k=0;k<260;k++){update(1);if(k%40===0)tr.push(k+':d'+(S.needs.diversion|0)+'s'+(S.needs.social|0)+(S.sim.outingActive?'*':''));}
 document.title='OK '+tr.join(' ')+' final d'+(S.needs.diversion|0)+' s'+(S.needs.social|0)+' errs='+window.__errs.length;
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,300)}},300);
