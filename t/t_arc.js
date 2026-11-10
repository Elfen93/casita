setTimeout(()=>{try{
 const [diff,ideo,track]=(location.hash.slice(1)||'normal,apolitica,oficina').split(',');
 S=newState(diff);S.char={...randomChar()};S.traits=['sociable'];S.ideo=ideo;S.pol.comp=2;initPeople();startTrack(track,true);rollWeather();newToday();storyStart();S.autoHome=true;ex().dmode='ana';
 for(let k=0;k<480*62;k++){update(3);dlgTick();}
 const st=S.story;const byDay={};for(const e of st.log){if(e.k==='d')continue;byDay[e.d]=(byDay[e.d]||[]);byDay[e.d].push(e.ic+' '+e.txt.replace(/<[^>]+>/g,'').slice(0,90));}
 const days=[];for(let d=1;d<=60;d++)days.push(d+': '+(byDay[d]||['—']).join(' | '));
 document.title='OK '+JSON.stringify({errs:__errs,money:Math.round(S.money),career:CAREER[S.career].t,chap:Object.values(st.chap).map(c=>c.n+'. '+c.title+' (d'+c.d+')'),days});
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,600)}},300);
