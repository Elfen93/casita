// tratar con los vecinos: acciones por puesto y lugar, favores con memoria, cotilleo, política y bloque, romance con adultos,
// menores sin ninguna vía romántica, vecinos que te buscan y partida antigua sin estado nuevo
let _sd=23;const _rnd=()=>{_sd=(Math.imul(_sd,1664525)+1013904223)>>>0;return _sd/4294967296;};Math.random=_rnd;
setTimeout(()=>{try{window.__errs=window.__errs||[];const fails=[];const chk=(c,m)=>{if(!c)fails.push(m);};const info={};
 const oe=console.error;const errs=[];console.error=(...a)=>{errs.push(a.map(x=>x&&x.stack?x.stack.slice(0,200):String(x)).join(' '));};
 const R0=Math.random,fix=(x,f)=>{Math.random=()=>x;try{return f();}finally{Math.random=R0;}}; // un azar fijo para la tirada que se mide
 const toasts=[];const _toast=toast;toast=(m,g)=>{toasts.push(String(m));};
 const V=DATA.personas.vecinos,vid=id=>V.find(v=>v.id===id);
 const base=()=>{S=newState('normal');S.char={...randomChar(),g:'f',age:30};S.ideo='socialdemocrata';S.life={orient:'hombres',rel:'estable',kids:'quiza',boda:'igual'};initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();S.autoHome=false;S.weather={k:'sol',t:20};S.needs.energia=80;S.needs.hambre=70;S.needs.higiene=80;S.money=2000;toasts.length=0;};
 const dia=(wd,h)=>{let d=S.day;while(dateOf(d).wd!==wd||festivo(d))d++;S.day=d;S.t=h*60;};
 const lugar=(k,h,wd)=>{dia(wd,h);const s=S.sim;s.exit=[0,10];s.work=200;s.awayTotal=400;s.route=null;s.outingActive=(PLACES[k]&&PLACES[k].outs||[])[0]||null;s.dest=k;mode='live';menu.classList.remove('open');enterScene();};
 const sal=()=>{const s=S.sim;s.work=0;s.dest=null;s.outingActive=null;leaveScene();};
 const conoce=(id,rel)=>{const v=vid(id);let p=vcPer(id)||vcConocer(v);p.rel=rel;return p;};
 const hoy=()=>{try{if(sfxEl)sfxEl.classList.remove('on');}catch(e){}};
 base();
 // ===== 1. por oficio y por lugar =====
 {const v=vid('paca'),p=conoce('paca',45);lugar('super',10,1);
  const a=trAcciones(v,p);chk(a.acc.some(x=>x.id==='turnos'&&x.origen==='oficio'),'cajera en su puesto: turnos');
  const f=vcFicha(v);chk(/data-tr="a:oficio:turnos"/.test(f),'ficha: opción de oficio');const n=(f.match(/data-tr="/g)||[]).length;chk(n>=2&&n<=4+2,'ficha: pocas opciones ('+n+')');
  const r0=p.rel,s0=S.needs.social,nb=S.netBoost||0;trClick(v,'a:oficio:turnos');hoy();
  chk(p.rel>r0&&S.needs.social>s0&&S.netBoost>S.day&&S.netBoost>nb,'turnos: relación, compañía y pista de curro');info.turnos=[r0,p.rel|0].join('→');
  chk(!trAcciones(v,p).acc.some(x=>x.id==='turnos'),'una vez al día');
  // la misma persona fuera de su puesto: opción del lugar
  lugar('bar',20,4);const a2=trAcciones(v,p);chk(a2.acc.some(x=>x.id==='cana'&&x.origen==='lugar'),'en el bar: opción del lugar');
  const m0=S.money,r1=p.rel;trClick(v,'a:lugar:cana');hoy();chk(S.money<m0&&p.rel>r1,'caña: cuesta (bkAdd) y sube la relación');info.cana=fmt(m0-S.money);
  // camarera: que te fíe, y se debe
  const cam=V.find(x=>x.trabajo&&x.trabajo.puesto[0]==='camarera'&&x.trabajo.lugar==='bar');const pc=conoce(cam.id,50);dia(cam.trabajo.dias[0],(cam.trabajo.h[0]+cam.trabajo.h[1])/2);
  chk(trAcciones(cam,pc).acc.some(x=>x.id==='fiar')&&trAcciones(cam,pc).acc.some(x=>x.id==='quien'),'camarera: fiar y quién ha pasado');
  const h0=S.needs.diversion;fix(.01,()=>trClick(cam,'a:oficio:fiar'));hoy();chk(TT().deudas.some(d=>d.vid===cam.id&&d.dir==='le'),'fiar crea deuda');chk(S.needs.diversion>h0||S.needs.diversion>=100,'fiar sube el ánimo');
  chk(/Le debes/.test(vcFicha(cam)),'ficha: le debes');
  // la enfermera no hace de médica fuera de consulta
  const en=V.find(x=>x.trabajo&&x.trabajo.puesto[0]==='enfermera');const pe=conoce(en.id,60);lugar(en.trabajo.lugar,(en.trabajo.h[0]+en.trabajo.h[1])/2,en.trabajo.dias[0]);
  const ae=trAcciones(en,pe);chk(!ae.acc.length&&/médica|cita|secreto/i.test(ae.nota),'enfermera: nada fuera de consulta: '+ae.nota);chk(/trnota/.test(vcFicha(en)),'ficha: nota de consulta');
  // maestra: por tus hijos solo si los tienes
  const ma=V.find(x=>x.trabajo&&x.trabajo.puesto[0]==='maestra'&&x.trabajo.lugar==='colegio');const pm=conoce(ma.id,50);lugar('colegio',11,1);
  chk(!trAcciones(ma,pm).acc.some(x=>x.id==='hijos'),'maestra: sin hijos, nada');S.kids=[{n:'Lía',g:'f',born:S.day-60*6,hap:50}];
  chk(trAcciones(ma,pm).acc.some(x=>x.id==='hijos'),'maestra: con hijos, por tus hijos');const hp=S.kids[0].hap;trClick(ma,'a:oficio:hijos');hoy();chk(S.kids[0].hap>hp,'hijos más contentos');S.kids=[];sal();}
 // ===== 2. favores: pedir (con memoria) =====
 base();
 {const v=vid('paca'),p=conoce('paca',60);const cr=Object.keys(CROPS)[0];S.obj[5]={t:'huerto',r:0,q:3,c:100,crop:{k:cr,g:.1,w:10,wd:0,dry:0}};
  chk(trFavElegible('regar',v,p),'regar: hay huerto');fix(.01,()=>trPedir(v,p,'regar'));hoy();
  chk(S.obj[5].crop.w===100,'regar: riega el huerto de verdad');chk(trFav(v.id).le===1,'le debes una');chk(/Le debes una/.test(vcFicha(v)),'ficha: «Le debes una»');chk(/Último favor/.test(vcFicha(v)),'ficha: último favor');
  // te lo cobras: si ella te debe una, no cuesta
  trFav(v.id).te=1;trFav(v.id).le=0;TT().cd[v.id+'|pedir']=0;S.netBoost=0;fix(.9,()=>trPedir(v,p,'avisar'));hoy();
  chk(S.netBoost>S.day&&trFav(v.id).te===0&&trFav(v.id).le===0,'si te debe una, te la cobras aunque la tirada sea mala');chk(TT().cd[v.id+'|pedir']===S.day,'un favor por día');
  // dinero: te deja, y se devuelve
  S.money=hrs(10);TT().cd[v.id+'|pedir']=0;chk(trFavElegible('dejar',v,p),'dejar: vas justa');const m0=S.money;fix(.01,()=>trPedir(v,p,'dejar'));hoy();
  chk(S.money===m0+hrs(2.5),'te deja '+hrs(2.5));const di=TT().deudas.findIndex(d=>d.vid===v.id&&d.dir==='le'&&d.amt===hrs(2.5));chk(di>=0,'deuda anotada');
  chk(/Le debes/.test(vcFicha(v))&&/data-tr="pagar:/.test(vcFicha(v)),'ficha: devolver');const r1=p.rel;trPagar(v,p,di);hoy();chk(S.money===m0&&p.rel>r1,'devuelto: dinero y relación');
  chk(!TT().deudas.some(d=>d.vid===v.id&&d.amt===hrs(2.5)),'deuda saldada');
  // que te avise de un curro: pista
  TT().cd[v.id+'|pedir']=0;S.netBoost=0;fix(.01,()=>trPedir(v,p,'avisar'));hoy();chk(S.netBoost>S.day,'avisar: pista de curro');}
 // ===== 3. favores: que te pidan (móvil y en persona) y cumplir o fallar =====
 base();
 {const v=vid('nuria'),p=conoce('nuria',60);S.needs.energia=90;const kid=trCria(v);chk(kid&&kid.edad<12,'Nuria tiene una cría');
  // por el móvil
  trPide(v,p,'cuidar','msg');const th=PH().th[p.k];chk(th&&th.length&&th[th.length-1].open&&/tr:ok/.test(JSON.stringify(th[th.length-1].k)),'mensaje con respuestas');
  chk(/Alba/.test(th[th.length-1].t),'el mensaje lleva el nombre de la cría');chk(/Te pide/.test(vcFicha(v)),'ficha: petición pendiente');
  // aceptar: se va a su casa de verdad
  S.t=17*60;dia(dateOf(S.day).wd,17);const rel0=p.rel,en0=S.needs.energia;S.sim.work=0;
  phAnswer(p.k,th.length-1,0);chk(TT().comp.length===1&&TT().run&&S.sim.outing==='visita'&&S.outWith===p.k,'aceptar: sale a su casa');
  chk(/Le has prometido|prometido/.test(vcFicha(v))||TT().comp.length===0,'ficha: prometido mientras va');
  S.sim.outing=null;S.sim.leaving=false;S.sim.path=[];S.sim.work=0;S.sim.dest=null;S.sim.outingActive=null;leaveScene();outBack('visita');hoy();
  chk(trFav(v.id).te===1,'te debe una (cumplido)');chk(p.rel>rel0+6,'relación sube al cumplir ('+(p.rel-rel0).toFixed(1)+')');chk(S.needs.energia<en0,'cuesta energía');
  chk(/Te debe una/.test(vcFicha(v))&&/cuidaste/.test(vcFicha(v)),'ficha: «Te debe una» y qué hiciste');info.cumple=(p.rel-rel0).toFixed(1);chk(TT().comp.length===0&&!TT().run,'compromiso cerrado');
  // la red colectiva lo recuerda
  chk(SOL().fav>0||SOL().log.length>0,'colectivo: solAdd');
  // fallar: prometes y no vas
  const v2=vid('yolanda'),p2=conoce('yolanda',60);const r2=trPide(v2,p2,'mudanza','enc');chk(r2&&TT().req.length===1,'petición en persona');
  vcOpen(v2);chk(vcEl.querySelector('[data-tr="req:ok"]'),'ficha abierta con los botones');vcClose();
  TT().req=[];TT().comp.push({id:'mudanza',vid:v2.id,dl:S.day-1,vars:{v:v2.n}});const rf=p2.rel;trDia();hoy();
  chk(p2.rel<rf-5,'fallar baja la relación ('+(p2.rel-rf).toFixed(1)+')');chk(TT().comp.length===0,'compromiso vencido');
  const t2=PH().th[p2.k];chk(t2&&/apañado/.test(t2[t2.length-1].t),'mensaje de reproche');chk(trFav(v2.id).hist.some(h=>/no fuiste/.test(h[1])),'memoria del fallo');
  // rechazar
  const r3=trPide(v2,p2,'firmar','enc');const rr3=p2.rel;trRechazar(v2,p2,r3);hoy();chk(p2.rel<rr3&&!TT().req.length,'rechazar: baja un poco y se cierra');
  // firmar: firma y movimiento
  const v3=vid('paca'),p3=conoce('paca',50);const mv=W_().mov,sl=SOL().fav;trPide(v3,p3,'firmar','msg');const th3=PH().th[p3.k];phAnswer(p3.k,th3.length-1,0);hoy();
  chk(W_().mov>mv&&SOL().fav>sl,'firmar: movimiento y red de favores');
  // prestar: te piden, prestas, te lo devuelven
  const v4=vid('olga'),p4=conoce('olga',55);S.money=1500;const m4=S.money;trPide(v4,p4,'prestar','msg');const th4=PH().th[p4.k];phAnswer(p4.k,th4.length-1,0);hoy();
  chk(S.money===m4-hrs(2.5),'prestar: sale el dinero');chk(/Te debe/.test(vcFicha(v4)),'ficha: te debe');
  S.day+=8;fix(.01,()=>trDeudasDia());hoy();chk(S.money===m4,'te lo devuelve');chk(!TT().deudas.some(d=>d.vid===v4.id),'deuda cerrada');
  // le debes y no pagas a tiempo: relación
  base();const v5=vid('paca'),p5=conoce('paca',50);TT().deudas.push({vid:'paca',amt:hrs(2),dl:S.day,dir:'le',why:''});trDeudasDia();const tt=PH().th[p5.k];chk(tt&&/lo mío/.test(tt[tt.length-1].t)&&tt[tt.length-1].open,'recordatorio de deuda');
  S.day+=8;const r5=p5.rel;trDeudasDia();chk(p5.rel<r5,'deuda tarde: baja la relación');}
 // ===== 4. cotilleo con contenido real =====
 base();
 {const v=vid('paca'),p=conoce('paca',50);let vistos={h:0,l:0},conoceX=0;
  for(let i=0;i<40&&(!vistos.h||!vistos.l);i++){const r=trChisme(v);if(!r)break;vistos[r.k]++;const x=r.x,px=vcPer(x.id);
   chk(!px||px.rel<VC_LAZOS,'el chisme es de alguien que conoces poco');const s=TT().sabe[x.id];chk(s&&(s.h.length||s.l.length),'queda descubierto');
   const f=vcFicha(x);if(r.k==='h')chk(f.includes(vcEsc(trFrases(x.historia)[s.h[s.h.length-1]])),'ficha de '+x.id+': su historia revelada');
   else chk(/vfh2 trlz/.test(f),'ficha de '+x.id+': su lazo revelado');conoceX++;}
  chk(vistos.h>0&&vistos.l>0,'hay chismes de historia y de lazo');info.chismes=vistos.h+'h+'+vistos.l+'l';
  const x0=V.find(q=>q.edad>=18&&!vcPer(q.id)&&!TT().sabe[q.id]);const f0=vcFicha(x0);chk(!/Lo que se dice/.test(f0),'sin chisme no hay sección');
  // por la ficha y con el cooldown
  base();const p6=conoce('paca',50);TT().cd={};hoy();trClick(v,'chisme');hoy();chk(TT().cd['paca|chisme']===S.day,'cooldown del chisme');}
 // ===== 5. política: afinidad, carisma y bloque =====
 base();
 {const mar=V.find(x=>x.ideo==='marxista'),sd=V.find(x=>x.ideo==='socialdemocrata'),con=V.find(x=>x.ideo==='conservadora'),apo=V.find(x=>x.ideo==='apolitica'&&x.edad>=18);
  const pm=conoce(mar.id,40),ps=conoce(sd.id,40),pc=conoce(con.id,40),pa=conoce(apo.id,40);
  let r=ps.rel;trPolitica(sd,ps);hoy();const dIgual=ps.rel-r;r=pm.rel;trPolitica(mar,pm);hoy();const dCerca=pm.rel-r;r=pa.rel;trPolitica(apo,pa);hoy();const dApo=pa.rel-r;
  chk(dIgual>dCerca&&dCerca>dApo&&dApo>0,'afinidad: igual > cercana > apolítica ('+[dIgual,dCerca,dApo].join('/')+')');
  r=pc.rel;fix(.99,()=>trPolitica(con,pc));hoy();chk(pc.rel<r,'ideología lejana, mal: baja');
  S.skills.carisma=400;for(let i=0;i<3;i++){TT().cd={};fix(.01,()=>trPolitica(con,pc));hoy();}chk(TT().ideo[con.id]&&TT().ideo[con.id]!=='conservadora'&&pc.ideo===TT().ideo[con.id],'con carisma, le mueves un poco: '+TT().ideo[con.id]);info.mueve=TT().ideo[con.id];
  // el bloque
  const bl=V.filter(x=>x.edad>=18&&(trEdifOf(x)||{}).e&&trEdifOf(x).e.tipo==='bloque'&&LEFT.includes(x.ideo)).slice(0,3);chk(bl.length===3,'3 del bloque');
  const ps3=bl.map(x=>conoce(x.id,60));S.pol.tenant=false;S.owned=false;const mv0=W_().mov;
  bl.forEach((x,i)=>{TT().cd={};fix(.01,()=>trBloque(x,ps3[i]));hoy();});chk(TT().bloque.ids.length===3,'3 apuntados');chk(S.pol.tenant===true,'sindicato de inquilinas (S.pol.tenant)');chk(W_().mov>mv0+2,'movimiento sube');
  chk(/En el sindicato del bloque/.test(vcFicha(bl[0])),'ficha: en el sindicato');
  W_().mov=30;S.rentStrike=false;fix(.01,()=>trDia());hoy();chk(S.rentStrike===true,'con el bloque organizado: huelga de alquileres');
  // asamblea juntas
  dia(1,18.5);S.sim.work=0;const pb=ps3[0],mv1=W_().mov,rb=pb.rel;trAsamblea(bl[0],pb);chk(S.outWith===pb.k&&S.sim.outing==='militancia','a la asamblea juntas: sale ('+(toasts.slice(-1)[0]||'')+')');
  S.sim.outing=null;S.sim.leaving=false;S.sim.path=[];S.sim.work=0;S.sim.dest=null;S.sim.outingActive=null;leaveScene();outBack('militancia');hoy();chk(W_().mov>mv1&&pb.rel>rb&&!S.outWith,'asamblea: movimiento y relación');}
 // ===== 6. romance con adultos =====
 base();
 {const cand=V.filter(x=>x.edad>=18&&trRomOk(x)&&likes(trOrient(x),'f')&&x.id!=='paca');const v=cand.find(x=>['quino','lucia','dani','begona','yolanda','quique','ruben','irene'].includes(x.id))||cand[0];chk(!!v,'hay un adulto libre compatible');
  S.life.orient=v.g==='f'?'mujeres':v.g==='m'?'hombres':'ambos';
  const o1=trOrient(v);base();S.life.orient=v.g==='f'?'mujeres':v.g==='m'?'hombres':'ambos';chk(trOrient(v)===o1,'orientación estable entre partidas');info.orient=v.id+':'+o1+':'+V.filter(x=>x.edad>=18).map(trOrient).join('').length;
  const dist={};for(const x of V.filter(q=>q.edad>=18))dist[trOrient(x)]=(dist[trOrient(x)]||0)+1;info.dist=JSON.stringify(dist);chk(Object.keys(dist).length>=2,'orientaciones variadas en el censo');
  const p=conoce(v.id,40);chk(p.orient===o1&&canLove(p),'canLove: libre, adulta y orientación coherente');chk(p.adult===true,'adult');
  const f=vcFicha(v);chk(/data-tr="lig"/.test(f),'ficha: Ligar');chk(/data-act="flirt"/.test(genteTab()),'Gente: Ligar');
  // ligar hasta cita
  p.dates=1;let n=0;for(let i=0;i<12&&p.stage!=='cita'&&p.stage!=='rollo';i++){p.flirtDay=-9;p.noLove=0;S.needs.hambre=70;S.needs.energia=80;S.needs.higiene=80;fix(.01,()=>flirt(p));n++;}hoy();
  chk(p.stage==='cita'||p.stage==='rollo','ligando llega a cita ('+p.stage+' tras '+n+')');info.etapa=p.stage;
  chk(!partner()||partner()===p,'sin conflicto de pareja');
  const g=genteTab();chk(/💘 Citas|💘 Amigos con derecho/.test(g)||/data-act="date"/.test(g),'Gente: etapa y cita');chk(/data-act="stay"/.test(g)&&/data-act="ask"/.test(g),'Gente: que se quede / pedir salir');
  chk(GEST.besar.ok(p)||(p.chispa||0)<2,'gesto besar disponible para el adulto');
  p.love=80;p.dates=4;p.stageDay=-20;S.needs.hambre=70;askOut(p);chk(p.stage==='pareja'&&partner()===p,'pedir salir: pareja');
  const nt=toasts.length;moveIn(p);chk(p.stage==='pareja'&&toasts.length>nt,'vivir juntos con un vecino: de momento no');
  chk(/Pareja/.test(genteTab()),'Gente: pareja');
  // aparece en las visitas como pareja
  S.res=[];const L=vsCandidates();chk(L.some(x=>x[0]===p&&x[2]==='pareja'),'visita como pareja');}
 // un adulto emparejado en el censo
 base();
 {const v=vid('nacho');const p=conoce('nacho',70);S.life.orient='mujeres';S.char.g='f';
  chk(trTienePareja(v).length===1&&Math.abs(v.edad-30)<=15,'Nacho tiene pareja y encaja en edad');chk(!trRomOk(v)&&p.orient==null&&!canLove(p),'emparejado: sin orientación ni canLove');
  const nt=toasts.length;p.flirtDay=-9;const r=flirt(p);chk(r===false&&toasts.length>nt&&/pareja/i.test(toasts[toasts.length-1]),'flirt: «tiene pareja»: '+toasts[toasts.length-1]);
  p.love=80;p.dates=5;p.stageDay=-20;askOut(p);chk(p.stage!=='pareja'&&p.stage!=='cita','no hay etapa romántica');
  const f=vcFicha(v);chk(!/data-tr="lig"/.test(f)&&!/data-tr="cita"/.test(f),'ficha: sin romance');chk(!/data-act="flirt"|data-act="date"/.test((genteTab().match(/<div class="pers">(?:(?!<div class="pers">)[\s\S])*data-por="v_nacho"[\s\S]*/)||[''])[0].split('<div class="pers">')[0]),'Gente: sin romance');
  chk(/Su pareja: <b>Lola/.test(f),'ficha: «Su pareja: Lola» con relación alta');
  chk(!GEST.ligar.ok(p)&&!GEST.besar.ok(p)&&!GEST.cama.ok(p),'gestos cerrados');
  // otra edad: demasiado lejos
  const viejo=V.find(x=>x.edad>=70);const pv=conoce(viejo.id,60);chk(!trRomOk(viejo)&&!canLove(pv),'la diferencia de edad cuenta');}
 // ===== 6b. menores: ninguna vía romántica =====
 base();
 {const menores=V.filter(x=>x.edad>=12&&x.edad<18);chk(menores.length>=3,'hay menores de 12 a 17');info.menores=menores.length;
  S.life.orient='ambos';S.char.age=17;
  for(const v of menores){const p=conoce(v.id,80);p.orient='ambos';p.love=90;p.stage='conocida';p.chispa=5;p.spark=20;trEnsure(p);
   chk(p.adult===false&&p.orient==null,'menor '+v.id+': sin orientación ni adult');chk(!canLove(p),'canLove '+v.id);
   p.flirtDay=-9;const r=flirt(p);chk(r===false&&p.stage==='conocida'&&!(p.chispa>5),'flirt bloqueado '+v.id);
   const st=p.stage;askOut(p);chk(p.stage===st,'pedir salir bloqueado '+v.id);moveIn(p);chk(p.stage===st,'vivir juntos bloqueado');
   S.res=[];inviteHome(p,true);chk(!(S.res||[]).some(r=>r.pid===p.k),'quedarse a dormir bloqueado '+v.id);S.res=[];inviteHome(p,false);chk(!(S.res||[]).some(r=>r.pid===p.k),'ni siquiera de visita '+v.id);
   for(const g of Object.keys(GEST))if(['ligar','besar','cama','hotel','sucasa','quedarse'].includes(g))chk(!GEST[g].ok(p),'gesto '+g+' cerrado '+v.id);
   const ficha=vcFicha(v);chk(!/data-tr="(lig|cita)"/.test(ficha)&&!/Ligar|💘|Quedar a solas|cita|pareja:/i.test(ficha.replace(/Su pareja: <b>[^<]*<\/b>/g,'').replace(/<[^>]+>/g,' ').replace(/Tiene pareja[^.]*\./g,'')),'ficha sin romance '+v.id+': '+ficha.replace(/<[^>]+>/g,'|').slice(0,160));
   const gt=genteTab();const blq=(gt.match(new RegExp('<div class="pers">(?:(?!<div class="pers">)[\\s\\S])*data-por="'+p.k+'"(?:(?!<div class="pers">)[\\s\\S])*'))||[''])[0];
   chk(blq&&!/data-act="(flirt|date|stay|ask|movein|break)"/.test(blq)&&!/💘/.test(blq),'Gente sin romance '+v.id);
   chk(!phPeople().some(q=>q.k===p.k),'fuera del móvil '+v.id);chk(!vsCandidates().some(c=>c[0]===p),'fuera de las visitas '+v.id);
   S.outWith=p.k;S.dateOut=true;const w0=S.sim.work;doOut('amigos');chk(S.outWith==null&&!(S.sim.work>w0),'salir con '+v.id+' bloqueado');
   S.outWith=null;const w1=S.sim.work;peGo(p,'visita');chk(S.outWith==null&&!(S.sim.work>w1),'peGo bloqueado '+v.id);
   // aunque el estado esté corrupto
   p.stage='cita';p.orient='ambos';p.adult=true;trEnsure(p);chk(p.adult===false&&p.orient==null,'estado corrupto se repara '+v.id);p.stage='conocida';}
  // por el móvil: ni mensajes de pareja ni citas
  for(let i=0;i<60;i++){try{phTick();}catch(e){}}const th=PH().th;for(const v of menores)chk(!(th['v_'+v.id]||[]).length,'sin mensajes de '+v.id);}
 // ===== 7. vecinos que te buscan =====
 base();
 {const v=vid('paca'),p=conoce('paca',55);S.res=[];let got=false;
  for(let i=0;i<60&&!got;i++){S.day++;TT().last={};const wd=dateOf(S.day).wd;TT().plan=null;VS().plan=null;trPlanDia();if(TT().plan){got=true;}else if(VS().plan&&VS().plan.k===p.k)got=true;}
  chk(got,'se genera una búsqueda');const pl=TT().plan,vp=VS().plan;const wd=dateOf(S.day).wd;
  if(pl){chk(trLibreEn(v,pl.h,wd),'hora coherente con su trabajo ('+pl.h.toFixed(1)+', wd '+wd+')');S.t=pl.h*60+5;const th0=(PH().th[p.k]||[]).length;trDisparo();const th=PH().th[p.k]||[];chk(th.length===th0+1&&th[th.length-1].f==='t'&&th[th.length-1].open,'llega el mensaje con respuestas');info.busca=pl.tipo+':'+pl.id+'@'+pl.h.toFixed(1);}
  else if(vp){chk(trLibreEn(v,vp.h,wd),'visita a hora coherente');info.busca='visita@'+vp.h.toFixed(1);}
  // una visita de siempre puesta en horas de trabajo se mueve
  dia(0,9);VS().plan={k:p.k,h:10,avisa:true,role:'amigo',asked:false};trAjustaVisita();chk(!VS().plan||trLibreEn(v,VS().plan.h,0),'visita en su turno: se mueve o se cancela ('+(VS().plan?VS().plan.h.toFixed(1):'cancelada')+')');
  // el texto de la visita es concreto
  S.res=[];const n0=(PH().th[p.k]||[]).length;phIncoming(p,'genérico',[['🏠 «Claro, sube»',4,'home','¡Voy!','Claro, sube'],['😮‍💨 «Hoy no»',-1,null,'Vale','Hoy no']]);const last=PH().th[p.k].slice(-1)[0];
  chk(last.t!=='genérico'&&Object.values(DATA.trato.buscan.visita).some(m=>m.txt.some(t=>t.replace('{v}',p.n)===last.t)),'el mensaje de visita es de un motivo concreto: '+last.t);
  // y trae algo
  S.sim.work=0;S.needs.hambre=40;const mo=TT().vmot[p.k];TT().vmot[p.k]={id:'taper',day:S.day};const h1=S.needs.hambre,r1=p.rel;S.res=[];inviteHome(p,false);hoy();
  chk((S.res||[]).some(r=>r.pid===p.k)&&S.needs.hambre>h1&&p.rel>r1,'visita con táper: hambre y relación');
  // curro y chisme por mensaje
  S.jobless=true;const th2=PH().th[p.k].length;const mm=DATA.trato.buscan.mensajes.curro;chk(trReqOk(mm.req,v,p),'curro: en paro y con trabajo dentro');S.jobless=false;
  S.netBoost=0;trAct(p.k,'curro');hoy();chk(S.netBoost>S.day,'respuesta «gracias»: pista de curro');}
 // ===== 8. mirar dentro desde el mapa: no se interactúa =====
 base();
 {const v=vid('paca'),p=conoce('paca',50);const ob=BM.obs;BM.obs='super';const r0=p.rel,t0=toasts.length;trClick(v,'chisme');trClick(v,'pol');chk(p.rel===r0&&toasts.length>t0,'BM.obs: no se interactúa');
  const f=vcFicha(v);chk(!/data-tr="(chisme|pol|favor)"/.test(f)&&/solo se mira/.test(f),'BM.obs: la ficha solo mira');BM.obs=ob;}
 // ===== 9. partida antigua: sin estado nuevo =====
 base();
 {const v=vid('paca'),p=conoce('paca',50);delete S.trato;const old=S.people;S.people=old.map(q=>{const c=Object.assign({},q);if(c.vid!=null){delete c.orient;delete c.relStyle;delete c.kids;}return c;});
  try{const f=vcFicha(v);chk(/vfb/.test(f),'ficha sin S.trato');genteTab();trDia();trOpciones(v,vcPer('paca'));trMemoria(v,vcPer('paca'));vecinosEn('bar',20,4);phPeople();vsCandidates();}catch(e){fails.push('partida antigua: '+e.message);}
  chk(S.trato&&Array.isArray(S.trato.deudas)&&S.trato.bloque&&Array.isArray(S.trato.bloque.ids),'estado creado con valores por defecto');
  const q=S.people.find(x=>x.vid==='paca');chk(q&&q.relStyle!=null,'persona antigua completada');
  // el estado sobrevive al guardado
  const js=JSON.stringify(S.trato);chk(JSON.stringify(JSON.parse(js))===js,'S.trato serializa');S.people=old;}
 toast=_toast;console.error=oe;
 const errs2=errs.filter(e=>!/^Q3D model/.test(e));document.title=(fails.length||errs2.length||window.__errs.length)?'FALLA '+JSON.stringify({fails,errs:errs2.slice(0,3),w:window.__errs.slice(0,2)}):'OK '+JSON.stringify({errs:errs2,werrs:window.__errs,info});
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,500)}},300);
