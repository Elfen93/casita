setTimeout(()=>{try{
 const out=[];
 for(const [ideo,track] of [['marxista','super'],['liberal','oficina'],['anarquista','hosteleria'],['conservadora','cuidados'],['libertaria','reparto'],['socialdemocrata','funcion'],['ecologista','obra']]){
  S=newState('soul');S.char={...randomChar(),name:'Pablo',g:'m'};S.traits=['sociable','genio'];S.ideo=ideo;S.pol.comp=3;initPeople();startTrack(track,true);rollWeather();newToday();storyStart();S.autoHome=true;ex().dmode='ana';
  for(let k=0;k<480*130;k++){update(3);dlgTick();}
  for(const e of S.story.log)out.push(e.txt.replace(/<[^>]+>/g,''));
  for(const c of Object.values(S.story.chap))out.push(c.title);
 }
 document.title='OK '+JSON.stringify({lines:out});
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,600)}},300);
