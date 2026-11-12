// =================== MARGINALIDAD: impago, desahucio, calle, albergue, pedir, servicios sociales, estigma ===================
const MG=()=>{if(!S.mg)S.mg={debt:0,wk:0,bank:0,calle:null,alb:0,ss:0,ssSince:0,imv:false,fines:0,hist:[]};return S.mg;};
const homeless=()=>!!(S.home&&S.home.type==='calle');
// plantilla: un rincón del parque. Colchón, un banco, una fuente. Sin paredes.
{const _ht=homeTemplate;homeTemplate=function(type){if(type!=='calle')return _ht.apply(this,arguments);const T0=_ht('casita');const I=(x,y)=>y*N+x;
  for(let i=0;i<N*N;i++){T0.wl[i]=0;T0.wc[i]=0;T0.ob[i]=null;T0.fl[i]=0;}
  const o=(x,y,t,q=1,ex={})=>{T0.ob[I(x,y)]={t,q,c:ex.c??100,r:0,...ex};};
  for(let y=0;y<N;y++)T0.fl[I(9,y)]=4;for(let x=0;x<N;x++)T0.fl[I(x,12)]=4;
  o(6,7,'colchon',1,{c:35});o(5,6,'seto');o(6,6,'seto');o(7,6,'seto');o(5,7,'seto');o(5,8,'seto');o(8,9,'bancoj',2,{c:60});o(11,8,'fuente',2);o(3,4,'arbol');o(14,5,'arbol');o(13,14,'arbol');o(3,15,'arbol');o(12,10,'farola',2);o(6,14,'farola',2);
  T0.area=[5,6,8,9];T0.sim=[7.5,8.5];T0.mates=[];return T0;};}
// ---- el alquiler: si no hay dinero, no se paga. Y eso tiene consecuencias ----
{const _pr=payRent;payRent=function(){const m=MG();if(homeless())return;const T=S.home&&S.home.type;
  if(T==='padres'){if(S.money<0){const md=P_('madre');if(md){md.rel=Math.max(0,md.rel-3);m.wk++;if(m.wk===4)tell(`Su madre no dice nada de que no ponga para la compra. Lo paga ella, de la pensión. Eso es lo que más duele.`,'👩‍🦳');if(md.rel<15&&m.wk>=6&&Math.random()<.3){mgEvict('madre');return;}}}else m.wk=0;return _pr.apply(this,arguments);}
  if(S.owned){const mo=S.mort;if(!mo)return _pr.apply(this,arguments);if(S.money-mo.pay<-mo.pay*3){m.bank++;m.debt+=mo.pay;mgBankWarn();return;}m.bank=0;return _pr.apply(this,arguments);}
  const rent=weeklyRent()-partnerShare(weeklyRent());
  if(S.money-rent<-rent*3){m.wk++;m.debt+=rent;mgRentWarn(rent);return;}
  if(m.wk&&S.money>m.debt+rent){S.money-=m.debt;tell(`${CH().name} ha pagado lo que debía de alquiler: ${fmt(m.debt)}. El casero no ha dado las gracias.`,'🏠');m.debt=0;m.wk=0;}
  else if(m.wk&&S.money-rent>0){m.wk=Math.max(0,m.wk-.5);}
  return _pr.apply(this,arguments);};}
function mgRentWarn(rent){const m=MG();const n=Math.round(m.wk);
  if(n===1)tell(`No ha podido pagar el alquiler esta semana. ${fmt(rent)}. El casero ha mandado un mensaje: «¿?»`,'🏠');
  else if(n===3)tell(`Tres semanas sin pagar. Un burofax en el buzón: diez días para pagar ${fmt(m.debt)} o demanda de desahucio.`,'📨');
  else if(n===5){chapter('demanda','La demanda',`Ha llegado la demanda del juzgado. ${CH().name} debe ${fmt(m.debt)}. Abogado de oficio, si lo consigue. El casero tiene uno de pago. ${isI('anarquista','marxista')?'Ha pasado por el sindicato de vivienda: le dicen que no está sola.':'No sabe a quién llamar.'}`);S.needs.diversion=Math.max(0,S.needs.diversion-20);}
  else if(n===7)tell(`Fecha de desahucio: la semana que viene, a las nueve. ${CH().name} lo ha leído tres veces.`,'🚪');
  else if(n>=8)mgEvict('casero');
  else if(throttled('rentw',3e5))toast(`🏠 Alquiler impagado: ${n} semanas (${fmt(m.debt)})`);}
