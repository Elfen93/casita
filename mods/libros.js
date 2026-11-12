// =================== LIBROS Y OFICIOS: librería, biblioteca, estantería, manuales, escribir y pintar (despacio, como en la vida) ===================
const LB=()=>{const C=COL();C.own=C.own||[];C.lent=C.lent||null;C.reading=C.reading||null;C.man=C.man||[];C.wr=C.wr||0;C.art=C.art||0;C.fama=C.fama||0;C.proj=C.proj||null;C.sub=C.sub||[];C.pub=C.pub||[];C.obras=C.obras||[];C.inc=C.inc||0;C.tx=C.tx||[];return C;};
// catálogo: [título, minutos, emoji, categoría, precio, efecto]  cat: novela | ensayo | manual(sk) | oficio(wr|art) | texto(prog)
const BOOKCAT=DATA.libros.catalogo;
const BK=n=>BOOKCAT.find(b=>b[0]===n);
// precio en horas de salario mínimo (un libro: 2–3 horas), no en «precio del mundo»
const bookPrice=(base,mul=1)=>Math.round(base/12*HW()*2.4*mul);
for(const n of DATA.libros.en_casa)BOOKS.push([n,BK(n)[1],BK(n)[2]]); // los que ya tenía en casa
// manuales de estudio por programa
function manualFor(k){const P=EDU_PROGS[k];if(!P)return null;return {n:TXHZ.libros.manual_prefijo+P.n.replace(/^(FP medio|FP superior|Grado|Curso|Máster) · ?/,'').replace(/ \(.*\)/,''),p:P.cert?18:P.lv==='grado'||P.lv==='master'?48:30};}
const ownsBook=n=>LB().own.includes(n)||BOOKS.some(b=>b[0]===n)||LB().lent===n;
// ---- qué está leyendo ----
curBook=function(){const C=LB();const un=n=>!C.libDone.includes(n);if(C.reading&&un(C.reading)&&ownsBook(C.reading)){const b=BK(C.reading);return [b[0],b[1]];}
  C.reading=null;const cands=[...C.own,...(C.lent?[C.lent]:[]),...BOOKS.map(b=>b[0])].filter(un);if(!cands.length)return null;C.reading=cands[0];const b=BK(cands[0]);return [b[0],b[1]];};
// al terminar un libro: lo que enseña
{const _af=actFinish;actFinish=function(u,frac){const C=LB();const before=C.libDone.length;const r=_af.apply(this,arguments);try{if(C.libDone.length>before){const n=C.libDone[C.libDone.length-1];const b=BK(n);if(b){const fx=b[5]||{};if(fx.wr){C.wr=Math.min(10,C.wr+fx.wr);}if(fx.art)C.art=Math.min(10,C.art+fx.art);if(fx.sk)gainSkill(fx.sk,90);
      if(b[3]==='oficio')tell(huecos(TXHZ.libros.ha_ensenado_mas_esperaba,{nom:n,x:fx.wr?TXHZ.libros.escribir_aprende_leyendo_quien_sabe:TXHZ.libros.mirar_aprende_mirando_quien_sabe}),'📚');}
      if(C.lent===n){C.lent=null;C.lentDue=null;tell(huecos(TXHZ.libros.ha_devuelto_biblioteca_gratis_como,{nom:n}),'📚');}
      if(!curBook())setTimeout(()=>tell(huecos(TXHZ.libros.ha_quedado_sin_nada_leer,{}),'📚'),500);}}catch(e){}return r;};}
