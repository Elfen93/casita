setTimeout(()=>{try{
 S=newState('facil');S.char={...DEFCHAR};initPeople();newToday();S.life={orient:'hombres',rel:'estable',kids:'si',boda:'si'};
 const p=newPerson('el bar',true);p.love=90;p.rel=80;S.people.push(p);setStage(p,'pareja');p.stageDay=S.day-30;moveIn(p);
 S.kids=[];const k={n:'Leo',g:'m',born:S.day-12,ch:{...randomChar(),g:'m'}};S.kids.push(k);
 S.t=19*60;for(let i=0;i<40;i++)update(1);
 menu.classList.remove('open');const [x,y]=simCell();cam.z=1.7;centerOnWorld(x,y);
 let re='';try{render();}catch(e){re=e.message+' '+e.stack.slice(0,900);} document.title='OK '+re;
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,500)}},400);
