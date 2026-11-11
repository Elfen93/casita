setTimeout(()=>{try{S=newState('normal');S.char={...randomChar(),g:'m'};initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();S.money=2000;
 const m=S.people.find(p=>p.k==='madre');const a=S.people.find(p=>p.k!=='madre');schedule(30,'devolver',{p:m.k,m:300});S.sol=S.sol||{};S.sol.owed=255;S.sol.loanWho=a.n;
 const out=[];phOpen('bank');bkTab='deudas';phRender();const ph=document.getElementById('phone');out.push('rows='+ph.querySelectorAll('.bkpay').length+' txt='+ph.querySelector('.bkbody').innerText.replace(/\s+/g,' ').slice(0,200));
 ph.querySelector('[data-pay="0"][data-amt="all"]').click();out.push('after: cq='+ex().cq.filter(q=>q.k==='devolver').map(q=>q.data.m).join(',')+' money='+S.money);
 bkTab='prod';phRender();const au=ph.querySelector('[data-au="10"]');au&&au.click();au&&ph.querySelector('[data-au="10"]').click();out.push('auto='+BP().auto);const s0=BP().ahorro.v;worldWeekly();out.push('ahorro '+s0+'→'+BP().ahorro.v);
 document.title='OK '+out.join(' ;; ')+' errs='+window.__errs.length+' '+(window.__errs[0]||'');
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,200)}},300);
