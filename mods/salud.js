// =================== CUERPO Y SALUD: peso, gimnasio, lo que el trabajo rompe, el médico (público con cola, privado con tarifa) ===================
const HP=()=>{if(!S.hp){const ch=S.char||{};const f=ch.g==='f';let base={delgada:f?54:63,media:f?64:76,ancha:f?80:92}[ch.build]||(f?64:76);let peso=base;if(ch.alt){const m=ch.alt/100;base=Math.round(22.5*m*m);peso=ch.peso0||ch.peso||base;}S.hp={base,peso,in:0,burn:0,gym:0,gymMonth:0,list:[],cita:0,mutua:false,hist:[],diet:false};}S.hp.list=S.hp.list||[];return S.hp;};
const ovw=()=>HP().peso-HP().base;
const gymFee=()=>hrs(HP().gymGood?9:3);
const hpHas=k=>HP().list.some(x=>x.k===k);
const HP_DEF=DATA.reglas.salud;
// ---- ingesta: todo lo que sube el hambre cuenta; de dónde viene, también ----
{const _up=update;update=function(gm){const h0=S.needs.hambre;const r=_up.apply(this,arguments);try{const H=HP();const d=S.needs.hambre-h0;if(d>1){const u=S.sim.use;const src=S.sim.outingActive?(S.sim.outingActive==='comedor'?.9:1.3):u&&(u.type==='fogon'||u.type==='encimera')?(u.act==='sano'?.7:.9):u&&u.type==='nevera'?1.15:u&&u.type==='micro'?1.2:S.sim.work>0?(S.tapers!=null&&S.lastTaper===S.day?.9:1.25):1.1;H.in+=d*src*(H.diet?.85:1);}}catch(e){}return r;};}
// ---- gimnasio y calistenia ----
conLogica(OUT,{gimnasio:{req:()=>!!HP().gymMember}});
{const _oc=outCost;outCost=function(k){if(k==='gimnasio'||k==='calistenia')return 0;return _oc.apply(this,arguments);};}
{const _ob=outBack;outBack=function(k){const H=HP();const nd=S.needs;const add=(n,v)=>nd[n]=Math.max(0,Math.min(100,nd[n]+v));const n=CH().name;
  if(k==='gimnasio'){H.gym++;H.gymMonth++;H.burn+=H.gymGood?26:22;S.fit=Math.min(100,(S.fit||0)+(H.gymGood?7:6));if(H.gymGood)add('higiene',40);add('diversion',10);add('energia',-15);add('higiene',-30);add('social',6);if(hpHas('lumbar')&&Math.random()<.3){const x=H.list.find(q=>q.k==='lumbar');x.sev=Math.max(0,x.sev-1);}
    if(H.gym===1)tell(huecos(TXHZ.salud.primer_dia_gimnasio_sabe_para,{nom:n}),'🏋️');else if(Math.random()<.15)tell(pickR([TXHZ.salud.gimnasio_siete_manana_entran_ocho,huecos(TXHZ.salud.ha_subido_peso_press_banca,{nom:n,x:oa()==='a'?TXHZ.salud.ella:TXHZ.salud.el}),huecos(TXHZ.salud.del_gimnasio_vende_batidos_ha,{nom:n}),huecos(TXHZ.salud.hoy_ha_ido_al_gimnasio,{nom:n})]),'🏋️');return;}
  if(k==='calistenia'){H.burn+=16;S.fit=Math.min(100,(S.fit||0)+4);add('diversion',12);add('energia',-12);add('higiene',-25);add('social',10);if(Math.random()<.2)tell(huecos(pickR(TXHZ.salud.barras_del_parque_hay_senor_lista),{nom:n}),'🤸');return;}
  const r=_ob.apply(this,arguments);if(k==='deporte')H.burn+=14;if(k==='beber')H.in+=18;if(k==='amigos'||k==='networking')H.in+=10;return r;};}
