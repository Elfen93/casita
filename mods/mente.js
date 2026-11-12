// =================== SALUD MENTAL Y ADICCIONES: el desánimo se acumula; se sale con ayuda, no con voluntad ===================
// precios «de persona»: en horas de salario mínimo, no en «precio del mundo»
const HW=()=>7.6*Dm().pay;const hrs=h=>Math.round(h*HW());
const MT=()=>{if(!S.mt)S.mt={an:70,dep:0,ther:null,wait:0,alc:0,dro:0,tol:0,deal:null,bust:0,sober:0,hist:[]};const m=S.mt;m.hist=m.hist||[];return m;};
const anLvl=()=>{const a=MT().an;return a>=65?'bien':a>=45?'bajo':a>=25?'hundido':'depresión';};
const depressed=()=>MT().dep>=1;
// ---- ánimo diario: necesidades, aspiraciones, precariedad, gente, salidas; alcohol/drogas dan subidón y luego bajón ----
function mtDaily(){const m=MT();const nd=S.needs;let d=0;const why=[];
  const avg=mood();d+=(avg-55)/14;
  if(S.jobless){d-=.9;why.push('sin trabajo');}if(S.money<0){d-=1.2;why.push('números rojos');}
  if(!S.jobless&&TOX()>.7){d-=.8;why.push('un curro tóxico');}
  const pt=partner();if(pt&&(pt.love||0)>=60)d+=.6;if(pt&&(pt.wear||0)>40){d-=.7;why.push('la pareja');}
  const fr=(S.people||[]).filter(p=>p.rel>=50).length;if(fr>=3)d+=.5;else if(!fr){d-=.6;why.push('nadie cerca');}
  const A=S.asp;if(A&&Object.keys(A.done||{}).length)d+=.2;const fails=(A&&A.failed)||0;if(fails){d-=Math.min(2,fails*.5);why.push('metas que no llegan');}
  if(ex().wk.out>=2)d+=.4;if(S.sick)d-=.4;if(S.jail)d-=1.5;
  if(S.glow&&S.glow>S.day*1440)d+=.5;
  if(typeof ED==='function'&&ED().cur)d+=.3;
  // sustancias: ayer subió, hoy baja
  if(m.alcDay===S.day-1){d-=.6+m.alc*.15;}if(m.droDay===S.day-1){d-=1.2+m.dro*.25;}
  // dependencia: sin consumir, mono
  if(m.alc>=3&&m.alcDay<S.day-1){d-=.8;nd.diversion=Math.max(0,nd.diversion-10);why.push('ganas de beber');}
  if(m.dro>=3&&m.droDay<S.day-1){d-=1.5;nd.energia=Math.max(0,nd.energia-10);why.push('el mono');}
  // terapia y rasgos
  if(m.ther&&m.ther.on&&S.day-(m.ther.since||S.day)>7)d+=.9;if(T('optimista')||T('resiliente'))d+=.4;if(T('pesimista')||T('ansiosa'))d-=.4;
  m.an=Math.max(0,Math.min(100,m.an+d));m.why=why.slice(0,3);
  // umbrales
  if(m.an<25&&!m.dep){m.dep=1;m.depSince=S.day;chapter('dep1','No puede más',`${CH().name} lleva semanas sin ganas de nada. No es pereza, no es tristeza: es que no puede. ${why.length?'Lo de '+why.join(', ')+' pesa.':''} Levantarse cuesta. Ducharse, más.`);toast(`🌧️ ${CH().name} está hundid${oa()}`,true);sfx('bad');
    try{phIncoming(P_('madre')||P_('amiga')||(S.people||[])[0],'Te noto raro. ¿Estás bien? 🥺','carino');}catch(e){}}
  if(m.dep&&m.an>=45){m.dep=0;chapter('dep_out','Sale el sol',`${CH().name} ha vuelto a tener un buen día. Y luego otro. ${m.ther&&m.ther.on?'La terapia ha hecho su parte.':'Nadie sabe muy bien por qué, pero se agarra a ello.'}`);toast(`☀️ ${CH().name} levanta cabeza`,true);sfx('level');}
  // cola de la pública
  if(m.wait>0){m.wait--;if(m.wait===0){m.ther={on:true,pub:true,since:S.day};tell(`Por fin le han dado cita en salud mental de la pública. ${Math.round((S.day-m.waitSince)/7)} semanas de espera. Media hora cada mes y medio, pero es alguien que escucha.`,'🧠');}}
  if(m.ther&&m.ther.on&&!m.ther.pub){const c=hrs(7);if(S.day%7===0){bkAdd('Terapia',-c);if(S.money<-300&&Math.random()<.5){m.ther=null;tell(`${CH().name} ha dejado la terapia privada: ${fmt(c)} a la semana no salen.`,'🧠');}}}
  if(m.sober>0&&m.alcDay!==S.day&&m.droDay!==S.day)m.sober++;
  m.hist.push(Math.round(m.an));if(m.hist.length>60)m.hist.shift();}
