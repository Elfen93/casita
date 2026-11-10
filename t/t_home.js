setTimeout(()=>{try{const errs=[];const oe=console.error;console.error=(...a)=>{errs.push(a.map(x=>x&&x.stack?x.stack.slice(0,250):String(x)).join(' '));};
 const k=location.hash.slice(1)||'habitacion';
 S=newState('normal');S.char={...DEFCHAR,name:'Ana'};S.traits=['sociable'];initPeople();startTrack('super',true);applyHome(k);rollWeather();newToday();storyStart();S.autoHome=true;ex().dmode='ana';
 const m0=Math.round(S.money);for(let i=0;i<480*40;i++){update(3);dlgTick();}
 S.t=19*60;S.sim.work=0;S.sim.outingActive=null;S.sim.dest=null;viewPlace=false;menu.classList.remove('open');cam.z=1;centerOnWorld(9.5,9.5);
 const log=S.story.log.filter(e=>/🛋️|🏚️|🦠|👩‍🦳|🏙️|🏊|📦|🛒|🔑|Capítulo/.test(e.ic+e.txt)).slice(-8).map(e=>'d'+e.d+' '+e.ic+' '+e.txt.replace(/<[^>]+>/g,'').slice(0,150));
 setTimeout(()=>{document.title='OK '+JSON.stringify({k,home:S.home.type,rent:weeklyRent(),m0,money:Math.round(S.money),res:(S.res||[]).map(r=>r.kind+':'+r.pid),errs:errs.slice(0,4).concat(__errs.slice(0,3)),log});},400);
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,400)}},300);