// ---- cada día: balance, peso, cuerpo que se rompe ----
{const _dl=dailyEvents;dailyEvents=function(){const r=_dl.apply(this,arguments);try{const H=HP();const n=CH().name;const tr=S.track;const phys=['obra','super','hosteleria','cuidados','reparto'].includes(tr)&&!S.jobless;const desk=['oficina','tech','funcion'].includes(tr)&&!S.jobless;
  const burn=82*(phys&&S.lastWorkDay===S.day?1.18:desk?.92:1)*(1+(S.fit||0)/500)+H.burn;const delta=(H.in-burn)*.0025;H.peso=Math.max(H.base-16,Math.min(H.base+45,H.peso+delta));H.hist.push(+H.peso.toFixed(1));if(H.hist.length>90)H.hist.shift();H.in=0;H.burn=0;
  // la forma se pierde sola
  if(typeof homeless==='function'&&homeless())H.peso-=.06;
  // apariencia: el cuerpo cambia de talla
  const ch=S.char;const o_=ovw();let want=ch?ch.build:'media';if(o_<=-7)want='delgada';else if(o_>=9)want='ancha';else if(ch&&ch.build==='delgada'&&o_>=4)want='media';else if(ch&&ch.build==='ancha'&&o_<=-4)want='media';if(ch&&ch.build!==want){ch.build=want;try{dirty();}catch(e){}tell(want==='ancha'?huecos(TXHZ.salud.pantalones,{causa:phys?TXHZ.salud.talla_phys:huecos(TXHZ.salud.talla_sentada,{})}):want==='delgada'?huecos(TXHZ.salud.baila_ropa,{nom:n,x:S.money<0||homeless&&homeless()?TXHZ.salud.comer_poco_dieta_cuando_eleccion:TXHZ.salud.ha_perdido_peso_dicen_bien}):huecos(TXHZ.salud.ha_vuelto_talla_siempre,{nom:n}),'🪞');}
  // avisos de ánimo por el cuerpo
  if(ovw()>=12&&Math.random()<.04){try{MT().an-=1.5;}catch(e){}tell(huecos(pickR(TXHZ.salud.trabajo_alguien_ha_hecho_comentario_lista),{nom:n}),'🪞');}
  // problemas de salud: riesgo diario según cuerpo y curro
  const add=(k,sev=1)=>{if(hpHas(k))return;H.list.push({k,sev,since:S.day,dx:false});};
  if(ovw()>=10&&Math.random()<.003+(ovw()-10)*.0004)add('hiper');
  if(ovw()>=18&&Math.random()<.002+(ovw()-18)*.0003)add('diab');
  if(ovw()<=-9&&Math.random()<.008)add('anemia');
  if(phys&&S.shifts>20&&Math.random()<.0025*(1-(S.fit||0)/160)*(ovw()>8?1.4:1))add('lumbar');
  if(desk&&S.shifts>30&&Math.random()<.002)add(Math.random()<.5?'carpo':'vista');
  try{if(MT().an<35&&Math.random()<.006)add('ansiedad');}catch(e){}
  // síntomas sin diagnóstico
  for(const x of H.list){if(x.dx)continue;const d=S.day-x.since;if(d===3||(d>3&&d%20===0)){const D=HP_DEF[x.k];tell({hiper:huecos(TXHZ.salud.lleva_dias_dolor_cabeza_mananas,{nom:n}),diab:huecos(TXHZ.salud.tiene_sed_rara_levanta_tres,{nom:n}),lumbar:huecos(TXHZ.salud.ha_quedado_espalda_al_agacharse,{nom:n}),carpo:huecos(TXHZ.salud.despierta_mano_dormida_sacude_sigue,{nom:n}),vista:huecos(TXHZ.salud.entrecierra_ojos_para_leer_movil,{nom:n}),anemia:huecos(TXHZ.salud.ha_mareado_al_levantarse_tiene,{nom:n}),ansiedad:huecos(TXHZ.salud.acelera_corazon_metro_sin_motivo,{nom:n})}[x.k],'🤒');if(d>=20&&!H.cita&&Math.random()<.5)tell(huecos(TXHZ.salud.deberia_ir_al_medico_lleva,{nom:n}),'🩺');}
    // efectos
    if(x.k==='lumbar'||x.k==='anemia'||x.k==='diab')S.needs.energia=Math.max(0,S.needs.energia-(x.dx?2:4)*x.sev);
    if(x.k==='ansiedad'){try{MT().an-=x.dx?.3:.8;}catch(e){}}
    if(!x.dx&&(x.k==='lumbar'||x.k==='hiper'||x.k==='diab')&&Math.random()<.02*x.sev&&!S.sick){S.sick=2+(Math.random()*4|0);tell({lumbar:huecos(TXHZ.salud.puede_levantar_cama_espalda_baja,{nom:n,S_sick:S.sick}),hiper:huecos(TXHZ.salud.ha_mareado_trabajo_han_tomado,{nom:n}),diab:huecos(TXHZ.salud.ha_desmayado_urgencias_han_pedido,{nom:n,S_sick:S.sick})}[x.k],'🚑');}
    if(x.dx&&HP_DEF[x.k].med&&dateOf(S.day).wd===0){const c=Math.round(HP_DEF[x.k].med/8*HW()*(H.mutua?.6:1));bkAdd('Farmacia',-c);}
    // mejora o empeora
    if(x.dx){if(x.k==='lumbar'&&(S.fit||0)>50&&Math.random()<.02){H.list.splice(H.list.indexOf(x),1);tell(huecos(TXHZ.salud.espalda_ha_dejado_doler_rehabilitacion,{nom:n}),'🦴');}
      if(x.k==='anemia'&&ovw()>-5&&Math.random()<.04){H.list.splice(H.list.indexOf(x),1);tell(huecos(TXHZ.salud.analitica_anemia_remite,{n}),'🩸');}
      if(x.k==='diab'&&ovw()<6&&Math.random()<.01){H.list.splice(H.list.indexOf(x),1);chapter('diabrev',TXHZ.salud.dar_vuelta,huecos(TXHZ.salud.diabetes_ha_remitido_dos_anos,{nom:n}));}
      if(x.k==='carpo'&&Math.random()<.015){H.list.splice(H.list.indexOf(x),1);tell(TXHZ.salud.operacion_del_tunel_carpiano_tres,'🖐️');S.sick=Math.max(S.sick||0,5);}
      if(x.k==='ansiedad'&&(MT().an>60)&&Math.random()<.03){H.list.splice(H.list.indexOf(x),1);tell(huecos(TXHZ.salud.lleva_semanas_sin_ataques_ansiedad,{nom:n,x:MT().ther&&MT().ther.on?TXHZ.salud.terapia_ha_hecho_parte:''}),'🫀');}}
    else{if(x.k==='anemia'&&ovw()>-4&&Math.random()<.04){H.list.splice(H.list.indexOf(x),1);tell(huecos(TXHZ.salud.lleva_dias_sin_marearse_comer,{nom:n}),'🩸');}else if(Math.random()<.01)x.sev=Math.min(3,x.sev+1);}}
  // cita médica
  if(H.cita&&S.day>=H.cita){H.cita=0;hpVisit();}
  // cuotas
  if(dateOf(S.day).dm===1){if(H.gymMember){const c=gymFee();bkAdd('Gimnasio',-c);toast(huecos(TXHZ.salud.cuota_del_gimnasio,{c:fmt(c)}));if(H.gymMonth===0&&Math.random()<.5)tell(huecos(TXHZ.salud.cuota_del_gimnasio_ha_ido,{c:fmt(c),nom:n}),'🏋️');H.gymMonth=0;}
    if(H.mutua){const c=hrs(6);bkAdd('Médico',-c);toast(huecos(TXHZ.salud.seguro_privado,{c:fmt(c)}));}}
  }catch(e){console.error(e);}return r;};}
