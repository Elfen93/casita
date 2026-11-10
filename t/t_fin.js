setTimeout(()=>{try{const errs=[];console.error=(...a)=>{errs.push(String(a[0]).slice(0,200));};
 S=newState('realista');S.char={...randomChar(),g:'m'};initPeople();applyHome('habitacion');startTrack('super',true);rollWeather();newToday();storyStart();S.autoHome=true;
 for(let k=0;k<480*20;k++)update(3);
 showFinal(false);const txt=finalEl.innerText.replace(/\s+/g,' ');
 document.title='OK '+JSON.stringify({errs:errs.slice(0,3),len:txt.length,txt:txt.slice(0,1500)});
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,400)}},300);
