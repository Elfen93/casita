setTimeout(()=>{try{S=newState('normal');S.char={...randomChar(),g:'m'};initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();S.jobless=true;S.t=11*60;
 const out=[];openMenu('gente');const b=card.querySelector('[data-pm]');out.push('btn='+!!b);b.click();const sh=document.querySelector('#pesheet');out.push('sheet='+sh.innerText.replace(/\n/g,'|').slice(0,220));
 sh.querySelector('[data-pe="parque"]').click();out.push('outing='+S.sim.outing+'/'+S.sim.outingActive+' with='+S.outWith);
 for(let k=0;k<200;k++)update(1);out.push('tras: with='+S.outWith);
 document.title='OK '+out.join(' ;; ')+' errs='+window.__errs.length+' '+(window.__errs[0]||'');
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,200)}},300);
