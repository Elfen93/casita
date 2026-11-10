setTimeout(()=>{try{
 S=newState('soul');S.char={...DEFCHAR};S.ideo='marxista';startTrack('super',true);initPeople();newToday();
 for(let k=0;k<480*20;k++)update(3);
 const out={};for(const k in PLACES){openPlace(k);out[k]=card.innerText.split('\n').slice(0,3).join(' | ');}
 barrioTap(-8,3);out.tap=card.innerText.slice(0,60);liveTap(-30,-30);
 document.title='OK '+JSON.stringify({errs:__errs,out});
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,500)+JSON.stringify(__errs)}},300);