// ---- la librería y la biblioteca: salidas ----
{const _oc=outCost;outCost=function(k){if(['libreria','mercadillo','presta'].includes(k))return 0;return _oc.apply(this,arguments);};}
let shopEl=null;function closeShop(){if(shopEl)shopEl.classList.remove('on');}
function openShop(kind){const C=LB();if(!shopEl){shopEl=document.createElement('div');shopEl.id='shopmenu';document.body.appendChild(shopEl);}
  const mul=kind==='mercadillo'?.35:1;const free=kind==='presta';const E=ED();
  let items=BOOKCAT.filter(b=>!ownsBook(b[0])&&!C.libDone.includes(b[0]));
  if(kind==='mercadillo'){const r=seedRng('merc'+S.day);items=items.filter(()=>r()<.4);}
  const man=E.cur&&!C.man.includes(E.cur.k)?manualFor(E.cur.k):null;
  let h=`<div class="omt">${kind==='libreria'?TXHZ.libros.titulo_libreria:kind==='mercadillo'?TXHZ.libros.titulo_mercadillo:TXHZ.libros.titulo_biblioteca}</div><div class="sub" style="font-size:11.5px;padding:0 10px 6px">${free?TXHZ.libros.sub_gratis:kind==='mercadillo'?TXHZ.libros.sub_mercadillo:huecos(TXHZ.libros.sub_tiene,{c:fmt(Math.round(S.money)),x:E.cur?TXHZ.libros.manuales_al_fondo:''})}</div>`;
  if(man&&!free)h+=`<button class="oma" data-man="${E.cur.k}"><span>📖</span><span class="omn"><b>${man.n}</b><small>${huecos(TXHZ.libros.estudiar_casa_rinde_doble,{c:fmt(bookPrice(man.p,mul))})}</small></span></button>`;
  const cats={novela:TXHZ.libros.novela_poesia,ensayo:TXHZ.libros.ensayo,manual:TXHZ.libros.manuales_practicos,oficio:TXHZ.libros.oficio_escribir_pintar};
  for(const c of Object.keys(cats)){const L=items.filter(b=>b[3]===c);if(!L.length)continue;h+=`<div class="sub" style="font-size:11px;padding:6px 10px 2px;opacity:.7">${cats[c]}</div>`;
    for(const b of L){const p=bookPrice(b[4],mul);const fx=b[5]||{};const tag=fx.sk?SKILLS.find(s=>s[0]===fx.sk)[2]:fx.wr&&fx.art?TXHZ.libros.escribir_pintar:fx.wr?TXHZ.libros.etiqueta_escribir:fx.art?TXHZ.libros.etiqueta_pintar:'';h+=`<button class="oma${!free&&S.money<p?' lock':''}" data-buy="${b[0]}"><span>${b[2]}</span><span class="omn"><b>${b[0]}</b><small>${huecos(TXHZ.libros.h_lectura,{num:Math.round(b[1]/60*10)/10,x:tag?' · '+tag:'',x2:free?'':' · '+fmt(p)})}</small></span></button>`;}}
  if(!items.length)h+=`<div class="sub" style="padding:8px 10px">${TXHZ.libros.queda_nada_tenga_ya}</div>`;
  h+=`<button class="oma" data-close="1"><span>🚪</span><span class="omn"><b>${TXHZ.libros.salir}</b></span></button>`;
  shopEl.innerHTML=h;shopEl.classList.add('on');shopEl.style.left='50%';shopEl.style.top='50%';shopEl.style.transform='translate(-50%,-50%)';
  shopEl.querySelectorAll('[data-buy]').forEach(bt=>bt.onclick=()=>{const n=bt.dataset.buy;const b=BK(n);const p=free?0:bookPrice(b[4],mul);if(S.money<p){toast(TXHZ.libros.llega);sfx('bad');return;}
    if(free){C.lent=n;C.lentDue=S.day+21;tell(huecos(TXHZ.libros.ha_llevado_biblioteca_tres_semanas,{nom:n}),'🏛️');closeShop();return;}
    S.money-=p;bumpMoney();C.own.push(n);sfx('buy');toast(huecos(TXHZ.libros.txt,{x:b[2],nom:n,c:fmt(p)}));C.tx.push(['libro',-p,S.day]);if(!C.reading)C.reading=n;openShop(kind);});
  shopEl.querySelectorAll('[data-man]').forEach(bt=>bt.onclick=()=>{const k=bt.dataset.man;const m=manualFor(k);const p=bookPrice(m.p,mul);if(S.money<p){toast(TXHZ.libros.llega);sfx('bad');return;}S.money-=p;bumpMoney();C.man.push(k);sfx('buy');tell(huecos(TXHZ.libros.ha_comprado_libros_texto_nunca,{x:m.n.toLowerCase(),c:fmt(p)}),'📖');openShop(kind);});
  const cl=shopEl.querySelector('[data-close]');if(cl)cl.onclick=closeShop;}
{const _mo=maybeOuting;maybeOuting=function(){S.outAuto=true;try{return _mo.apply(this,arguments);}finally{S.outAuto=false;}};}
{const _do=doOut;doOut=function(k){S.outManual=!S.outAuto;return _do.apply(this,arguments);};}
function libReturn(){const C=LB();if(!C.lent)return;const n=C.lent;const done=C.libDone.includes(n);C.lent=null;C.lentDue=null;C.renewed=0;if(C.reading===n)C.reading=null;tell(done?huecos(TXHZ.libros.ha_devuelto_biblioteca,{nom:n}):huecos(TXHZ.libros.ha_devuelto_sin_terminarlo_leido,{nom:n,num:Math.round((C.lib[n]||0)/BK(n)[1]*100)}),'🏛️');}
function autoBuyBook(k){const C=LB();if(k==='presta'&&C.lent)libReturn();const items=BOOKCAT.filter(b=>!ownsBook(b[0])&&!C.libDone.includes(b[0])&&(k==='presta'||bookPrice(b[4],k==='mercadillo'?.35:1)<Math.max(0,S.money)*.1));if(!items.length)return;const b=pickR(items);
  if(k==='presta'){C.lent=b[0];C.lentDue=S.day+21;tell(huecos(TXHZ.libros.ha_llevado_biblioteca,{x:b[0]}),'🏛️');}else{const p=bookPrice(b[4],k==='mercadillo'?.35:1);S.money-=p;C.own.push(b[0]);C.tx.push(['libro',-p,S.day]);tell(huecos(TXHZ.libros.ha_vuelto,{x:k==='mercadillo'?TXHZ.libros.del_mercadillo:TXHZ.libros.libreria,x2:b[0],c:fmt(p)}),'📚');}if(!C.reading)C.reading=b[0];}
{const _ob=outBack;outBack=function(k){if(k==='libreria'||k==='mercadillo'||k==='presta'){S.needs.diversion=Math.min(100,S.needs.diversion+10);
    if(!S.outManual){autoBuyBook(k);return;}
    if(k==='presta'&&LB().lent)libReturn();
    setTimeout(()=>{try{openShop(k);}catch(e){console.error(e);}},200);return;}
  return _ob.apply(this,arguments);};}
// devolver el préstamo tarde cuesta
{const _dl=dailyEvents;dailyEvents=function(){const r=_dl.apply(this,arguments);try{const C=LB();if(C.lent&&C.lentDue&&S.day>=C.lentDue){if(!C.renewed&&!C.libDone.includes(C.lent)){C.renewed=1;C.lentDue=S.day+21;tell(huecos(TXHZ.libros.ha_renovado_desde_movil_tres,{C_lent:C.lent}),'🏛️');}else{libReturn();}}
  if(S.autoHome&&!curBook()&&!C.lent&&Math.random()<.08&&S.t/60<9){C.autoShop=true;}}catch(e){}return r;};}
