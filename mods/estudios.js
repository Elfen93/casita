// =================== EDUCACIÓN: nivel, estudiar (FP, universidad, cursos) y para qué sirve ===================
const EDU_LV={eso:{n:'ESO',o:0,e:'📘'},bach:{n:'Bachillerato',o:1,e:'📗'},fpm:{n:'FP de grado medio',o:1,e:'🔧'},fps:{n:'FP de grado superior',o:2,e:'🛠️'},grado:{n:'Grado universitario',o:3,e:'🎓'},master:{n:'Máster',o:4,e:'🎓'}};
const EDU_ORDER=['eso','bach','fpm','fps','grado','master'];
const EDU_PROGS={
  bach:{n:'Bachillerato (nocturno)',lv:'bach',h:900,cost:0,req:['eso'],sk:'logica',d:'Dos cursos por la tarde en el instituto de adultos. Gratis. Abre la universidad y la FP superior.',sched:[17,21],days:[0,1,2,3],place:'instituto'},
  fpm_elec:{n:'FP medio · Electricidad',lv:'fpm',h:1000,cost:120,req:['eso'],sk:'elec',d:'Instalaciones eléctricas. Sirve en la obra y para arreglar tu propia casa.',sched:[8,14],days:[0,1,2,3,4],place:'instituto'},
  fpm_cocina:{n:'FP medio · Cocina',lv:'fpm',h:1000,cost:120,req:['eso'],sk:'cocina',d:'Cocina profesional. Entrar de cocinera sin pasar años de camarera.',sched:[8,14],days:[0,1,2,3,4],place:'instituto'},
  fpm_cuid:{n:'FP medio · Auxiliar de enfermería',lv:'fpm',h:1000,cost:120,req:['eso'],sk:'carisma',d:'Cuidados básicos. Lo que piden en residencias y hospitales.',sched:[8,14],days:[0,1,2,3,4],place:'instituto'},
  fps_dam:{n:'FP superior · Desarrollo de aplicaciones',lv:'fps',h:1400,cost:200,req:['bach','fpm'],sk:'logica',d:'Programación. La puerta más corta a tecnología.',sched:[8,14],days:[0,1,2,3,4],place:'instituto'},
  fps_admin:{n:'FP superior · Administración y finanzas',lv:'fps',h:1400,cost:200,req:['bach','fpm'],sk:'logica',d:'Contabilidad, nóminas, papeleo. Oficina con mejor sueldo de entrada.',sched:[8,14],days:[0,1,2,3,4],place:'instituto'},
  grado_enf:{n:'Grado · Enfermería',lv:'grado',h:3200,cost:900,req:['bach','fps'],sk:'logica',d:'Cuatro años. Sanidad con título: mejor sueldo, más responsabilidad.',sched:[8,14],days:[0,1,2,3,4],place:'uni'},
  grado_inf:{n:'Grado · Ingeniería informática',lv:'grado',h:3200,cost:900,req:['bach','fps'],sk:'logica',d:'Cuatro años. Tecnología desde arriba.',sched:[8,14],days:[0,1,2,3,4],place:'uni'},
  grado_ade:{n:'Grado · ADE',lv:'grado',h:3200,cost:900,req:['bach','fps'],sk:'carisma',d:'Cuatro años. Para mandar en oficinas, o eso prometen.',sched:[8,14],days:[0,1,2,3,4],place:'uni'},
  grado_soc:{n:'Grado · Trabajo social',lv:'grado',h:3200,cost:900,req:['bach','fps'],sk:'carisma',d:'Cuatro años. Función pública, cuidados, movimiento vecinal.',sched:[8,14],days:[0,1,2,3,4],place:'uni'},
  master:{n:'Máster',lv:'master',h:1200,cost:2400,req:['grado'],sk:'logica',d:'Un año y una pasta. Lo piden para algunos puestos de arriba.',sched:[17,21],days:[0,1,2,3],place:'uni'},
  bach_online:{n:'Bachillerato a distancia',lv:'bach',h:1100,cost:60,req:['eso'],sk:'logica',d:'Desde casa, a tu ritmo: libros y ordenador. Más largo, sin horarios.',sched:[0,0],days:[],place:'online'},
  fps_dam_tarde:{n:'FP superior · Desarrollo de aplicaciones (tarde)',lv:'fps',h:1500,cost:200,req:['bach','fpm'],sk:'logica',d:'La misma FP, en turno de tarde para quien trabaja de mañana.',sched:[16,21],days:[0,1,2,3,4],place:'instituto'},
  grado_online:{n:'Grado a distancia (UNED)',lv:'grado',h:3600,cost:700,req:['bach','fps'],sk:'logica',d:'Carrera desde casa. Sin clases: libros, ordenador y exámenes. Lo hace la gente que trabaja.',sched:[0,0],days:[],place:'online'},
  curso_ofim:{n:'Curso · Ofimática',lv:null,h:120,cost:0,req:[],sk:'logica',d:'Del SEPE, gratis. Suma puntos para oficina.',sched:[9,13],days:[0,1,2,3,4],place:'academia',cert:'ofimatica'},
  curso_ing:{n:'Curso · Inglés B2',lv:null,h:300,cost:180,req:[],sk:'carisma',d:'Academia por las tardes. Lo piden en oficina y tech.',sched:[18,20],days:[0,1,2,3],place:'academia',cert:'ingles'},
  curso_carr:{n:'Curso · Carretillero',lv:null,h:40,cost:90,req:[],sk:'alba',d:'Un fin de semana. Permite trabajos de almacén mejor pagados.',sched:[9,14],days:[5,6],place:'academia',cert:'carretilla'},
  curso_manip:{n:'Curso · Manipulador de alimentos',lv:null,h:20,cost:30,req:[],sk:'cocina',d:'Obligatorio en hostelería. Dos tardes.',sched:[17,20],days:[1,2],place:'academia',cert:'manipulador'},
};
const ED=()=>{if(!S.edu)S.edu={lv:'eso',done:[],certs:[],cur:null};S.edu.done=S.edu.done||[];S.edu.certs=S.edu.certs||[];return S.edu;};
const eduHas=lv=>{const E=ED();return E.lv===lv||E.done.includes(lv)||(EDU_LV[E.lv]&&EDU_LV[lv]&&EDU_LV[E.lv].o>EDU_LV[lv].o&&lv!=='fpm'&&lv!=='fps')||(lv==='bach'&&(E.done.includes('fps')||E.lv==='grado'||E.lv==='master'));};
function eduCan(k){const P=EDU_PROGS[k];const E=ED();if(E.cur&&E.cur.k===k)return 'cursando';if(P.cert&&E.certs.includes(P.cert))return 'ya lo tiene';if(P.lv&&(E.done.includes(k)||(E.lv===P.lv&&!P.cert)))return 'ya lo tiene';
  if(P.req.length&&!P.req.some(r=>eduHas(r)))return 'necesita '+P.req.map(r=>EDU_LV[r].n).join(' o ');if(E.cur)return 'ya está estudiando otra cosa';
  const c=Math.round(P.cost*PM());if(S.money<c)return 'cuesta '+fmt(c);return null;}
