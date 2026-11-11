setTimeout(()=>{try{S=newState('normal');S.char={...randomChar(),g:'m'};initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();S.money=5000;
 let w=null;for(let i=0;i<N*N&&w==null;i++)if(S.wall[i]===1&&inArea(i%N,i/N|0))w=i;const x=w%N,y=w/N|0;
 mode='build';tool={kind:'paint',v:3};const [px,py]=obCC(x,y);const face=[px,py-WALL_H*cam.z*.6];const c0=screenToCell(...face);
 obTap(...face);
 document.title='OK wall='+x+','+y+' tapFace→'+c0+' wcol='+S.wcol[w]+' painted='+S.wcol.filter(v=>v===3).length+' errs='+window.__errs.length+' '+(window.__errs[0]||'');
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,200)}},1200);