// la IA compra o pide libros si no tiene nada que leer
{const _au=autonomy;autonomy=function(){try{const C=LB();const s=S.sim;const h=S.t/60;if(S.autoHome&&C.autoShop&&!(s.work>0)&&!s.leaving&&h>=10&&h<19&&S.outDay!==S.day){C.autoShop=false;const k=S.money>60&&Math.random()<.4?'libreria':'presta';if(!outAvail(k)){
    // compra automática sin menú
    const items=BOOKCAT.filter(b=>!ownsBook(b[0])&&!C.libDone.includes(b[0])&&(k==='presta'||bookPrice(b[4])<S.money*.1));if(items.length){const b=pickR(items);if(k==='presta'){C.lent=b[0];C.lentDue=S.day+21;tell(huecos(TXHZ.libros.ha_pasado_biblioteca_ha_llevado,{x:b[0]}),'🏛️');}else{const p=bookPrice(b[4]);S.money-=p;C.own.push(b[0]);C.tx.push(['libro',-p,S.day]);tell(huecos(TXHZ.libros.ha_entrado_libreria_solo_mirar,{c:fmt(p),x:b[0]}),'📚');}C.reading=b[0];}
    S.outDay=S.day;S.needs.diversion=Math.min(100,S.needs.diversion+8);}}}catch(e){}return _au.apply(this,arguments);};}
// ---- estantería y librería: elegir, ordenar, estudiar ----
function pickBookMenu(){const C=LB();const un=[...C.own,...(C.lent?[C.lent]:[]),...BOOKS.map(b=>b[0])].filter(n=>!C.libDone.includes(n));if(!un.length){toast(TXHZ.libros.tiene_nada_sin_leer);return;}
  if(!objMenuEl)openObjMenu(0);let h=`<div class="omt">${TXHZ.libros.lee}</div>`;for(const n of un){const b=BK(n);const pr=Math.round((C.lib[n]||0)/b[1]*100);h+=`<button class="oma" data-pk="${n}"><span>${b[2]}</span><span class="omn"><b>${n}</b><small>${pr?huecos(TXHZ.libros.leido_pct,{pr}):TXHZ.libros.sin_empezar}${C.lent===n?TXHZ.libros.prestamo:''}</small></span></button>`;}
  objMenuEl.innerHTML=h;objMenuEl.classList.add('on');objMenuEl.style.left='50%';objMenuEl.style.top='40%';objMenuEl.style.transform='translate(-50%,0)';
  objMenuEl.querySelectorAll('[data-pk]').forEach(bt=>bt.onclick=()=>{C.reading=bt.dataset.pk;closeObjMenu();objMenuEl.style.transform='';toast('📖 '+bt.dataset.pk);});}
{const _om=openObjMenu;openObjMenu=function(i){const r=_om.apply(this,arguments);try{if(objMenuEl)objMenuEl.style.transform='';}catch(e){}return r;};}
// ---- escribir: un proyecto largo, un oficio que se aprende, un mercado que no quiere ----
const WR_KINDS=DATA.libros.escritos;
const WR_TITLES=DATA.libros.titulos;
function wrStart(kind){const C=LB();if(C.proj){toast(huecos(TXHZ.libros.algo_a_medias,{t:C.proj.t}));return;}C.proj={k:kind,t:pickR(WR_TITLES),h:0,need:WR_KINDS[kind].h,since:S.day,rev:0};tell(huecos(TXHZ.libros.ha_empezado,{x:WR_KINDS[kind].n,C_proj_t:C.proj.t,x2:kind==='novela'?TXHZ.libros.nadie_ha_pedido_asi_empiezan:''}),'✍️');}
function wrQuality(p){const C=LB();const read=C.libDone.filter(n=>{const b=BK(n);return b&&(b[3]==='novela'||b[3]==='oficio');}).length;const base=C.wr*.22+Math.min(2,read*.2)+Math.min(.9,(p.rev||0)*.3)+(T('artista')?.4:0)+(T('despistada')?-.3:0)-(p.k==='novela'?.6:0);const r=base+(seedRng('wq'+p.t+p.since)()-.5)*.9;return r<.6?0:r<1.6?1:r<2.6?2:3;}
{const _af2=actFinish;actFinish=function(u,frac){const a=ACT_DEF(u.type,u.act);const fx=a&&a[8];if(!['escribir','enviar','elegir','ordenar','estudiar','pintar','vender'].includes(fx))return _af2.apply(this,arguments);
  const C=LB(),n=CH().name,x=u.i%N+.5,y=(u.i/N|0)+.5;const ft=(t,c='#2e8b57')=>floatText(t,x,y,46,c);if(frac<.6){if(frac>.15)ft(TXHZ.libros.medias,'#8a7f99');return;}
  switch(fx){
    case 'elegir':setTimeout(pickBookMenu,100);break;
    case 'ordenar':{const tot=C.own.length+BOOKS.length;ft(huecos(TXHZ.libros.libros_leidos,{tot,C_libDone_length:C.libDone.length}),'#6b6e3c');S.needs.diversion=Math.min(100,S.needs.diversion+5);if(Math.random()<.3)tell(huecos(pickR(TXHZ.libros.ordenando_estanteria_ha_encontrado_bille_lista),{nom:n,x:tot-C.libDone.length}),'📚');break;}
    case 'estudiar':{const E=ED();if(!E.cur){ft(huecos(TXHZ.libros.no_matriculado,{}),'#8a7f99');break;}gainSkill(EDU_PROGS[E.cur.k].sk||'logica',a[3]*.25);ft(C.man.includes(E.cur.k)?huecos(TXHZ.libros.h_manual,{num:Math.round(E.cur.h),E_cur_need:E.cur.need}):huecos(TXHZ.libros.h_sin_manual_rinde_mitad,{num:Math.round(E.cur.h),E_cur_need:E.cur.need}),'#3a5a9a');break;}
    case 'escribir':{if(!C.proj){setTimeout(wrPickMenu,100);break;}const p=C.proj;const hrs=a[3]*frac/60;if(p.done){p.rev=Math.min(4,(p.rev||0)+hrs/(p.k==='novela'?25:p.k==='poemario'?8:3));p.q=wrQuality(p);ft(huecos(TXHZ.libros.reescribiendo,{p_t:p.t,x:Q[p.q]}),'#7d3aa8');if(Math.random()<.15)tell(pickR([huecos(TXHZ.libros.reescribe_principio_quinta_vez,{nom:n,p_t:p.t}),huecos(TXHZ.libros.revisar_quitar_adjetivos,{n}),huecos(TXHZ.libros.ha_leido_voz_alta_ahora,{nom:n,p_t:p.t})]),'✏️');break;}p.h+=hrs;C.wr=Math.min(10,C.wr+hrs*.012*(C.libDone.length>=3?1:.4));S.needs.diversion=Math.min(100,S.needs.diversion+4);
      if(p.h>=p.need){p.done=true;p.q=wrQuality(p);ft(huecos(TXHZ.libros.terminad,{x:WR_KINDS[p.k].e,p_t:p.t,x2:Q[p.q]}),'#7d3aa8');tell(p.k==='novela'?huecos(TXHZ.libros.ha_terminado_meses_horas_robadas,{nom:n,p_t:p.t,num:Math.round((S.day-p.since)/30),num2:Math.round(p.h),x:p.q>=2?TXHZ.libros.buena_sabe_eso_da_mas:p.q>=1?TXHZ.libros.sabe_si_buena_nadie_sabe:TXHZ.libros.sabe_buena_todavia_reescribir_escribir}):huecos(TXHZ.libros.ha_terminado,{nom:n,x:WR_KINDS[p.k].n,p_t:p.t,x2:Q[p.q]}),'✍️');}
      else ft(huecos(TXHZ.libros.txt2,{num:Math.round(p.h/p.need*100),p_t:p.t}),'#7d3aa8');
      if(Math.random()<.08)tell(huecos(pickR(TXHZ.libros.ha_escrito_dos_paginas_borrado_lista),{nom:n}),'✍️');break;}
    case 'enviar':{const p=C.proj;if(!p||!p.done){ft(TXHZ.libros.hay_nada_terminado,'#8a7f99');break;}setTimeout(()=>wrSendMenu(p),100);break;}
    case 'pintar':{const o=C.cur_art||(C.cur_art={t:pickR(TXHZ.libros.patio_interior_lista),h:0,need:18+Math.random()*14,since:S.day});const hrs=a[3]*frac/60;o.h+=hrs;C.art=Math.min(10,C.art+hrs*.03);S.needs.diversion=Math.min(100,S.needs.diversion+6);S.money-=Math.round(1.5*PM()*frac);
      if(o.h>=o.need){const read=C.libDone.filter(nn=>{const b=BK(nn);return b&&b[5]&&b[5].art;}).length;const v=C.art*.25+read*.3+(T('artista')?.5:0)+(Math.random()-.5);o.q=v<.6?0:v<1.5?1:v<2.5?2:3;C.obras.push(o);C.cur_art=null;ft(huecos(TXHZ.libros.txt3,{o_t:o.t,x:Q[o.q]}),'#7d3aa8');tell(huecos(TXHZ.libros.ha_terminado_cuadro_apilados,{nom:n,o_t:o.t,x:o.q>=3?TXHZ.libros.hay_algo_ahi_verdad:o.q>=2?TXHZ.libros.esta_bien_ensenaria_alguien:o.q>=1?TXHZ.libros.correcto_decorativo_diria_critico_cruel:TXHZ.libros.va_girar_contra_pared,C_obras_length:C.obras.length,x2:C.obras.length>1?'s':''}),'🎨');}
      else ft(huecos(TXHZ.libros.txt4,{num:Math.round(o.h/o.need*100),o_t:o.t}),'#7d3aa8');break;}
  }};}
