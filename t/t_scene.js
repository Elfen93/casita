setTimeout(()=>{try{
 const q=new URLSearchParams(location.hash.slice(1));
 S=newState('soul');S.char={...DEFCHAR,style:'melena'};S.ideo='marxista';startTrack(q.get('t')||'super',true);initPeople();newToday();S.weather={k:'sol',t:20};
 W_().crisis=60;W_().mov=55;S.pol.inf=+(q.get('inf')||10);S.union={member:true,since:1};office().org=60;
 S.t=+(q.get('h')||11)*60;const s=S.sim;s.exit=[0,10];const act=q.get('a')||'work';
 if(act!=='work'){s.outingActive=act;if(act==='manifestacion')W_().manif={day:S.day,cause:'por la vivienda',side:['marxista']};}
 s.dest=q.get('d')||destOf(act==='work'?'work':act);s.work=200;s.awayTotal=+(q.get('tot')||400);s.route=null;
 mode='live';menu.classList.remove('open');enterScene();hud();
 document.title='OK';
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,500)}},300);
