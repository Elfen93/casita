setTimeout(()=>{try{
 S=newState('facil');S.char={...DEFCHAR};S.ideo='ecologista';startTrack('cuidados',true);initPeople();newToday();S.life={orient:'hombres',rel:'estable',kids:'si',boda:'si'};
 const mon=[];
 for(let k=0;k<480*260;k++){update(3);if(k%(480*30)===0){const pt=partner();mon.push(`d${S.day} $${Math.round(S.money)} people=${S.people.length} partner=${pt?pt.n+'/'+pt.stage:'-'} kids=${(S.kids||[]).length} baby=${!!S.baby} res=${(S.res||[]).length}`);}}
 document.title='OK '+JSON.stringify({errs:__errs,mon,chap:Object.values(S.story.chap).map(c=>c.n+'. '+c.title),log:S.story.log.filter(e=>!/^d|📖/.test(e.k)).filter(e=>/💘|❤️|💍|💒|👶|🍼|🏡|💔|🌙|🏠|🥂/.test(e.ic)).slice(-14).map(e=>'d'+e.d+' '+e.ic+' '+e.txt.replace(/<[^>]+>/g,'').slice(0,150))});
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,600)+JSON.stringify(__errs)}},300);
