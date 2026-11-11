setTimeout(()=>{try{S=newState('normal');S.char={...randomChar(),g:'m'};initPeople();applyHome('casita');startTrack('oficina',true);rollWeather();newToday();storyStart();
 stepCell=()=>{for(let y=2;y<N-2;y++)for(let x=2;x<N-2;x++)if(walkable(x,y))return idx(x,y);};STEP_T.x=600;execStep=(j,i)=>{};const out=[];while(dateOf(S.day).wd!==1){S.t=1439;update(1);}S.t=22*60;S.money=5000;
 S.job={name:'Prueba',emoji:'🧱',steps:[{k:'x',done:false}],who:'builder'};const r=spawnBuilder();out.push('spawn22='+r+' npc='+!!S.npc+' wait='+S.job.waitBuilder);
 let seen=null;for(let k=0;k<14*60;k++){if(S.job)S.job.steps[0].done=false;update(1);if(S.npc&&!seen)seen=(S.t/60).toFixed(2);}out.push('llega a las '+seen+' job='+!!S.job+' wait='+(S.job&&S.job.waitBuilder)+' t='+(S.t/60).toFixed(1)+' hora='+obraHora()+' sb='+_sb0);
 // a las 18 se va
 let left=null;for(let k=0;k<11*60;k++){if(S.job)S.job.steps[0].done=false;update(1);if(S.npc&&S.npc.state==='leaving'&&!left)left=(S.t/60).toFixed(2);}out.push('se va '+left);
 document.title='OK '+out.join(' ;; ')+' errs='+window.__errs.length+' '+(window.__errs[0]||'');
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,200)}},300);
