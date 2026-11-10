setTimeout(()=>{try{const errs=[];console.error=(...a)=>{errs.push(String(a[0]).slice(0,200));};
 const out=[];for(const tr of ['super','obra','oficina']){S=newState('normal');S.char={...randomChar(),g:'f'};S.ideo='marxista';initPeople();applyHome('viejo');startTrack(tr,true);rollWeather();newToday();storyStart();S.autoHome=true;ex().dmode='ana';
 const dec=[];const _t=tell;tell=function(t,ic){if(ic==='🧭')dec.push(t.slice(0,40));return _t.apply(this,arguments);};
 for(let k=0;k<480*40;k++){update(3);dlgTick();}tell=_t;out.push(tr+': '+JSON.stringify(JN())+' dec='+dec.length+' '+dec.slice(0,3).join('|'));}
 document.title='OK '+JSON.stringify({errs:errs.slice(0,3),out});
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,400)}},300);