// ---- la depresión se nota: todo cuesta, cae la diversión, el trabajo va peor ----
{const _up9=update;update=function(gm){const r=_up9.apply(this,arguments);try{const m=MT();if(m.dep){S.needs.diversion=Math.max(0,S.needs.diversion-.012*gm);S.needs.energia=Math.max(0,S.needs.energia-.006*gm);S.needs.higiene=Math.max(0,S.needs.higiene-.004*gm);}}catch(e){}return r;};}
{const _au3=autonomy;autonomy=function(){try{const m=MT();const s=S.sim;if(m.dep&&!s.use&&!(s.path&&s.path.length)&&!(s.work>0)&&Math.random()<.05&&!(typeof homeless==='function'&&homeless()&&S.t/60>=18)){const b=findObjs((d,t)=>['cama','camamat','sofa','sofacama'].includes(t));if(b.length){enqueue({k:'obj',i:b[0],act:S.obj[b[0]].t.startsWith('cama')?'techo':'tirarse'});if(throttled('depcama',6e5))tell(pickR([`${CH().name} se ha vuelto a tumbar. No tiene sueño. Tiene nada.`,`${CH().name} mira el techo. Lleva así una hora.`,`Hoy ${CH().name} no ha contestado a nadie.`]),'🌧️');return;}}}catch(e){}return _au3.apply(this,arguments);};}
// faltar al trabajo cuando está hundido
{const _gw2=goWork;goWork=function(){try{const m=MT();if(m.dep&&Math.random()<.15&&!S.sick){S.rep=Math.max(0,(S.rep??60)-4);tell(`${CH().name} no ha ido a trabajar. No ha avisado. Se ha quedado en la cama con el móvil boca abajo.`,'🌧️');toast(`🌧️ ${CH().name} no ha podido ir al curro`);S.lastWorkDay=S.day;return;}}catch(e){}return _gw2.apply(this,arguments);};}
// aspiraciones que caducan cuentan como fallo
{const _ac2=aspCheck;aspCheck=function(){const A=S.asp;const before=A?A.active.slice():[];const dn=A?Object.keys(A.done||{}).length:0;const r=_ac2.apply(this,arguments);try{if(A){const after=A.active;const dn2=Object.keys(A.done||{}).length;const dropped=before.filter(id=>!after.includes(id)&&!(A.done||{})[id]);if(dropped.length&&dn2===dn){A.failed=(A.failed||0)+dropped.length;for(const id of dropped){const a=ASP.find(x=>x.id===id);if(a&&throttled('aspfail',2e5))tell(`Lo de «${a.t()}» ya no va a pasar. ${CH().name} lo sabe.`,'💭');}}}}catch(e){}return r;};}
// ---- salidas: terapia, bar (beber), el camello ----
conLogica(OUT,{
  terapia:{req:()=>!(MT().ther&&MT().ther.on&&MT().ther.pub)&&(MT().an<60||(MT().ther&&MT().ther.on))},
  beber:{req:()=>MT().an<50||MT().alc>=2},
  pillar:{req:()=>!!MT().deal||MT().an<40}});
