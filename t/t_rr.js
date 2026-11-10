setTimeout(()=>{try{S=newState('normal');S.char={...randomChar(),g:'m'};initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();S.jobless=true;S.t=10*60;LB().own.push('Carpintería de banco');LB().libDone.push('Carpintería de banco');
 openLib('leidos');const b=document.querySelector('[data-reread]');if(!b)throw new Error('no releer');b.onclick();
 const x0=S.skills.carp;const i=findObjs((d,t)=>t==='libros')[0];for(let s=0;s<3;s++){for(const k in S.needs)S.needs[k]=90;S.sim.use=null;S.sim.path=[];S.sim.queue=[];enqueue({k:'obj',i,act:'leer'});for(let k=0;k<90;k++)update(1);}
 document.title='OK reading='+LB().reading+' carp '+x0+' → '+S.skills.carp.toFixed(1)+' prog='+JSON.stringify(LB().lib)+' errs='+window.__errs.length;
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,300)}},300);
