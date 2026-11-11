setTimeout(()=>{try{S=newState('normal');S.char={...randomChar(),g:'m'};initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();
 const out=[];const w=W_();
 for(const g of ['centro','conservador','liberal','austeridad','progresista','consejos']){w.gov=g;const b=salary();const s=fsSlip(b);out.push(g+': base'+b+' bruto'+s.bruto.toFixed(0)+' ss'+s.ss.toFixed(0)+' irpf'+s.irpf.toFixed(0)+' neto'+s.neto.toFixed(0)+' A'+Math.round(s.A)+' compraX'+govIvaFood().toFixed(3));}
 w.gov='centro';S.career=Math.min(CAREER.length-1,4);{const b=salary();const s=fsSlip(b);out.push('alto: base'+b+' A'+Math.round(s.A)+' ret'+(s.ret*100).toFixed(1));}S.career=0;
 S.t=8.5*60;depart();for(let k=0;k<700&&S.sim.work>0;k++)update(1);out.push('last='+JSON.stringify(Object.fromEntries(Object.entries(S.fs.last).map(([k,v])=>[k,typeof v==='number'?+v.toFixed(2):v]))));
 // salto de año
 out.push('d1='+JSON.stringify(dateOf(1)));for(let d=0;d<480;d++){S.t=1439;update(1);}out.push('yr='+S.fs.yr.y+' prev='+(S.fs.prev&&S.fs.prev.y)+' decl='+JSON.stringify(S.fs.decl));
 openFs();out.push('sheet='+document.querySelector('#fsheet').innerText.slice(0,160).replace(/\n/g,'|'));
 document.title='OK '+out.slice(7).join(' ;; ')+' errs='+window.__errs.length+' '+(window.__errs[0]||'');
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,300)}},300);