function outCost2(k){if(k==='terapia')return hrs(7);if(k==='beber')return Math.round((12+MT().alc*4)*PM());if(k==='pillar')return Math.round((25+MT().tol*6)*PM());return null;}
{const _oc=outCost;outCost=function(k){const c=outCost2(k);return c!=null?c:_oc.apply(this,arguments);};}
{const _ob3=outBack;outBack=function(k){const m=MT();const nd=S.needs;const add=(n,v)=>nd[n]=Math.max(0,Math.min(100,nd[n]+v));
  if(k==='terapia'){if(!m.ther||!m.ther.on)m.ther={on:true,pub:false,since:S.day};m.an=Math.min(100,m.an+2.5);add('social',10);m.sess=(m.sess||0)+1;
    tell(pickR([`Sesión de terapia. ${CH().name} ha hablado de su madre. Siempre acaba en su madre.`,`En terapia le han dicho que no es culpa suya. Le ha costado creérselo.`,`Hoy en terapia solo ha llorado. La psicóloga dice que eso también es trabajar.`,`${CH().name} ha salido de terapia con deberes: llamar a alguien cada día.`]),'🧠');
    if(m.sess===1)chapter('ther1','Pedir ayuda',`${CH().name} ha ido a terapia por primera vez. ${fmt(outCost('terapia'))} la sesión; en la pública la lista de espera es de meses. Que la salud mental dependa del sueldo dice mucho de todo.`);return;}
  if(k==='beber'){m.alcDay=S.day;m.alc=Math.min(10,m.alc+(m.alc>=3?.35:.5));m.sober=0;m.an=Math.min(100,m.an+6);add('diversion',30);add('social',15);add('energia',-15);add('higiene',-10);S.hang=S.day+1;
    const n=Math.round(m.alc);tell(n>=6?`${CH().name} ha bebido hasta no acordarse de cómo volvió. Es la ${n}ª vez este mes y ya nadie se ríe.`:n>=3?`Otra noche de copas. ${CH().name} dice que lo controla. Lo dicen todos.`:pickR([`Unas cañas que se convirtieron en muchas. Risas, y luego un silencio raro en el bus de vuelta.`,`${CH().name} ha bebido para no pensar. Ha funcionado unas horas.`]),'🍷');
    if(!m.deal&&(m.an<40||m.alc>=3)&&Math.random()<.35)mtDealer();
    if(m.alc>=3&&!S.story.chap.alc1)chapter('alc1','Para aguantar',`${CH().name} bebe casi cada día. No es fiesta: es anestesia. ${S.jobless?'Desde que está en paro, más.':'Sale del curro y va directo al bar.'}`);
    if(m.alc>=6&&Math.random()<.25){const pt=partner();if(pt){pt.love=Math.max(0,pt.love-6);pt.wear=Math.min(100,(pt.wear||0)+8);pt.wearWhy='la bebida';try{phIncoming(pt,'¿Otra vez borrach'+oa()+'? No puedo más con esto.','gen');}catch(e){}}}return;}
  if(k==='pillar'){mtPillar();return;}
  return _ob3.apply(this,arguments);};}
// ---- el camello: lo conoces por el barrio; la primera vez te lo presentan en el bar o el parque ----
function mtDealer(){const m=MT();if(m.deal)return m.deal;const names=['el Rubio','el Chino','Dani','la Vane','el Moro','Kevin'];m.deal={n:pickR(names),rel:20,heat:0};tell(`En ${pickR(['el bar','el parque','el portal de al lado'])}, alguien le ha presentado a ${m.deal.n}. «Lo que necesites, tú me dices». ${CH().name} ha dicho que no. De momento.`,'🌫️');return m.deal;}
function mtPillar(){const m=MT();const D=mtDealer();const nd=S.needs;m.droDay=S.day;m.dro=Math.min(10,m.dro+(m.dro>=3?.4:.6));m.tol=Math.min(10,m.tol+.3);m.sober=0;D.rel=Math.min(100,D.rel+5);D.heat=Math.min(100,D.heat+6+(W_().era==='represion'?6:0));
  m.an=Math.min(100,m.an+10);nd.diversion=100;nd.energia=Math.min(100,nd.energia+20);nd.hambre=Math.max(0,nd.hambre-15);S.needs.higiene=Math.max(0,S.needs.higiene-8);
  const n=Math.round(m.dro);tell(n>=6?`${CH().name} ya no pilla para divertirse. Pilla para estar normal. ${D.n} le fía, y eso nunca es gratis.`:n>=3?`Otra vez con ${D.n}. ${CH().name} se dice que es para el finde. Es martes.`:pickR([`${CH().name} ha pillado. Unas horas sin pensar en nada. Mañana, la cuenta.`,`Primera vez con ${D.n}. Le ha dicho que la primera invita él. Así empiezan todas.`]),'💊');
  if(m.dro>=3&&!S.story.chap.dro1)chapter('dro1','La salida fácil',`${CH().name} consume casi cada semana. Lo caro no es lo que paga a ${D.n}: es todo lo demás. El barrio está lleno de gente que empezó así, y de policía que solo entra en estos portales.`);
  if(m.dro>=5&&S.money<50&&Math.random()<.3){m.debt=(m.debt||0)+Math.round(40*PM());tell(`${D.n} le ha fiado. ${CH().name} le debe ya ${fmt(m.debt)}. ${D.n} no manda recordatorios por el móvil.`,'🌫️');}
  // redada / registro: más en barrios pobres y con gobierno de mano dura
  const bust=.03+D.heat/400+(W_().era==='represion'?.05:0)+(S.record?.03:0)+(S.home&&['infra','viejo'].includes(S.home.type)?.03:0);
  if(Math.random()<bust){m.bust++;if(m.dro>=4&&Math.random()<.5){arrestAna(3+(Math.random()*10|0),'con sustancias encima');chapter('carcel'+m.bust,'Calabozo',`Registro a la salida del portal. ${CH().name} llevaba lo justo para el finde; para la policía, «cantidad para tráfico». ${S.record?'Con antecedentes, ni fianza.':'Antecedentes. Para siempre.'} ${D.n}, curiosamente, no estaba.`);}
    else{const f=Math.round(300*PM());S.money-=f;S.record=true;tell(`Multa de ${fmt(f)} por tenencia. Y una ficha policial que no se borra. A ${D.n} no le han pedido ni el DNI.`,'🚔');}}}
