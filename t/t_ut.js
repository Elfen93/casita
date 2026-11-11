setTimeout(()=>{try{S=newState('normal');S.char={...randomChar(),g:'m'};initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();
 const out=[];S.money=5000;for(const p of S.people)p.rel=60;
 out.push('why='+utCanFound().join('|'));utFound('integral');out.push('ut='+JSON.stringify({m:S.ut.members,c:S.ut.coh,caja:S.ut.caja}));
 const vh=vidaTab();out.push('ui='+vh.includes('Cohesión'));
 for(let i=0;i<30&&S.ut;i++){worldWeekly();const b=document.querySelector('#utsheet.on [data-utd]');if(b)b.click();}
 out.push('after30='+(S.ut?JSON.stringify({m:S.ut.members,c:Math.round(S.ut.coh),caja:Math.round(S.ut.caja),tej:S.ut.tejido,free:S.ut.free.toFixed(1)}):'disuelta'));
 S.jobless=true;const m0=S.money;if(S.ut)worldWeekly();out.push('resist='+(S.money-m0));
 document.title='OK '+out.join(' ;; ')+' errs='+window.__errs.length+' '+(window.__errs[0]||'');
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,300)}},300);
