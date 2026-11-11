setTimeout(()=>{try{S=newState('realista');S.char={...randomChar(),g:'m'};initPeople();applyHome('viejo');startTrack('obra',true);rollWeather();newToday();storyStart();S.autoHome=true;
 const w=planPool();const out=['FL9='+FLOORS[9].p,'pool='+(w?jobPrice(w).mat:'null'),'ok='+wantOK(w)];S.want={key:'pool',name:'Piscina',kind:'build',steps:[{k:'water',v:9,i:5}]};S.wantDay=S.day;planTick();out.push('after want='+(S.want&&S.want.name));
 document.title='OK '+out.join(' ;; ')+' errs='+window.__errs.length;
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,200)}},300);
