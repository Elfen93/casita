setTimeout(()=>{try{
 S=newState('normal');S.char={...DEFCHAR,name:'Lucía',style:'melena',hair:'#a63d1f',glasses:true};initPeople();newToday();storyStart();
 const q=new URLSearchParams(location.hash.slice(1));
 S.t=+(q.get('h')||11)*60;S.day=+(q.get('d')||200);S.weather={k:q.get('w')||'lluvia',t:12};S.snow=q.get('w')==='nieve'?3:0;
 S.obj[idx(4,12)]={t:'huerto',r:0,q:3,c:100,crop:{k:'calabaza',g:1,w:80,wd:0}};
 S.obj[idx(5,12)]={t:'huerto',r:0,q:3,c:100,crop:{k:'zanahoria',g:.5,w:90,wd:.3}};
 S.obj[idx(4,14)]={t:'bancoj',r:1,q:3,c:100};S.obj[idx(12,13)]={t:'arbol',r:0,q:3,c:100};S.obj[idx(9,12)]={t:'flores',r:0,q:3,c:100};
 S.weeds=[idx(12,15),idx(13,14),idx(2,16)];
 S.sim.x=6.5;S.sim.y=13.5;S.sim.use=null;S.sim.path=[];anaRT.front=true;anaRT.right=false;
 thought.txt='Me encanta oír la lluvia.';thought.until=performance.now()+2600;
 cam.z=1.5;centerOnWorld(8,11);dirty();hud();menu.classList.remove('open');
 document.title='OK';
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,500)}},300);
