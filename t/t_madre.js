setTimeout(()=>{try{S=newState('normal');S.char={...randomChar(),g:'m'};initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();
 openMenu('gente');const m=S.people.find(p=>p.k==='madre');openPe('madre');const b=document.querySelector('#pesheet [data-pi="socialdemocrata"]');b.click();
 document.title='OK madre='+m.ideo+' errs='+window.__errs.length+' '+(window.__errs[0]||'');
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,200)}},300);
