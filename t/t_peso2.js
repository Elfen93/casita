setTimeout(()=>{try{S=newState('realista');S.char={...randomChar(),g:'m',alt:187,peso:65};initPeople();applyHome('viejo');startTrack('obra',true);rollWeather();newToday();storyStart();S.autoHome=true;S.free=true;
 const H=HP();H.peso=65;H.gymUntil=S.day+999;const out=['sano='+pesoSano()];CM().desp=30;let pz=[];
 const _dl=dailyEvents;dailyEvents=function(){const P=S.pz||{};pz.push(Math.round(P.in||0)+'/'+Math.round(P.dr||0)+'/b'+Math.round(H.burn||0));return _dl.apply(this,arguments);};
 for(let d=0;d<20;d++){for(let k=0;k<1440;k++){update(1);if(CM().desp<5)CM().desp=30;if(S.money<500)S.money=2000;if(Math.abs(S.t-18*60)<1&&!(S.sim.work>0)&&dayType(S.day)==='work'){try{doOut('gimnasio');}catch(e){}}}if(d%5===4)out.push('d'+(d+1)+' '+H.peso.toFixed(1)+'kg nut'+CM().nut);}
 out.push('pz '+pz.slice(-6).join(' '));
 document.title='OK '+out.join(' ;; ')+' errs='+window.__errs.length+' '+(window.__errs[0]||'');
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,200)}},300);
