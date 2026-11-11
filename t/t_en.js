setTimeout(()=>{try{S=newState('realista');S.char={...randomChar(),g:'m'};initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();S.free=true;S.autoHome=true;
 const out=[];let d=1;while(dayType(S.day)!=='work'){S.t=1439;update(1);}S.t=6*60;for(const k in S.needs)S.needs[k]=95;S.needs.energia=100;S.sim.use=null;
 const log=t=>out.push(t+' '+(S.t/60).toFixed(1)+'h E'+Math.round(S.needs.energia));log('wake');
 for(let k=0;k<16*60&&S.t<22*60;k++){update(1);if(Math.abs(S.t-17.5*60)<1)log('tras curro');if(Math.abs(S.t-19*60)<1&&!(S.sim.work>0)){doOut('amigos');log('sale');}}
 log('22h');let floor=0;for(let k=0;k<3*60;k++){update(1);if(S.sim.use&&S.sim.use.type==='_suelo')floor=1;}log('1h');out.push('suelo='+floor+' uso='+(S.sim.use&&S.sim.use.type));
 document.title='OK '+out.join(' ;; ')+' errs='+window.__errs.length+' '+(window.__errs[0]||'');
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,200)}},300);