function eduHours(k){const P=EDU_PROGS[k];const D=Dm();return Math.round(P.h*(D.soul?1:D.shifts<1?D.shifts:1)*(P.cert?1:0.8));}
function eduClash(k){const P=EDU_PROGS[k];if(S.jobless||!S.track||!TRACKS[S.track])return false;const T0=TRACKS[S.track];const [a,b]=P.sched,[c,d]=T0.sh;return P.days.some(x=>T0.days.includes(x))&&a<d&&c<b;}
function eduStart(k){const why=eduCan(k);if(why){toast('No puede: '+why);return false;}const P=EDU_PROGS[k];const c=Math.round(P.cost*PM());S.money-=c;
  if(eduClash(k))tell(`${CH().name} se ha matriculado en ${P.n.toLowerCase()}, pero el horario choca con el trabajo. Irá los días que pueda y estudiará en casa el resto. Va a ser largo.`,'📕');
  ED().cur={k,h:0,need:eduHours(k),since:S.day,miss:0};tell(`${CH().name} se ha matriculado en ${P.n.toLowerCase()}. ${c?fmt(c)+' de matrícula.':'Gratis.'} ${P.place==='uni'?'Años de clases, trabajos y exámenes por delante.':P.place==='instituto'?'Clases casi todas las mañanas.':'Unas semanas.'}`,'🎓');toast(`🎓 Matriculad${oa()}: ${P.n}`,true);sfx('level');return true;}
