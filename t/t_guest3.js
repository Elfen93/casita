setTimeout(()=>{try{S=newState('normal');S.char={...randomChar(),g:'m'};initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();S.jobless=true;S.t=12*60;S.free=true;
 for(let i=0;i<N*N;i++){const o=S.obj[i];if(o&&['sofa','silla','sillon','butaca','mesacoc','banco','bancoj','sofacama'].includes(o.t))S.obj[i]=null;}
 const p=S.people.find(q=>q.k!=='madre');p.rel=70;inviteHome(p,false);const r=S.res.find(x=>x.pid===p.k);const seen={};
 for(let k=0;k<150;k++){update(1);if(r.doing)seen[r.doing.t]=1;if(r.away)seen.away=1;}
 document.title='OK pos='+r.x.toFixed(1)+','+r.y.toFixed(1)+' did='+Object.keys(seen).join(',')+' errs='+window.__errs.length+' '+(window.__errs[0]||'');
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,200)}},300);
