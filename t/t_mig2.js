setTimeout(()=>{try{
 for(let k=0;k<2000;k++)update(3);openMenu('historia');
 document.title='OK '+JSON.stringify({errs:__errs,char:S.char,people:(S.people||[]).length,log:S.story.log.map(e=>e.txt.slice(0,90)).slice(0,4)});
}catch(err){document.title='ERR '+err.message+err.stack.slice(0,300)}},300);
