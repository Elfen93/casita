setTimeout(()=>{try{S=newState('normal');S.char={...randomChar(),g:'m'};initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();S.jobless=true;S.t=12*60;
 const out=[];const p=S.people.find(q=>q.k!=='madre')||S.people[0];p.rel=60;callP(p);
 setTimeout(()=>{out.push('callov='+document.querySelector('#callov').className);},500);
 setTimeout(()=>{out.push('card='+(document.querySelector('#sfxcard')||{}).innerText);
   S.outWith=p.k;doOut('visita');out.push('dest='+S.sim.dest+'/'+S.sim.outing);
   document.title='OK '+out.join(' ;; ').replace(/\n/g,'|')+' errs='+window.__errs.length+' '+(window.__errs[0]||'');},4200);
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,200)}},300);
