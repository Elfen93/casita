setTimeout(()=>{try{
 S=newState('soul');S.char={...randomChar()};S.ideo='marxista';S.pol.comp=3;startTrack('obra',true);S.story=null;initPeople();rollWeather();newToday();storyStart();
 const log=[];let mo=0,mt=0;const om=maybeOuting;maybeOuting=function(){mo++;const r=om();if(r)mt++;return r;};
 for(let k=0;k<480*200;k++){update(3);const d=dateOf(S.day);if(S.day>120&&(d.wd===1||d.wd===4)&&Math.floor(S.t/60)===19&&S.t%60<3){const s=S.sim;log.push(`d${S.day} avail=${outAvail('militancia')} use=${s.use&&s.use.type} work=${Math.round(s.work)} e=${Math.round(S.needs.energia)} h=${Math.round(S.needs.hambre)} v=${Math.round(S.needs.vejiga)} outDay=${S.outDay} xp=${S.pol.xp} free=${S.free} cmd=${s.cmd} leaving=${s.leaving} path=${s.path.length}`);}}
 document.title='OK '+JSON.stringify({errs:__errs,mo,mt,log:log.slice(0,24)});
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,600)}},300);
