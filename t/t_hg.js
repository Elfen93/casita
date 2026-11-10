setTimeout(()=>{try{const errs=[];console.error=(...a)=>{errs.push(String(a[0]).slice(0,300));};
 S=newState('normal');S.char={...randomChar(),g:'f'};initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();S.autoHome=true;ex().dmode='ana';S.money=3000;
 const ev={};const _t=tell;tell=function(t,ic){if(['🚿','🧊','🧺','🔑','📨','🔊','🏘️'].includes(ic))ev[ic]=(ev[ic]||0)+1;return _t.apply(this,arguments);};
 for(let k=0;k<480*120;k++){update(3);dlgTick();if(S.money<300)S.money=1500;}
 document.title='OK '+JSON.stringify({errs:errs.slice(0,3),ev,hg:HG(),home:S.home.type,chaps:Object.keys(S.story.chap).filter(c=>['casero','norenueva'].includes(c))});
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,400)}},300);
