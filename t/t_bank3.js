setTimeout(()=>{try{S=newState('normal');S.char={...randomChar(),g:'m'};initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();S.money=3000;
 const m=S.people.find(p=>p.k==='madre');schedule(30,'devolver',{p:m.k,m:300});const out=[];phOpen('bank');const ph=document.getElementById('phone');const w=W_();
 for(const [era,gov] of [[null,'centro'],['consejos','consejos'],[null,'mercado']]){w.era=era;w.gov=gov;if(era)S.gv={since:S.day-20,ph:3,pre:null,lack:[],prop:-99,comedor:0,elec:0,ev:0};
  for(const t of ['resumen','mov','ahorro','deudas']){bkTab=t;phRender();}
  bkTab='ahorro';phRender();const d=ph.querySelector('[data-bka="dep-6-0.5"]');d&&d.click();const dep=BP().dep;out.push(gov+': mode='+bkMode()+' dep='+(dep?dep.v+'@'+(dep.rate*100).toFixed(2)+'%':'none'));const br=ph.querySelector('[data-bka="dep-brk"]');br&&br.click();out.push(' brk→'+(BP().dep?'still':'ok')+' money='+S.money+' fondos='+!!ph.querySelector('[data-bka="fo+10"]'));}
 const sc=getComputedStyle(ph.querySelector('.bkbody')).overflowY;out.push('scroll='+sc);
 document.title='OK '+out.join(' ;; ')+' errs='+window.__errs.length+' '+(window.__errs[0]||'');
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,200)}},300);