function wrPickMenu(){if(!objMenuEl)openObjMenu(0);let h=`<div class="omt">${TXHZ.libros.escribe}</div>`;for(const k in WR_KINDS){const K=WR_KINDS[k];h+=`<button class="oma" data-wk="${k}"><span>${K.e}</span><span class="omn"><b>${K.n[0].toUpperCase()+K.n.slice(1)}</b><small>${huecos(TXHZ.libros.unas_horas,{K_h:K.h,x:k==='novela'?TXHZ.libros.meses:k==='poemario'?TXHZ.libros.semanas:TXHZ.libros.dias})}</small></span></button>`;}
  objMenuEl.innerHTML=h;objMenuEl.classList.add('on');objMenuEl.querySelectorAll('[data-wk]').forEach(b=>b.onclick=()=>{wrStart(b.dataset.wk);closeObjMenu();});}
function wrSendMenu(p){if(!objMenuEl)openObjMenu(0);const C=LB();p.q=wrQuality(p);const opts=p.k==='novela'?[['edit','🏢',TXHZ.libros.mandarla_editoriales,TXHZ.libros.meses_espera_casi_todas_dicen],['auto','🖨️',TXHZ.libros.autopublicar,huecos(TXHZ.libros.imprimir_50_venderlos_mano,{c:fmt(Math.round(180*PM()))})],['ebook','📱',TXHZ.libros.ebook_plataforma,TXHZ.libros.gratis_plataforma_queda_30],['cajon','🗄️',TXHZ.libros.guardarla_cajon,TXHZ.libros.empezar_otra]]:
    p.k==='poemario'?[['edit','🏢',TXHZ.libros.mandarlo_editorial_pequena,TXHZ.libros.tiradas_300_pagan_ejemplares],['concurso','🏆',TXHZ.libros.concurso_poesia,TXHZ.libros.premio_entre_400_originales],['cajon','🗄️',TXHZ.libros.al_cajon,'']]:
    p.k==='relato'?[['concurso','🏆',TXHZ.libros.concurso_relatos,TXHZ.libros.jurado_2_meses_premio],['revista','📰',TXHZ.libros.mandarlo_revista,TXHZ.libros.pagan_poco_o_nada_da],['cajon','🗄️',TXHZ.libros.al_cajon,'']]:
    [['medio','📰',TXHZ.libros.proponerlo_medio,TXHZ.libros.si_cogen_pagan_algo],['blog','🌐',TXHZ.libros.publicarlo_gratis_internet,TXHZ.libros.leen_cuatro_da_nombre],['cajon','🗄️',TXHZ.libros.al_cajon,'']];
  let h=`<div class="omt">📮 «${p.t}» ${Q[p.q]}</div>`;for(const [k,e,t,s] of opts)h+=`<button class="oma" data-ws="${k}"><span>${e}</span><span class="omn"><b>${t}</b><small>${s}</small></span></button>`;
  objMenuEl.innerHTML=h;objMenuEl.classList.add('on');objMenuEl.querySelectorAll('[data-ws]').forEach(b=>b.onclick=()=>{wrSubmit(p,b.dataset.ws);closeObjMenu();});}
