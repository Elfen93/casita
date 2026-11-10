setTimeout(()=>{try{
 const errs=[];console.error=(...a)=>{errs.push(a.map(x=>x&&x.stack?x.stack.slice(0,300):String(x)).join(' '));};
 S=newState('normal');S.char={...randomChar(),g:'f'};S.traits=['artista'];S.ideo='marxista';initPeople();applyHome('viejo');startTrack('super',true);rollWeather();newToday();storyStart();S.autoHome=false;ex().dmode='ana';S.money=3000;
 // muebles: escritorio, estantería, caballete
 const free=[];for(let i=0;i<N*N;i++){const x=i%N,y=i/N|0;if(!S.obj[i]&&inArea(x,y)&&S.floor[i]&&S.wall[i]===0)free.push(i);}
 S.obj[free[0]]={t:'escritorio',q:3,c:100,r:0};S.obj[free[3]]={t:'estant',q:3,c:100,r:0};S.obj[free[6]]={t:'caballete',q:3,c:100,r:0};dirty();uidSweep();computeRooms();
 // tienda
 openShop('libreria');const nb=shopEl.querySelectorAll('[data-buy]').length;shopEl.querySelectorAll('[data-buy]')[0].click();shopEl.querySelectorAll('[data-buy]')[5].click();closeShop();
 eduStart('bach_online');openShop('libreria');const man=shopEl.querySelector('[data-man]');if(man)man.click();closeShop();
 const C=LB();const own0=C.own.slice();
 // leer en la estantería, escribir, pintar en bucle
 const acts={};let days=0;
 const loop=(n,f)=>{for(let k=0;k<n;k++){update(3);const u=S.sim.use;if(u&&u.act)acts[u.act]=(acts[u.act]||0)+1;if(!S.sim.use&&!(S.sim.path&&S.sim.path.length)&&!S.sim.queue.length&&!(S.sim.work>0)&&S.t/60>16&&S.t/60<23)f();}};
 wrStart('relato');
 loop(480*40,()=>{const r=Math.random();if(r<.3)enqueue({k:'obj',i:free[3],act:'leer'});else if(r<.65)enqueue({k:'obj',i:free[0],act:'escribir'});else if(S.money>50)enqueue({k:'obj',i:free[6],act:'pintar'});});
 const st1={proj:C.proj&&{k:C.proj.k,h:Math.round(C.proj.h),done:C.proj.done,q:C.proj.q},wr:+C.wr.toFixed(2),art:+C.art.toFixed(2),obras:C.obras.length,read:C.libDone.length,reading:C.reading,eduH:Math.round(ED().cur&&ED().cur.h||0)};
 if(C.proj&&C.proj.done)wrSubmit(C.proj,'concurso');
 if(C.obras.length)artSell('merc');
 wrStart('novela');
 loop(480*120,()=>{if(C.proj&&C.proj.done){wrSubmit(C.proj,'edit');wrStart('articulo');}const r=Math.random();if(r<.2)enqueue({k:'obj',i:free[3],act:'leer'});else if(r<.8)enqueue({k:'obj',i:free[0],act:'escribir'});else if(S.money>50)enqueue({k:'obj',i:free[6],act:'pintar'});});
 if(C.obras.length){artSell('gal');artSell('online');}
 loop(480*60,()=>{if(C.proj&&C.proj.done){wrSubmit(C.proj,C.proj.k==='novela'?'ebook':'medio');wrStart('articulo');}if(Math.random()<.7)enqueue({k:'obj',i:free[0],act:'escribir'});});
 openMenu('perfil');const of=card.querySelector('#ofbox');
 document.title='OK '+JSON.stringify({errs:errs.slice(0,4),werrs:window.__errs.slice(0,3),nb,own0,st1,acts,fin:{wr:+C.wr.toFixed(2),art:+C.art.toFixed(2),fama:+C.fama.toFixed(2),pub:C.pub.map(p=>[p.k,p.q,p.how,p.sold]),sub:C.sub.length,obras:C.obras.length,inc:Math.round(C.inc),rej:C.rej,tx:C.tx.length,read:C.libDone.length,money:Math.round(S.money),edu:ED().cur&&Math.round(ED().cur.h),man:C.man},of:of&&of.innerText.replace(/\s+/g,' ').slice(0,400)});
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,600)}},300);
