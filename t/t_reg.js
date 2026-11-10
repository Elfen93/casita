setTimeout(()=>{try{
 const out=[];const errs=[];const oe=console.error;console.error=(...a)=>{errs.push(a.map(x=>x&&x.stack?x.stack.slice(0,200):String(x)).join(' '));};
 const cfg=[['marxista','super','f','soul'],['liberal','tech','m','normal'],['anarquista','coop','x','realista'],['conservadora','negocio','f','dificil'],['libertaria','arte','m','soul'],['socialdemocrata','funcion','f','facil'],['ecologista','obra','m','realista'],['apolitica','hosteleria','f','normal']];
 for(const [ideo,track,g,diff] of cfg){
  S=newState(diff);S.char={...randomChar(),g};if(g==='f')S.char.beard='no';S.traits=['sociable'];S.ideo=ideo;S.pol.comp=2;initPeople();startTrack(track,true);rollWeather();newToday();storyStart();S.autoHome=true;ex().dmode='ana';
  for(let k=0;k<480*125;k++){update(3);dlgTick();}
  out.push(`${diff}/${ideo}/${track}/${g}: $${Math.round(S.money)} ${S.jobless?'PARO':CAREER[S.career].t} chap=${Object.keys(S.story.chap).length} tmp=${S.tmp.n} traits=${S.traits.join(',')} ideo=${S.ideo}`);
  for(const e of S.story.log)if(/🧭/.test(e.ic))out.push('   '+e.txt.replace(/<[^>]+>/g,'').slice(0,120));
 }
 document.title='OK '+JSON.stringify({errs:errs.slice(0,8),werrs:__errs.slice(0,5),out});
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,600)}},300);
