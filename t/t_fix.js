setTimeout(()=>{try{const errs=[];console.error=(...a)=>{errs.push(String(a[0]).slice(0,300));};
 const out=[];for(const home of ['padres','viejo']){S=newState('normal');S.char={...randomChar(),g:'m'};initPeople();applyHome(home);startTrack('oficina',true);rollWeather();newToday();storyStart();S.autoHome=true;S.money=2000;S.t=10*60;S.jobless=true;S.skills.carp=200;S.skills.elec=200;S.skills.font=200;
  const objs=findObjs((d,t)=>['nevera','tele','sofa','ducha','fogon'].includes(t));const res=[];for(const i of objs.slice(0,3)){S.obj[i].c=30;addFixStep(i,true);let k=0;for(;k<400;k++){update(3);if(S.obj[i].c>=60)break;}res.push(S.obj[i].t+(S.obj[i].priv?'(priv)':'')+':'+Math.round(S.obj[i].c)+'@'+k+' job='+(S.job?S.job.name+'/'+S.job.who+'/'+(S.job.paused?'paused':''):'-'));}
  out.push(home+' '+res.join(' | '));}
 document.title='OK '+JSON.stringify({errs:errs.slice(0,3),out});
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,400)}},300);
