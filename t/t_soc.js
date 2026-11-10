setTimeout(()=>{try{
 const q=new URLSearchParams(location.hash.slice(1));const diff=q.get('d')||'soul',ideo=q.get('i')||'marxista',track=q.get('t')||'super';const days=+(q.get('n')||240);
 S=newState(diff);S.char={...randomChar()};S.ideo=ideo;S.pol.comp=3;startTrack(track,true);S.story=null;initPeople();rollWeather();newToday();storyStart();
 const mon=[];
 for(let k=0;k<480*days;k++){update(3);if(k%(480*30)===0){const w=W_();mon.push(`d${S.day} $${Math.round(S.money)} ${TR().e}${S.jobless?'PARO':CAREER[S.career].t} crisis=${Math.round(w.crisis)} mov=${Math.round(w.mov)} gov=${w.gov} inf=${Math.round(S.pol.inf)} xp=${Math.round(S.pol.xp)} org=${S.office?Math.round(S.office.org||0):'-'} griev=${S.office?Math.round(S.office.griev||0):'-'} union=${!!(S.union&&S.union.member)} era=${w.era}`);}}
 const st=S.story;
 document.title='OK '+JSON.stringify({errs:__errs,mon,chap:Object.values(st.chap).map(c=>c.n+'. '+c.title+' (d'+c.d+')'),
  sample:st.log.filter(e=>e.k!=='d').slice(-30).map(e=>'d'+e.d+' '+e.ic+' '+e.txt.replace(/<[^>]+>/g,'').slice(0,170))});
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,600)+JSON.stringify(__errs)}},300);
