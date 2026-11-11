setTimeout(()=>{try{const out=[];for(const [home,money] of [['viejo',400],['viejo',5000],['casita',400],['casita',40000]]){S=newState('realista');S.char={...randomChar(),g:'m'};initPeople();applyHome(home);startTrack('super',true);rollWeather();newToday();storyStart();S.money=money;S.day=20;
 const c={};for(let k=0;k<60;k++){const w=chooseWant();const n=w?w.name:'(nada)';c[n]=(c[n]||0)+1;}out.push(home+' '+money+'€: '+Object.entries(c).map(([k,v])=>k+'×'+v).join(', '));}
 document.title='OK '+out.join(' ;; ')+' errs='+window.__errs.length+' '+(window.__errs[0]||'');
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,200)}},300);
