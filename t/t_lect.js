setTimeout(()=>{try{S=newState('normal');S.char={...randomChar(),g:'m'};initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();S.r3d='simple';LB().own.push('Las uvas de la ira','Trabajos de mierda');LB().lib['Las uvas de la ira']=100;
 openLib('leyendo');const n=libEl.querySelectorAll('.libbook').length;libEl.querySelector('[data-read="Trabajos de mierda"]').click();const cur=LB().reading;openLib('buscar');const m=libEl.querySelectorAll('.libbook').length;openLib('leyendo');menu.classList.remove('open');
 setTimeout(()=>{document.title='OK n='+n+' cur='+cur+' buscar='+m+' errs='+window.__errs.length;},300);
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,300)}},300);
