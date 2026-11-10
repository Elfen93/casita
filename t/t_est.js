setTimeout(()=>{try{S=newState('normal');S.char={...randomChar(),g:'m'};initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();S.autoHome=true;S.money=2000;S.r3d='simple';
 const free=[];for(let i=0;i<N*N;i++){const x=i%N,y=i/N|0;if(!S.obj[i]&&inArea(x,y)&&S.floor[i]&&S.wall[i]===0)free.push(i);}S.obj[free[0]]={t:'estant',q:3,c:100,r:0};dirty();uidSweep();computeRooms();
 eduStart('bach_online');LB().man.push('bach_online');LB().own.push('Cien años de soledad');
 openObjMenu(free[0]);const items=[...objMenuEl.querySelectorAll('.oma')].map(b=>b.innerText.replace(/\s+/g,' ')).join(' | ');
 closeObjMenu();const lib=findObjs((d,t)=>t==='libros')[0];let items2='';if(lib!=null){openObjMenu(lib);items2=[...objMenuEl.querySelectorAll('.oma')].map(b=>b.innerText.replace(/\s+/g,' ')).join(' | ');}
 document.title='OK estant: '+items+' || libros: '+items2+' cur='+JSON.stringify(curBook());
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,300)}},300);
