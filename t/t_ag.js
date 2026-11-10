setTimeout(()=>{try{const errs=[];console.error=(...a)=>{errs.push(String(a[0]).slice(0,300));};
 S=newState('normal');S.char={...randomChar(),g:'m'};initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();S.autoHome=true;S.money=1000;HP().gymMember=true;S.union={member:true,since:1};S.r3d='simple';
 const free=[];for(let i=0;i<N*N;i++){const x=i%N,y=i/N|0;if(!S.obj[i]&&inArea(x,y)&&S.floor[i]&&S.wall[i]===0)free.push(i);}S.obj[free[0]]={t:'escritorio',q:3,c:100,r:0};dirty();uidSweep();computeRooms();
 const A=AG();for(let d=0;d<7;d++){A.plan[d+':18.5']='gimnasio';A.plan[d+':21.5']='escribir';A.plan[d+':7']='leer';}A.plan['5:11']='sindicato';
 const outs={},acts={};const toasts=[];const _to=toast;toast=function(m){if(String(m).startsWith('📅'))toasts.push(String(m).slice(0,30));return _to.apply(this,arguments);};
 for(let k=0;k<480*14;k++){update(3);if(S.sim.outingActive)outs[S.sim.outingActive]=(outs[S.sim.outingActive]||0)+1;const u=S.sim.use;if(u&&u.act)acts[u.act]=(acts[u.act]||0)+1;}
 openAg(2);const rows=agEl.querySelectorAll('.agrow').length;const sel=agEl.querySelectorAll('select').length;
 document.title='OK '+JSON.stringify({errs:errs.slice(0,3),outs,acts:{escribir:acts.escribir,leer:acts.leer},toasts:toasts.slice(0,8),rows,sel});
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,400)}},300);