function mgBankWarn(){const m=MG();const n=m.bank;if(n===1)tell(`La cuota de la hipoteca ha venido devuelta. El banco cobra ${fmt(Math.round(35*PM()))} de comisión por avisarle de que no tiene dinero.`,'🏦');
  else if(n===4)tell(`Cuatro cuotas sin pagar. El banco amenaza con ejecutar la hipoteca. ${CH().name} ha pagado años; ahora la casa vale menos que la deuda.`,'🏦');
  else if(n>=10)mgEvict('banco');else if(throttled('bankw',3e5))toast(`🏦 Hipoteca impagada: ${n} cuotas`);}
// ---- desahucio: a casa de la madre si se puede; si no, a la calle. El barrio puede pararlo ----
function mgEvict(who){const m=MG();const nm=CH().name;const md=P_('madre');
  // el barrio para el desahucio
  if(who!=='madre'&&(isI('anarquista','marxista')||S.rentStrike||(S.union&&S.union.member))&&Math.random()<(S.rentStrike?.6:.4)&&!m.stopped){m.stopped=S.day;m.wk=4;chapter('parado','Este desahucio lo paramos',`A las ocho de la mañana había cuarenta personas en el portal. La comisión judicial no ha podido entrar. ${who==='banco'?'El banco':'El casero'} tendrá que pedir otra fecha. ${nm} no ha dormido, pero hoy ha llorado de otra cosa.`);toast('✊ Desahucio parado por el barrio',true);sfx('level');ex().exp.solid+=2;return;}
  if(who==='banco'){const left=S.mort?Math.round(S.mort.left):0;const v=Math.round(housePrice()*.6);m.bankDebt=Math.max(0,left-v);S.owned=false;S.mort=null;}
  m.evicted=(m.evicted||0)+1;m.debt=0;m.wk=0;m.bank=0;
  const toMom=md&&md.rel>=30&&who!=='madre'&&S.home.type!=='padres';
  const lost=[];for(let i=0;i<N*N;i++){const o=S.obj[i];if(o&&!o.priv&&OBJ[o.t].p>60)lost.push(OBJ[o.t].n.toLowerCase());}
  applyHome(toMom?'padres':'calle');computeRooms();if(typeof centerOnWorld==='function')centerOnWorld(S.sim.x,S.sim.y);
  if(toMom)chapter('desah'+m.evicted,'Desahucio',`${who==='banco'?'El banco se ha quedado la casa.':'La comisión judicial ha venido a las nueve con dos policías y un cerrajero.'} ${nm} ha sacado lo que cabía en dos bolsas y una maleta. ${lost.length?'Lo demás —'+lost.slice(0,3).join(', ')+'— se queda dentro.':''} Su madre la ha ido a buscar${md.rel>=60?' y no le ha preguntado nada':', con la cara que pone cuando no quiere decir lo que piensa'}. ${m.bankDebt?'Y sigue debiendo '+fmt(m.bankDebt)+' al banco por una casa que ya no es suya.':''}`);
  else{m.calle={since:S.day};chapter('calle'+m.evicted,'La calle',who==='madre'?`Su madre le ha dicho que se vaya. Meses sin poner nada, sin hablar, sin levantarse. ${nm} ha dormido esta noche en el parque, con la mochila de almohada. Ha pensado que mañana lo arregla. Mañana.`:`${who==='banco'?'El banco se ha quedado la casa.':'Cerrajero, dos policías y una funcionaria con prisa.'} ${nm} no tiene a quién llamar${md?'; con su madre no se habla':''}. Ha dormido en el parque, detrás de los setos, con las bolsas atadas al tobillo. La primera noche no se duerme. La segunda, sí.`);toast('🧳 Sin casa',true);sfx('bad');
    try{MT().an=Math.max(0,MT().an-15);}catch(e){}
    for(const p of (S.people||[]))if(p.rel<70&&p.k!=='madre')p.rel=Math.max(0,p.rel-10);}}