// deudas con el camello: visita
{const _dly=dailyEvents;dailyEvents=function(){const r=_dly.apply(this,arguments);try{mtDaily();const m=MT();if(m.debt>0&&Math.random()<.2){if(S.money>=m.debt){S.money-=m.debt;tell(`${CH().name} ha pagado lo que debía a ${m.deal.n}. ${fmt(m.debt)}. Se acabó, dice.`,'🌫️');m.debt=0;}else{S.needs.social=Math.max(0,S.needs.social-20);m.an-=4;tell(pickR([`${m.deal.n} ha venido a casa. No ha subido. Solo ha esperado abajo un rato, mirando.`,`Mensaje de ${m.deal.n}: «¿cuándo?». Solo eso.`,`${m.deal.n} ha saludado a su madre en la calle. Por su nombre.`]),'🌫️');}}
  if(S.hang===S.day){S.needs.energia=Math.max(0,S.needs.energia-25);S.needs.hambre=Math.max(0,S.needs.hambre-10);if(throttled('resaca',6e4))toast('🤕 Resaca');}}catch(e){console.error(e);}return r;};}
// ---- dejarlo: con apoyo (terapia, pareja, madre, sindicato) y tiempo; recaídas ----
function mtQuit(){const m=MT();if(m.alc<2&&m.dro<2){toast('No hay nada que dejar');return;}const sup=(m.ther&&m.ther.on?2:0)+(partner()?1:0)+(P_('madre')&&P_('madre').rel>60?1:0)+(S.union&&S.union.member?1:0);
  m.quit={since:S.day,sup};tell(`${CH().name} ha decidido dejarlo. ${sup>=3?'Tiene gente alrededor y alguien profesional. Eso cambia todo.':sup>=1?'Tiene a alguien. No es mucho, pero es algo.':'Sol'+oa()+'. Así casi nadie lo consigue, pero lo va a intentar.'}`,'🌱');toast('🌱 Lo va a intentar',true);}
{const _dly2=dailyEvents;dailyEvents=function(){const r=_dly2.apply(this,arguments);try{const m=MT();if(m.quit){const d=S.day-m.quit.since;const relapse=(.08-m.quit.sup*.02)*(m.an<35?1.8:1)*(m.dro>=5||m.alc>=6?1.5:1);
    if(m.alcDay===S.day||m.droDay===S.day){m.quit=null;tell(`${CH().name} ha recaído. No es un fracaso: es parte. Mañana, otra vez.`,'🌧️');}
    else if(d>0&&d%7===0){m.alc=Math.max(0,m.alc-1);m.dro=Math.max(0,m.dro-1);m.an=Math.min(100,m.an+2);if(m.alc<1&&m.dro<1){m.quit=null;m.sober=d;chapter('sobrio','Limpi'+oa(),`${d} días. ${CH().name} ha dejado ${m.deal?'de pillar y ':''}de beber para anestesiarse. ${m.deal?m.deal.n+' ya no le escribe.':''} No fue la voluntad: fue tener a alguien.`);toast('🌱 '+d+' días limpi'+oa(),true);sfx('level');}}
    if(Math.random()<relapse&&d>2){(m.dro>=2?mtPillar():(()=>{m.alcDay=S.day;m.alc=Math.min(10,m.alc+.3);})());m.quit=null;tell(`Recaída. ${CH().name} no se lo ha contado a nadie.`,'🌧️');}}}catch(e){}return r;};}
