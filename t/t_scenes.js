setTimeout(()=>{try{window.__errs=window.__errs||[];const ce=console.error;console.error=(...a)=>{window.__errs.push(a.map(x=>x&&x.stack?x.stack.slice(0,200):String(x)).join(' ').slice(0,300));};
S=newState('normal');S.char={...randomChar(),g:'f'};S.ideo='marxista';initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();S.autoHome=false;S.r3d='simple';
const ks=['obra','super','bar','torre','residencia','biblioteca','parque','sindicato','ateneo','comedor','coop','sala','parroquia','comisaria','ayto','tienda','gym','gymbueno'];let n=0,fig=0;
for(const k of ks)for(const h of [9,14,20]){S.t=h*60;HP().gymGood=(k==='gymbueno');const s=S.sim;s.work=60;s.awayTotal=150;s.dest=k;s.outingActive=((PLACES[k]&&PLACES[k].outs)||[])[0]||null;s.exit=[9,19];awayKey=()=>k;enterScene();viewPlace=true;sceneKey=null;render();n++;}
enterScene();document.title='OK '+window.__errs.length+' '+n+' '+[...new Set(window.__errs.map(e=>e.slice(0,120)))].join(' | ');
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,300)}},300);
