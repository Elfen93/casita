setTimeout(()=>{try{S=newState('normal');S.char={...DEFCHAR};initPeople();startTrack('super',true);applyHome('padres');rollWeather();newToday();storyStart();S.autoHome=true;S.t=17*60;
 const tr=[];for(let k=0;k<480*1;k++){update(1);if(k%40===0){const r=(S.res||[]).find(q=>q.pid==='madre');tr.push(r?`${r.x.toFixed(1)},${r.y.toFixed(1)} p${(r.path||[]).length} n${(r.next||0).toFixed(1)}`:'none');}}
 const r=(S.res||[]).find(q=>q.pid==='madre');
 document.title='OK '+JSON.stringify({tr,ana:simCell(),walk:r?walkable(Math.floor(r.x),Math.floor(r.y)):null,room:r?roomId[idx(Math.floor(r.x),Math.floor(r.y))]:null,errs:__errs.slice(0,3)});}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,300)}},300);
