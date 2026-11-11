setTimeout(()=>{try{S=newState('normal');S.char={...randomChar(),g:'m'};initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();S.money=5000;
 const out=[];let cell=null;for(let i=0;i<N*N&&!cell;i++){const x=i%N,y=i/N|0;if(!S.obj[i]&&walkable(x,y)&&inArea(x,y))cell=[x,y];}
 for(const t of ['encimera','fregadero']){const tl={kind:'obj',type:t,t,v:t,obj:t,q:3};let r,err='';try{beginStroke();r=apply(cell[0],cell[1],tl);endStroke();}catch(e){err=e.message+' '+e.stack.slice(0,200);}out.push(t+': can='+canApply(cell[0],cell[1],tl)+' apply='+r+' obj='+(S.obj[idx(...cell)]&&S.obj[idx(...cell)].t)+' '+err);if(S.obj[idx(...cell)])S.obj[idx(...cell)]=null;}
 // dibujo
 try{for(const t of Object.keys(MDRAW)){S.obj[idx(...cell)]={t,q:3,c:100,r:0};try{render(0);}catch(e){out.push('MDRAW '+t+' ERR '+e.message);}}out.push('render loop done');}catch(e){out.push('render ERR '+e.message+' '+e.stack.slice(0,300));}
 document.title='OK '+out.join(' ;; ')+' errs='+window.__errs.length+' '+(window.__errs[0]||'');
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,300)}},1200);