// ---- UI: Vida → bloque de ánimo ----
function mtBlock(){const m=MT();const lv=anLvl();const col=lv==='bien'?'#2e8b57':lv==='bajo'?'#e9a23b':'#c0392b';
  let h=`<h3>🧠 Ánimo</h3><div class="minibars"><i style="width:${Math.round(m.an)}%;background:${col}"></i></div><div class="sub" style="font-size:12px"><b>${lv==='bien'?'Bien':lv==='bajo'?'Bajo':lv==='hundido'?'Hundid'+oa():'Depresión'}</b>${m.why&&m.why.length?' · pesa: '+m.why.join(', '):''}</div>`;
  if(m.ther&&m.ther.on)h+=`<div class="sub" style="font-size:12px">🧠 En terapia ${m.ther.pub?'(pública, una vez al mes y medio)':'(privada, '+fmt(hrs(7))+'/semana)'}</div>`;
  else if(m.wait>0)h+=`<div class="sub" style="font-size:12px">⏳ En lista de espera de salud mental: ${m.wait} días</div>`;
  else if(m.an<50)h+=`<button class="btn grey" id="mtpub">🏥 Pedir cita en la pública (gratis, lista de espera)</button>`;
  if(m.alc>=2||m.dro>=2){h+=`<div class="sub" style="font-size:12px;color:#a04a3a">${m.alc>=2?'🍷 Bebe '+(m.alc>=6?'cada día':m.alc>=3?'casi a diario':'de más')+'. ':''}${m.dro>=2?'💊 Consume '+(m.dro>=6?'a diario':m.dro>=3?'cada semana':'a veces')+'. ':''}${m.debt?'Debe '+fmt(m.debt)+' a '+m.deal.n+'. ':''}</div>`;if(!m.quit)h+=`<button class="btn grey" id="mtquit">🌱 Intentar dejarlo</button>`;else h+=`<div class="sub" style="font-size:12px">🌱 Lleva ${S.day-m.quit.since} días intentando dejarlo</div>`;}
  if(m.sober>=7&&!m.quit&&m.alc<1&&m.dro<1)h+=`<div class="sub" style="font-size:12px">🌱 ${m.sober} días limpi${oa()}</div>`;
  return h;}
{const _vt=vidaTab;vidaTab=function(){const h=_vt.apply(this,arguments);try{return mtBlock()+h;}catch(e){return h;}};}
{const _bs2=bindSociety;bindSociety=function(){_bs2.apply(this,arguments);const q=s=>card.querySelector(s);const a=q('#mtpub');if(a)a.onclick=()=>{const m=MT();m.wait=45+(Math.random()*90|0);m.waitSince=S.day;tell(`${CH().name} ha pedido cita en salud mental. Le han dado para dentro de ${Math.round(m.wait/7)} semanas. «Si es urgente, vaya a urgencias».`,'🏥');openMenu('vida');};const b=q('#mtquit');if(b)b.onclick=()=>{mtQuit();openMenu('vida');};};}
// la IA: cuando está hundido y no hay ayuda, tira de lo que hay a mano
{const _au4=autonomy;autonomy=function(){try{const m=MT();const s=S.sim;const h=S.t/60;if(S.autoHome&&m.an<40&&!(s.work>0)&&!s.leaving&&h>=18&&h<22.5&&Math.random()<.06){const k=(m.deal||m.dro>=1)&&Math.random()<.45?'pillar':'beber';if(!outAvail(k)&&S.money>outCost(k)){doOut(k);return;}}
  if(S.autoHome&&m.an<35&&!m.ther&&!m.wait&&Math.random()<.01){const pub=S.money<800||isLeft();if(pub){m.wait=45+(Math.random()*90|0);m.waitSince=S.day;tell(`${CH().name} ha pedido cita en salud mental. ${Math.round(m.wait/7)} semanas de espera.`,'🏥');}else if(!outAvail('terapia')){doOut('terapia');return;}}}catch(e){}return _au4.apply(this,arguments);};}
// HUD: ánimo en la ficha
{const _mood=mood;mood=function(){const v=_mood.apply(this,arguments);try{const m=MT();return v*(m.dep?.8:m.an<45?.92:1);}catch(e){return v;}};}
// hundido, no apetece salir a correr ni a la asamblea
{const _mo=maybeOuting;maybeOuting=function(){try{if(MT().dep&&Math.random()<.6)return false;}catch(e){}return _mo.apply(this,arguments);};}
