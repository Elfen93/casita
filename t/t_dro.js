setTimeout(()=>{try{
 const errs=[];console.error=(...a)=>{errs.push(a.map(x=>x&&x.stack?x.stack.slice(0,300):String(x)).join(' '));};
 S=newState('dificil');S.char={...randomChar(),g:'m'};S.traits=['pesimista'];S.ideo='apolitica';initPeople();applyHome('infra');startTrack('reparto',true);rollWeather();newToday();storyStart();S.autoHome=true;ex().dmode='ana';S.money=300;
 const outs={};const log=[];
 for(let k=0;k<480*120;k++){update(3);dlgTick();if(S.sim.outingActive)outs[S.sim.outingActive]=(outs[S.sim.outingActive]||0)+1;if(k%480===0){MT().an=Math.min(MT().an,28);MT().ther=null;MT().wait=0;if(S.money<150)S.money=150;}}
 const m=MT();document.title='OK '+JSON.stringify({errs:errs.slice(0,4),werrs:window.__errs.slice(0,3),mt:{an:Math.round(m.an),dep:m.dep,alc:+m.alc.toFixed(1),dro:+m.dro.toFixed(1),deal:m.deal,bust:m.bust,debt:m.debt,quit:m.quit,sober:m.sober},rec:S.record,jail:S.jail,chaps:Object.keys(S.story.chap).join(','),outs,money:Math.round(S.money),home:S.home.type,mg:S.mg&&{wk:S.mg.wk,ev:S.mg.evicted}});
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,600)}},300);
