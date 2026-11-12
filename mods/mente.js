// =================== SALUD MENTAL Y ADICCIONES: el desánimo se acumula; se sale con ayuda, no con voluntad ===================
// precios «de persona»: en horas de salario mínimo, no en «precio del mundo»
const HW=()=>7.6*Dm().pay;const hrs=h=>Math.round(h*HW());
const MT=()=>{if(!S.mt)S.mt={an:70,dep:0,ther:null,wait:0,alc:0,dro:0,tol:0,deal:null,bust:0,sober:0,hist:[]};const m=S.mt;m.hist=m.hist||[];return m;};
const anLvl=()=>{const a=MT().an;return a>=65?'bien':a>=45?'bajo':a>=25?'hundido':'depresión';};
const depressed=()=>MT().dep>=1;
// ---- ánimo diario: necesidades, aspiraciones, precariedad, gente, salidas; alcohol/drogas dan subidón y luego bajón ----
function mtDaily(){const m=MT();const nd=S.needs;let d=0;const why=[];
  const avg=mood();d+=(avg-55)/14;
  if(S.jobless){d-=.9;why.push(TXHZ.mente.sin_trabajo);}if(S.money<0){d-=1.2;why.push(TXHZ.mente.numeros_rojos);}
  if(!S.jobless&&TOX()>.7){d-=.8;why.push(TXHZ.mente.curro_toxico);}
  const pt=partner();if(pt&&(pt.love||0)>=60)d+=.6;if(pt&&(pt.wear||0)>40){d-=.7;why.push(TXHZ.mente.pareja);}
  const fr=(S.people||[]).filter(p=>p.rel>=50).length;if(fr>=3)d+=.5;else if(!fr){d-=.6;why.push(TXHZ.mente.nadie_cerca);}
  const A=S.asp;if(A&&Object.keys(A.done||{}).length)d+=.2;const fails=(A&&A.failed)||0;if(fails){d-=Math.min(2,fails*.5);why.push(TXHZ.mente.metas_llegan);}
  if(ex().wk.out>=2)d+=.4;if(S.sick)d-=.4;if(S.jail)d-=1.5;
  if(S.glow&&S.glow>S.day*1440)d+=.5;
  if(typeof ED==='function'&&ED().cur)d+=.3;
  // sustancias: ayer subió, hoy baja
  if(m.alcDay===S.day-1){d-=.6+m.alc*.15;}if(m.droDay===S.day-1){d-=1.2+m.dro*.25;}
  // dependencia: sin consumir, mono
  if(m.alc>=3&&m.alcDay<S.day-1){d-=.8;nd.diversion=Math.max(0,nd.diversion-10);why.push(TXHZ.mente.ganas_beber);}
  if(m.dro>=3&&m.droDay<S.day-1){d-=1.5;nd.energia=Math.max(0,nd.energia-10);why.push(TXHZ.mente.mono);}
  // terapia y rasgos
  if(m.ther&&m.ther.on&&S.day-(m.ther.since||S.day)>7)d+=.9;if(T('optimista')||T('resiliente'))d+=.4;if(T('pesimista')||T('ansiosa'))d-=.4;
  m.an=Math.max(0,Math.min(100,m.an+d));m.why=why.slice(0,3);
  // umbrales
  if(m.an<25&&!m.dep){m.dep=1;m.depSince=S.day;chapter('dep1',TXHZ.mente.puede_mas,huecos(TXHZ.mente.depresion,{razones:why.length?huecos(TXHZ.mente.depresion_lo_de,{lo:why.join(', ')}):''}));toast(huecos(TXHZ.mente.esta_hundid,{}),true);sfx('bad');
    try{phIncoming(P_('madre')||P_('amiga')||(S.people||[])[0],TXHZ.mente.te_noto_raro_estas_bien,'carino');}catch(e){}}
  if(m.dep&&m.an>=45){m.dep=0;chapter('dep_out',TXHZ.mente.sale_sol,huecos(TXHZ.mente.ha_vuelto_tener_buen_dia,{x:m.ther&&m.ther.on?TXHZ.mente.terapia_ha_hecho_parte:TXHZ.mente.nadie_sabe_muy_bien_pero}));toast(huecos(TXHZ.mente.levanta_cabeza,{}),true);sfx('level');}
  // cola de la pública
  if(m.wait>0){m.wait--;if(m.wait===0){m.ther={on:true,pub:true,since:S.day};tell(huecos(TXHZ.mente.fin_han_dado_cita_salud,{num:Math.round((S.day-m.waitSince)/7)}),'🧠');}}
  if(m.ther&&m.ther.on&&!m.ther.pub){const c=hrs(7);if(S.day%7===0){bkAdd('Terapia',-c);if(S.money<-300&&Math.random()<.5){m.ther=null;tell(huecos(TXHZ.mente.ha_dejado_terapia_privada_semana,{c:fmt(c)}),'🧠');}}}
  if(m.sober>0&&m.alcDay!==S.day&&m.droDay!==S.day)m.sober++;
  m.hist.push(Math.round(m.an));if(m.hist.length>60)m.hist.shift();}
