setTimeout(()=>{try{
 const diff=location.hash.slice(1)||'normal';
 S=newState(diff);S.char={...randomChar()};S.traits=['naturaleza'];initPeople();rollWeather();newToday();storyStart();
 const mon=[];
 for(let k=0;k<14400*2;k++){update(3);if(k%(480*30)===0)mon.push(`d${S.day} $${Math.round(S.money)} ${CAREER[S.career].t} huertos=${findObjs((d,t)=>t==='huerto').length} pantry=${S.pantry} weeds=${(S.weeds||[]).length} jard=${lvl('jard')} gs=${gardenScore().stars}`);}
 const st=S.story;
 document.title='OK '+JSON.stringify({errs:__errs,name:S.char.name,g:S.char.g,mon,chap:Object.values(st.chap).map(c=>c.n+'. '+c.title+' (d'+c.d+')'),people:S.people.map(p=>p.n+':'+Math.round(p.rel)),
  sample:st.log.filter(e=>e.k!=='d').slice(-25).map(e=>'d'+e.d+' '+e.ic+' '+e.txt.replace(/<[^>]+>/g,'').slice(0,200)),diary:st.log.filter(e=>e.k==='d').slice(-3).map(e=>e.txt.replace(/<[^>]+>/g,''))});
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,600)+JSON.stringify(__errs)}},300);