function wrSubmit(p,how){const C=LB();const n=CH().name;C.proj=null;
  if(how==='cajon'){C.pub.push({...p,how:'cajon'});tell(huecos(TXHZ.libros.va_al_cajon_otros_dice,{p_t:p.t,nom:n}),'🗄️');return;}
  if(how==='auto'){const c=Math.round(180*PM());if(S.money<c){toast(TXHZ.libros.llega_para_imprimir);C.proj=p;return;}S.money-=c;C.tx.push(['imprenta',-c,S.day]);C.pub.push({...p,how:'auto',stock:50,sold:0});tell(huecos(TXHZ.libros.ha_pagado_50_ejemplares_imprenta,{nom:n,c:fmt(c),p_t:p.t}),'🖨️');return;}
  if(how==='ebook'||how==='blog'){C.pub.push({...p,how,sold:0});C.fama+=p.q*.3+.2;tell(how==='ebook'?huecos(TXHZ.libros.ya_esta_plataforma_2_99,{p_t:p.t,nom:n}):huecos(TXHZ.libros.ha_publicado_internet_han_leido,{nom:n,p_t:p.t,x:4+p.q*6}),'📱');return;}
  const wait=how==='edit'?60+(Math.random()*80|0):how==='concurso'?45+(Math.random()*40|0):how==='revista'?20+(Math.random()*30|0):7+(Math.random()*14|0);
  C.sub.push({...p,how,due:S.day+wait});tell(how==='edit'?huecos(TXHZ.libros.ha_mandado_ahora_esperar_editoriales,{nom:n,p_t:p.t,x:p.k==='novela'?TXHZ.libros.ocho_editoriales:TXHZ.libros.tres_editoriales_pequenas}):how==='concurso'?huecos(TXHZ.libros.va_concurso_cuenta_nadie_si,{p_t:p.t,nom:n}):how==='medio'?huecos(TXHZ.libros.ha_propuesto_medio_redactor_jefe,{nom:n,p_t:p.t}):huecos(TXHZ.libros.enviado_revista_dicen_contestan_mes,{p_t:p.t}),'📮');}