// ---- el médico ----
function hpAsk(priv){const H=HP();const n=CH().name;if(H.cita){toast(TXHZ.salud.ya_tiene_cita);return;}const wait=priv||H.mutua?1+(Math.random()*2|0):5+(Math.random()*12|0);H.cita=S.day+wait;H.citaPriv=!!(priv||H.mutua);
  tell(priv||H.mutua?huecos(TXHZ.salud.cita_privada,{espera:wait===1?TXHZ.salud.manana:huecos(TXHZ.salud.dentro_de,{d:wait}),pago:H.mutua?TXHZ.salud.mutua:huecos(TXHZ.salud.consulta,{c:fmt(hrs(8))})}):huecos(TXHZ.salud.cita_centro_salud_dentro_dias,{wait,nom:n}),'🩺');}
function hpVisit(){const H=HP();const n=CH().name;const priv=H.citaPriv;if(priv&&!H.mutua){S.money-=hrs(8);}
  const found=H.list.filter(x=>!x.dx);S.needs.energia-=5;
  if(!found.length){tell(priv?huecos(TXHZ.salud.doctora_privada_ha_pedido_analitica,{c:fmt(hrs(8))}):huecos(TXHZ.salud.siete_minutos_consulta_esta_bien,{nom:n,x:H.citaWait||9}),'🩺');return;}
  for(const x of found){x.dx=true;const D=HP_DEF[x.k];
    if(x.k==='lumbar'||x.k==='hiper'||x.k==='diab'){S.sick=Math.max(S.sick||0,x.k==='lumbar'?5:2);}
    tell(huecos(TXHZ.salud.diagnostico,{dn:D.n,d:D.d,x:D.med?huecos(TXHZ.salud.medicacion_semana,{c:fmt(Math.round(D.med/8*HW())),x:H.mutua?TXHZ.salud.mutua_cubre:TXHZ.salud.receta_publica}):''}),D.e);
    if(x.k==='diab'||x.k==='hiper')chapter('dx_'+x.k,D.n,huecos(TXHZ.salud.dx_cronica,{dx:D.n.toLowerCase(),detalle:x.k==='diab'?huecos(TXHZ.salud.dx_diab,{n}):huecos(TXHZ.salud.dx_hiper,{edad:S.char.age||30})}));
    if(x.k==='lumbar'&&!S.jobless&&['obra','super','hosteleria','cuidados'].includes(S.track))tell(huecos(TXHZ.salud.medico_ha_escrito_evitar_esfuerzos,{nom:n}),'🦴');}
  if(priv&&found.length)tell(TXHZ.salud.privada_cita_ha_sido_larga,'🏥');}
