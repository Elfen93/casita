setTimeout(()=>{try{
 S=newState('soul');S.char={...randomChar()};S.traits=[];S.ideo='marxista';S.pol.comp=3;initPeople();startTrack('super',true);rollWeather();newToday();storyStart();S.autoHome=true;
 S.career=2;S.pol.comp=1;joinUnion();ex().dmode='ana';ex().lastCareer=1;
 const pt=newPerson('test',true);pt.ideo='liberal';setStage(pt,'convive');pt.love=70;pt.hid=['trepa','tacana'];
 const mon=[];
 for(let k=0;k<14400*5;k++){update(3);dlgTick();if(k%(480*15)===0)mon.push(`d${S.day} $${Math.round(S.money)} ${S.jobless?'PARO':CAREER[S.career].t} ${S.ideo}/${comp()} cl=${classOf()} contra=${Math.round(ex().contra)} cq=${ex().cq.map(q=>q.k).join(',')} pt=${pt.stage}/${Math.round(pt.love)}/w${Math.round(pt.wear||0)}${pt.wearWhy?'('+pt.wearWhy+')':''} drift=${JSON.stringify(Object.fromEntries(Object.entries(ex().drift).map(([k,v])=>[k,Math.round(v)])))}`);}
 const st=S.story;
 document.title='OK '+JSON.stringify({errs:__errs,traits:S.traits,mon,chap:Object.values(st.chap).map(c=>c.n+'. '+c.title+' (d'+c.d+')'),mem:ex().mem.map(m=>'d'+m.d+' '+m.t),
  sample:st.log.filter(e=>e.k!=='d'&&/🧭|😤|⚖️|🥶|🐀|💔|📉|📦|🛡️|🤫|🕵️|📄|🙅|📣|☕|🪨|🛋️|🧊|📵/.test(e.ic+e.txt)).slice(-40).map(e=>'d'+e.d+' '+e.ic+' '+e.txt.replace(/<[^>]+>/g,'').slice(0,240))});
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,600)+JSON.stringify(__errs)}},300);
