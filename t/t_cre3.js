setTimeout(()=>{try{const errs=[];console.error=(...a)=>{errs.push(String(a[0]&&a[0].stack||a[0]).slice(0,300));};S=newState('normal');S.char={...randomChar(),g:'m'};initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();
 openMenu('perfil');card.querySelector('#editchar').click();setTimeout(()=>{document.title='OK cuerpo='+!!card.querySelector('#cralt')+' errs='+errs.join(';');},600);
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,300)}},300);
