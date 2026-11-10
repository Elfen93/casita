setTimeout(()=>{try{
 S=newState('facil');S.char={...DEFCHAR};initPeople();newToday();S.money=5000;dirty();computeRooms();
 const sp=pickSpot('compu');const job={key:'buy-compu',name:'Ordenador',emoji:'💻',why:'',kind:'buy',who:'ana',steps:[{k:'obj',v:'compu',i:sp,q:3}],total:1};S.job=job;
 execStep(job,0,false);
 const c=findObjs((d,t)=>t==='compu');
 document.title='OK '+JSON.stringify({errs:__errs,sp,ana:c.map(j=>({chairs:chairsAround(j),seat:seatFor(j)}))});
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,400)}},300);
