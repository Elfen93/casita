setTimeout(()=>{try{const out=[];for(const conMesa of [true,false]){S=newState('normal');S.char={...randomChar(),g:'m'};initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();S.jobless=true;S.t=13*60;
 if(!conMesa){for(let i=0;i<S.obj.length;i++){const o=S.obj[i];if(o&&(o.t==='mesa'||OBJ[o.t].table))S.obj[i]=null;}}else{const m=findObjs((d,t)=>t==='mesa')[0];const x=m%N,y=m/N|0;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const j=idx(x+dx,y+dy);if(!S.obj[j]&&walkable(x+dx,y+dy)){S.obj[j]={t:'silla',q:3,c:100,r:0};break;}}out.push('seat='+seatFor(m));}
 if(!findObjs((d,t)=>t==='fogon').length)out.push('SIN FOGON');
 for(const k in S.needs)S.needs[k]=80;S.needs.hambre=20;if(typeof CM==='function')CM().desp=10;S.sim.use=null;const i=findObjs((d,t)=>t==='fogon')[0];enqueue({k:'obj',i});
 let maxCook=0,phase=[];for(let k=0;k<120;k++){update(1);const u=S.sim.use;const lab=u?(u.goal==='_comer'?'comer':u.type):'-';if(phase[phase.length-1]!==lab)phase.push(lab);if(u&&u.type==='fogon'&&u.goal!=='_comer')maxCook=Math.max(maxCook,S.needs.hambre);}
 out.push((conMesa?'MESA':'SIN')+': fases '+phase.join('>')+' hambre max cocinando '+Math.round(maxCook)+' final '+Math.round(S.needs.hambre)+' plato '+Math.round(S.plato||0));}
 document.title='OK '+out.join(' ;; ')+' errs='+window.__errs.length+' '+(window.__errs[0]||'');
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,200)}},300);
