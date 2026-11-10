setTimeout(()=>{try{
 S=newState('normal');S.char={...DEFCHAR,name:'Hugo',g:'m',style:'corto',beard:'corta',hair:'#1d1714',skin:'#c68a5c',shirt:'#3a86ff'};initPeople();newToday();S.weather={k:'sol',t:22};
 S.obj[idx(9,8)]={t:'sofa',r:2,q:3,c:100};S.obj[idx(9,7)]={t:'tele',r:0,q:3,c:100};
 S.sim.x=9.5;S.sim.y=8.5;S.sim.use={type:'sofa',i:idx(9,8),t:5,goal:'diversion'};S.t=15*60;
 cam.z=2.4;centerOnWorld(8.5,8.5);dirty();menu.classList.remove('open');
 document.title='OK';
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,500)}},300);
