// =================== EDUCACIÓN: nivel, estudiar (FP, universidad, cursos) y para qué sirve ===================
const {estudios:TX_estudios}=DATA.textos_mods_ag;
const EDU_LV=DATA.estudios.niveles;
const EDU_ORDER=DATA.estudios.orden;
const EDU_PROGS=DATA.estudios.programas;
const ED=()=>{if(!S.edu)S.edu={lv:'eso',done:[],certs:[],cur:null};S.edu.done=S.edu.done||[];S.edu.certs=S.edu.certs||[];return S.edu;};
const eduHas=lv=>{const E=ED();return E.lv===lv||E.done.includes(lv)||(EDU_LV[E.lv]&&EDU_LV[lv]&&EDU_LV[E.lv].o>EDU_LV[lv].o&&lv!=='fpm'&&lv!=='fps')||(lv==='bach'&&(E.done.includes('fps')||E.lv==='grado'||E.lv==='master'));};
function eduCan(k){const P=EDU_PROGS[k];const E=ED();if(E.cur&&E.cur.k===k)return TX_estudios.can.cursando;if(P.cert&&E.certs.includes(P.cert))return TX_estudios.can.tiene;if(P.lv&&(E.done.includes(k)||(E.lv===P.lv&&!P.cert)))return TX_estudios.can.tiene;
  if(P.req.length&&!P.req.some(r=>eduHas(r)))return huecos(TX_estudios.can.necesita,{x:P.req.map(r=>EDU_LV[r].n).join(' o ')});if(E.cur)return TX_estudios.can.otra;
  const c=Math.round(P.cost*PM());if(S.money<c)return huecos(TX_estudios.can.cuesta,{v:fmt(c)});return null;}
function eduHours(k){const P=EDU_PROGS[k];const D=Dm();return Math.round(P.h*(D.soul?1:D.shifts<1?D.shifts:1)*(P.cert?1:0.8));}
function eduClash(k){const P=EDU_PROGS[k];if(S.jobless||!S.track||!TRACKS[S.track])return false;const T0=TRACKS[S.track];const [a,b]=P.sched,[c,d]=T0.sh;return P.days.some(x=>T0.days.includes(x))&&a<d&&c<b;}
function eduStart(k){const why=eduCan(k);if(why){toast(huecos(TX_estudios.no_puede,{why}));return false;}const P=EDU_PROGS[k];const c=Math.round(P.cost*PM());S.money-=c;
  if(eduClash(k))tell(huecos(TX_estudios.choca,{p:P.n.toLowerCase()}),'📕');
  ED().cur={k,h:0,need:eduHours(k),since:S.day,miss:0};tell(huecos(TX_estudios.matricula,{p:P.n.toLowerCase(),coste:c?huecos(TX_estudios.matricula_coste,{v:fmt(c)}):TX_estudios.matricula_gratis,fin:P.place==='uni'?TX_estudios.matricula_uni:P.place==='instituto'?TX_estudios.matricula_inst:TX_estudios.matricula_otro}),'🎓');toast(huecos(TX_estudios.matriculado_toast,{p:P.n}),true);sfx('level');return true;}
function eduDrop(){const E=ED();if(!E.cur)return;const P=EDU_PROGS[E.cur.k];tell(huecos(TX_estudios.deja,{p:P.n.toLowerCase(),h:Math.round(E.cur.h),fin:pickR(TX_estudios.deja_fin)}),'📕');E.cur=null;}
function eduFinish(){const E=ED();const C=E.cur;if(!C)return;const P=EDU_PROGS[C.k];E.cur=null;
  if(P.cert)E.certs.push(P.cert);else{E.done.push(C.k);if(EDU_LV[P.lv].o>=EDU_LV[E.lv].o)E.lv=P.lv;}
  gainSkill(P.sk,P.cert?40:120);S.rep=Math.min(100,(S.rep??60)+(P.cert?3:8));
  chapter('edu_'+C.k,P.cert?TX_estudios.fin_cert:huecos(TX_estudios.fin_titulo,{}),huecos(TX_estudios.fin_texto,{p:P.n.toLowerCase(),fin:P.place==='uni'?TX_estudios.fin_uni:P.place==='instituto'?TX_estudios.fin_inst:TX_estudios.fin_otro}));
  toast(huecos(TX_estudios.fin_toast,{p:P.n}),true);sfx('level');popBubble('🎓');}
