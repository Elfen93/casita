setTimeout(()=>{try{const errs=[];console.error=(...a)=>{errs.push(String(a[0]).slice(0,300));};
 const out=[];for(const home of ['padres','habitacion','viejo']){S=newState('normal');S.char={...randomChar(),g:'m'};initPeople();applyHome(home);startTrack('oficina',true);rollWeather();newToday();storyStart();S.autoHome=false;S.money=2000;S.t=10*60;
  // romper la nevera común y arreglarla
  const i=findObjs((d,t)=>t==='nevera')[0];S.obj[i].c=10;const m0=S.money;hireFor(i,'fix');for(let k=0;k<480;k++)update(3);
  out.push(home+': paid='+(m0-S.money)+' cond='+Math.round(S.obj[i].c)+' share='+shareOf(i).toFixed(2));}
 document.title='OK '+JSON.stringify({errs:errs.slice(0,3),out});
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,400)}},300);