// ---- UI ----
function hpBlock(){const H=HP();const o=ovw();const st=o<=-9?TXHZ.salud.bajo_peso:o<=-4?huecos(TXHZ.salud.delgad,{}):o<8?TXHZ.salud.peso:o<16?TXHZ.salud.sobrepeso:TXHZ.salud.obesidad;
  let h=`<h3>${TXHZ.salud.cuerpo}</h3><div class="sub" style="font-size:12px">${huecos(TXHZ.salud.ficha_cuerpo,{peso:H.peso.toFixed(1),st,fit:Math.round(S.fit||0),x:H.gymMember?huecos(TXHZ.salud.ficha_gym,{d:H.gymMonth}):'',x2:H.mutua?TXHZ.salud.ficha_seguro:'',x3:H.diet?TXHZ.salud.ficha_dieta:''})}</div>`;
  if(H.list.length)h+=`<div class="sub" style="font-size:12px;color:#a04a3a">${H.list.map(x=>HP_DEF[x.k].e+' '+(x.dx?HP_DEF[x.k].n:huecos(TXHZ.salud.algo_no_esta_bien,{d:S.day-x.since}))).join(' · ')}</div>`;
  h+=`<div style="display:flex;flex-wrap:wrap;gap:6px;margin:6px 0 10px">`;
  if(!H.cita)h+=`<button class="btn grey" id="hpcita">${TXHZ.salud.cita_publica}</button><button class="btn grey" id="hppriv">${huecos(TXHZ.salud.privada,{c:fmt(hrs(8))})}</button>`;else h+=`<span class="sub" style="font-size:12px">${huecos(TXHZ.salud.cita_dentro_dias,{x:H.cita-S.day})}</span>`;
  h+=`<button class="btn grey" id="hpgym">${H.gymMember?TXHZ.salud.baja_gym:huecos(TXHZ.salud.alta_gym,{c:fmt(gymFee())})}</button>`;
  h+=`<button class="btn grey" id="hpmutua">${H.mutua?TXHZ.salud.quitar_seguro:huecos(TXHZ.salud.alta_seguro,{c:fmt(hrs(6))})}</button>`;
  h+=`<button class="btn grey" id="hpdiet">${H.diet?TXHZ.salud.dejar_dieta:TXHZ.salud.cuidar_dieta}</button></div>`;return h;}
{const _vt=vidaTab;vidaTab=function(){const h=_vt.apply(this,arguments);try{return hpBlock()+h;}catch(e){return h;}};}
{const _bs=bindSociety;bindSociety=function(){_bs.apply(this,arguments);const H=HP();const q=s=>card.querySelector(s);const re=()=>openMenu('vida');
  const a=q('#hpcita');if(a)a.onclick=()=>{hpAsk(false);re();};const b=q('#hppriv');if(b)b.onclick=()=>{if(S.money<hrs(8)){toast(TXHZ.salud.llega);return;}hpAsk(true);re();};
  const join=good=>{H.gymGood=good;if(S.money<gymFee()){toast(TXHZ.salud.llega);return;}H.gymMember=true;S.money-=gymFee();H.gymMonth=0;tell(good?huecos(TXHZ.salud.ha_apuntado_gimnasio_bueno_piscina,{c:fmt(gymFee())}):huecos(TXHZ.salud.ha_apuntado_al_gimnasio_low,{c:fmt(gymFee())}),'🏋️');re();};
  const g=q('#hpgym');if(g)g.onclick=()=>{if(H.gymMember){H.gymMember=false;tell(huecos(TXHZ.salud.ha_dado_baja_del_gimnasio,{}),'🏋️');re();}else join(false);};const g2=q('#hpgym2');if(g2)g2.onclick=()=>join(true);
  const m=q('#hpmutua');if(m)m.onclick=()=>{H.mutua=!H.mutua;if(H.mutua){S.money-=hrs(6);tell(huecos(TXHZ.salud.seguro_privado_contratado_citas_dos,{c:fmt(hrs(6))}),'🏥');}re();};
  const d=q('#hpdiet');if(d)d.onclick=()=>{H.diet=!H.diet;if(H.diet)tell(huecos(TXHZ.salud.va_intentar_comer_mejor_mas,{}),'🥗');re();};};}
