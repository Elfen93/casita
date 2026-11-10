setTimeout(()=>{try{
 const out=[];
 for(const season of [0,180]){ // día 1 ≈ primavera?, +180 días
  S=newState('normal');S.char={...randomChar(),g:'m'};S.traits=[];S.ideo='marxista';S.pol.comp=2;initPeople();startTrack('oficina',true);rollWeather();newToday();storyStart();S.autoHome=true;ex().dmode='ana';
  S.day+=season;
  const sh=[];let minH=100;const lastUse={};const drops=[];let ph=S.needs.higiene;
  for(let k=0;k<480*8;k++){update(3);dlgTick();const u=S.sim.use;if(u&&SHOWERS.has(u.type)&&!lastUse.on){lastUse.on=1;sh.push((S.day-season)+'d'+(S.t/60).toFixed(1));}if(!(u&&SHOWERS.has(u.type)))lastUse.on=0;if(S.day-season>1)minH=Math.min(minH,S.needs.higiene);if(ph-S.needs.higiene>8)drops.push((S.day-season)+'d'+(S.t/60).toFixed(1)+':'+(ph-S.needs.higiene).toFixed(0)+(S.sim.work>0?'W':'')+(S.sim.outing||''));ph=S.needs.higiene;if(k%160==0)drops.push('·'+(S.day-season)+'d'+(S.t/60|0)+'='+S.needs.higiene.toFixed(0)+(S.sim.work>0?'W':''));}
  out.push(seasonOf()+' minHig='+minH.toFixed(0)+' showers='+sh.join(' ')+' pref='+showerPref()+' drops='+drops.join(' ')+' shw='+JSON.stringify(S.shw));
 }
 document.title='OK '+JSON.stringify({out,errs:window.__errs.slice(0,4)});
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,600)}},300);
