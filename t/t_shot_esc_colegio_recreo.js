// captura de la escena del centro: colegio a las 11.2
setTimeout(()=>{try{S=newState('normal');S.char={...randomChar(),g:'f'};S.ideo='marxista';initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();S.autoHome=false;S.r3d='simple';
 S.weather={k:'sol',t:20};S.day=40;while(dateOf(S.day).wd!==2||festivo(S.day))S.day++;S.t=11.2*60;S.jobless=true;
 S.kids=[{n:'Nora',g:'f',born:S.day-60*7,ch:{...randomChar(),g:'f',name:'Nora',beard:'no'}}];
 const s=S.sim;s.work=60;s.awayTotal=120;s.dest='colegio';s.outingActive='clase';s.escKid=0;s.exit=[9,19];enterScene();menu.classList.remove('open');
 setTimeout(()=>{document.title='OK '+sceneKey+' '+window.__errs.length+' '+(window.__errs[0]||'');},900);
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,300)}},300);
