// Visor: el calentador roto en la pestaña Vida (v=vida) o la decisión abierta (v=dlg)
setTimeout(()=>{try{const q=new URLSearchParams(location.hash.slice(1));window.__errs=window.__errs||[];
 let seed=11;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 S=newState('normal');S.char={...randomChar('m'),name:'Oury'};S.ideo='marxista';initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();S.weather={k:'sol',t:20};newToday();storyStart();S.autoHome=false;S.sim.work=0;
 S.t=11*60;const g=HG();g.boiler=1;g.boilerSince=S.day-12;if(q.get('sind'))S.pol.tenant=true;if(q.get('req'))g.req=2;
 mode='live';speed=0;hud();const st=document.createElement('style');st.textContent='#toasts{display:none!important}';document.head.appendChild(st);
 if(q.get('v')==='dlg'){askDilemma('calentador',{});dlgTick();}else{openMenu(q.get('tab')||'vida');setTimeout(()=>{const b=document.getElementById('hgcal');if(b)b.scrollIntoView({block:'center'});},300);}
 setTimeout(()=>{document.title='OK '+JSON.stringify({btn:!!document.getElementById('hgcal'),dlg:!!(ex().dlg),errs:window.__errs.slice(0,2)});},900);
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,300)}},300);