// ---- la calle, día a día: frío, policía, estigma, ánimo; y la salida ----
{const _dl=dailyEvents;dailyEvents=function(){const r=_dl.apply(this,arguments);try{const m=MG();if(!homeless()){if(m.calle){m.calle=null;}return r;}
  const nd=S.needs;const d=S.day-(m.calle?m.calle.since:S.day);const nm=CH().name;const inv=typeof seasonOf==='function'?seasonOf(S.day)==='inv':false;
  try{MT().an=Math.max(0,MT().an-(d<7?1.5:1));}catch(e){}
  nd.higiene=Math.max(0,nd.higiene-6);nd.social=Math.max(0,nd.social-3);
  if(inv&&Math.random()<.12&&!S.sick){S.sick=true;S.sickDays=2+(Math.random()*3|0);tell(`Ha pasado la noche a dos grados. Hoy ${nm} tose y le duele todo. No hay cama en la que quedarse.`,'🤒');}
  if(S.rep!=null&&!S.jobless&&Math.random()<.3){S.rep=Math.max(0,S.rep-1.5);if(throttled('calleRep',4e5))tell(`En el trabajo han empezado a notar algo: la ropa, el olor, el cansancio. Nadie pregunta. Alguien ha hecho una broma.`,'🏢');}
  const rep=W_().era==='represion';
  if(Math.random()<(rep?.12:.05)){const f=Math.round((rep?200:100)*PM());m.fines++;bkAdd('Multa',-f);tell(pickR([`Policía municipal, seis de la mañana: «aquí no se puede dormir». Multa de ${fmt(f)} por la ordenanza de convivencia. A quien no tiene casa, por no tener casa.`,`Limpieza se ha llevado el colchón y una de las bolsas. «Residuos». Dentro iba la documentación.`,`Identificación en el parque. ${fmt(f)} de multa por «acampada». ${nm} no sabe con qué la va a pagar; ellos tampoco, y da igual.`]),'🚔');if(Math.random()<.4){const i=findObjs((dd,t)=>t==='colchon')[0];if(i!=null){S.obj[i]=null;dirty();}}}
  if(Math.random()<.5&&!findObjs((dd,t)=>t==='colchon').length){const i=(7)*N+6;if(!S.obj[i]){S.obj[i]={t:'colchon',q:1,c:30,r:0};dirty();tell(`${nm} ha encontrado otro colchón en un contenedor. Mejor que el otro, casi.`,'🛌');}}
  for(const p of (S.people||[]))if(p.k!=='madre'&&p.rel<80&&Math.random()<.15)p.rel=Math.max(0,p.rel-1);
  try{if(!MT().deal&&Math.random()<.06)mtDealer();}catch(e){}
  if(d===3)tell(`Tercer día. ${nm} ha aprendido dónde hay una fuente, a qué hora cierra el parque, qué banco da el sol por la mañana. Son cosas que no quería saber.`,'🧳');
  if(d===14&&!S.story.chap.calle14)chapter('calle14','Invisible',`Dos semanas. La gente ya no la mira: la rodea. ${nm} ha visto a conocid${oa()}s cambiar de acera. Lo peor no es el frío. Es ser mueble.`);
  if(d===45&&!S.story.chap.calle45)chapter('calle45','Cronificarse',`Mes y medio. Los de servicios sociales lo llaman «cronificarse», como si fuera algo que uno hace. ${nm} ya no planea mañana. Planea esta noche.`);
  // IMV / renta mínima
  if(m.imv&&dateOf(S.day).wd===0){const v=Math.round(115*PM());bkAdd('Ayuda',v);toast(`🏛️ Ingreso mínimo: ${fmt(v)}`);}
  // servicios sociales: si hay nómina, piso; si no, albergue y paciencia
  if(m.ss>=2&&S.day-m.ssSince>=21&&!m.imv){m.imv=true;chapter('imv','El papel',`Después de tres citas, dos certificados de empadronamiento sin domicilio y una espera de semanas, le han aprobado el ingreso mínimo: ${fmt(Math.round(115*PM()))} a la semana. Es menos que el alquiler más barato del barrio. Está diseñado así.`);}
  if(m.ss>=2&&!S.jobless&&S.shifts>=8&&Math.random()<.15){applyHome('habitacion');computeRooms();if(typeof centerOnWorld==='function')centerOnWorld(S.sim.x,S.sim.y);S.money-=Math.round(moveCost('habitacion')*.3);m.calle=null;chapter('techo','Un techo',`La trabajadora social ha conseguido una habitación de un programa de la ONG. Con el sueldo de ${nm} y una fianza reducida. ${d} días en la calle. Una llave en el bolsillo pesa más de lo que parece.`);toast('🔑 Tiene habitación',true);sfx('level');}
  m.hist.push(d);}catch(e){console.error(e);}return r;};}
