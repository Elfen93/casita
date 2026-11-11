setTimeout(()=>{try{S=newState('normal');S.char={...randomChar(),g:'m'};initPeople();applyHome('viejo');startTrack('hosteleria',true);rollWeather();newToday();storyStart();
 const out=[];const f=FS();
 // forzar oferta
 let wk=0;for(;wk<200&&!document.querySelector('#fsdlg.on');wk++){f.negroAsk=-99;worldWeekly();}out.push('oferta@'+wk);
 document.querySelector('#fsdlg [data-fsd="0"]').click();out.push('negro='+f.negro);
 const b=salary();out.push('pf='+(payFactor()).toFixed(3));
 S.t=SHIFT.start*60-30;depart();for(let k=0;k<900&&S.sim.work>0;k++)update(1);out.push('slip='+JSON.stringify(f.last&&{n:Math.round(f.last.neto),negro:f.last.negro}));
 S.jobless=true;S.paroWeeks=6;S.t=1439;update(1);out.push('paro='+S.paroWeeks+' negro='+f.negro);
 // autónomo rider
 S.jobless=false;startTrack('reparto',true);const m0=S.money;for(let i=0;i<6;i++)worldWeekly();const a=fsAut();out.push('alta='+a.alta+' cuota='+fsCuota()+' yrCuota='+FS().yr.cuota);
 openFs();out.push('win='+/Autónom/.test(document.querySelector('#fsheet').innerText));
 document.title='OK '+out.join(' ;; ')+' errs='+window.__errs.length+' '+(window.__errs[0]||'');
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,300)}},300);
