setTimeout(()=>{try{
 const errs=[];console.error=(...a)=>{errs.push(a.map(x=>x&&x.stack?x.stack.slice(0,300):String(x)).join(' '));};
 const out=[];
 for(const [tr,gym,home] of [['oficina',true,'viejo'],['obra',false,'habitacion'],['reparto',false,'infra']]){
  S=newState('normal');S.char={...randomChar(),g:'m'};S.traits=[];S.ideo='apolitica';initPeople();applyHome(home);startTrack(tr,true);rollWeather();newToday();storyStart();S.autoHome=true;ex().dmode='ana';S.money=2500;
  if(gym){HP().gymMember=true;}
  const outs={};for(let k=0;k<480*150;k++){update(3);dlgTick();if(S.sim.outingActive)outs[S.sim.outingActive]=(outs[S.sim.outingActive]||0)+1;if(S.money<500)S.money=500;}
  const H=HP();out.push(tr+': peso '+H.base+'→'+H.peso.toFixed(1)+' build='+S.char.build+' fit='+Math.round(S.fit||0)+' gym='+H.gym+' list='+JSON.stringify(H.list)+' cita='+H.cita+' hist='+H.hist.filter((x,i)=>i%30===0).join('/')+' outs='+JSON.stringify(outs)+' chaps='+Object.keys(S.story.chap).filter(c=>c.startsWith('dx')).join(','));
 }
 // forzado: sobrepeso + diagnóstico
 S=newState('normal');S.char={...randomChar(),g:'f'};initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();S.autoHome=true;S.money=3000;HP().peso=HP().base+22;HP().list.push({k:'diab',sev:1,since:S.day-30,dx:false});hpAsk(false);
 for(let k=0;k<480*30;k++){update(3);}
 out.push('dx: '+JSON.stringify(HP().list)+' sick='+S.sick+' build='+S.char.build+' chaps='+Object.keys(S.story.chap).filter(c=>c.startsWith('dx')).join(','));
 openMenu('vida');out.push('vida='+card.innerText.replace(/\s+/g,' ').slice(0,260));
 document.title='OK '+JSON.stringify({errs:errs.slice(0,4),werrs:window.__errs.slice(0,3),out});
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,600)}},300);
