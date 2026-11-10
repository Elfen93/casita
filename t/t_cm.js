setTimeout(()=>{try{const errs=[];console.error=(...a)=>{errs.push(String(a[0]&&a[0].stack||a[0]).slice(0,300));};
 const out=[];for(const [tr,home] of [['oficina','viejo'],['super','padres'],['hosteleria','habitacion']]){S=newState('normal');S.char={...randomChar(),g:'m'};initPeople();applyHome(home);startTrack(tr,true);rollWeather();newToday();storyStart();S.autoHome=true;ex().dmode='ana';S.money=1500;
  const meals={};let days=0;const _d=dailyEvents;dailyEvents=function(){const t=CM().today;days++;for(const k in t)meals[t[k].n]=(meals[t[k].n]||0)+1;return _d.apply(this,arguments);};
  for(let k=0;k<480*21;k++){update(3);dlgTick();}dailyEvents=_d;
  out.push(tr+'/'+home+': nut='+CM().nut+' desp='+Math.round(CM().desp)+' spent='+Math.round(CM().spent)+' $'+Math.round(S.money)+' meals/day='+(Object.values(meals).reduce((a,b)=>a+b,0)/days).toFixed(1)+' '+JSON.stringify(meals));}
 document.title='OK '+JSON.stringify({errs:errs.slice(0,3),out});
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,400)}},300);
