setTimeout(()=>{try{S=newState('normal');S.char={...randomChar(),g:'m'};initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();S.jobless=true;S.t=17*60;
 document.querySelectorAll('.diffov,#diffov,#intro,#welcome').forEach(e=>e.remove());menu.classList.remove('open');mode='live';
 const k=Object.keys(EDU_PROGS).find(k=>EDU_PROGS[k].place!=='online');ED().cur={k,h:0,need:100,since:S.day,miss:0};S.money=5000;
 const r=doOut('clase');for(let i=0;i<40;i++)update(1);viewPlace=true;
 document.title='OK k='+k+' r='+r+' away='+awayKey()+' out='+S.sim.outingActive+' errs='+window.__errs.length+' '+(window.__errs[0]||'');
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,200)}},1200);