function eduDrop(){const E=ED();if(!E.cur)return;const P=EDU_PROGS[E.cur.k];tell(`${CH().name} ha dejado ${P.n.toLowerCase()} a medias (${Math.round(E.cur.h)} h). ${pickR(['No daba la vida para todo.','Quizá vuelva.','El curro gana siempre.'])}`,'📕');E.cur=null;}
function eduFinish(){const E=ED();const C=E.cur;if(!C)return;const P=EDU_PROGS[C.k];E.cur=null;
  if(P.cert)E.certs.push(P.cert);else{E.done.push(C.k);if(EDU_LV[P.lv].o>=EDU_LV[E.lv].o)E.lv=P.lv;}
  gainSkill(P.sk,P.cert?40:120);S.rep=Math.min(100,(S.rep??60)+(P.cert?3:8));
  chapter('edu_'+C.k,P.cert?'Certificado':'Titulad'+oa(),`${CH().name} ha terminado ${P.n.toLowerCase()}. ${P.place==='uni'?'Con la familia en la graduación llorando y una deuda de la que nadie habla.':P.place==='instituto'?'Primer título que nadie le va a quitar.':'Un papel más para el currículum.'}`);
  toast(`🎓 ¡${P.n} terminado!`,true);sfx('level');popBubble('🎓');}
// ---- ir a clase: salida como el trabajo, en su horario ----
Object.assign(OUT,{clase:{n:'Ir a clase',e:'🎓',dur:240,h:[7,21],why:'estudiar',req:()=>!!ED().cur}});
function eduInClassHours(){const C=ED().cur;if(!C)return false;const P=EDU_PROGS[C.k];const h=S.t/60;return P.days.includes(dateOf(S.day).wd)&&h>=P.sched[0]&&h<P.sched[1];}
function eduTryGo(){const C=ED().cur;if(!C||!eduInClassHours())return false;const s=S.sim;if(s.work>0||s.leaving||C.wentDay===S.day)return false;const P=EDU_PROGS[C.k];const h=S.t/60;if(h>P.sched[0]+1.5)return false;
  if(S.needs.energia<15||S.needs.hambre<12){if(throttled('eduskip',3e5))tell(`${CH().name} ha faltado a clase: ${S.needs.energia<15?'no se tenía en pie':'tenía que comer algo'}.`,'📕');C.miss++;C.wentDay=S.day;return false;}
  C.wentDay=S.day;OUT.clase.dur=Math.round((P.sched[1]-P.sched[0])*60);goOut('clase');return true;}
{const _au=autonomy;autonomy=function(){try{if(eduTryGo())return;}catch(e){console.error(e);}return _au.apply(this,arguments);};}
{const _df=destOf;destOf=function(k){if(k==='clase'){const C=ED().cur;const P=C&&EDU_PROGS[C.k];return 'biblioteca';}return _df.apply(this,arguments);};}
// al volver de clase: horas, cansancio, lógica
{const _ob=outBack;outBack=function(kind,...a){if(kind==='clase'){const C=ED().cur;if(!C)return;const P=EDU_PROGS[C.k];const hrs=(P.sched[1]-P.sched[0]);C.h+=hrs;gainSkill(P.sk,hrs*2);S.needs.energia=Math.max(0,S.needs.energia-hrs*3);S.needs.diversion=Math.max(0,S.needs.diversion-hrs*1.5);S.needs.social=Math.min(100,S.needs.social+10);
    if(Math.random()<.15)tell(pickR([`En clase ${CH().name} ha conocido a gente que también estudia después de currar.`,`Examen sorpresa. ${lvl(P.sk)>=5?'Lo ha bordado.':'Ha salido vivo. Más o menos.'}`,`${CH().name} se ha dormido en la última hora. El profe lo ha visto.`,`Debate en clase sobre el alquiler. ${CH().name} ha hablado más que nadie.`]),'🎓');
    if(C.h>=C.need)eduFinish();return;}return _ob.apply(this,[kind,...a]);};}
