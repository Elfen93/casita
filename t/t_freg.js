setTimeout(()=>{try{S=newState('normal');S.char={...randomChar(),g:'m'};initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();S.jobless=true;S.t=13*60;
 const out=[];out.push('obj='+!!OBJ.fregadero+' buy='+MUEB_NEW.includes('fregadero'));
 // poner un fregadero
 let put=null;for(let i=0;i<N*N&&put==null;i++){const x=i%N,y=i/N|0;if(!S.obj[i]&&walkable(x,y)&&inArea(x,y)&&x>1&&y>1){S.obj[i]={t:'fregadero',q:3,c:100,r:0};put=i;}}
 for(const k in S.needs)S.needs[k]=80;S.needs.hambre=20;CM().desp=10;const f=findObjs((d,t)=>t==='fogon')[0];enqueue({k:'obj',i:f});for(let k=0;k<90;k++)update(1);out.push('sucios tras cocinar='+S.sucios);
 enqueue({k:'obj',i:put,act:'fregar'});let lab='';for(let k=0;k<150;k++){update(1);const u=S.sim.use;if(u&&u.act==='fregar')lab=useLabel(u).v;}out.push('tras fregar='+S.sucios+' label='+lab);
 S.sucios=9;S.sim.use=null;enqueue({k:'obj',i:f});let fr=0;for(let k=0;k<40;k++){update(1);if(S.sim.use&&S.sim.use.act==='fregar')fr=1;}out.push('bloquea cocina y friega='+fr+' sucios='+Math.round(S.sucios));
 document.title='OK '+out.join(' ;; ')+' errs='+window.__errs.length+' '+(window.__errs[0]||'');
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,200)}},300);
