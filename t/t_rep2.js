setTimeout(()=>{try{S=newState('normal');S.char={...randomChar(),g:'m'};initPeople();applyHome('padres');startTrack('oficina',true);rollWeather();newToday();storyStart();S.autoHome=false;S.money=2000;S.t=10*60;S.jobless=true;
 const i=findObjs((d,t)=>t==='nevera')[0];S.obj[i].c=10;const log=[];const _t=tell;tell=function(t,ic){log.push(ic+t.slice(0,50)+' $'+S.money);return _t.apply(this,arguments);};
 log.push('m0 '+S.money);hireFor(i,'fix');log.push('after hire '+S.money+' job='+(S.job&&S.job.kind));for(let k=0;k<480;k++){update(3);}log.push('end '+S.money);
 document.title='OK '+JSON.stringify(log);
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,400)}},300);
