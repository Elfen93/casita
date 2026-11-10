setTimeout(()=>{try{const errs=[];console.error=(...a)=>{errs.push(String(a[0]).slice(0,300));};
 S=newState('normal');S.char={...randomChar(),g:'m'};initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();S.autoHome=false;S.money=1000;HP().gymMember=true;S.union={member:true,since:1};
 // ir a trabajar
 for(let k=0;k<480*2;k++){update(3);if(S.sim.work>0&&!S.sim.outingActive&&S.t/60>=12)break;}
 const log=[];log.push('work='+S.sim.work+' rep='+S.rep+' $'+S.money+' h='+(S.t/60).toFixed(1)+' av='+outAvail('gimnasio'));
 doOut('gimnasio');log.push('after gym: oa='+S.sim.outingActive+' work='+S.sim.work+' rep='+S.rep+' $'+S.money+' dest='+S.sim.dest);
 for(let k=0;k<20;k++)update(1);
 doOut('sindicato');log.push('after sind: oa='+S.sim.outingActive+' work='+S.sim.work+' dest='+S.sim.dest+' gym='+HP().gym);
 for(let k=0;k<30;k++)update(1);
 const ok=leaveNow();S.sim.work=1;S.sim.awayTotal=1;S.sim.outingActive=S.sim.outingActive||'_vuelta';for(let k=0;k<5;k++)update(1);log.push('leave='+ok+' oa='+S.sim.outingActive+' work='+S.sim.work+' x='+S.sim.x.toFixed(1)+' errs='+errs.length);
 document.title='OK '+JSON.stringify({errs:errs.slice(0,3),log});
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,400)}},300);
