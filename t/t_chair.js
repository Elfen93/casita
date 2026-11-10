setTimeout(()=>{try{
 S=newState('facil');S.char={...DEFCHAR};initPeople();newToday();S.money=5000;dirty();computeRooms();
 const ok=apply(10,8,{kind:'obj',v:'compu',q:3},true);
 const i=idx(10,8);const r1={placed:!!ok,chairs:chairsAround(i),seat:seatFor(i)};
 // Ana compra y monta otro
 S.obj[i]=null;for(const j of findObjs((d,t)=>t==='silla'))S.obj[j]=null;dirty();
 S.want=null;S.job=null;const w=wantBuy('compu','prueba');S.want=w;S.wantDay=S.day;
 for(let k=0;k<4000&&findObjs((d,t)=>t==='compu').length===0;k++)update(3);
 const c=findObjs((d,t)=>t==='compu');
 document.title='OK '+JSON.stringify({errs:__errs,r1,ana:c.map(j=>({chairs:chairsAround(j),seat:seatFor(j)}))});
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,400)}},300);
