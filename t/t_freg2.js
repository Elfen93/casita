setTimeout(()=>{try{S=newState('normal');S.char={...randomChar(),g:'m'};initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();S.jobless=true;S.t=10*60;S.autoHome=true;S.free=true;if(typeof mode!=='undefined')mode='live';
 let put=null;const f=findObjs((d,t)=>t==='fogon')[0];const fx=f%N,fy=f/N|0;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1],[2,0],[-2,0]]){const i=idx(fx+dx,fy+dy);if(put==null&&!S.obj[i]&&walkable(fx+dx,fy+dy)){S.obj[i]={t:'fregadero',q:3,c:100,r:0};put=i;}}
 const uses={};S.sucios=0;for(let k=0;k<600;k++){update(1);const u=S.sim.use;if(u&&u.type==='fregadero'){const key=(u.act||'-')+'/'+(u.goal||'');uses[key]=(uses[key]||0)+1;}}
 document.title='OK put='+put+' uses='+JSON.stringify(uses)+' sucios='+S.sucios+' errs='+window.__errs.length+' '+(window.__errs[0]||'');
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,200)}},1500);
