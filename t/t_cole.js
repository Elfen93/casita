// elegir colegio (T-113): público o concertado a los 3 y a los 12, admisión por puntos (puede denegarse), recibos mensuales, la salida «recoger» va al centro elegido,
// quién coincide a la puerta, sucesos propios de cada centro, cambio al acabar el curso y partida antigua (sin k.centro)
setTimeout(()=>{try{
 window.__errs=window.__errs||[];const log=[];let fail=0;const ck=(c,m)=>{if(!c){fail++;if(log.length<14)log.push('FALLA '+m);}};
 let seed=21;const rs=n=>{seed=Math.imul(n+7,2654435761)>>>0;Math.random();Math.random();};Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const told=[],toasts=[];{const _t=tell;tell=function(){told.push(String(arguments[0]));return _t.apply(this,arguments);};const _o=toast;toast=function(){toasts.push(String(arguments[0]));return _o.apply(this,arguments);};}
 const fresh=(casa)=>{S=newState('normal');S.char={...randomChar(),g:'f'};S.ideo='marxista';initPeople();applyHome(casa||'viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();S.autoHome=false;S.r3d='simple';S.jobless=true;S.weather={k:'sol',t:20};S.t=7*60;S.money=3000;};
 const fill=()=>{for(const k in S.needs)S.needs[k]=100;};
 const dayFor=(wd,from)=>{let d=from||40;while(dateOf(d).wd!==wd||festivo(d))d++;return d;};
 const diaMes=(dm,m,from)=>{let d=from||60;while(!(dateOf(d).dm===dm&&dateOf(d).m===m))d++;return d;};
 const kid=(a,x)=>({n:'Nora',g:'f',born:S.day-60*a-1,ch:{...randomChar(),g:'f',name:'Nora',beard:'no'},...(x||{})});
 const run=(maxTicks,stop,want)=>{const seen={};for(let k=0;k<maxTicks;k++){if(k%40===0)fill();update(3);const s=S.sim;if(s.outingActive===want){seen.out=want;seen.dest=s.dest;}if(stop()){seen.k=k;break;}}return seen;};
 const eleg=(id,data,i)=>{const D=DLG[id],o=D.o(data);o[i].f();return o;};
 const info={};
 // ---------- 1) a los tres años salta el dilema, y vuelve cada día hasta que se responde ----------
 fresh('habitacion');S.day=diaMes(10,1);S.kids=[kid(3,{})];S.kids[0].born=S.day-180;ex().dq=[];ex().dlg=null;
 dailyEvents();ck(S.kids[0].pend==='cole3','a los 3 años queda pendiente: '+S.kids[0].pend);ck(ex().dq.some(d=>d.id==='cr_cole'),'el dilema cr_cole está en cola');
 ck(DLG.cr_cole.o({i:0,e:'cole3'}).length===2,'dos opciones a los 3');
 // sin elegir sigue lo de siempre (casa de clase baja → público)
 ck(esCentroDe(S.kids[0])==='colegio','sin elegir, el público: '+esCentroDe(S.kids[0]));
 ex().dq=[];S.day++;dailyEvents();ck(ex().dq.some(d=>d.id==='cr_cole'),'si no se responde, vuelve al día siguiente');
 // ---------- 2) elegir pública ----------
 {const k=S.kids[0];ex().dq=[];const c0=told.length;eleg('cr_cole',{i:0,e:'cole3'},0);ck(k.centro==='colegio','pública: k.centro '+k.centro);ck(!k.pend,'pública: sin pendiente');ck(destOf('cole')==='colegio','pública: recoger va a colegio: '+destOf('cole'));
  ck(told.slice(c0).some(t=>/La Ribera/.test(t)),'pública: lo cuenta');info.pub=k.centro;}
 // ---------- 3) concertado: con unas semillas entra y con otras no ----------
 {let ent=0,den=0,tx=[];for(let sd=1;sd<=60;sd++){fresh();S.day=diaMes(10,1);S.kids=[kid(3,{pend:'cole3'})];rs(sd);const c0=told.length;eleg('cr_cole',{i:0,e:'cole3'},1);const k=S.kids[0];
    if(k.centro==='concertado'){ent++;ck(esCentroDe(k)==='concertado','admitida: esCentroDe');ck(destOf('cole')==='concertado','admitida: recoger va al concertado: '+destOf('cole'));ck(/San Roque/.test(told.slice(c0).join(' ')),'admitida: lo cuenta');}
    else{den++;ck(k.centro==='colegio','denegada: se queda en el público: '+k.centro);ck(destOf('cole')==='colegio','denegada: recoger al público');ck(/fuera|no tiene plaza|puntos/.test(told.slice(c0).join(' ')),'denegada: lo cuenta ('+told.slice(c0).join('|').slice(0,80)+')');}
    ck(!k.pend,'concertado: sin pendiente');}
  ck(ent>5&&den>5,'admisión por puntos: entran '+ent+' y no entran '+den+' de 60');info.admision=[ent,den];
  // hermano en el centro: siempre entra (3 puntos de hermanos + cercanía 2 + renta + sorteo)
  let todos=true;for(let sd=1;sd<=30;sd++){fresh();S.day=diaMes(10,1);S.kids=[kid(3,{pend:'cole3'}),kid(6,{n:'Leo',centro:'concertado'})];rs(sd);eleg('cr_cole',{i:0,e:'cole3'},1);if(S.kids[0].centro!=='concertado')todos=false;}
  ck(todos,'con hermano en el centro siempre entra');}
 // ---------- 4) lo que se paga cada mes ----------
 {const delta=(centro,dm,m)=>{fresh();S.day=diaMes(dm,m);S.kids=[kid(6,{centro})];S.money=3000;rs(5);const m0=S.money;dailyEvents();return {d:S.money-m0,k:S.kids[0]};};
  const mes=[1,0];let dc=null,dp=null;
  for(const m of [10,0,3]){const c=delta('concertado',1,m),p=delta('colegio',1,m);
   // otros gastos de la jornada son iguales en las dos: la diferencia es la cuota
   const esp=colCuota(c.k)+colExtra()-colMat();ck(Math.abs((p.d-c.d)-esp)<=1,`mes ${m}: concertado cuesta ${fmt(esp)} más que público (${p.d-c.d})`);dc=c;dp=p;}
  ck(toasts.some(t=>/Cuota del cole/.test(t)),'avisa de la cuota');ck(toasts.some(t=>/Material y salidas/.test(t)),'avisa del material');
  // no en julio ni agosto, ni cualquier otro día
  for(const [dm,m,quien] of [[1,6,'julio'],[1,7,'agosto'],[15,3,'día 15']]){const a=delta('concertado',dm,m),b=delta('colegio',dm,m);ck(Math.abs(a.d-b.d)<=1,'sin recibo en '+quien+' ('+(a.d-b.d)+')');}
  // septiembre: uniforme y cuota, y se apunta lo pagado en el curso
  {const c=delta('concertado',1,8),p=delta('colegio',1,8);ck(p.d-c.d>hrs(14),'septiembre: el concertado cuesta bastante más: '+(p.d-c.d));ck(c.k.pagado>colCuota(c.k),'septiembre: apunta lo pagado '+c.k.pagado);}
  // recibo devuelto: sin dinero, k.debe sube
  fresh();S.day=diaMes(1,3);S.kids=[kid(6,{centro:'concertado'})];S.money=-500;rs(5);dailyEvents();ck(S.kids[0].debe>=1,'sin dinero, recibo devuelto: debe '+S.kids[0].debe);}
 // ---------- 5) «recoger del cole» va al centro correcto y se nota a la puerta ----------
 for(const centro of ['colegio','concertado']){fresh();S.day=dayFor(2);S.t=14*60;fill();S.kids=[kid(6,{centro})];
  ck(outAvail('cole')===null,centro+': cole disponible: '+outAvail('cole'));ck(destOf('cole')===centro,centro+': destino '+destOf('cole'));ck(destOf('tutoria')===centro,centro+': tutoría '+destOf('tutoria'));
  const n0=told.length;doOut('cole');const r=run(260,()=>!S.sim.outingActive&&S.sim.work<=0&&told.length>n0,'cole');ck(r.dest===centro,centro+': la salida llega a '+r.dest);
  try{const sc=buildScene(centro,1,0);ck(sc&&sc.items&&sc.items.length>=1,centro+': escena');}catch(e){ck(false,centro+' escena '+e.message);}}
 // criatura de 13 en concertado: tutoría al concertado; en público, al instituto
 fresh();S.day=dayFor(2);S.t=16.5*60;fill();S.kids=[kid(13,{centro:'concertado'})];ck(destOf('tutoria')==='concertado','13 años concertado: tutoría '+destOf('tutoria'));S.kids=[kid(13,{centro:'colegio'})];ck(destOf('tutoria')==='instituto','13 años público: tutoría '+destOf('tutoria'));
 // familias del censo a la puerta: cada centro, las suyas
 {const V=DATA.personas.vecinos,H=DATA.personas.hogares;const familias={};for(const c of ['colegio','concertado']){fresh();S.kids=[kid(6,{centro:c})];const set=new Set();
   for(let d=40;d<240;d++){S.day=d;const t=colPuerta(c,S.kids[0]);if(t)set.add(t);}
   familias[c]=[...set];ck(set.size>=2,c+': coincide con familias del censo ('+set.size+')');
   const ok=[...set].every(t=>pbVec().some(a=>pbAdult(a)&&t.includes(a.n)&&pbVec().some(v=>v.hogar===a.hogar&&v.centro===c&&v.estudia==='cole')));ck(ok,c+': solo familias de ese centro');}
  ck(familias.colegio.join('|')!==familias.concertado.join('|'),'no son las mismas familias');info.puerta=[familias.colegio[0],familias.concertado[0]];}
 // ---------- 6) sucesos propios de cada centro (y la huelga solo en la pública) ----------
 {const T=DATA.sucesos.centros;const marca=x=>x.tell.split('{')[0].slice(0,22);
  for(const [c,edad] of [['colegio',4],['concertado',4],['instituto',12]]){fresh();const k0=kid(edad,{centro:c==='concertado'?'concertado':c});S.kids=[k0];S.jobless=false;S.money=50000;rs(31);const c0=told.length;const visto=new Set();let huelga=0;
   const d0=diaMes(2,8,40);for(let i=0;i<900;i++){S.day=d0+i;S.kids[0].born=S.day-60*edad-30-Math.floor(i/9);S.kids[0].sick=0;dailyEvents();}
   const txt=told.slice(c0);for(const x of T[c].sucesos)if(txt.some(t=>t.startsWith(marca(x))))visto.add(x.id);huelga=txt.filter(t=>/^Huelga en /.test(t)).length;
   ck(visto.size>=2,c+': sucesos propios vistos '+[...visto]);if(c==='concertado')ck(huelga===0,'el concertado no tiene huelga');else ck(huelga>=1,c+': huelga educativa ('+huelga+')');
   info['suc_'+c]=[...visto].join(',')+' huelga:'+huelga;}}
 // ---------- 7) huelga: la criatura se queda en casa ese día ----------
 fresh();S.day=dayFor(2);S.t=14*60;fill();S.kids=[kid(6,{centro:'colegio'})];S.kids[0].huelga=S.day;ck(outAvail('cole')==='no toca','en huelga no hay a quién recoger: '+outAvail('cole'));
 // ---------- 8) cambio al acabar el curso ----------
 {fresh();S.day=diaMes(24,5);S.kids=[kid(8,{centro:'concertado',debe:1})];ex().dq=[];dailyEvents();ck(S.kids[0].pend==='cambio','24 de junio, con recibos devueltos, queda pendiente: '+S.kids[0].pend);
  ex().dq=[];S.day++;dailyEvents();ck(ex().dq.some(d=>d.id==='cr_cole_cambio'),'se pregunta el cambio');
  const k=S.kids[0];eleg('cr_cole_cambio',{i:0,e:'cambio'},1);ck(k.centro==='colegio'&&!k.pend,'pasa a público: '+k.centro);ck(destOf('cole')==='colegio','tras cambiar, recoger va al público');
  // y de público a concertado, por puntos
  let ent=0,den=0;for(let sd=1;sd<=40;sd++){fresh();S.day=diaMes(24,5);S.kids=[kid(8,{centro:'colegio',pend:'cambio'})];rs(sd);eleg('cr_cole_cambio',{i:0,e:'cambio'},1);if(S.kids[0].centro==='concertado')ent++;else{den++;ck(S.kids[0].centro==='colegio','denegada: sigue donde estaba');}}
  ck(ent>3&&den>3,'cambio a concertado por puntos: '+ent+'/'+den);info.cambio=[ent,den];
  // quien está bien no recibe el dilema
  fresh();S.day=diaMes(24,5);S.kids=[kid(8,{centro:'colegio',hap:80})];S.money=100;dailyEvents();ck(!S.kids[0].pend,'sin motivo no se pregunta');}
 // ---------- 9) a los 12 se vuelve a elegir; partida antigua: sin dilema retroactivo ----------
 {fresh();S.day=diaMes(10,3);S.kids=[kid(11,{centro:'colegio'})];S.kids[0].born=S.day-60*12;ex().dq=[];dailyEvents();ck(S.kids[0].pend==='cole12','a los 12 queda pendiente: '+S.kids[0].pend);
  ck(DLG.cr_cole.o({i:0,e:'cole12'}).length===2,'dos opciones a los 12');ck(/Las Eras/.test(DLG.cr_cole.o({i:0,e:'cole12'})[0].t),'la pública a los 12 es el instituto');
  eleg('cr_cole',{i:0,e:'cole12'},0);ck(S.kids[0].centro==='instituto'&&esCentroDe(S.kids[0])==='instituto','pública a los 12: instituto ('+esCentroDe(S.kids[0])+')');
  // antigua: una criatura de 5 sin k.centro
  fresh('habitacion');S.day=diaMes(10,3);S.kids=[kid(5)];delete S.kids[0].centro;const viejo=JSON.parse(JSON.stringify(S.kids[0]));ex().dq=[];
  ck(esCentroDe(S.kids[0])==='colegio','antigua: sigue en el público');dailyEvents();ck(!S.kids[0].pend&&!ex().dq.some(d=>d.id==='cr_cole'),'antigua: sin dilema retroactivo');ck(!S.kids[0].centro,'antigua: no se le asigna centro');ck(destOf('cole')==='colegio','antigua: recoger al público');
  // y la rica antigua sigue donde estaba (esCentroDe de siempre)
  fresh('chalet');S.kids=[kid(5)];ck(['concertado'].includes(esCentroDe(S.kids[0])),'antigua rica: sigue en el concertado ('+esCentroDe(S.kids[0])+')');
  // guardado y carga con el estado nuevo
  fresh();S.kids=[kid(6,{centro:'concertado',pagado:500,debe:1,sucDay:50,huelga:3})];const J=JSON.parse(JSON.stringify(S));ck(J.kids[0].centro==='concertado'&&J.kids[0].debe===1,'el estado nuevo sobrevive al guardado');}
 // ---------- 10) conciliar: la concertada acoge hasta las cinco y media ----------
 {const sh=(()=>{fresh();S.jobless=false;return TR().sh[1];})();info.sh=sh;
  const asked=(centro)=>{fresh();S.jobless=false;S.day=dayFor(1,60);S.kids=[kid(6,{centro})];S.recoger=null;ex().dq=[];dailyEvents();return ex().dq.some(d=>d.id==='cr_recoger');};
  if(sh>16.5&&sh<=17.5){ck(asked('colegio'),'público: turno hasta las '+sh+' y se pregunta quién recoge');ck(!asked('concertado'),'concertado: con turno hasta las '+sh+' no hace falta');}
  else info.nota='el turno de oficina no cae entre 16.5 y 17.5';}
 // Gente: la ficha dice el centro
 fresh();S.kids=[kid(6,{centro:'concertado'})];ck(/concertado/.test(genteTab()),'Gente dice cole concertado');
 document.title=(fail||window.__errs.length?'ERR ':'OK ')+JSON.stringify({fail,log:log.slice(0,8),errs:window.__errs.slice(0,3),info}).slice(0,900);
}catch(err){document.title='ERR '+err.message+' '+(err.stack||'').slice(0,500)}},300);
