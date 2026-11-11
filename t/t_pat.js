setTimeout(()=>{try{S=newState('normal');S.char={...randomChar(),g:'m'};initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();
 S.t=1439;update(1);const t=TM();t.money0=Math.round(S.money)+252;// gastó 252
 let put=0;for(let i=0;i<N*N&&put<3;i++){const x=i%N,y=i/N|0;if(!S.obj[i]&&walkable(x,y)&&inArea(x,y)){S.obj[i]={t:'sofa',q:3,c:100,r:0};put++;}}
 document.title='OK '+patrimonioTxt(t,Math.round(S.money)-t.money0)+' | vida='+vidaTab().match(/.{60}Red.{40}/)+' errs='+window.__errs.length+' '+(window.__errs[0]||'');
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,200)}},300);
