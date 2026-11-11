setTimeout(()=>{try{S=newState('normal');S.char={...randomChar(),g:'m'};initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();S.jobless=true;S.t=9*60;if(typeof mode!=='undefined')mode='live';
 S.needs.higiene=10;const d=findObjs((d,t)=>t==='ducha')[0];out=[];if(d==null)out.push('sin ducha');else enqueue({k:'obj',i:d});
 let seen=0;for(let k=0;k<40&&!enDucha();k++){update(1);}seen=enDucha()?1:0;S.speed=0;if(typeof speed!=='undefined')speed=0;menu.classList.remove('open');document.querySelectorAll('.diffov,#diffov,#intro,#welcome').forEach(e=>e.remove());cam.z=3.2;const [sx,sy]=obScr(S.sim.x,S.sim.y);cam.x+=innerWidth/2-sx;cam.y+=innerHeight/2-sy+60;
 document.title='OK enDucha='+seen+' use='+(S.sim.use&&S.sim.use.type)+' errs='+window.__errs.length+' '+(window.__errs[0]||'');
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,200)}},1500);