// respuestas: llegan tarde y casi siempre son no
{const _dl2=dailyEvents;dailyEvents=function(){const r=_dl2.apply(this,arguments);try{const C=LB();const n=CH().name;
  for(const s of C.sub.slice()){if(S.day<s.due)continue;C.sub.splice(C.sub.indexOf(s),1);const f=C.fama;let ok;
    if(s.how==='edit')ok=Math.random()<[.01,.04,.13,.3][s.q]+f*.02;else if(s.how==='concurso')ok=Math.random()<[.005,.03,.1,.25][s.q]+f*.01;else if(s.how==='revista')ok=Math.random()<[.05,.2,.5,.8][s.q]+f*.03;else ok=Math.random()<[.1,.3,.6,.85][s.q]+f*.04;
    if(!ok){C.rej=(C.rej||0)+1;try{MT().an-=s.k==='novela'?4:1.5;}catch(e){}tell(s.how==='edit'?pickR([huecos(TXHZ.libros.editorial_rechazo,{t:s.t,otras:s.k==='novela'?TXHZ.libros.siete:TXHZ.libros.dos,noes:C.rej>3?huecos(TXHZ.libros.van_noes,{k:C.rej}):''}),huecos(TXHZ.libros.editorial_ha_devuelto_nota_mano,{s_t:s.t,nom:n}),huecos(TXHZ.libros.correo_tipo_sobre_gran_volumen,{s_t:s.t,c:fmt(Math.round(600*PM()))})]):s.how==='concurso'?huecos(TXHZ.libros.concurso_ya_tiene_ganador,{s_t:s.t,x:Math.random()<.3?TXHZ.libros.ganador_sobrino_alguien_del_jurado:''}):huecos(TXHZ.libros.quieren_ni_han_explicado,{s_t:s.t}),'📭');
      if(s.k==='novela'&&!S.story.chap.rechazo)chapter('rechazo',TXHZ.libros.cajon,huecos(TXHZ.libros.nadie_quiere_ha_pasado_meses,{s_t:s.t,nom:n}));C.proj=null;C.pub.push({...s,how:'cajon'});continue;}
    // sí
    if(s.how==='edit'){const adv=Math.round((s.k==='novela'?[0,400,900,1800][s.q]:0)*PM());bkAdd('Ingreso',adv);C.inc+=adv;C.fama+=1+s.q*.5;C.pub.push({...s,how:'edit',sold:0,adv});C.tx.push(['anticipo',adv,S.day]);chapter('publica'+C.pub.length,huecos(TXHZ.libros.publicado_titulo,{}),huecos(TXHZ.libros.editorial_si,{peq:s.k==='novela'?'':TXHZ.libros.pequena,t:s.t,anticipo:adv?huecos(TXHZ.libros.anticipo,{c:fmt(adv)}):huecos(TXHZ.libros.en_ejemplares,{})}));toast(huecos(TXHZ.libros.publican,{t:s.t}),true);sfx('level');}
    else if(s.how==='concurso'){const prize=Math.round([0,150,400,1200][s.q]*PM());bkAdd('Premio',prize);C.inc+=prize;C.fama+=.8;C.tx.push(['premio',prize,S.day]);tell(huecos(TXHZ.libros.ha_ganado_concurso_placa_ha,{s_t:s.t,c:fmt(prize),nom:n}),'🏆');sfx('level');}
    else{const pay=Math.round((s.how==='medio'?[0,40,70,120][s.q]:[0,0,30,60][s.q])*PM());bkAdd('Ingreso',pay);C.inc+=pay;C.fama+=.5;C.tx.push(['colaboración',pay,S.day]);tell(pay?huecos(TXHZ.libros.publican_brutos_factura_como_autonom,{s_t:s.t,c:fmt(pay)}):huecos(TXHZ.libros.publican_revista_pagan_visibilidad_ha,{s_t:s.t,nom:n}),'📰');}}
  // ventas lentas de lo publicado
  if(dateOf(S.day).wd===0){for(const p of C.pub){if(p.how==='cajon'||p.how==='blog')continue;let s=0;const lam=(p.how==='edit'?2.5:p.how==='ebook'?.6:.9)*(.3+p.q*.5)*(1+C.fama*.15)*Math.exp(-((S.day-(p.pubDay||S.day))/200));for(let i=0;i<12;i++)if(Math.random()<lam/12)s++;
      if(p.how==='auto'){s=Math.min(s,p.stock-p.sold);p.sold+=s;const v=Math.round(s*9*PM());S.money+=v;C.inc+=v;if(s&&throttled('vauto',3e5))tell(huecos(TXHZ.libros.ha_vendido_ejemplar_quedan_armario,{nom:n,s,x:s>1?TXHZ.libros.es:'',p_t:p.t,x2:pickR([TXHZ.libros.bar,TXHZ.libros.companera,TXHZ.libros.presentacion_del_centro_social,TXHZ.libros.madre_ya_tenia_dos]),x3:p.stock-p.sold}),'📘');}
      else{p.sold+=s;const roy=p.how==='edit'?Math.round(s*1.4*PM()):Math.round(s*2.1*PM());if(p.how==='edit'){p.roy=(p.roy||0)+roy;if(p.roy>(p.adv||0)){S.money+=roy;C.inc+=roy;}}else{S.money+=roy;C.inc+=roy;}
        if(s&&Math.random()<.2)tell(p.how==='edit'?huecos(TXHZ.libros.liquidacion,{t:p.t,vendidos:p.sold,cubre:p.roy>(p.adv||0)?huecos(TXHZ.libros.cubre_si,{c:fmt(roy)}):TXHZ.libros.cubre_no}):huecos(TXHZ.libros.descarga_esta_semana_resena_estrella,{p_t:p.t,s,x:s>1?'s':'',c:fmt(roy)}),'📱');}}}
  // autónomos: si gana algo regular, Hacienda se acuerda
  if(C.inc-(C.incTaxed||0)>=600*PM()){const t=Math.round((C.inc-(C.incTaxed||0))*.19);bkAdd('Hacienda',-t);C.incTaxed=C.inc;tell(huecos(TXHZ.libros.hacienda_retencion,{c:fmt(t),n}),'🏛️');}
  }catch(e){console.error(e);}return r;};}
// ---- pintar: el caballete ----
if(typeof MUEB_NEW!=='undefined')MUEB_NEW.push('caballete');if(typeof ONOBJ!=='undefined')ONOBJ.add('caballete');
MDRAW.caballete=(o,i,tt,u,anaOn)=>{const w=O_COL(o,'#a0714f');lp(.18,.5,.22,.54,0,42,w);lp(.78,.5,.82,.54,0,42,w);lp(.48,.78,.52,.82,0,36,w);lp(.2,.5,.8,.52,22,24,w);
  const C=(typeof LB==='function')?LB():null;const cur=C&&C.cur_art;const pr=cur?Math.min(1,cur.h/cur.need):0;const [a,b]=LP(.5,.5,0);
  poly([LP(.24,.48,24),LP(.76,.48,24),LP(.76,.48,42),LP(.24,.48,42)],'#f1ece0');if(pr>0){const cols=['#c9524a','#5a7fb0','#d8a640','#5f9a5a','#8b5e8b'];const r=seedRng('cu'+(cur.t||''));const k=Math.ceil(pr*5);for(let j=0;j<k;j++){const x0=.27+r()*.4,z0=26+r()*12;poly([LP(x0,.479,z0),LP(x0+.08+r()*.1,.479,z0),LP(x0+.08+r()*.1,.479,z0+3+r()*5),LP(x0,.479,z0+3+r()*5)],cols[j%5]);}}
  lp(.26,.44,.74,.5,0,1.5,'#6e4e38');};
{const _af3=actFinish;actFinish=function(u,frac){const a=ACT_DEF(u.type,u.act);if(a&&a[8]==='vender'){setTimeout(artSellMenu,100);return;}return _af3.apply(this,arguments);};}
function artSellMenu(){const C=LB();const n=CH().name;if(!C.obras.length){toast(TXHZ.libros.tiene_cuadros_terminados);return;}if(!objMenuEl)openObjMenu(0);
  let h=`<div class="omt">${huecos(TXHZ.libros.cuadro,{C_obras_length:C.obras.length,x:C.obras.length>1?'s':'',x2:C.obras.map(o=>Q[o.q]).join(' ')})}</div>`;
  for(const [k,e,t,s] of [['merc','🧺',TXHZ.libros.mercadillo_artesania,TXHZ.libros.domingo_turistas_regatean],['online','🌐',TXHZ.libros.subirlos_plataforma,TXHZ.libros.comision_20],['gal','🏛️',TXHZ.libros.llevar_carpeta_galeria,TXHZ.libros.casi_siempre_si_si_quedan],['colgar','🔨',TXHZ.libros.colgar_uno_casa,TXHZ.libros.venderlo]])h+=`<button class="oma" data-as="${k}"><span>${e}</span><span class="omn"><b>${t}</b><small>${s}</small></span></button>`;
  objMenuEl.innerHTML=h;objMenuEl.classList.add('on');objMenuEl.querySelectorAll('[data-as]').forEach(b=>b.onclick=()=>{artSell(b.dataset.as);closeObjMenu();});}
