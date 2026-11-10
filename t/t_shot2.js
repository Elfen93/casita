setTimeout(()=>{try{S=newState('normal');S.char={...randomChar(),g:'m'};S.traits=[];initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();S.autoHome=false;S.money=2000;S.r3d='simple';
 const p=newPerson('bar',true);p.n='Marta';p.g='f';p.ch.g='f';if(!S.people.includes(p))S.people.push(p);setStage(p,'convive');p.love=80;p.rel=80;S.t=21*60;residents();
 const bed=findObjs((d,t)=>t==='cama')[0];const r=S.res.find(x=>x.pid===p.k);GEST.cama.run(p);for(let k=0;k<40;k++)update(1);
 centerOnWorld(bed%N+.5,(bed/N|0)+.5);cam.z=2.2;menu.classList.remove('open');setTimeout(()=>{document.title='OK '+(S.sim.use&&S.sim.use.act)+' '+(r.doing&&r.doing.act);},600);
}catch(err){document.title='ERR '+err.message}},300);
