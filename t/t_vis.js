setTimeout(()=>{try{const errs=[];console.error=(...a)=>{errs.push(String(a[0]).slice(0,300));};
 const run=(home)=>{S=newState('normal');S.char={...randomChar(),g:'m'};initPeople();applyHome(home);startTrack('oficina',true);rollWeather();newToday();storyStart();S.autoHome=true;ex().dmode='ana';S.money=2000;
  const p=newPerson('bar',true);p.n='Marta';p.g='f';p.ch.g='f';if(!S.people.includes(p))S.people.push(p);setStage(p,'pareja');p.love=80;p.rel=80;
  const f=S.people.find(q=>!q.k.startsWith('p')&&q.k!=='madre');if(f)f.rel=80;
  let visits=0,msgs=0;const _t=tell;tell=function(t,ic){if(ic==='🚪')visits++;return _t.apply(this,arguments);};const _pi=phIncoming;phIncoming=function(p,t,k){if(Array.isArray(k)&&k[0][2]==='home')msgs++;return _pi.apply(this,arguments);};
  for(let k=0;k<480*30;k++){update(3);dlgTick();}tell=_t;phIncoming=_pi;return home+': visitas='+visits+' msgs='+msgs;};
 const out=[run('viejo'),run('padres')];
 // agenda: asamblea jueves 18h en franja de 17
 S=newState('normal');S.char={...randomChar(),g:'m'};initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();S.autoHome=true;S.union={member:true,since:1};AG().plan['3:17']='sindicato';let sind=0;for(let k=0;k<480*14;k++){update(3);if(S.sim.outingActive==='sindicato')sind++;}
 document.title='OK '+JSON.stringify({errs:errs.slice(0,3),out,sind});
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,400)}},300);
