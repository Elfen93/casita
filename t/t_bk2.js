setTimeout(()=>{try{S=newState('normal');S.char={...randomChar(),g:'m'};initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();S.autoHome=true;ex().dmode='ana';S.money=900;S.r3d='simple';
 for(let k=0;k<480*12;k++){update(3);}bpMove('ahorro',hrs(10));
 phOpen&&phOpen();phApp='bank';bkTab='resumen';phRender();setTimeout(()=>{document.title='OK '+window.__errs.length;},400);
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,300)}},300);
