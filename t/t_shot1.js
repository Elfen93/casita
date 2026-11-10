setTimeout(()=>{try{
 S=newState('normal');S.char={...DEFCHAR};initPeople();rollWeather();newToday();storyStart();
 S.t=10*60;S.day=40;S.weather={k:'sol',t:22};
 S.obj[idx(4,12)]={t:'huerto',r:0,q:3,c:100,crop:{k:'tomate',g:1,w:80,wd:0}};
 S.obj[idx(5,12)]={t:'huerto',r:0,q:3,c:100,crop:{k:'lechuga',g:.6,w:20,wd:.3}};
 S.obj[idx(4,14)]={t:'bancoj',r:0,q:3,c:100};S.obj[idx(6,14)]={t:'barbacoa',r:0,q:3,c:100};S.obj[idx(3,9)]={t:'fuente',r:0,q:3,c:100};
 S.weeds=[idx(12,13),idx(13,14),idx(2,16)];
 S.sim.x=7.5;S.sim.y=13.5;S.sim.use=null;S.sim.path=[];
 thought.txt='Tengo que regar el huerto.';thought.until=performance.now()+1e9;
 cam.z=2.2;centerOnWorld(6,12.5);
 dirty();hud();menu.classList.remove('open');window.__hn=document.getElementById('hname').outerHTML;
 document.title='OK '+window.__hn;
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,500)}},300);