// estudiar en casa también cuenta (libros, ordenador, escritorio)
{const _up7=update;update=function(gm){const r=_up7.apply(this,arguments);try{const C=ED().cur;const u=S.sim.use;if(C&&u&&!(S.sim.work>0)&&(u.type==='libros'||u.type==='compu'||u.type==='escritorio'||u.act==='estudiar'||u.act==='curso')){const P=EDU_PROGS[C.k];C.h+=gm/60*(P.place==='online'?1:.5)*(typeof LB==='function'&&LB().man.includes(C.k)?1.3:.5);if(C.h>=C.need)eduFinish();}}catch(e){}return r;};}
// ---- para qué sirve: requisitos de entrada y sueldo ----
const EDU_REQ={tech:['fps','grado'],funcion:['bach','fps','grado'],cuidados:['fpm','fps','grado'],oficina:[]};
const EDU_PAY={tech:{fps:1.08,grado:1.2,master:1.3},oficina:{bach:1.04,fps:1.1,grado:1.18,master:1.25},funcion:{grado:1.15,master:1.22},cuidados:{fpm:1.06,fps:1.12,grado:1.3},hosteleria:{fpm:1.1},obra:{fpm:1.08,fps:1.15},coop:{fps:1.05,grado:1.1}};
function eduBest(){const E=ED();let best=E.lv;for(const d of E.done){const P=EDU_PROGS[d];if(P&&P.lv&&EDU_LV[P.lv].o>EDU_LV[best].o)best=P.lv;}return best;}
function eduPayMul(k){const t=EDU_PAY[k||S.track];if(!t)return 1;const E=ED();let m=1;for(const lv in t){if(eduHas(lv)||E.done.some(d=>EDU_PROGS[d]&&EDU_PROGS[d].lv===lv))m=Math.max(m,t[lv]);}
  if(E.certs.includes('ofimatica')&&(k||S.track)==='oficina')m+=.03;if(E.certs.includes('ingles')&&['oficina','tech'].includes(k||S.track))m+=.04;if(E.certs.includes('carretilla')&&(k||S.track)==='super')m+=.05;if(E.certs.includes('manipulador')&&(k||S.track)==='hosteleria')m+=.03;return m;}
{const _em=entryMissing;entryMissing=function(k){const m=_em.apply(this,arguments);try{if(k===S.track&&!S.jobless)return m;const req=EDU_REQ[k];if(req&&req.length&&!req.some(r=>eduHas(r))){m.push('título: '+req.map(r=>EDU_LV[r].n).join(' o '));}
  if(k==='hosteleria'&&Dm().soul&&!ED().certs.includes('manipulador'))m.push('carnet de manipulador');}catch(e){}return m;};}
