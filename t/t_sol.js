setTimeout(()=>{try{const errs=[];console.error=(...a)=>{errs.push(String(a[0]).slice(0,200));};
 S=newState('dificil');S.char={...randomChar(),g:'f'};S.ideo='marxista';initPeople();applyHome('viejo');startTrack('super',true);rollWeather();newToday();storyStart();S.autoHome=true;
 S.union={member:true,since:1};ex().exp.solid=4;for(const p of S.people)p.rel=Math.max(p.rel,50);
 const ev=[];const _t=tell;tell=function(t,ic){if(ic==='🤝'||ic==='⚖️'||ic==='🔑'||ic==='✊')ev.push(t.slice(0,60));return _t.apply(this,arguments);};
 for(let k=0;k<480*60;k++){update(3);if(k===480*10){S.money=-300;}if(k===480*25){S.sick=3;S.needs.hambre=20;}if(k===480*40){S.money=-2000;}}
 document.title='OK '+JSON.stringify({errs:errs.slice(0,3),fav:+SOL().fav.toFixed(1),owed:SOL().owed,ev,mg:S.mg&&S.mg.wk,home:S.home.type});
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,400)}},300);
