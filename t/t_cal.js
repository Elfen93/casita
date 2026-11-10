setTimeout(()=>{try{
 const out=[];
 for(const tr of ['oficina','obra']){S=newState('normal');S.char={...randomChar(),g:'m'};initPeople();applyHome('viejo');startTrack(tr,true);rollWeather();newToday();storyStart();S.autoHome=true;S.money=2500;
  const ins=[],burns=[];const _d=dailyEvents;dailyEvents=function(){ins.push(Math.round(HP().in));burns.push(Math.round(HP().burn));return _d.apply(this,arguments);};
  for(let k=0;k<480*40;k++){update(3);}
  dailyEvents=_d;out.push(tr+' in='+ins.slice(5).join(',')+' burn='+burns.slice(5).join(',')+' fit='+S.fit);}
 document.title='OK '+JSON.stringify(out);
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,600)}},300);