// ---- la depresión se nota: todo cuesta, cae la diversión, el trabajo va peor ----
{const _up9=update;update=function(gm){const r=_up9.apply(this,arguments);try{const m=MT();if(m.dep){S.needs.diversion=Math.max(0,S.needs.diversion-.012*gm);S.needs.energia=Math.max(0,S.needs.energia-.006*gm);S.needs.higiene=Math.max(0,S.needs.higiene-.004*gm);}}catch(e){}return r;};}
{const _au3=autonomy;autonomy=function(){try{const m=MT();const s=S.sim;if(m.dep&&!s.use&&!(s.path&&s.path.length)&&!(s.work>0)&&Math.random()<.05&&!(typeof homeless==='function'&&homeless()&&S.t/60>=18)){const b=findObjs((d,t)=>['cama','camamat','sofa','sofacama'].includes(t));if(b.length){enqueue({k:'obj',i:b[0],act:S.obj[b[0]].t.startsWith('cama')?'techo':'tirarse'});if(throttled('depcama',6e5))tell(huecos(pickR(TXHZ.mente.ha_vuelto_tumbar_tiene_sueno_lista),{}),'🌧️');return;}}}catch(e){}return _au3.apply(this,arguments);};}
// faltar al trabajo cuando está hundido
{const _gw2=goWork;goWork=function(){try{const m=MT();if(m.dep&&Math.random()<.15&&!S.sick){S.rep=Math.max(0,(S.rep??60)-4);tell(huecos(TXHZ.mente.ha_ido_trabajar_ha_avisado,{}),'🌧️');toast(huecos(TXHZ.mente.ha_podido_ir_al_curro,{}));S.lastWorkDay=S.day;return;}}catch(e){}return _gw2.apply(this,arguments);};}
// aspiraciones que caducan cuentan como fallo
{const _ac2=aspCheck;aspCheck=function(){const A=S.asp;const before=A?A.active.slice():[];const dn=A?Object.keys(A.done||{}).length:0;const r=_ac2.apply(this,arguments);try{if(A){const after=A.active;const dn2=Object.keys(A.done||{}).length;const dropped=before.filter(id=>!after.includes(id)&&!(A.done||{})[id]);if(dropped.length&&dn2===dn){A.failed=(A.failed||0)+dropped.length;for(const id of dropped){const a=ASP.find(x=>x.id===id);if(a&&throttled('aspfail',2e5))tell(huecos(TXHZ.mente.ya_va_pasar_sabe,{x:a.t()}),'💭');}}}}catch(e){}return r;};}
// ---- salidas: terapia, bar (beber), el camello ----
conLogica(OUT,{
  terapia:{req:()=>!(MT().ther&&MT().ther.on&&MT().ther.pub)&&(MT().an<60||(MT().ther&&MT().ther.on))},
  beber:{req:()=>MT().an<50||MT().alc>=2},
  pillar:{req:()=>!!MT().deal||MT().an<40}});
