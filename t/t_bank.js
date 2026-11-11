setTimeout(()=>{try{S=newState('normal');S.char={...randomChar(),g:'m'};initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();
 const w=W_();w.era='consejos';w.gov='consejos';S.gv={since:S.day-20,ph:3,pre:null,lack:[],prop:-99,comedor:0,elec:0,ev:0};S.money=-50;
 const out=['govBank='+govBank()];phOpen('bank');for(const t of ['resumen','prod']){bkTab=t;phRender();out.push(t+': '+document.getElementById('phone').innerText.replace(/\s+/g,' ').slice(150,700));}
 document.title='OK '+out.join(' ;; ')+' errs='+window.__errs.length+' '+(window.__errs[0]||'');
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,200)}},300);
