// huéspedes: la amiga que se queda a dormir se acuesta (cama libre; si no hay, sofá); la acogida sigue en casa días después; el calentador de alquiler se puede reclamar
setTimeout(()=>{try{window.__errs=window.__errs||[];const bad=[];const info={};
 let seed=11;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const mk=casa=>{S=newState('normal');S.char={...randomChar(),g:'m',name:'Oury'};S.ideo='marxista';initPeople();applyHome(casa);startTrack('oficina',true);rollWeather();newToday();storyStart();S.autoHome=false;ex().dmode='ana';S.sim.work=0;};
 const camas=()=>findObjs((d,t)=>BEDS.includes(t)).length,sofas=()=>findObjs((d,t)=>HU_SOFA.includes(t)||HU_ULT.includes(t)).length+(huCamaAna()>=0&&['cama','camamat'].includes(S.obj[huCamaAna()].t)?1:0);
 const corre=(min)=>{for(let k=0;k<min;k++){S.t+=1;if(S.t>=1440){S.t-=1440;S.day++;}updateResidents(1);}};
 info.casas={};
 for(const casa of ['habitacion','infra','viejo','casita','bueno','chalet']){mk(casa);info.casas[casa]=[camas(),sofas()];
  const f=P_('amiga');if(!f){bad.push('sin amiga');continue;}f.stage=f.stage||'amiga';
  // 1) se queda a dormir: a las 23:30 tiene que acabar durmiendo en algún sitio que no sea la cama de la jugadora
  S.t=21*60;info.casas[casa].push('otros:'+(S.res||[]).length);S.res=[];inviteHome(f,true);const r=S.res.find(x=>x.pid===f.k);if(!r){bad.push(casa+': no entra');continue;}
  corre(60*4);// hasta la 1:00
  const d=r.doing;const sitios=camas()-1+sofas();
  if(sitios>0){if(!d||d.act!=='sleep')bad.push(casa+': no duerme ('+JSON.stringify(d&&d.act)+')');
   else{const o=S.obj[d.i];const mia=S.anaBedUid!=null&&o.uid===S.anaBedUid;if(mia&&(camas()>1||findObjs((d,t)=>HU_SOFA.includes(t)).length))bad.push(casa+': duerme en la cama de la jugadora habiendo otro sitio');info.casas[casa].push(huDonde(f)[0]);
    if(camas()>1&&!BEDS.includes(o.t))bad.push(casa+': hay cama libre y duerme en '+o.t);info.casas[casa].push(o.t);}}
  else info.casas[casa].push('sin sitio');
  // 2) acogida: sigue en casa cinco días después y duerme cada noche
  S.lodger=f.k;corre(60*24*5);const r2=(S.res||[]).find(x=>x.pid===f.k);if(!r2)bad.push(casa+': la acogida se ha ido');
  else{S.t=2*60;corre(30);if(sitios>0&&!(r2.doing&&r2.doing.act==='sleep'))bad.push(casa+': acogida despierta a las 2:30');}
  // 3) encuentra sitio: se va
  S.lodger=null;corre(30);if((S.res||[]).some(x=>x.pid===f.k))bad.push(casa+': no se va al encontrar sitio');
  // 4) «una semana»: a los seis días se va sola
  S.t=12*60;S.lodger=f.k;S.lodgerEnd=S.day+6;corre(60*24*3);if(!(S.res||[]).some(x=>x.pid===f.k))bad.push(casa+': semana, se va antes');corre(60*24*4);if((S.res||[]).some(x=>x.pid===f.k)||S.lodger)bad.push(casa+': semana, no se va');
 }
 // 5) la pareja que se queda sigue yendo a la cama de la jugadora
 {mk('viejo');const p=S.people.find(x=>x.k.startsWith('p'))||S.people.find(x=>x.k!=='madre');if(p&&p.k.startsWith('p')){p.stage='pareja';p.love=80;S.t=21*60;inviteHome(p,true);const r=S.res.find(x=>x.pid===p.k);S.sim.use=null;corre(60*4);info.pareja=r&&r.doing?[r.doing.act,S.obj[r.doing.i].t]:'despierta';if(r&&r.doing&&r.doing.act==='sleep'&&S.anaBedUid!=null&&S.obj[r.doing.i].uid!==S.anaBedUid)bad.push('pareja en otra cama');}else info.pareja='sin candidata';}
 // 6) calentador de alquiler: dilema, burofax, pagar, sindicato
 {mk('viejo');const g=HG();const D=DLG.calentador;g.boiler=1;g.boilerSince=S.day-3;S.money=5000;
  let o=D.o({});if(o.length!==3)bad.push('calentador: opciones sin sindicato '+o.length);o[0].f();if(g.req!==2)bad.push('burofax no cuenta');
  const m0=S.money;o=D.o({});o[1].f();if(g.boiler)bad.push('pagar no arregla');if(S.money>m0)bad.push('pagar da dinero');
  g.boiler=1;g.boilerSince=S.day;S.pol.tenant=true;o=D.o({});if(o.length!==4)bad.push('calentador: falta sindicato');o[2].f();if(!g.fixBy)bad.push('sindicato sin fecha');
  let dias=0;while(g.boiler&&dias<8){S.day++;dailyEvents();dias++;}if(g.boiler)bad.push('sindicato: no se arregla');info.sind=dias;
  S.money=0;g.boiler=1;g.fixBy=0;o=D.o({});if(o[0].ok()||o[1].ok())bad.push('sin dinero y deja pagar');
  info.x=D.x({});info.vida=/hgcal/.test(vidaTab());}
 document.title=(bad.length||__errs.length?'ERR ':'OK ')+JSON.stringify({bad:bad.slice(0,8),nbad:bad.length,errs:__errs.slice(0,3),info});
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,500)}},300);
