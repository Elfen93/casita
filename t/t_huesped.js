// huéspedes: la amiga que se queda a dormir se acuesta (cama libre; si no hay, sofá); la acogida sigue en casa días después; el calentador de alquiler se puede reclamar y el burofax cumple su plazo de diez días
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
 // 6b) el burofax cumple su plazo: fecha, diez días, decisión nueva, aviso al arreglarse, Vida
 {const R0=Math.random;const toasts=[];const _to=toast;toast=a=>{toasts.push(String(a));};
  const sube=(n,v)=>{Math.random=()=>v;for(let i=0;i<n;i++){S.day++;dailyEvents();}Math.random=R0;};
  const qid=()=>ex().dq.map(d=>d.id);
  // (1) al mandar el burofax se guarda la fecha y no se puede mandar otra vez
  mk('viejo');let g=HG();g.boiler=1;g.boilerSince=S.day-3;g.req=0;g.reqDay=0;S.money=5000;ex().dq=[];ex().dlg=null;
  DLG.calentador.o({})[0].f();if(g.reqDay!==S.day)bad.push('burofax: no guarda g.reqDay');if(DLG.calentador.o({})[0].ok())bad.push('burofax: se manda dos veces');
  info.vida0=(vidaTab().match(/burofax enviado hace [^<]*/)||['no sale'])[0];if(!/burofax enviado hace 0 días \(plazo: 10\)/.test(vidaTab()))bad.push('Vida no dice el plazo: '+info.vida0);
  // (3) sin que el casero se mueva (azar al máximo): la decisión nueva sale el día 10, no antes, y no se vuelve a preguntar el burofax
  const d0=g.reqDay;let dia10=-1,pregBur=false;for(let i=1;i<=14&&dia10<0;i++){sube(1,.999);if(qid().includes('calentador'))pregBur=true;if(qid().includes('calentador_plazo'))dia10=S.day-d0;}
  info.plazo=dia10;if(dia10!==10)bad.push('el plazo vence el día '+dia10+' (debía ser 10)');if(pregBur)bad.push('vuelve a preguntar el burofax estando enviado');
  if(!g.boiler)bad.push('plazo: no debía arreglarse solo con el azar al máximo');
  info.vida10=(vidaTab().match(/burofax enviado hace [^<]*/)||['no sale'])[0];if(!/hace 10 días \(plazo: 10\) · plazo vencido/.test(vidaTab()))bad.push('Vida a los 10 días: '+info.vida10);
  // no se repite cada día: pasa una semana antes de insistir
  ex().dq=[];sube(3,.999);if(qid().includes('calentador_plazo'))bad.push('plazo: insiste antes de una semana');
  // opción: arreglarlo y descontarlo: dinero igual, calentador arreglado, aviso, y no hay vuelta atrás
  {const D=DLG.calentador_plazo;const o=D.o({});if(o.length!==2)bad.push('plazo sin sindicato: '+o.length+' opciones');const m0=S.money;toasts.length=0;Math.random=()=>.5;o[0].f();Math.random=R0;
   if(g.boiler)bad.push('plazo: arreglar no arregla');if(S.money!==m0)bad.push('plazo: descontar deja el dinero en '+(S.money-m0));if(!toasts.some(t=>/agua caliente/i.test(t)))bad.push('plazo: sin toast al arreglarse');if(g.reqDay)bad.push('plazo: g.reqDay sin limpiar');if(g.rencor)bad.push('rencor con azar .5');}
  // rencor: con azar bajo (10 %) puede quedar; al renovar el contrato, no renueva (S.noRenew); con sindicato en el bloque, no
  for(const sind of [false,true]){mk('viejo');g=HG();g.boiler=1;g.boilerSince=S.day-14;g.req=2;g.reqDay=S.day-11;S.money=5000;S.noRenew=null;S.rentStrike=false;if(sind)S.rentStrike=true;
   Math.random=()=>.05;DLG.calentador_plazo.o({})[0].f();Math.random=R0;if(!g.rencor)bad.push('rencor: con azar .05 debía quedar');
   S.home.since=S.day-365;sube(0,.9);Math.random=()=>.9;dailyEvents();Math.random=R0;
   if(sind){if(S.noRenew)bad.push('rencor: con sindicato no debía romperse el contrato');if(g.rencor)bad.push('rencor: con sindicato se limpia');}
   else{if(!(S.noRenew>S.day))bad.push('rencor: no renueva (S.noRenew) al renovar: '+S.noRenew);info.noRenew=S.noRenew?S.noRenew-S.day:null;}}
  // sin rencor (azar alto) renueva normal aunque haya habido descuento
  mk('viejo');g=HG();g.boiler=1;g.boilerSince=S.day-14;g.req=2;g.reqDay=S.day-11;S.money=5000;S.noRenew=null;Math.random=()=>.5;DLG.calentador_plazo.o({})[0].f();S.home.since=S.day-365;Math.random=()=>.9;dailyEvents();Math.random=R0;if(S.noRenew)bad.push('sin rencor: no debía romperse el contrato');
  // sindicato de inquilinas desde el plazo
  mk('viejo');g=HG();g.boiler=1;g.boilerSince=S.day-14;g.req=2;g.reqDay=S.day-11;S.money=5000;S.pol.tenant=true;{const o=DLG.calentador_plazo.o({});if(o.length!==3)bad.push('plazo con sindicato: '+o.length);o[1].f();if(!g.fixBy)bad.push('plazo+sindicato: sin fecha de fontanero');
   toasts.length=0;let n=0;Math.random=()=>.999;while(g.boiler&&n<8){S.day++;dailyEvents();n++;}Math.random=R0;if(g.boiler)bad.push('plazo+sindicato: no se arregla');if(!toasts.some(t=>/agua caliente/i.test(t)))bad.push('sindicato: sin toast');info.sindPlazo=n;}
  // seguir esperando: no pasa nada, vuelve a preguntar a la semana
  mk('viejo');g=HG();g.boiler=1;g.boilerSince=S.day-14;g.req=2;g.reqDay=S.day-11;S.money=5000;{const o=DLG.calentador_plazo.o({});const k=o.length-1;o[k].f();if(!g.boiler)bad.push('esperar arregla');}
  // (2) aviso (toast) por cualquier vía: el casero lo arregla solo (azar bajo), el primo de la madre y la propietaria que paga
  mk('viejo');g=HG();g.boiler=1;g.boilerSince=S.day-6;g.req=0;toasts.length=0;Math.random=()=>.0001;S.day++;dailyEvents();Math.random=R0;if(g.boiler)bad.push('azar mínimo: el casero no lo arregla');if(!toasts.some(t=>/agua caliente/i.test(t)))bad.push('casero: sin toast');
  mk('padres');g=HG();g.boiler=1;g.boilerSince=S.day-5;toasts.length=0;S.day++;dailyEvents();if(g.boiler)bad.push('padres: no se arregla a los 3 días');if(!toasts.some(t=>/agua caliente/i.test(t)))bad.push('padres: sin toast');
  mk('viejo');S.owned=true;g=HG();g.boiler=1;g.boilerSince=S.day-5;S.money=5000;toasts.length=0;Math.random=()=>.9;S.day++;dailyEvents();Math.random=R0;if(g.boiler)bad.push('propietaria: no paga');if(!toasts.some(t=>/agua caliente/i.test(t)))bad.push('propietaria: sin toast');
  mk('viejo');g=HG();g.boiler=1;g.boilerSince=S.day-3;S.money=5000;toasts.length=0;DLG.calentador.o({})[1].f();if(!toasts.some(t=>/agua caliente/i.test(t)))bad.push('pagar y descontar: sin toast');
  // partida antigua: burofax enviado sin fecha → el plazo cuenta desde hoy
  mk('viejo');g=HG();g.boiler=1;g.boilerSince=S.day-5;g.req=2;delete g.reqDay;S.day++;Math.random=()=>.999;dailyEvents();Math.random=R0;if(g.reqDay!==S.day)bad.push('partida antigua: reqDay '+g.reqDay);
  toast=_to;}
 document.title=(bad.length||__errs.length?'ERR ':'OK ')+JSON.stringify({bad:bad.slice(0,8),nbad:bad.length,errs:__errs.slice(0,3),info});
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,500)}},300);