function outCost2(k){if(k==='terapia')return hrs(7);if(k==='beber')return Math.round((12+MT().alc*4)*PM());if(k==='pillar')return Math.round((25+MT().tol*6)*PM());return null;}
{const _oc=outCost;outCost=function(k){const c=outCost2(k);return c!=null?c:_oc.apply(this,arguments);};}
{const _ob3=outBack;outBack=function(k){const m=MT();const nd=S.needs;const add=(n,v)=>nd[n]=Math.max(0,Math.min(100,nd[n]+v));
  if(k==='terapia'){if(!m.ther||!m.ther.on)m.ther={on:true,pub:false,since:S.day};m.an=Math.min(100,m.an+2.5);add('social',10);m.sess=(m.sess||0)+1;
    tell(huecos(pickR(TXHZ.mente.sesion_terapia_ha_hablado_madre_lista),{}),'🧠');
    if(m.sess===1)chapter('ther1',TXHZ.mente.pedir_ayuda,huecos(TXHZ.mente.ha_ido_terapia_primera_vez,{c:fmt(outCost('terapia'))}));return;}
  if(k==='beber'){m.alcDay=S.day;m.alc=Math.min(10,m.alc+(m.alc>=3?.35:.5));m.sober=0;m.an=Math.min(100,m.an+6);add('diversion',30);add('social',15);add('energia',-15);add('higiene',-10);S.hang=S.day+1;
    const n=Math.round(m.alc);tell(n>=6?huecos(TXHZ.mente.ha_bebido_hasta_acordarse_como,{nom:n}):n>=3?huecos(TXHZ.mente.otra_noche_copas_dice_controla,{}):huecos(pickR(TXHZ.mente.unas_canas_convirtieron_muchas_risas_lista),{}),'🍷');
    if(!m.deal&&(m.an<40||m.alc>=3)&&Math.random()<.35)mtDealer();
    if(m.alc>=3&&!S.story.chap.alc1)chapter('alc1',TXHZ.mente.para_aguantar,huecos(TXHZ.mente.bebe_casi_cada_dia_fiesta,{x:S.jobless?TXHZ.mente.desde_esta_paro_mas:TXHZ.mente.sale_del_curro_va_directo}));
    if(m.alc>=6&&Math.random()<.25){const pt=partner();if(pt){pt.love=Math.max(0,pt.love-6);pt.wear=Math.min(100,(pt.wear||0)+8);pt.wearWhy=TXHZ.mente.bebida;try{phIncoming(pt,huecos(TXHZ.mente.otra_vez_borracho,{}),'gen');}catch(e){}}}return;}
  if(k==='pillar'){mtPillar();return;}
  return _ob3.apply(this,arguments);};}
// ---- el camello: lo conoces por el barrio; la primera vez te lo presentan en el bar o el parque ----
function mtDealer(){const m=MT();if(m.deal)return m.deal;const names=[TXHZ.mente.rubio,TXHZ.mente.chino,TXHZ.mente.dani,TXHZ.mente.vane,TXHZ.mente.moro,TXHZ.mente.kevin];m.deal={n:pickR(names),rel:20,heat:0};tell(huecos(TXHZ.mente.alguien_ha_presentado_necesites_tu,{x:pickR([TXHZ.mente.bar,TXHZ.mente.parque,TXHZ.mente.portal_al_lado]),m_deal_n:m.deal.n}),'🌫️');return m.deal;}
function mtPillar(){const m=MT();const D=mtDealer();const nd=S.needs;m.droDay=S.day;m.dro=Math.min(10,m.dro+(m.dro>=3?.4:.6));m.tol=Math.min(10,m.tol+.3);m.sober=0;D.rel=Math.min(100,D.rel+5);D.heat=Math.min(100,D.heat+6+(W_().era==='represion'?6:0));
  m.an=Math.min(100,m.an+10);nd.diversion=100;nd.energia=Math.min(100,nd.energia+20);nd.hambre=Math.max(0,nd.hambre-15);S.needs.higiene=Math.max(0,S.needs.higiene-8);
  const n=Math.round(m.dro);tell(n>=6?huecos(TXHZ.mente.ya_pilla_para_divertirse_pilla,{D:D.n}):n>=3?huecos(TXHZ.mente.otra_vez_dice_para_finde,{D:D.n}):huecos(pickR(TXHZ.mente.ha_pillado_unas_horas_sin_lista),{D:D.n}),'💊');
  if(m.dro>=3&&!S.story.chap.dro1)chapter('dro1',TXHZ.mente.salida_facil,huecos(TXHZ.mente.consume_casi_cada_semana_caro,{D:D.n}));
  if(m.dro>=5&&S.money<50&&Math.random()<.3){m.debt=(m.debt||0)+Math.round(40*PM());tell(huecos(TXHZ.mente.ha_fiado_debe_ya_manda,{D:D.n,c:fmt(m.debt)}),'🌫️');}
  // redada / registro: más en barrios pobres y con gobierno de mano dura
  const bust=.03+D.heat/400+(W_().era==='represion'?.05:0)+(S.record?.03:0)+(S.home&&['infra','viejo'].includes(S.home.type)?.03:0);
  if(Math.random()<bust){m.bust++;if(m.dro>=4&&Math.random()<.5){arrestAna(3+(Math.random()*10|0),TXHZ.mente.sustancias_encima);chapter('carcel'+m.bust,TXHZ.mente.calabozo,huecos(TXHZ.mente.registro_salida_del_portal_llevaba,{x:S.record?TXHZ.mente.antecedentes_ni_fianza:TXHZ.mente.antecedentes_para_siempre,D:D.n}));}
    else{const f=Math.round(300*PM());S.money-=f;S.record=true;tell(huecos(TXHZ.mente.multa_tenencia_ficha_policial_borra,{c:fmt(f),D:D.n}),'🚔');}}}
