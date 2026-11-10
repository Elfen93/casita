setTimeout(()=>{try{S=newState('normal');S.char={...DEFCHAR};initPeople();startTrack('super',true);applyHome('padres');S.money=5000;
 const r={};setMode('buy');r.sellBed=apply(5,6,{kind:'del'});r.sellFridge=apply(5,10,{kind:'del'});r.moveLamp=apply(7,7,{kind:'obj',v:'lampara',q:3});r.buyKitchen=apply(9,11,{kind:'obj',v:'planta',q:3});
 r.toasts=[...document.querySelectorAll('#toasts .toast')].map(t=>t.textContent);document.title='OK '+JSON.stringify(r);}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,300)}},300);
