setTimeout(()=>{try{const errs=[];console.error=(...a)=>{errs.push(String(a[0]).slice(0,200));};
 const done=[];for(const t of ['telefono','micro','sillon','banco','lavadora','muebar','hamaca','caseta','armario','vater','lavabo','chimenea']){
  S=newState('normal');S.char={...randomChar(),g:'f'};initPeople();applyHome('casita');startTrack('oficina',true);rollWeather();newToday();storyStart();S.autoHome=false;S.money=5000;S.jobless=true;S.t=10*60;
  let i=findObjs((d,tt)=>tt===t)[0];if(i==null){i=idx(9,8);if(S.obj[i])i=idx(10,8);S.obj[i]={t,q:3,c:100,r:0};dirty();uidSweep();computeRooms();}
  for(const a of ACTV[t]){if(!a[3])continue;for(const k in S.needs)S.needs[k]=35;S.sim.use=null;S.sim.path=[];S.sim.queue=[];enqueue({k:'obj',i,act:a[0]});let ok=false;for(let k=0;k<150;k++){update(2);if(S.sim.use&&S.sim.use.act===a[0])ok=true;if(ok&&!S.sim.use)break;}done.push(t+'.'+a[0]+(ok?'':'!'));}}
 document.title='OK '+errs.join('|')+' '+done.join(' ');
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,400)}},300);