// deudas con el camello: visita
{const _dly=dailyEvents;dailyEvents=function(){const r=_dly.apply(this,arguments);try{mtDaily();const m=MT();if(m.debt>0&&Math.random()<.2){if(S.money>=m.debt){S.money-=m.debt;tell(huecos(TXHZ.mente.ha_pagado_debia_acabo_dice,{m_deal_n:m.deal.n,c:fmt(m.debt)}),'🌫️');m.debt=0;}else{S.needs.social=Math.max(0,S.needs.social-20);m.an-=4;tell(huecos(pickR(TXHZ.mente.ha_venido_casa_ha_subido_lista),{m_deal_n:m.deal.n}),'🌫️');}}
  if(S.hang===S.day){S.needs.energia=Math.max(0,S.needs.energia-25);S.needs.hambre=Math.max(0,S.needs.hambre-10);if(throttled('resaca',6e4))toast(TXHZ.mente.resaca);}}catch(e){console.error(e);}return r;};}
// ---- dejarlo: con apoyo (terapia, pareja, madre, sindicato) y tiempo; recaídas ----
function mtQuit(){const m=MT();if(m.alc<2&&m.dro<2){toast(TXHZ.mente.hay_nada_dejar);return;}const sup=(m.ther&&m.ther.on?2:0)+(partner()?1:0)+(P_('madre')&&P_('madre').rel>60?1:0)+(S.union&&S.union.member?1:0);
  m.quit={since:S.day,sup};tell(huecos(TXHZ.mente.dejarlo,{apoyo:sup>=3?TXHZ.mente.apoyo_3:sup>=1?TXHZ.mente.apoyo_1:huecos(TXHZ.mente.apoyo_0,{})}),'🌱');toast(TXHZ.mente.va_intentar,true);}
{const _dly2=dailyEvents;dailyEvents=function(){const r=_dly2.apply(this,arguments);try{const m=MT();if(m.quit){const d=S.day-m.quit.since;const relapse=(.08-m.quit.sup*.02)*(m.an<35?1.8:1)*(m.dro>=5||m.alc>=6?1.5:1);
    if(m.alcDay===S.day||m.droDay===S.day){m.quit=null;tell(huecos(TXHZ.mente.ha_recaido_fracaso_parte_manana,{}),'🌧️');}
    else if(d>0&&d%7===0){m.alc=Math.max(0,m.alc-1);m.dro=Math.max(0,m.dro-1);m.an=Math.min(100,m.an+2);if(m.alc<1&&m.dro<1){m.quit=null;m.sober=d;chapter('sobrio',huecos(TXHZ.mente.limpio_titulo,{}),huecos(TXHZ.mente.dias_ha_dejado_beber_para,{d,x:m.deal?TXHZ.mente.pillar:'',x2:m.deal?huecos(TXHZ.mente.camello_ya_no_escribe,{camello:m.deal.n}):''}));toast(huecos(TXHZ.mente.limpio_toast,{d}),true);sfx('level');}}
    if(Math.random()<relapse&&d>2){(m.dro>=2?mtPillar():(()=>{m.alcDay=S.day;m.alc=Math.min(10,m.alc+.3);})());m.quit=null;tell(huecos(TXHZ.mente.recaida_ha_contado_nadie,{}),'🌧️');}}}catch(e){}return r;};}