// sueldo: multiplicador por estudios aplicado vía payMul al empezar/ascender
function eduApplyPay(){try{const base=S.payMulBase!=null?S.payMulBase:(S.payMul||1);S.payMulBase=base;S.payMul=base*eduPayMul();}catch(e){}}
{const _st=startTrack;startTrack=function(){const r=_st.apply(this,arguments);S.payMulBase=null;eduApplyPay();return r;};}
{const _ef=eduFinish;eduFinish=function(){_ef.apply(this,arguments);eduApplyPay();};}
// ---- UI: pestaña Trabajo ----
function eduBlock(){const E=ED();const C=E.cur;let h=`<h3>🎓 Estudios</h3><div class="kv"><span>Nivel</span><span>${EDU_LV[eduBest()].e} ${EDU_LV[eduBest()].n}${E.certs.length?' · '+E.certs.length+' certificado'+(E.certs.length>1?'s':''):''}</span></div>`;
  if(C){const P=EDU_PROGS[C.k];const pc=Math.min(100,Math.round(C.h/C.need*100));h+=`<div class="sub"><b>${P.n}</b> · ${Math.round(C.h)}/${C.need} h${C.miss?' · faltas: '+C.miss:''}</div><div class="minibars"><i style="width:${pc}%;background:#7a6fd0"></i></div><div class="sub" style="font-size:11.5px">${P.days.map(d=>WDS[d]).join(' ')} ${P.sched[0]}:00–${P.sched[1]}:00 · va sol${oa()} a clase. Leer y el ordenador también suman.</div><button class="btn grey" id="edudrop">📕 Dejarlo</button>`;}
  else{h+=`<details class="tracks"><summary>📚 Matricularse</summary>`;for(const k in EDU_PROGS){const P=EDU_PROGS[k];const why=eduCan(k);const c=Math.round(P.cost*PM());
    h+=`<div class="outrow"><span class="oe">${P.lv?EDU_LV[P.lv].e:'📄'}</span><span class="ot"><b>${P.n}</b><small>${eduHours(k)} h · ${c?fmt(c):'gratis'} · ${P.d}${why?' · <i>'+why+'</i>':''}</small></span><button class="mini" data-edu="${k}" ${why?'disabled style="opacity:.45"':''}>Ir</button></div>`;}h+=`</details>`;}
  const mul=eduPayMul();if(mul>1)h+=`<div class="sub" style="font-size:11.5px">Sus estudios le suben el sueldo un ${Math.round((mul-1)*100)} % en ${TR().n.toLowerCase()}.</div>`;
  return h;}
{const _tb=trackBlock;trackBlock=function(){return _tb.apply(this,arguments)+eduBlock();};}
{const _bs=bindSociety;bindSociety=function(){_bs.apply(this,arguments);card.querySelectorAll('[data-edu]').forEach(b=>b.onclick=()=>{if(eduStart(b.dataset.edu))openMenu('trabajo');});const d=card.querySelector('#edudrop');if(d)d.onclick=()=>{eduDrop();openMenu('trabajo');};};}
// creador: nivel de estudios al empezar
{const _rc3=renderCreator;renderCreator=function(diff,edit){_rc3(diff,edit);try{if(edit)return;const anchor=[...card.querySelectorAll('.clab')].find(e=>/Dónde vive/.test(e.textContent));if(!anchor)return;cre.edu=cre.edu||'eso';
  const box=document.createElement('div');box.innerHTML=`<div class="clab">Estudios</div><div class="chips">${['eso','bach','fpm','fps','grado'].map(k=>`<button class="chip${cre.edu===k?' on':''}" data-edu0="${k}">${EDU_LV[k].e} ${EDU_LV[k].n}</button>`).join('')}</div><div class="sub" style="font-size:11.5px">${cre.edu==='eso'?'Lo justo. Sin títulos no se entra en tecnología, sanidad ni función pública… pero se puede estudiar.':cre.edu==='grado'?'Con carrera. Empieza con menos dinero (la deuda) pero más puertas abiertas.':'Abre algunas puertas y sube un poco el sueldo.'}</div>`;
  anchor.before(box);box.querySelectorAll('[data-edu0]').forEach(b=>b.onclick=()=>{cre.edu=b.dataset.edu0;renderCreator(diff,edit);});}catch(e){console.error(e);}};}
{const _ns=newState;newState=function(...a){const st=_ns.apply(this,a);try{if(typeof cre!=='undefined'&&cre&&cre.edu){st.edu={lv:cre.edu,done:[],certs:[],cur:null};if(cre.edu==='grado')st.money=Math.round(st.money*.7);else if(cre.edu==='fps')st.money=Math.round(st.money*.9);}}catch(e){}return st;};}
{const _nw=newToday;newToday=function(){const r=_nw.apply(this,arguments);try{if(S.payMulBase!=null){const m=eduPayMul();const expect=S.payMulBase*m;if(Math.abs((S.payMul||1)-expect)>1e-6){S.payMulBase=(S.payMul||1)/m;}}}catch(e){}return r;};}
{const _au2=autonomy;autonomy=function(){try{const C=ED().cur;const s=S.sim;if(C&&!s.use&&!(s.path&&s.path.length)&&!(s.work>0)&&!s.leaving){const h=S.t/60;const nd=S.needs;const P=EDU_PROGS[C.k];
  if(h>=9&&h<23&&!['hambre','vejiga','energia','higiene'].some(k=>nd[k]<40)&&Math.random()<(P.place==='online'?.12:.06)&&(C.homeDay!==S.day||Math.random()<.3)){const b=findObjs((d,t)=>t==='escritorio'||t==='compu'||t==='libros');if(b.length){C.homeDay=S.day;enqueue({k:'obj',i:b[0],act:S.obj[b[0]].t==='libros'?'leer':'estudiar'});if(throttled('estudia',6e5))toast(`📚 ${CH().name} se pone a estudiar`);return;}}}}catch(e){}return _au2.apply(this,arguments);};}
// las aspiraciones y los objetivos no pagan: dan ánimo, no dinero
{const _ac=aspCheck;aspCheck=function(){const m0=S.money;const r=_ac.apply(this,arguments);if(S.money>m0){const d=S.money-m0;S.money=m0;S.needs.diversion=Math.min(100,S.needs.diversion+25);S.needs.social=Math.min(100,S.needs.social+8);S.glow=S.day*1440+S.t+600;}return r;};}
{const _ck=checkGoals;checkGoals=function(){const m0=S.money;const r=_ck.apply(this,arguments);if(S.money>m0){S.money=m0;S.needs.diversion=Math.min(100,S.needs.diversion+15);}return r;};}
