// el censo real en las escenas: nadie en dos sitios a la vez, criaturas siempre con su adulta, nadie fuera de su horario
setTimeout(()=>{try{window.__errs=window.__errs||[];const bad=[];
 S=newState('normal');S.char={...randomChar(),g:'f'};S.ideo='marxista';initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();
 const V=DATA.personas.vecinos,H=DATA.personas.hogares;const vistos=new Set();let figs=0,veces=0;
 for(const wd of [0,2,5,6])for(let h=7;h<24;h+=.5){S.t=h*60;S.day=1;while(dateOf(S.day).wd!==wd)S.day++;const donde={};
  for(const k of Object.keys(PLACES)){let o;try{o=crowd({tt:0},k,{W:10,D:8});}catch(e){bad.push('crowd '+k+' '+e.message);continue;}
   const ns=o.filter(q=>q.v);figs+=o.length;veces++;
   for(const q of ns){const v=q.v;vistos.add(v.id);if(donde[v.id])bad.push(`${v.id} a la vez en ${donde[v.id]} y ${k} (${wd} ${h})`);donde[v.id]=k;
    const porT=v.trabajo&&v.trabajo.lugar===k&&h>=v.trabajo.h[0]&&h<v.trabajo.h[1]&&v.trabajo.dias.includes(wd);
    const porD=(v.donde||[]).some(d=>d[0]===k&&h>=d[1]&&h<d[2]&&d[3].includes(wd));if(!porT&&!porD)bad.push(`${v.id} en ${k} fuera de horario (${wd} ${h})`);
    if(v.edad<12&&!(k==='parque'&&h>=17&&h<20)&&!ns.some(a=>a.v.hogar===v.hogar&&a.v.edad>=18))bad.push(`${v.id} (${v.edad}) sin adulta en ${k} (${wd} ${h})`);
    if(v.edad<18&&['bar','sala','obra','torre','sindicato','comisaria'].includes(k))bad.push(`${v.id} menor en ${k}`);}}}
 for(const id in H)for(const m of H[id].miembros)if(!V.find(v=>v.id===m))bad.push('hogar '+id+' sin '+m);
 const nunca=V.filter(v=>!vistos.has(v.id)).map(v=>v.id);
 document.title=(bad.length||__errs.length?'ERR ':'OK ')+JSON.stringify({bad:[...new Set(bad)].slice(0,8),nbad:bad.length,errs:__errs.slice(0,3),personas:V.length,vistas:vistos.size,nunca,media:Math.round(figs/veces*10)/10});
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,400)}},300);