// ---- salidas desde la calle ----
conLogica(OUT,{
  albergue:{req:()=>homeless()},
  pedir:{req:()=>homeless()||S.money<-100},
  chatarra:{req:()=>homeless()||S.money<-50},
  ssociales:{req:()=>homeless()||MG().wk>=3||S.money<-200}});
{const _c=outCost;outCost=function(k){if(['albergue','pedir','chatarra','ssociales'].includes(k))return 0;return _c.apply(this,arguments);};}
OUT.comedor.req=()=>homeless()||S.money<60;
{const _ob=outBack;outBack=function(k){const m=MG();const nd=S.needs;const nm=CH().name;const add=(n,v)=>nd[n]=Math.max(0,Math.min(100,nd[n]+v));
  if(k==='albergue'){m.alb++;add('energia',75);add('higiene',70);add('hambre',60);add('social',10);m.albMonth=(m.albMonth||0)+1;
    tell(m.alb===1?`Primera noche en el albergue. Cola a las siete, ducha de cinco minutos, cena en bandeja, litera, luces fuera a las once, fuera a las ocho. Hay ${pickR(['un chaval de veinte','un señor que fue delineante','una mujer con dos bolsas de deporte'])} que lleva dos años así.`:pickR([`Albergue. Le han cambiado de litera: ha venido una familia con niños.`,`Noche en el albergue. Alguien le ha robado el cargador. Nadie ha dormido.`,`El albergue estaba lleno; le han dado una colchoneta en el pasillo. Mejor que el parque.`,`En el albergue hay una trabajadora que se sabe su nombre. Es lo más parecido a casa.`]),'🛏️');
    if(m.albMonth>=12&&Math.random()<.3){tell(`En el albergue le han dicho que ha agotado las noches del mes. «Es para emergencias». ${nm} pregunta qué es esto, entonces.`,'🛏️');}return;}
  if(k==='pedir'){const v=Math.round((3+Math.random()*12)*PM()*(dateOf(S.day).wd>=5?1.5:1));S.money+=v;try{MT().an-=2;}catch(e){}add('social',-10);add('hambre',10);
    tell(pickR([`${fmt(v)} en cuatro horas en la puerta del súper. La mayoría no mira. Una señora le ha dado una barra de pan y le ha dicho «que Dios te ayude». Un guardia la ha movido dos veces.`,`Pedir. ${fmt(v)}. Ha visto pasar a ${((S.people||[])[0]||{}).n||'alguien conocido'}, que ha mirado el móvil justo a tiempo.`,`${fmt(v)} y un bocadillo. Un chaval le ha hecho una foto. ${nm} no sabe para qué.`]),'🥤');
    for(const p of (S.people||[]))if(Math.random()<.1&&p.rel<70)p.rel=Math.max(0,p.rel-4);return;}
  if(k==='chatarra'){const v=Math.round((6+Math.random()*16)*PM());S.money+=v;add('energia',-25);add('higiene',-15);
    tell(pickR([`Un carro de supermercado, cuatro kilómetros, ${fmt(v)} en la chatarrería. El del peso paga lo que quiere.`,`Chatarra: ${fmt(v)}. Se ha cruzado con dos hombres que llevan años en lo mismo; le han dicho qué contenedores son de quién.`,`${fmt(v)} de cobre. Se ha cortado con un cable y no tiene dónde lavárselo.`]),'🛒');return;}
  if(k==='ssociales'){m.ss++;if(!m.ssSince)m.ssSince=S.day;add('social',5);try{MT().an-=1;}catch(e){}
    tell(m.ss===1?`Servicios sociales. Dos horas de espera para una cita dentro de tres semanas. Hace falta empadronamiento, y para empadronarse hace falta domicilio. La trabajadora social lo sabe; está tan cansada como ${nm}.`:m.ss===2?`Segunda cita. Han abierto expediente. La trabajadora social tiene 140 casos. Le ha dado un papel para el albergue y otro para el comedor, y le ha dicho, en voz baja, que no deje de venir.`:pickR([`Servicios sociales: «estamos tramitándolo». Hoy la trabajadora era otra.`,`Cita en servicios sociales. Le han pedido un documento que ya entregó.`,`Servicios sociales. ${nm} ha visto a su vecina de antes en la sala de espera. Ninguna ha dicho nada.`]),'🏛️');return;}
  return _ob.apply(this,arguments);};}
