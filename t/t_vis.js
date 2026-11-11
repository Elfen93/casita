setTimeout(()=>{try{S=newState('normal');S.char={...randomChar(),g:'m'};initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();S.jobless=true;S.t=17*60;
 const p=S.people.find(q=>q.k!=='madre');p.rel=80;const V=VS();V.plan={k:p.k,h:18.5,avisa:true,role:'amigo',asked:false};
 for(let k=0;k<20;k++)update(1);const th=PH().th[p.k]||[];
 document.title='OK res='+(S.res||[]).some(x=>x.pid===p.k)+' msgs='+th.map(m=>m.f+':'+m.t).join(' | ').slice(0,200)+' errs='+window.__errs.length+' '+(window.__errs[0]||'');
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,200)}},300);