function artSell(how){const C=LB();const n=CH().name;const best=C.obras.slice().sort((a,b)=>b.q-a.q);
  if(how==='colgar'){const o=best[0];const wall=findObjs(()=>false);let i=-1;for(let k=0;k<N*N;k++){if(S.obj[k])continue;const x=k%N,y=k/N|0;if(!inArea(x,y)||!S.floor[k])continue;for(let r=0;r<4;r++){const dx=[0,1,0,-1][r],dy=[-1,0,1,0][r];const w=S.wall[(y+dy)*N+x+dx];if((w===1)&&!S.obj[(y+dy)*N+x+dx]){i=k;S.obj[k]={t:'cuadro',q:o.q>=2?4:3,c:100,r,own:o.t};break;}}if(i>=0)break;}
    if(i<0){toast(TXHZ.libros.hay_pared_libre);return;}C.obras.splice(C.obras.indexOf(o),1);dirty();try{uidSweep();}catch(e){}tell(huecos(TXHZ.libros.ha_colgado_casa_cada_vez,{nom:n,o_t:o.t}),'🖼️');return;}
  if(how==='merc'){let sold=0,v=0;for(const o of best.slice(0,4)){if(Math.random()<[.05,.2,.45,.7][o.q]){sold++;const p=Math.round([10,25,45,80][o.q]*PM()*(.7+Math.random()*.6));v+=p;C.obras.splice(C.obras.indexOf(o),1);}}S.money+=v;C.inc+=v;C.tx.push(['mercadillo',v,S.day]);S.outDay=S.day;
    tell(sold?huecos(TXHZ.libros.mercadillo_vendido,{n,sold,s:sold>1?'s':'',c:fmt(v)}):huecos(TXHZ.libros.mercadillo_cero,{c:fmt(Math.round(15*PM()))}),'🧺');if(!sold)S.money-=Math.round(15*PM());return;}
  if(how==='online'){for(const o of best)o.online=true;C.fama+=.2;tell(huecos(TXHZ.libros.ha_subido_cuadro_plataforma_entre,{nom:n,best_length:best.length,x:best.length>1?'s':''}),'🌐');return;}
  if(how==='gal'){const o=best[0];const ok=Math.random()<[.0,.03,.15,.4][o.q]+C.fama*.02;if(!ok){try{MT().an-=2;}catch(e){}tell(pickR([huecos(TXHZ.libros.galeria_han_mirado_carpeta_treinta,{nom:n}),huecos(TXHZ.libros.galerista_ha_preguntado_donde_ha,{nom:n}),TXHZ.libros.galeria_figurativo]),'🏛️');return;}
    C.expo={day:S.day+30,obras:best.slice(0,3)};for(const x of C.expo.obras)C.obras.splice(C.obras.indexOf(x),1);C.fama+=1;chapter('expo',TXHZ.libros.exposicion,huecos(TXHZ.libros.galeria_pequena_expone_tres_cuadros,{nom:n}));}}
{const _dl3=dailyEvents;dailyEvents=function(){const r=_dl3.apply(this,arguments);try{const C=LB();const n=CH().name;if(C.expo&&S.day>=C.expo.day){let v=0,s=0;for(const o of C.expo.obras){if(Math.random()<[.1,.3,.55,.8][o.q]){s++;v+=Math.round([60,150,300,600][o.q]*PM()*.5);}}S.money+=v-Math.round(60*PM());C.inc+=v;C.tx.push(['galería',v,S.day]);tell(s?huecos(TXHZ.libros.inauguracion_vendidos_3_llegan_tras,{s,nom:n,c:fmt(v)}):TXHZ.libros.inauguracion_cero,'🏛️');if(!s)C.obras.push(...C.expo.obras);else C.obras.push(...C.expo.obras.filter(()=>Math.random()<.4));C.expo=null;}
  if(dateOf(S.day).wd===0){const on=C.obras.filter(o=>o.online);for(const o of on){if(Math.random()<[.01,.04,.1,.2][o.q]*(1+C.fama*.1)){const p=Math.round([20,45,90,160][o.q]*PM()*.8);S.money+=p;C.inc+=p;C.obras.splice(C.obras.indexOf(o),1);tell(huecos(TXHZ.libros.venta_online_despues_comision_envio,{o_t:o.t,c:fmt(p),nom:n,c2:fmt(Math.round(8*PM()))}),'🌐');S.money-=Math.round(8*PM());}}}}catch(e){console.error(e);}return r;};}
