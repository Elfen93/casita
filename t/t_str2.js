setTimeout(()=>{try{S=newState('normal');S.char={...randomChar(),g:'m'};initPeople();applyHome('viejo');startTrack('super',true);rollWeather();newToday();storyStart();S.autoHome=false;S.union={member:true,since:1};office().org=70;S.t=5*60;
 callStrike(false);S.strike.join=true;S.strike.left=3;S.strike.total=3;let piq=0,days=0;const ts=[];const _t=toast;toast=function(m){if(String(m).includes('iquete'))ts.push(String(m).slice(0,40));return _t.apply(this,arguments);};
 for(let k=0;k<480*3;k++){update(3);if(S.sim.outingActive==='piquete')piq++;}
 document.title='OK piq='+piq+' ts='+ts.join('|')+' errs='+window.__errs.length;
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,300)}},300);