// ---- ir a clase: salida como el trabajo, en su horario ----
conLogica(OUT,{clase:{req:()=>!!ED().cur}});
function eduInClassHours(){const C=ED().cur;if(!C)return false;const P=EDU_PROGS[C.k];const h=S.t/60;return P.days.includes(dateOf(S.day).wd)&&h>=P.sched[0]&&h<P.sched[1];}
function eduTryGo(){const C=ED().cur;if(!C||!eduInClassHours())return false;const s=S.sim;if(s.work>0||s.leaving||C.wentDay===S.day)return false;const P=EDU_PROGS[C.k];const h=S.t/60;if(h>P.sched[0]+1.5)return false;
  if(S.needs.energia<15||S.needs.hambre<12){if(throttled('eduskip',3e5))tell(huecos(TX_estudios.falta,{why:S.needs.energia<15?TX_estudios.falta_energia:TX_estudios.falta_hambre}),'📕');C.miss++;C.wentDay=S.day;return false;}
  C.wentDay=S.day;OUT.clase.dur=Math.round((P.sched[1]-P.sched[0])*60);goOut('clase');return true;}
{const _au=autonomy;autonomy=function(){try{if(eduTryGo())return;}catch(e){console.error(e);}return _au.apply(this,arguments);};}
{const _df=destOf;destOf=function(k){if(k==='clase'){const C=ED().cur;const P=C&&EDU_PROGS[C.k];return 'biblioteca';}return _df.apply(this,arguments);};}
// al volver de clase: horas, cansancio, lógica
{const _ob=outBack;outBack=function(kind,...a){if(kind==='clase'){const C=ED().cur;if(!C)return;const P=EDU_PROGS[C.k];const hrs=(P.sched[1]-P.sched[0]);C.h+=hrs;gainSkill(P.sk,hrs*2);S.needs.energia=Math.max(0,S.needs.energia-hrs*3);S.needs.diversion=Math.max(0,S.needs.diversion-hrs*1.5);S.needs.social=Math.min(100,S.needs.social+10);
    if(Math.random()<.15)tell(huecos(pickR(TX_estudios.clase_tell),{examen:lvl(P.sk)>=5?TX_estudios.clase_examen_bien:TX_estudios.clase_examen_mal}),'🎓');
    if(C.h>=C.need)eduFinish();return;}return _ob.apply(this,[kind,...a]);};}
