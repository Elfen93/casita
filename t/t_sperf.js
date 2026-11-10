setTimeout(()=>{try{S=newState('normal');S.char={...DEFCHAR};initPeople();startTrack('super',true);rollWeather();newToday();storyStart();menu.classList.remove('open');mode='live';S.t=12*60;W_().crisis=60;W_().mov=60;
 const res={};for(const k of ['super','bar','tienda','torre','ayto','biblioteca','obra','residencia','coop','sindicato','ateneo','_piquete','parroquia','comedor','comisaria','parque','sala','_calle','_ride']){
  awayKey=()=>k;S.sim.work=200;S.sim.dest=k;viewPlace=true;sceneKey=null;render();const t0=performance.now();for(let i=0;i<20;i++)render();res[k]=+((performance.now()-t0)/20).toFixed(1);}
 viewPlace=false;awayKey=()=>null;const t1=performance.now();for(let i=0;i<20;i++)render();res.casa=+((performance.now()-t1)/20).toFixed(1);
 document.title='OK '+JSON.stringify(res)+JSON.stringify(__errs.slice(0,3));}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,300)}},300);
