setTimeout(()=>{try{
 const errs=[];const oe=console.error;console.error=(...a)=>{errs.push(a.map(x=>x&&x.stack?x.stack.slice(0,200):String(x)).join(' '));};
 const out=[];
 for(const home of ['padres','habitacion','bueno']){
  S=newState('normal');S.char={...randomChar(),g:'f'};S.traits=['sociable'];S.ideo='marxista';S.pol.comp=2;initPeople();applyHome(home);startTrack('super',true);rollWeather();newToday();storyStart();S.autoHome=true;ex().dmode='ana';
  const acts={};let stuck=0;
  for(let k=0;k<480*30;k++){update(3);dlgTick();const u=S.sim.use;if(u&&u.act)acts[u.act]=(acts[u.act]||0)+1;}
  out.push(home+': $'+Math.round(S.money)+' acts='+Object.keys(acts).join(',')+' col='+JSON.stringify({r:S.col&&S.col.rec.length,l:S.col&&S.col.libDone.length,c:S.col&&S.col.can.length,cur:S.col&&S.col.curDone.length,plat:S.col&&S.col.plat})+' msgs='+Object.values(PH().th).reduce((a,t)=>a+t.length,0)+' needs='+Object.entries(S.needs).map(([k,v])=>k[0]+(v|0)).join(''));
 }
 document.title='OK '+JSON.stringify({errs:errs.slice(0,6),werrs:window.__errs.slice(0,4),out});
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,600)}},300);
