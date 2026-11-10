setTimeout(()=>{try{
 const mode=location.hash.slice(1)||'dlg';
 S=newState('soul');S.char={...randomChar(),name:'Ana',g:'f'};S.traits=['sociable'];S.ideo='marxista';S.pol.comp=2;initPeople();startTrack('super',true);rollWeather();newToday();storyStart();
 for(let k=0;k<480*20;k++){update(3);}
 const pt=newPerson('test',true);pt.ideo='liberal';setStage(pt,'convive');pt.love=55;pt.hid=['trepa','generosa'];pt.rev=['trepa'];pt.wear=48;pt.wearWhy='la militancia';
 const f=S.people.find(p=>p.k==='amiga');if(f){f.hid=['conciencia'];f.rev=['conciencia'];}
 latentOf();ex().contra=34;pushI('anarquista',40,'vivienda');remember('Hizo la huelga.');schedule(10,'esquirol',{});
 if(mode==='dlg'){menu.classList.remove('open');ex().dmode='preguntar';S.career=2;askDilemma('despedir',{});}
 else{menu.classList.remove('open');openMenu(mode);}
 setTimeout(()=>{document.title='OK '+JSON.stringify(__errs);},800);
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,600)}},300);
