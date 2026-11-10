setTimeout(()=>{try{S=newState('normal');S.char={...randomChar(),g:'m'};initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();S.autoHome=true;S.money=2000;S.t=10*60;S.jobless=true;S.skills.carp=200;S.skills.elec=200;S.skills.font=200;
 const objs=findObjs((d,t)=>['nevera','tele','sofa','ducha','fogon'].includes(t));const log=[];
 for(const i of objs.slice(0,2)){S.obj[i].c=30;addFixStep(i,true);log.push('ADD '+S.obj[i].t+' job='+(S.job&&S.job.name));let k=0;for(;k<400;k++){update(3);if(k%40===0)log.push(k+':'+(S.job?S.job.name.slice(0,14)+'/'+S.job.who+'/'+(S.job.paused?'P':''):'-')+' c='+Math.round(S.obj[i].c)+' w='+(S.sim.work>0?'away:'+S.sim.outingActive:'home')+' use='+(S.sim.use&&S.sim.use.type));if(S.obj[i].c>=60)break;}}
 document.title='OK '+log.join(' || ');
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,400)}},300);
