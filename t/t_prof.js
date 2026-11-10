setTimeout(()=>{try{
 S=newState('facil');S.char={...DEFCHAR};S.ideo='liberal';startTrack('oficina',true);initPeople();rollWeather();newToday();
 const names=['autonomy','planTick','chooseWant','pickSpot','maybeOuting','gardenChore','computeRooms','bestObjFor','pathToObj','bfs','bfsCount','compuFits','mood','thoughtCandidates','outAvail','writeDiary','dailySociety','worldWeekly','withChair','envBonus'];
 const T={};
 for(const n of names){const f=eval(n);T[n]=[0,0];const w=function(...a){const t0=performance.now();const r=f.apply(this,a);T[n][0]+=performance.now()-t0;T[n][1]++;return r;};eval(n+'=w');}
 const t0=performance.now();const marks=[];
 for(let d=0;d<60;d++){const t1=performance.now();for(let k=0;k<480;k++)update(3);marks.push(Math.round(performance.now()-t1));}
 const out=Object.entries(T).map(([k,v])=>k+':'+Math.round(v[0])+'ms/'+v[1]).join(' ');
 document.title='OK '+JSON.stringify({total:Math.round(performance.now()-t0),marks,out,objs:S.obj.filter(Boolean).length,rooms:rooms.length});
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,500)}},300);
