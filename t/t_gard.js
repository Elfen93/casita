setTimeout(()=>{try{
 S=newState('normal');S.char={...DEFCHAR};initPeople();rollWeather();newToday();S.day=100;
 for(const [x,y] of [[3,13],[4,13],[5,13]])S.obj[idx(x,y)]={t:'huerto',r:0,q:3,c:100,crop:{k:'tomate',g:0,w:100,wd:0}};
 dirty();computeRooms();
 const og=gardenChore;let calls=0,ok=0;const why={};
 gardenChore=function(){calls++;const r=og();if(r)ok++;return r;};
 const oa=autonomy;let au=0;autonomy=function(){au++;return oa();};
 const log=[];
 for(let k=0;k<480*12;k++){update(3);if(k%480===0)log.push('d'+S.day+' '+findObjs((d,t)=>t==='huerto').map(i=>{const c=S.obj[i].crop;return c?Math.round(c.g*100)+'/'+Math.round(c.w)+(c.dead?'X':''):'-'}).join(' ')+' calls='+calls+' ok='+ok+' au='+au+' used='+JSON.stringify(S.today.used));}
 document.title='OK '+JSON.stringify({errs:__errs,log});
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,600)}},300);
