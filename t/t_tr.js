setTimeout(()=>{try{const errs=[];const oe=console.error;console.error=(...a)=>{errs.push(a.map(x=>x&&x.stack?x.stack.slice(0,200):String(x)).join(' '));};
 const out=[];for(const tr of [['solitaria','dondegentes','multitarea','milideas'],['fiestera','romantica','impulsiva','optimista','nocturna'],['casera','pesimista','tozuda','constante','madrugadora'],['deportista','curiosa','independiente']]){
 S=newState('normal');S.char={...randomChar(),g:'m'};S.traits=tr;S.ideo='marxista';initPeople();startTrack('oficina',true);rollWeather();newToday();storyStart();S.autoHome=true;ex().dmode='ana';
 for(let k=0;k<480*70;k++){update(3);dlgTick();}
 out.push(tr.join('+')+': $'+Math.round(S.money)+' outs='+Object.keys(S.story.chap).length);for(const e of S.story.log)if(/💡|🔀/.test(e.ic))out.push('  '+e.txt.slice(0,110));}
 document.title='OK '+JSON.stringify({errs:errs.slice(0,5).concat(__errs.slice(0,3)),out:out.slice(0,24)});}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,400)}},300);
