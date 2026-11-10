setTimeout(()=>{try{S=newState('normal');S.char={...randomChar(),g:'f'};initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();S.autoHome=false;S.money=5000;S.jobless=true;S.t=10*60;
 const di=findObjs((d,t)=>t==='ducha')[0];for(const k in S.needs)S.needs[k]=35;
 const log=[];enqueue({k:'obj',i:di,act:'rapida'});log.push('q='+JSON.stringify(S.sim.queue)+' path='+(S.sim.path&&S.sim.path.length)+' target='+S.sim.target+' na='+S.sim.nextAct);
 for(let k=0;k<120;k++){update(2);if(k%10===0)log.push(k+':'+(S.sim.use?S.sim.use.type+'/'+S.sim.use.act:'-')+'/p'+(S.sim.path&&S.sim.path.length)+'/t'+S.sim.target+'/na'+S.sim.nextAct);}
 document.title='OK '+log.join(' ');
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,400)}},300);
