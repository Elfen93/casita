setTimeout(()=>{try{
 S=newState('facil');S.char={...DEFCHAR};S.ideo='apolitica';startTrack('oficina',true);initPeople();rollWeather();newToday();storyStart();
 window.__d=0;for(let k=0;k<480*120;k++){update(3);window.__d=S.day;}
 document.title='DONE';
}catch(err){document.title='ERR '+err.message}},300);
