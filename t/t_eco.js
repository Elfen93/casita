setTimeout(()=>{try{const out=[];for(const d of ['normal','realista']){S=newState(d);S.char={...randomChar(),g:'m'};initPeople();applyHome('viejo');startTrack('super',true);rollWeather();newToday();storyStart();
 out.push(d+': sueldo/turno '+fmt(salary())+' neto '+fmt(salary()*payFactor())+' alquiler/sem '+fmt(weeklyRent())+' compra '+fmt(compraCost())+' nevera '+fmt(priceOf('nevera',3))+' fogon '+fmt(priceOf('fogon',3))+' fogon malo '+fmt(priceOf('fogon',1))+' casa '+fmt(housePrice())+' menu '+fmt(mealOutCost())+' gym '+(typeof gymFee==='function'?fmt(gymFee('low'))+'/'+fmt(gymFee('good')):'')+' HW '+HW().toFixed(2)+' cuota sind '+fmt(unionFee()));}
 const s=fsSlip(salary());out.push('slip bruto/año '+Math.round(s.A)+' irpf '+(s.ret*100).toFixed(1)+'%');
 document.title='OK '+out.join(' ;; ')+' errs='+window.__errs.length+' '+(window.__errs[0]||'');
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,200)}},300);
