setTimeout(()=>{try{
 S=newState('dificil');S.char={...randomChar(),g:'m'};S.traits=[];S.ideo='apolitica';initPeople();applyHome('viejo');startTrack('super',true);rollWeather();newToday();storyStart();S.autoHome=true;ex().dmode='ana';
 applyHome('calle');computeRooms();S.mg=undefined;MG().calle={since:S.day};S.jobless=true;S.money=20;
 const why={};let calls=0;const _au=autonomy;autonomy=function(){calls++;const h=S.t/60;if(h>=19&&h<21.5){const w=outAvail('albergue')||'OK';why[w]=(why[w]||0)+1;}return _au.apply(this,arguments);};
 const outs={};for(let k=0;k<480*20;k++){update(3);if(S.sim.outingActive)outs[S.sim.outingActive]=(outs[S.sim.outingActive]||0)+1;}
 document.title='OK '+JSON.stringify({calls,why,outs,alb:MG().alb,use:S.sim.use&&S.sim.use.type,errs:window.__errs.slice(0,3)});
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,600)}},300);
