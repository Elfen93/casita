setTimeout(()=>{try{const errs=[];const oe=console.error;console.error=(...a)=>{errs.push(a.map(x=>x&&x.stack?x.stack.slice(0,200):String(x)).join(' '));};
 const out=[];for(const [tr,ideo,track] of [[['solitaria','dondegentes','multitarea','milideas'],'anarquista','super'],[['trabajadora','ahorradora','constante'],'liberal','oficina'],[['romantica','fiestera','cocinillas'],'apolitica','hosteleria'],[['deportista','curiosa','artista'],'ecologista','cuidados']]){
 S=newState('normal');S.char={...randomChar(),g:'f'};S.traits=tr;S.ideo=ideo;S.pol.comp=2;initPeople();startTrack(track,true);rollWeather();newToday();storyStart();S.autoHome=true;ex().dmode='ana';
 aspFill();out.push(tr.join('+')+'/'+ideo+': '+S.asp.active.map(id=>ASP.find(a=>a.id===id).t()).join(' | '));
 for(let k=0;k<480*90;k++){update(3);dlgTick();if(k%480===0)aspCheck();}
 out.push('   d90 done='+Object.keys(S.asp.done).join(',')+' · now: '+S.asp.active.join(','));}
 document.title='OK '+JSON.stringify({errs:errs.slice(0,5).concat(__errs.slice(0,3)),out});}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,400)}},300);
