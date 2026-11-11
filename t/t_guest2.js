setTimeout(()=>{try{S=newState('normal');S.char={...randomChar(),g:'m'};initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();S.jobless=true;S.t=18*60;S.free=true;
 const p=S.people.find(q=>q.k!=='madre');p.rel=70;inviteHome(p,false);const r=S.res.find(x=>x.pid===p.k);
 // simular que se queda clavada fuera: sin camino
 r.x=0.5;r.y=0.5;const _b=bfs;let block=true;bfs=function(a,f){if(block&&a[0]===0&&a[1]===0)return null;return _b.apply(this,arguments);};
 for(let k=0;k<40;k++)update(1);block=false;
 document.title='OK pos='+r.x.toFixed(1)+','+r.y.toFixed(1)+' inside='+(roomId[idx(Math.floor(r.x),Math.floor(r.y))]>=0)+' errs='+window.__errs.length+' '+(window.__errs[0]||'');
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,200)}},300);