// ---- la IA: si duerme en la calle, busca albergue las noches malas y pide cuando no hay nada ----
{const _au=autonomy;autonomy=function(){try{if(homeless()&&S.autoHome){const s=S.sim;const h=S.t/60;if(!(s.work>0)&&!s.leaving){
    if(h>=19&&h<21.5&&(S.needs.higiene<40||S.needs.energia<50||Math.random()<.3)&&!outAvail('albergue')){doOut('albergue');return;}
    if(S.outDay===S.day)return _au.apply(this,arguments);
    if(h>=9&&h<13&&dateOf(S.day).wd>=1&&dateOf(S.day).wd<=5&&MG().ss<2&&Math.random()<.03&&!outAvail('ssociales')){doOut('ssociales');return;}
    if(S.money<15&&S.needs.hambre<40&&h>=9&&h<20&&Math.random()<.02){const k=Math.random()<.5?'pedir':'chatarra';if(!outAvail(k)){doOut(k);return;}}
    if(S.needs.hambre<35&&h>=12&&h<15&&Math.random()<.04&&!outAvail('comedor')){doOut('comedor');return;}}}}catch(e){}return _au.apply(this,arguments);};}
// sin domicilio cuesta más que te contraten
{const _as=autoSeek;autoSeek=function(){if(homeless()&&Math.random()<.55){if(throttled('calleJob',6e5)&&S.jobless)tell(`Entrevista. «¿Dirección?». ${CH().name} ha dado la de su madre. Han llamado; su madre ha dicho que no vive ahí.`,'📋');return;}return _as.apply(this,arguments);};}
// ---- UI ----
function mgBlock(){const m=MG();let h='';
  if(homeless()){const d=S.day-(m.calle?m.calle.since:S.day);h+=`<h3>🧳 Sin casa</h3><div class="sub" style="font-size:12px">${d} días en la calle · ${m.alb} noches de albergue · ${m.fines} multas${m.imv?' · cobra el ingreso mínimo':m.ss?' · expediente abierto en servicios sociales ('+m.ss+' citas)':''}</div><div class="sub" style="font-size:12px">Para salir: un trabajo con nómina y servicios sociales, o ${fmt(moveCost('habitacion'))} de fianza. Ninguna de las dos cosas se consigue sin la otra.</div>`;}
  else if(m.wk>=1)h+=`<h3>🏠 Alquiler impagado</h3><div class="sub" style="font-size:12px;color:#a04a3a">${Math.round(m.wk)} semanas · debe ${fmt(m.debt)} · ${m.wk>=5?'hay demanda de desahucio':m.wk>=3?'burofax recibido':'el casero pregunta'}</div>`;
  else if(m.bank>=1)h+=`<h3>🏦 Hipoteca impagada</h3><div class="sub" style="font-size:12px;color:#a04a3a">${m.bank} cuotas · el banco ${m.bank>=4?'amenaza con ejecutar':'cobra comisiones'}</div>`;
  if(m.bankDebt)h+=`<div class="sub" style="font-size:12px">🏦 Deuda con el banco tras perder la casa: ${fmt(m.bankDebt)}</div>`;
  return h;}
{const _vt=vidaTab;vidaTab=function(){const h=_vt.apply(this,arguments);try{return mgBlock()+h;}catch(e){return h;}};}
// en la calle no hay facturas ni alquiler
{const _pu=payUtilities;payUtilities=function(){if(homeless())return;return _pu.apply(this,arguments);};}
// volver con la madre requiere que la madre quiera
{const _cm=canMove;canMove=function(k){const r=_cm.apply(this,arguments);if(k==='padres'){const md=P_('madre');if(!md){r.ok=false;r.why.push('no tiene madre a la que volver');}else if(md.rel<25){r.ok=false;r.why.push(`su madre no quiere verl${oa()} en casa`);}}return r;};}
