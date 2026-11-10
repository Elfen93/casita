setTimeout(()=>{try{
 const [diff,ideo,track]=(location.hash.slice(1)||'soul,marxista,super').split(',');
 S=newState(diff);S.char={...randomChar()};S.traits=['sociable'];S.ideo=ideo;S.pol.comp=2;initPeople();startTrack(track,true);rollWeather();newToday();storyStart();S.autoHome=true;
 ex().dmode='ana';
 const mon=[];
 for(let k=0;k<14400*6;k++){update(3);dlgTick();if(k%(480*20)===0)mon.push(`d${S.day} $${Math.round(S.money)} ${S.jobless?'PARO':CAREER[S.career].t} ${S.ideo}/${comp()} cl=${classOf()} contra=${Math.round(ex().contra)} cq=${ex().cq.length} drift=${JSON.stringify(Object.fromEntries(Object.entries(ex().drift).map(([k,v])=>[k,Math.round(v)])))}`);}
 const st=S.story;
 document.title='OK '+JSON.stringify({errs:__errs,traits:S.traits,lat:latentOf(),mon,chap:Object.values(st.chap).map(c=>c.n+'. '+c.title+' (d'+c.d+')'),people:S.people.map(p=>p.n+':'+Math.round(p.rel)+'/'+Math.round(p.love||0)+' w'+Math.round(p.wear||0)+' '+(p.stage||'')+' hid='+(p.hid||[]).join('+')+' rev='+(p.rev||[]).join('+')),
  mem:ex().mem.map(m=>'d'+m.d+' '+m.t),sample:st.log.filter(e=>e.k!=='d'&&/🧭|😤|⚖️|🥶|🐀|💔|🌧️|😒|🤥|🫶|🗯️|✊|🎩|🪙|🤲|🧺|📈/.test(e.ic+e.txt)).slice(-40).map(e=>'d'+e.d+' '+e.ic+' '+e.txt.replace(/<[^>]+>/g,'').slice(0,220))});
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,600)+JSON.stringify(__errs)}},300);
