setTimeout(()=>{try{
 S=newState('normal');S.char={...DEFCHAR};S.ideo='socialdemocrata';startTrack('oficina',true);initPeople();newToday();if(typeof ensureIds==='function')ensureIds();
 const mon=[];
 for(let k=0;k<480*200;k++){update(3);if(k%(480*25)===0){const pt=partner();mon.push(`d${S.day} $${Math.round(S.money)} people=${S.people.length} partner=${pt?pt.n+'/'+pt.stage:'-'} kids=${(S.kids||[]).length} baby=${!!S.baby}`);}}
 openMenu('gente');const g=card.innerText.slice(0,600);menu.classList.remove('open');
 document.title='OK '+JSON.stringify({errs:__errs,mon,g,chap:Object.values(S.story.chap).map(c=>c.n+'. '+c.title),life:S.life,log:S.story.log.filter(e=>/💘|❤️|💍|💒|👶|🍼|🏡|💔|📱|👋|🌙|🏠/.test(e.ic)).slice(-15).map(e=>'d'+e.d+' '+e.ic+' '+e.txt.replace(/<[^>]+>/g,'').slice(0,150))});
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,600)+JSON.stringify(__errs)}},300);