// la IA: va al médico si lleva semanas mal; al gimnasio si es socia; a las barras si es deportista
{const _au=autonomy;autonomy=function(){try{const H=HP();const s=S.sim;const h=S.t/60;if(S.autoHome&&!(s.work>0)&&!s.leaving){
    if(!H.cita&&H.list.some(x=>!x.dx&&S.day-x.since>14)&&Math.random()<.02)hpAsk(S.money>1500&&!isLeft());
    if(S.outDay!==S.day&&Math.random()<.03){if(H.gymMember&&!outAvail('gimnasio')&&S.needs.energia>40){doOut('gimnasio');return;}if((T('deportista')||(S.fit||0)<30&&ovw()>8)&&!outAvail('calistenia')&&S.needs.energia>40&&Math.random()<.5){doOut('calistenia');return;}}
    if(!H.gymMember&&S.autoHome&&(T('deportista')||ovw()>10)&&S.money>hrs(60)&&Math.random()<.002){H.gymMember=true;S.money-=gymFee();tell(huecos(TXHZ.salud.ha_apuntado_al_gimnasio_enero,{}),'🏋️');}}}catch(e){}return _au.apply(this,arguments);};}
// perfil: peso en la ficha
{const _om=openMenu;openMenu=function(...a){const r=_om.apply(this,a);try{if(menuTab==='perfil'){const H=HP();const box=card.querySelector('#colbox');if(box&&!card.querySelector('#hpmini')){const d=document.createElement('div');d.id='hpmini';d.className='sub';d.style.cssText='font-size:12px;margin:-4px 0 10px';d.innerHTML=huecos(TXHZ.salud.kg_forma,{x:H.peso.toFixed(1),num:Math.round(S.fit||0),x2:H.list.filter(x=>x.dx).length?' · '+H.list.filter(x=>x.dx).map(x=>HP_DEF[x.k].e+' '+HP_DEF[x.k].n).join(', '):''});box.before(d);}}}catch(e){}return r;};}

