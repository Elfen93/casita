setTimeout(()=>{try{S=newState('realista');S.char={...randomChar(),g:'m',alt:187,peso:65};initPeople();applyHome('viejo');startTrack('obra',true);rollWeather();newToday();storyStart();S.autoHome=true;S.free=true;
 const H=HP();H.peso=65;const out=['sano='+pesoSano()];CM().desp=30;
 for(let d=0;d<60;d++){for(let k=0;k<1440;k++){update(1);if(CM().desp<5)CM().desp=30;if(S.money<500)S.money=2000;}if(d%15===14)out.push('d'+(d+1)+' '+H.peso.toFixed(1)+'kg');}
 W_().gov='consejos';W_().era='consejos';H.cita=0;hpAsk(false);out.push('cita en '+(H.cita-S.day));
 document.title='OK '+out.join(' ;; ')+' errs='+window.__errs.length+' '+(window.__errs[0]||'');
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,200)}},300);