// ---- la IA escribe o pinta si le va ----
{const _au2=autonomy;autonomy=function(){try{const C=LB();const s=S.sim;const h=S.t/60;if(S.autoHome&&!s.use&&!(s.path&&s.path.length)&&!(s.work>0)&&h>=18&&h<23&&Math.random()<.025&&!['hambre','vejiga','energia'].some(k=>S.needs[k]<35)){
    const wants=T('artista')||C.wr>=1||C.proj||C.art>=1;if(wants){const e=findObjs((d,t)=>t==='caballete');const w=findObjs((d,t)=>t==='escritorio'||t==='compu');
      if(e.length&&(C.art>=C.wr||!w.length)&&Math.random()<.5&&S.money>20){enqueue({k:'obj',i:e[0],act:'pintar'});return;}
      if(w.length){if(!C.proj){const k=Math.random()<.5?'relato':Math.random()<.5?'articulo':C.wr>=3?'novela':'relato';wrStart(k);}if(C.proj&&C.proj.done){const p=C.proj;wrSubmit(p,p.k==='novela'?(Math.random()<.6?'edit':'ebook'):p.k==='relato'?'concurso':p.k==='articulo'?'medio':'edit');return;}enqueue({k:'obj',i:w[0],act:'escribir'});return;}}}}catch(e){}return _au2.apply(this,arguments);};}
// ---- perfil: el oficio ----
{const _om2=openMenu;openMenu=function(...a){const r=_om2.apply(this,a);try{if(menuTab==='perfil'){const C=LB();const box=card.querySelector('#colbox');if(box&&!card.querySelector('#ofbox')&&(C.wr>0||C.art>0||C.proj||C.pub.length||C.obras.length||C.own.length)){const d=document.createElement('div');d.id='ofbox';
      const lst=(arr,f)=>arr.length?arr.map(f).join(''):`<span class="sub" style="font-size:11.5px">${TXHZ.libros.nada_todavia}</span>`;
      d.innerHTML=`<h3>${TXHZ.libros.oficio}</h3><div class="colg"><div class="sub" style="font-size:12px">${huecos(TXHZ.libros.libros_casa_leidos_escritura_10,{x:C.own.length+BOOKS.length,x2:C.lent?TXHZ.libros.n1_biblioteca:'',C_libDone_length:C.libDone.length,x3:C.wr.toFixed(1),x4:C.art.toFixed(1),x5:C.fama.toFixed(1)})}</div>
      ${C.proj?`<div><b>${TXHZ.libros.en_marcha}</b> ${huecos(TXHZ.libros.proyecto_marcha,{e:WR_KINDS[C.proj.k].e,t:C.proj.t,h:Math.round(C.proj.h),need:C.proj.need,fin:C.proj.done?huecos(TXHZ.libros.terminado_sin_enviar,{}):''})}</div>`:''}
      ${C.sub.length?`<div><b>${TXHZ.libros.esperando_respuesta}</b> ${C.sub.map(s=>huecos(TXHZ.libros.envio,{t:s.t,how:s.how,d:Math.max(0,s.due-S.day)})).join(' · ')}</div>`:''}
      <div><b>${huecos(TXHZ.libros.publicado_guardado,{C_pub_length:C.pub.length})}</b>${lst(C.pub.slice(-6),p=>`<span class="chipc">${Q[p.q]} «${p.t}» · ${p.how==='cajon'?TXHZ.libros.how_cajon:p.how==='edit'?huecos(TXHZ.libros.how_editorial,{v:p.sold||0}):p.how==='auto'?huecos(TXHZ.libros.how_autoed,{v:p.sold,s:p.stock}):p.how==='ebook'?huecos(TXHZ.libros.how_ebook,{v:p.sold||0}):p.how}</span>`)}</div>
      <div><b>${huecos(TXHZ.libros.cuadros_sin_vender,{C_obras_length:C.obras.length})}</b>${lst(C.obras.slice(-6),o=>`<span class="chipc">${Q[o.q]} ${o.t}${o.online?' 🌐':''}</span>`)}</div>
      <div class="sub" style="font-size:11.5px">${huecos(TXHZ.libros.ganado_oficio,{c:fmt(Math.round(C.inc)),x:C.rej?huecos(TXHZ.libros.rechazos,{r:C.rej}):''})}</div></div>`;box.after(d);}}}catch(e){console.error(e);}return r;};}
// aspiraciones del oficio
ASP.push({id:'novela',c:'vida',e:'📘',t:()=>TXHZ.libros.terminar_novela,w:()=>LB().wr>=1.5||T('artista')?1.2:0,start:()=>LB().pub.filter(p=>p.k==='novela').length+(LB().proj&&LB().proj.k==='novela'&&LB().proj.done?1:0),ok:b=>LB().pub.filter(p=>p.k==='novela').length+(LB().proj&&LB().proj.k==='novela'&&LB().proj.done?1:0)>b,r:3},
  {id:'publicar',c:'vida',e:'🏢',t:()=>TXHZ.libros.editorial_publique_algo_suyo,w:()=>LB().pub.length||LB().sub.length?1:0,start:()=>LB().pub.filter(p=>p.how==='edit').length,ok:b=>LB().pub.filter(p=>p.how==='edit').length>b,r:4},
  {id:'vendercuadro',c:'vida',e:'🖼️',t:()=>TXHZ.libros.vender_cuadro,w:()=>LB().art>=.5?1:0,start:()=>LB().tx.filter(t=>['mercadillo','galería'].includes(t[0])&&t[1]>0).length,ok:b=>LB().tx.filter(t=>['mercadillo','galería'].includes(t[0])&&t[1]>0).length>b,r:2.5},
  {id:'leer10',c:'vida',e:'📚',t:()=>TXHZ.libros.leer_diez_libros,w:()=>T('artista')||lvl('logica')>=3?.8:.3,ok:()=>LB().libDone.length>=10,r:1.5});