// ---- UI: Vida → bloque de ánimo ----
function mtBlock(){const m=MT();const lv=anLvl();const col=lv==='bien'?'#2e8b57':lv==='bajo'?'#e9a23b':'#c0392b';
  let h=`<h3>${TXHZ.mente.animo_titulo}</h3><div class="minibars"><i style="width:${Math.round(m.an)}%;background:${col}"></i></div><div class="sub" style="font-size:12px"><b>${lv==='bien'?TXHZ.mente.nivel_bien:lv==='bajo'?TXHZ.mente.nivel_bajo:lv==='hundido'?huecos(TXHZ.mente.nivel_hundido,{}):TXHZ.mente.nivel_depresion}</b>${m.why&&m.why.length?huecos(TXHZ.mente.animo_pesa,{lo:m.why.join(', ')}):''}</div>`;
  if(m.ther&&m.ther.on)h+=`<div class="sub" style="font-size:12px">${huecos(TXHZ.mente.en_terapia,{tipo:m.ther.pub?TXHZ.mente.terapia_publica:huecos(TXHZ.mente.terapia_privada,{c:fmt(hrs(7))})})}</div>`;
  else if(m.wait>0)h+=`<div class="sub" style="font-size:12px">${huecos(TXHZ.mente.lista_espera,{d:m.wait})}</div>`;
  else if(m.an<50)h+=`<button class="btn grey" id="mtpub">${TXHZ.mente.pedir_cita}</button>`;
  if(m.alc>=2||m.dro>=2){h+=`<div class="sub" style="font-size:12px;color:#a04a3a">${m.alc>=2?huecos(TXHZ.mente.bebe,{cuanto:m.alc>=6?TXHZ.mente.bebe_dia:m.alc>=3?TXHZ.mente.bebe_casi:TXHZ.mente.bebe_mas}):''}${m.dro>=2?huecos(TXHZ.mente.consume,{cuanto:m.dro>=6?TXHZ.mente.consume_dia:m.dro>=3?TXHZ.mente.consume_semana:TXHZ.mente.consume_veces}):''}${m.debt?huecos(TXHZ.mente.debe,{c:fmt(m.debt),camello:m.deal.n}):''}</div>`;if(!m.quit)h+=`<button class="btn grey" id="mtquit">${TXHZ.mente.intentar_dejarlo}</button>`;else h+=`<div class="sub" style="font-size:12px">${huecos(TXHZ.mente.lleva_intentando,{d:S.day-m.quit.since})}</div>`;}
  if(m.sober>=7&&!m.quit&&m.alc<1&&m.dro<1)h+=`<div class="sub" style="font-size:12px">${huecos(TXHZ.mente.dias_limpio,{d:m.sober})}</div>`;
  return h;}
{const _vt=vidaTab;vidaTab=function(){const h=_vt.apply(this,arguments);try{return mtBlock()+h;}catch(e){return h;}};}
{const _bs2=bindSociety;bindSociety=function(){_bs2.apply(this,arguments);const q=s=>card.querySelector(s);const a=q('#mtpub');if(a)a.onclick=()=>{const m=MT();m.wait=45+(Math.random()*90|0);m.waitSince=S.day;tell(huecos(TXHZ.mente.ha_pedido_cita_salud_mental,{num:Math.round(m.wait/7)}),'🏥');openMenu('vida');};const b=q('#mtquit');if(b)b.onclick=()=>{mtQuit();openMenu('vida');};};}
// la IA: cuando está hundido y no hay ayuda, tira de lo que hay a mano
{const _au4=autonomy;autonomy=function(){try{const m=MT();const s=S.sim;const h=S.t/60;if(S.autoHome&&m.an<40&&!(s.work>0)&&!s.leaving&&h>=18&&h<22.5&&Math.random()<.06){const k=(m.deal||m.dro>=1)&&Math.random()<.45?'pillar':'beber';if(!outAvail(k)&&S.money>outCost(k)){doOut(k);return;}}
  if(S.autoHome&&m.an<35&&!m.ther&&!m.wait&&Math.random()<.01){const pub=S.money<800||isLeft();if(pub){m.wait=45+(Math.random()*90|0);m.waitSince=S.day;tell(huecos(TXHZ.mente.ha_pedido_cita_salud_mental2,{num:Math.round(m.wait/7)}),'🏥');}else if(!outAvail('terapia')){doOut('terapia');return;}}}catch(e){}return _au4.apply(this,arguments);};}
// HUD: ánimo en la ficha
{const _mood=mood;mood=function(){const v=_mood.apply(this,arguments);try{const m=MT();return v*(m.dep?.8:m.an<45?.92:1);}catch(e){return v;}};}
// hundido, no apetece salir a correr ni a la asamblea
{const _mo=maybeOuting;maybeOuting=function(){try{if(MT().dep&&Math.random()<.6)return false;}catch(e){}return _mo.apply(this,arguments);};}