// ---- creador: altura y peso ----
const bmiOf=(cm,kg)=>kg/((cm/100)**2);
const bmiTxt=b=>b<18.5?TXHZ.salud.bajo_peso:b<25?TXHZ.salud.peso_normal:b<30?TXHZ.salud.sobrepeso:TXHZ.salud.obesidad;
{const _rc=renderCreator;renderCreator=function(diff,edit){_rc(diff,edit);try{let anchor=[...card.querySelectorAll('.clab')].find(e=>/Estudios|Dónde vive/.test(e.textContent));if(!anchor){const ok=card.querySelector('#creok');anchor=ok;if(ok&&ok.parentElement!==card&&ok.parentElement.children.length<=3)anchor=ok.parentElement;}if(!anchor)return;const f=cre.g==='f';cre.alt=cre.alt||(edit&&S.char&&S.char.alt)||(f?165:177);cre.peso=cre.peso||(edit&&S.hp?Math.round(S.hp.peso):Math.round(22.5*(cre.alt/100)**2));const b=bmiOf(cre.alt,cre.peso);
    const box=document.createElement('div');box.innerHTML=`<div class="clab">${TXHZ.salud.cuerpo2}</div><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:4px 0 2px"><label style="font-size:12.5px;font-weight:800">${TXHZ.salud.altura}<input type="number" id="cralt" min="140" max="210" value="${cre.alt}" style="width:58px;padding:5px;border-radius:8px;border:1px solid #e3dce8;font:inherit">${TXHZ.salud.cm}</label><label style="font-size:12.5px;font-weight:800">${TXHZ.salud.peso2}<input type="number" id="crpeso" min="38" max="200" value="${cre.peso}" style="width:58px;padding:5px;border-radius:8px;border:1px solid #e3dce8;font:inherit">${TXHZ.salud.kg}</label></div><div class="sub" style="font-size:11.5px" id="crbmi">${huecos(TXHZ.salud.imc,{x:b.toFixed(1),bmiTxt:bmiTxt(b)})}</div>`;
    anchor.before(box);const upd=()=>{const a=+box.querySelector('#cralt').value||cre.alt,w=+box.querySelector('#crpeso').value||cre.peso;cre.alt=Math.max(140,Math.min(210,a));cre.peso=Math.max(38,Math.min(200,w));const bb=bmiOf(cre.alt,cre.peso);box.querySelector('#crbmi').textContent=huecos(TXHZ.salud.imc,{x:bb.toFixed(1),bmiTxt:bmiTxt(bb)});cre.build=bb<19?'delgada':bb>=27?'ancha':'media';};
    box.querySelector('#cralt').oninput=upd;box.querySelector('#crpeso').oninput=upd;
    const ok=card.querySelector('#creok');if(ok&&edit)ok.addEventListener('click',()=>{try{if(S.char){S.char.alt=cre.alt;const H=HP();const m=cre.alt/100;H.base=Math.round(22.5*m*m);H.peso=cre.peso;H.hist=[];if(H.peso-H.base>-6)H.list=H.list.filter(x=>x.k!=='anemia'||x.dx);}}catch(e){}});}catch(e){console.error(e);}};}
{const _om=openMenu;openMenu=function(...a){const r=_om.apply(this,a);try{if(menuTab==='perfil'){const d=card.querySelector('#hpmini');if(d&&S.char&&S.char.alt){const H=HP();const b=bmiOf(S.char.alt,H.peso);d.innerHTML=huecos(TXHZ.salud.mini,{alt:(S.char.alt/100).toFixed(2),kg:H.peso.toFixed(1),imc:b.toFixed(1),txt:bmiTxt(b),fit:Math.round(S.fit||0)})+(H.list.filter(x=>x.dx).length?' · '+H.list.filter(x=>x.dx).map(x=>HP_DEF[x.k].e+' '+HP_DEF[x.k].n).join(', '):'');}}}catch(e){}return r;};}
