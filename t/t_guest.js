setTimeout(()=>{try{const out=[];for(const home of ['viejo','casita']){S=newState('normal');S.char={...randomChar(),g:'m'};initPeople();applyHome(home);startTrack('oficina',true);rollWeather();newToday();storyStart();S.jobless=true;S.t=18*60;S.free=true;
 const p=S.people.find(q=>q.k!=='madre');p.rel=70;inviteHome(p,false);const r=(S.res||[]).find(x=>x.pid===p.k);const s0=r?[r.x.toFixed(1),r.y.toFixed(1)]:null;
 for(let k=0;k<60;k++)update(1);const r2=(S.res||[]).find(x=>x.pid===p.k);out.push(home+': start='+s0+' after60='+(r2?[r2.x.toFixed(1),r2.y.toFixed(1),'path'+(r2.path||[]).length,'doing='+JSON.stringify(r2.doing||null),'arr='+r2.arrived]:'gone')+' sim='+simCell());}
 document.title='OK '+out.join(' ;; ')+' errs='+window.__errs.length+' '+(window.__errs[0]||'');
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,200)}},300);
