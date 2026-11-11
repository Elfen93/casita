setTimeout(()=>{try{S=newState('normal');S.char={...randomChar(),g:'m'};initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();if(typeof mode!=='undefined')mode='live';
 S.t=8*60;S.strike={on:true,join:true,start:S.day-1,total:2,by:'ana',left:1};strikeBar();
 document.title='OK '+document.querySelector('#strikebar').innerText+' errs='+window.__errs.length;
}catch(err){document.title='ERR '+err.message}},1500);
