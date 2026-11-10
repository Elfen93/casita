setTimeout(()=>{try{
 const q=new URLSearchParams(location.hash.slice(1));
 S=newState('soul');S.char={...DEFCHAR};S.ideo='marxista';startTrack('super',true);initPeople();newToday();S.weather={k:'sol',t:20};
 W_().crisis=+(q.get('c')||40);W_().mov=+(q.get('m')||20);
 S.t=+(q.get('h')||7)*60;S.day=8;
 const s=S.sim;s.exit=[0,10];s.outingActive=null;s.work=500;s.awayTotal=510;s.dest=q.get('dest')||'super';s.route=null;
 if(q.get('in'))s.work=200;
 rot=+(q.get('r')||0);cam.z=+(q.get('z')||0.45);centerOnWorld(N/2,N/2);menu.classList.remove('open');dirty();hud();
 document.title='OK';
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,500)}},300);