// estudiar en casa también cuenta (libros, ordenador, escritorio)
{const _up7=update;update=function(gm){const r=_up7.apply(this,arguments);try{const C=ED().cur;const u=S.sim.use;if(C&&u&&!(S.sim.work>0)&&(u.type==='libros'||u.type==='compu'||u.type==='escritorio'||u.act==='estudiar'||u.act==='curso')){const P=EDU_PROGS[C.k];C.h+=gm/60*(P.place==='online'?1:.5)*(typeof LB==='function'&&LB().man.includes(C.k)?1.3:.5);if(C.h>=C.need)eduFinish();}}catch(e){}return r;};}
// ---- para qué sirve: requisitos de entrada y sueldo ----
const EDU_REQ=DATA.estudios.requisitos;
const EDU_PAY=DATA.estudios.sueldo;
function eduBest(){const E=ED();let best=E.lv;for(const d of E.done){const P=EDU_PROGS[d];if(P&&P.lv&&EDU_LV[P.lv].o>EDU_LV[best].o)best=P.lv;}return best;}
function eduPayMul(k){const t=EDU_PAY[k||S.track];if(!t)return 1;const E=ED();let m=1;for(const lv in t){if(eduHas(lv)||E.done.some(d=>EDU_PROGS[d]&&EDU_PROGS[d].lv===lv))m=Math.max(m,t[lv]);}
  if(E.certs.includes('ofimatica')&&(k||S.track)==='oficina')m+=.03;if(E.certs.includes('ingles')&&['oficina','tech'].includes(k||S.track))m+=.04;if(E.certs.includes('carretilla')&&(k||S.track)==='super')m+=.05;if(E.certs.includes('manipulador')&&(k||S.track)==='hosteleria')m+=.03;return m;}
{const _em=entryMissing;entryMissing=function(k){const m=_em.apply(this,arguments);try{if(k===S.track&&!S.jobless)return m;const req=EDU_REQ[k];if(req&&req.length&&!req.some(r=>eduHas(r))){m.push(huecos(TX_estudios.titulo_req,{x:req.map(r=>EDU_LV[r].n).join(' o ')}));}
  if(k==='hosteleria'&&Dm().soul&&!ED().certs.includes('manipulador'))m.push(TX_estudios.carnet_manip);}catch(e){}return m;};}
