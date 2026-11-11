setTimeout(()=>{try{S=newState('normal');S.char={...randomChar(),g:'m'};initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();
 const out=[];const w=W_();
 for(const g of ['liberal','progresista','austeridad','mercado']){S.cy=null;w.era=null;w.gov=g;let wk=0;const hp0=housePrice();for(;wk<80&&CY().ph!=='crisis';wk++)worldWeekly();out.push(g+': crisis@wk'+wk+' hp '+hp0+'→'+housePrice()+' payMul'+(S.payMul||1).toFixed(3)+' crisisW'+Math.round(w.crisis));}
 await0();
 function await0(){}
 // consejos
 S.cy=null;w.era='consejos';w.gov='consejos';w.mov=30;let wk=0;for(;wk<120&&CY().ph!=='crisis';wk++)worldWeekly();out.push('consejos crisis@'+wk);
 const vh=vidaTab();out.push('ui='+/Burocratizaci|Acumulaci|Sobreinversi|Compresi|Espiral/.test(vh));
 setTimeout(()=>{out.push('after: gov='+w.gov+' era='+w.era+' tells='+(S.diary||[]).length);document.title='OK '+out.join(' ;; ')+' errs='+window.__errs.length+' '+(window.__errs[0]||'');},3500);
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,300)}},300);
