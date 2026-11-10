setTimeout(()=>{try{const errs=[];console.error=(...a)=>{errs.push(String(a[0]).slice(0,300));};
 S=newState('normal');S.char={...randomChar(),g:'f'};initPeople();applyHome('viejo');startTrack('hosteleria',true);rollWeather();newToday();storyStart();S.autoHome=true;ex().dmode='ana';S.money=3000;
 S.kids=[{n:'Lúa',g:'f',born:S.day-200,ch:randomChar('f')}];residents();
 const ev=[];const _t=tell;tell=function(t,ic){if(['🤒','👩‍🦳','🎒','🧒','🎂'].includes(ic))ev.push(ic+t.slice(0,50));return _t.apply(this,arguments);};
 let away=0,home=0;for(let k=0;k<480*70;k++){update(3);dlgTick();if(k%10===0){const r=S.res.find(x=>x.kind==='kid');if(r){if(r.away)away++;else home++;}}if(k%(480*7)===0&&S.money<500)S.money=1500;}
 // jugar
 const r=S.res.find(x=>x.kind==='kid');S.t=19*60;if(r&&r.away)r.away=null;S.sim.work=0;S.sim.outingActive=null;S.sim.use=null;const k=S.kids[0];const h0=k.hap;S.kidAct={r:0,k:'jugar',m:30,t:0};const cx=Math.floor(r.x),cy=Math.floor(r.y);const [sx,sy]=simCell();const path=bfs([sx,sy],(x,y)=>Math.abs(x-cx)+Math.abs(y-cy)<=1&&walkable(x,y));S.sim.path=path||[];S.sim.cmd=true;for(let i=0;i<80;i++)update(1);
 document.title='OK '+JSON.stringify({errs:errs.slice(0,3),age:kidAge(k),hap:[h0,k.hap],play:k.play,away,home,recoger:S.recoger,abs:S.kidAbs,ev:ev.slice(0,8)});
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,400)}},300);
