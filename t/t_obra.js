setTimeout(()=>{try{const errs=[];console.error=(...a)=>{errs.push(String(a[0]).slice(0,200));};
 S=newState('normal');S.char={...randomChar(),g:'m'};initPeople();applyHome('padres');startTrack('oficina',true);rollWeather();newToday();storyStart();S.autoHome=true;S.money=3000;S.day=10;
 const w=wantFor('huerto','x');const jobs={};let stuck=0;
 for(let k=0;k<480*20;k++){update(3);if(S.job){jobs[S.job.name]=(jobs[S.job.name]||0)+1;}}
 document.title='OK '+JSON.stringify({job:S.job&&{k:S.job.kind,who:S.job.who,steps:S.job.steps.map(s=>[s.k,s.v,s.i,s.done,s._nf])},held:S.held,use:S.sim.use&&S.sim.use.type,errs:errs.slice(0,3),huertoWant:!!w,jobs,noWant:S.noWant,has:findObjs((d,t)=>t==='huerto').length});
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,400)}},300);
