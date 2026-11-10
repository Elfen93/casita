setTimeout(()=>{try{
 S=newState('normal');S.char={...DEFCHAR};S.day=300;S.weather={k:'nieve',t:0};S.snow=3;
 let n=0;const oc=circ;circ=(...a)=>{n++;return oc(...a);};
 drawObj(5,5,{t:'flores',r:0,q:3,c:100},idx(9,12),false,9,12);
 circ=oc;
 document.title='OK circ='+n+' season='+seasonOf();
}catch(err){document.title='ERR '+err.message+err.stack}},300);
