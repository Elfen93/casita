setTimeout(()=>{try{
 S=newState('normal');S.char={...DEFCHAR};initPeople();rollWeather();newToday();
 const log=[];const od=depart;let lastUse='';
 for(let k=0;k<14400*1.5;k++){const h=S.t/60;const s=S.sim;if(h>7.5&&h<9.2&&dayType(S.day)==='work'&&S.lastWorkDay!==S.day&&k%5==0){const u=s.use?s.use.type:'-';const st=`d${S.day} ${h.toFixed(2)} use=${u} path=${s.path.length} leaving=${!!s.leaving} tgt=${s.target} weed=${s.weedJ} e=${Math.round(S.needs.energia)}`;if(st.split(' ').slice(2).join(' ')!==lastUse){log.push(st);lastUse=st.split(' ').slice(2).join(' ');}}update(3);}
 document.title='OK '+JSON.stringify({errs:__errs,log:log.slice(0,60)});
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,500)}},500);
