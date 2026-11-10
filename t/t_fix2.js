setTimeout(()=>{try{S=newState('normal');S.char={...randomChar(),g:'m'};initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();S.autoHome=true;S.money=2000;S.t=10*60;S.jobless=true;S.skills.carp=200;S.skills.elec=200;S.skills.font=200;
 const i=findObjs((d,t)=>t==='ducha')[0];S.obj[i].c=30;addFixStep(i,true);const log=['req='+stepReq({k:'fix',i})+' lvl='+lvl('font')];const _t=toast;toast=function(m){log.push('T:'+String(m).slice(0,40));return _t.apply(this,arguments);};
 for(let k=0;k<200;k++){update(3);if(k%20===0)log.push(k+':'+(S.job?S.job.name+'/'+S.job.who+'/p'+!!S.job.paused+'/st'+JSON.stringify(S.job.steps[0]):'-')+' use='+(S.sim.use&&S.sim.use.type)+' c='+Math.round(S.obj[i].c)+' $'+Math.round(S.money));}
 document.title='OK '+log.join(' || ');
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,400)}},300);