// sueldo: multiplicador por estudios aplicado vía payMul al empezar/ascender
function eduApplyPay(){try{const base=S.payMulBase!=null?S.payMulBase:(S.payMul||1);S.payMulBase=base;S.payMul=base*eduPayMul();}catch(e){}}
{const _st=startTrack;startTrack=function(){const r=_st.apply(this,arguments);S.payMulBase=null;eduApplyPay();return r;};}
{const _ef=eduFinish;eduFinish=function(){_ef.apply(this,arguments);eduApplyPay();};}
// ---- UI: pestaña Trabajo ----
function eduBlock(){const E=ED();const C=E.cur;const U=TX_estudios.ui;let h=`<h3>${U.titulo}</h3><div class="kv"><span>${U.nivel}</span><span>${EDU_LV[eduBest()].e} ${EDU_LV[eduBest()].n}${E.certs.length?huecos(U.certs,{k:E.certs.length,s:E.certs.length>1?'s':''}):''}</span></div>`;
  if(C){const P=EDU_PROGS[C.k];const pc=Math.min(100,Math.round(C.h/C.need*100));h+=`<div class="sub"><b>${P.n}</b> · ${Math.round(C.h)}/${C.need} h${C.miss?huecos(U.faltas,{k:C.miss}):''}</div><div class="minibars"><i style="width:${pc}%;background:#7a6fd0"></i></div><div class="sub" style="font-size:11.5px">${huecos(U.horario,{dias:P.days.map(d=>WDS[d]).join(' '),a:P.sched[0],b:P.sched[1]})}</div><button class="btn grey" id="edudrop">${U.dejarlo}</button>`;}
  else{h+=`<details class="tracks"><summary>${U.matricularse}</summary>`;for(const k in EDU_PROGS){const P=EDU_PROGS[k];const why=eduCan(k);const c=Math.round(P.cost*PM());
    h+=`<div class="outrow"><span class="oe">${P.lv?EDU_LV[P.lv].e:'📄'}</span><span class="ot"><b>${P.n}</b><small>${huecos(U.horas,{h:eduHours(k),c:c?fmt(c):U.gratis,d:P.d})}${why?' · <i>'+why+'</i>':''}</small></span><button class="mini" data-edu="${k}" ${why?'disabled style="opacity:.45"':''}>${U.ir}</button></div>`;}h+=`</details>`;}
  const mul=eduPayMul();if(mul>1)h+=`<div class="sub" style="font-size:11.5px">${huecos(U.sube,{p:Math.round((mul-1)*100),t:TR().n.toLowerCase()})}</div>`;
  return h;}
{const _tb=trackBlock;trackBlock=function(){return _tb.apply(this,arguments)+eduBlock();};}
{const _bs=bindSociety;bindSociety=function(){_bs.apply(this,arguments);card.querySelectorAll('[data-edu]').forEach(b=>b.onclick=()=>{if(eduStart(b.dataset.edu))openMenu('trabajo');});const d=card.querySelector('#edudrop');if(d)d.onclick=()=>{eduDrop();openMenu('trabajo');};};}
// creador: nivel de estudios al empezar
{const _rc3=renderCreator;renderCreator=function(diff,edit){_rc3(diff,edit);try{if(edit)return;const anchor=[...card.querySelectorAll('.clab')].find(e=>/Dónde vive/.test(e.textContent));if(!anchor)return;cre.edu=cre.edu||'eso';
  const box=document.createElement('div');const U=TX_estudios.ui;box.innerHTML=`<div class="clab">${U.creador}</div><div class="chips">${['eso','bach','fpm','fps','grado'].map(k=>`<button class="chip${cre.edu===k?' on':''}" data-edu0="${k}">${EDU_LV[k].e} ${EDU_LV[k].n}</button>`).join('')}</div><div class="sub" style="font-size:11.5px">${cre.edu==='eso'?U.creador_eso:cre.edu==='grado'?U.creador_grado:U.creador_otro}</div>`;
  anchor.before(box);box.querySelectorAll('[data-edu0]').forEach(b=>b.onclick=()=>{cre.edu=b.dataset.edu0;renderCreator(diff,edit);});}catch(e){console.error(e);}};}
{const _ns=newState;newState=function(...a){const st=_ns.apply(this,a);try{if(typeof cre!=='undefined'&&cre&&cre.edu){st.edu={lv:cre.edu,done:[],certs:[],cur:null};if(cre.edu==='grado')st.money=Math.round(st.money*.7);else if(cre.edu==='fps')st.money=Math.round(st.money*.9);}}catch(e){}return st;};}
{const _nw=newToday;newToday=function(){const r=_nw.apply(this,arguments);try{if(S.payMulBase!=null){const m=eduPayMul();const expect=S.payMulBase*m;if(Math.abs((S.payMul||1)-expect)>1e-6){S.payMulBase=(S.payMul||1)/m;}}}catch(e){}return r;};}
{const _au2=autonomy;autonomy=function(){try{const C=ED().cur;const s=S.sim;if(C&&!s.use&&!(s.path&&s.path.length)&&!(s.work>0)&&!s.leaving){const h=S.t/60;const nd=S.needs;const P=EDU_PROGS[C.k];
  if(h>=9&&h<23&&!['hambre','vejiga','energia','higiene'].some(k=>nd[k]<40)&&Math.random()<(P.place==='online'?.12:.06)&&(C.homeDay!==S.day||Math.random()<.3)){const b=findObjs((d,t)=>t==='escritorio'||t==='compu'||t==='libros');if(b.length){C.homeDay=S.day;enqueue({k:'obj',i:b[0],act:S.obj[b[0]].t==='libros'?'leer':'estudiar'});if(throttled('estudia',6e5))toast(huecos(TX_estudios.ui.estudia,{}));return;}}}}catch(e){}return _au2.apply(this,arguments);};}
// las aspiraciones y los objetivos no pagan: dan ánimo, no dinero
{const _ac=aspCheck;aspCheck=function(){const m0=S.money;const r=_ac.apply(this,arguments);if(S.money>m0){const d=S.money-m0;S.money=m0;S.needs.diversion=Math.min(100,S.needs.diversion+25);S.needs.social=Math.min(100,S.needs.social+8);S.glow=S.day*1440+S.t+600;}return r;};}
{const _ck=checkGoals;checkGoals=function(){const m0=S.money;const r=_ck.apply(this,arguments);if(S.money>m0){S.money=m0;S.needs.diversion=Math.min(100,S.needs.diversion+15);}return r;};}
