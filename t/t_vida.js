setTimeout(()=>{try{
 S=newState('soul');S.char={...DEFCHAR,name:'Carmen',style:'mono',hair:'#3e2a1e'};S.ideo='marxista';S.pol.comp=3;startTrack('super',true);S.story=null;initPeople();rollWeather();newToday();storyStart();
 for(let k=0;k<480*120;k++)update(3);
 const tab=location.hash.slice(1)||'vida';
 if(tab==='cre'){openCreator('soul',false);cre.ideo='libertaria';cre.track='hosteleria';renderCreator('soul',false);card.scrollTop=700;}
 else openMenu(tab);
 document.title='OK';
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,500)}},300);
