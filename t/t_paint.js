setTimeout(()=>{try{S=newState('normal');S.char={...randomChar(),g:'m'};initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();S.money=5000;
 const out=[];let w=null;for(let i=0;i<N*N&&w==null;i++)if(S.wall[i]===1&&inArea(i%N,i/N|0))w=i;const x=w%N,y=w/N|0;
 const tl={kind:'paint',v:3};out.push('can='+canApply(x,y,tl)+' cost='+costOf(x,y,tl));
 mode='build';tool=tl;const m0=S.money;beginStroke&&beginStroke();const r=apply(x,y,tl);endStroke&&endStroke();out.push('apply='+r+' wcol='+S.wcol[w]+' money '+m0+'→'+S.money);
 // via obra
 S.wcol[w]=0;let w2=null;for(let i=w+1;i<N*N&&w2==null;i++)if(S.wall[i]===1&&inArea(i%N,i/N|0))w2=i;
 try{obStart(w2%N,w2/N|0);obEnd&&obEnd();}catch(e){out.push('ob ERR '+e.message);}out.push('ob wcol='+S.wcol[w2]+' locked='+(typeof obLocked==='function'&&obLocked()));
 document.title='OK '+out.join(' ;; ')+' errs='+window.__errs.length+' '+(window.__errs[0]||'');
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,200)}},300);
