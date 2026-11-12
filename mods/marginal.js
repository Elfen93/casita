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
  if(T==='padres'){if(S.money<0){const md=P_('madre');if(md){md.rel=Math.max(0,md.rel-3);m.wk++;if(m.wk===4)tell(TXHZ.marginal.madre_calla,'👩‍🦳');if(md.rel<15&&m.wk>=6&&Math.random()<.3){mgEvict('madre');return;}}}else m.wk=0;return _pr.apply(this,arguments);}
  if(S.owned){const mo=S.mort;if(!mo)return _pr.apply(this,arguments);if(S.money-mo.pay<-mo.pay*3){m.bank++;m.debt+=mo.pay;mgBankWarn();return;}m.bank=0;return _pr.apply(this,arguments);}
  const rent=weeklyRent()-partnerShare(weeklyRent());
  if(S.money-rent<-rent*3){m.wk++;m.debt+=rent;mgRentWarn(rent);return;}
  if(m.wk&&S.money>m.debt+rent){S.money-=m.debt;tell(huecos(TXHZ.marginal.paga_deuda,{c:fmt(m.debt)}),'🏠');m.debt=0;m.wk=0;}
  else if(m.wk&&S.money-rent>0){m.wk=Math.max(0,m.wk-.5);}
  return _pr.apply(this,arguments);};}
function mgRentWarn(rent){const m=MG();const n=Math.round(m.wk);
  if(n===1)tell(huecos(TXHZ.marginal.alq_1,{c:fmt(rent)}),'🏠');
  else if(n===3)tell(huecos(TXHZ.marginal.alq_3,{c:fmt(m.debt)}),'📨');
  else if(n===5){chapter('demanda',TXHZ.marginal.demanda_titulo,huecos(TXHZ.marginal.demanda,{c:fmt(m.debt),ayuda:isI('anarquista','marxista')?TXHZ.marginal.demanda_sindicato:TXHZ.marginal.demanda_sola}));S.needs.diversion=Math.max(0,S.needs.diversion-20);}
  else if(n===7)tell(huecos(TXHZ.marginal.alq_7,{}),'🚪');
  else if(n>=8)mgEvict('casero');
  else if(throttled('rentw',3e5))toast(huecos(TXHZ.marginal.alq_toast,{sem:n,c:fmt(m.debt)}));}
function mgBankWarn(){const m=MG();const n=m.bank;if(n===1)tell(huecos(TXHZ.marginal.hip_1,{c:fmt(Math.round(35*PM()))}),'🏦');
  else if(n===4)tell(huecos(TXHZ.marginal.hip_4,{}),'🏦');
  else if(n>=10)mgEvict('banco');else if(throttled('bankw',3e5))toast(huecos(TXHZ.marginal.hip_toast,{cuotas:n}));}
// ---- desahucio: a casa de la madre si se puede; si no, a la calle. El barrio puede pararlo ----
function mgEvict(who){const m=MG();const nm=CH().name;const md=P_('madre');
  // el barrio para el desahucio
  if(who!=='madre'&&(isI('anarquista','marxista')||S.rentStrike||(S.union&&S.union.member))&&Math.random()<(S.rentStrike?.6:.4)&&!m.stopped){m.stopped=S.day;m.wk=4;chapter('parado',TXHZ.marginal.parado_titulo,huecos(TXHZ.marginal.parado,{quien:who==='banco'?TXHZ.marginal.el_banco:TXHZ.marginal.el_casero}));toast(TXHZ.marginal.parado_toast,true);sfx('level');ex().exp.solid+=2;return;}
  if(who==='banco'){const left=S.mort?Math.round(S.mort.left):0;const v=Math.round(housePrice()*.6);m.bankDebt=Math.max(0,left-v);S.owned=false;S.mort=null;}
  m.evicted=(m.evicted||0)+1;m.debt=0;m.wk=0;m.bank=0;
  const toMom=md&&md.rel>=30&&who!=='madre'&&S.home.type!=='padres';
  const lost=[];for(let i=0;i<N*N;i++){const o=S.obj[i];if(o&&!o.priv&&OBJ[o.t].p>60)lost.push(OBJ[o.t].n.toLowerCase());}
  applyHome(toMom?'padres':'calle');computeRooms();if(typeof centerOnWorld==='function')centerOnWorld(S.sim.x,S.sim.y);
  if(toMom)chapter('desah'+m.evicted,TXHZ.marginal.desahucio,huecos(TXHZ.marginal.desahucio_madre,{quien:who==='banco'?TXHZ.marginal.banco_casa:TXHZ.marginal.comision,resto:lost.length?huecos(TXHZ.marginal.desahucio_resto,{lo:lost.slice(0,3).join(', ')}):'',madre:md.rel>=60?TXHZ.marginal.madre_calla_nada:TXHZ.marginal.madre_cara,deuda:m.bankDebt?huecos(TXHZ.marginal.desahucio_deuda,{c:fmt(m.bankDebt)}):''}));
  else{m.calle={since:S.day};chapter('calle'+m.evicted,TXHZ.marginal.calle_titulo,who==='madre'?huecos(TXHZ.marginal.calle_madre,{}):huecos(TXHZ.marginal.calle,{quien:who==='banco'?TXHZ.marginal.banco_casa:TXHZ.marginal.cerrajero,madre:md?TXHZ.marginal.calle_madre_no:''}));toast(TXHZ.marginal.sin_casa_toast,true);sfx('bad');
    try{MT().an=Math.max(0,MT().an-15);}catch(e){}
    for(const p of (S.people||[]))if(p.rel<70&&p.k!=='madre')p.rel=Math.max(0,p.rel-10);}}
// ---- la calle, día a día: frío, policía, estigma, ánimo; y la salida ----
{const _dl=dailyEvents;dailyEvents=function(){const r=_dl.apply(this,arguments);try{const m=MG();if(!homeless()){if(m.calle){m.calle=null;}return r;}
  const nd=S.needs;const d=S.day-(m.calle?m.calle.since:S.day);const nm=CH().name;const inv=typeof seasonOf==='function'?seasonOf(S.day)==='inv':false;
  try{MT().an=Math.max(0,MT().an-(d<7?1.5:1));}catch(e){}
  nd.higiene=Math.max(0,nd.higiene-6);nd.social=Math.max(0,nd.social-3);
  if(inv&&Math.random()<.12&&!S.sick){S.sick=true;S.sickDays=2+(Math.random()*3|0);tell(huecos(TXHZ.marginal.frio,{}),'🤒');}
  if(S.rep!=null&&!S.jobless&&Math.random()<.3){S.rep=Math.max(0,S.rep-1.5);if(throttled('calleRep',4e5))tell(TXHZ.marginal.calle_trabajo,'🏢');}
  const rep=W_().era==='represion';
  if(Math.random()<(rep?.12:.05)){const f=Math.round((rep?200:100)*PM());m.fines++;bkAdd('Multa',-f);tell(huecos(pickR(TXHZ.marginal.multa),{c:fmt(f),n:nm}),'🚔');if(Math.random()<.4){const i=findObjs((dd,t)=>t==='colchon')[0];if(i!=null){S.obj[i]=null;dirty();}}}
  if(Math.random()<.5&&!findObjs((dd,t)=>t==='colchon').length){const i=(7)*N+6;if(!S.obj[i]){S.obj[i]={t:'colchon',q:1,c:30,r:0};dirty();tell(huecos(TXHZ.marginal.colchon,{}),'🛌');}}
  for(const p of (S.people||[]))if(p.k!=='madre'&&p.rel<80&&Math.random()<.15)p.rel=Math.max(0,p.rel-1);
  try{if(!MT().deal&&Math.random()<.06)mtDealer();}catch(e){}
  if(d===3)tell(huecos(TXHZ.marginal.dia3,{}),'🧳');
  if(d===14&&!S.story.chap.calle14)chapter('calle14',TXHZ.marginal.dia14_titulo,huecos(TXHZ.marginal.dia14,{}));
  if(d===45&&!S.story.chap.calle45)chapter('calle45',TXHZ.marginal.dia45_titulo,huecos(TXHZ.marginal.dia45,{}));
  // IMV / renta mínima
  if(m.imv&&dateOf(S.day).wd===0){const v=Math.round(115*PM());bkAdd('Ayuda',v);toast(huecos(TXHZ.marginal.imv_toast,{c:fmt(v)}));}
  // servicios sociales: si hay nómina, piso; si no, albergue y paciencia
  if(m.ss>=2&&S.day-m.ssSince>=21&&!m.imv){m.imv=true;chapter('imv',TXHZ.marginal.imv_titulo,huecos(TXHZ.marginal.imv,{c:fmt(Math.round(115*PM()))}));}
  if(m.ss>=2&&!S.jobless&&S.shifts>=8&&Math.random()<.15){applyHome('habitacion');computeRooms();if(typeof centerOnWorld==='function')centerOnWorld(S.sim.x,S.sim.y);S.money-=Math.round(moveCost('habitacion')*.3);m.calle=null;chapter('techo',TXHZ.marginal.techo_titulo,huecos(TXHZ.marginal.techo,{d}));toast(TXHZ.marginal.techo_toast,true);sfx('level');}
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
    tell(m.alb===1?huecos(TXHZ.marginal.albergue_1,{quien:pickR(TXHZ.marginal.albergue_quien)}):pickR(TXHZ.marginal.albergue),'🛏️');
    if(m.albMonth>=12&&Math.random()<.3){tell(huecos(TXHZ.marginal.albergue_mes,{}),'🛏️');}return;}
  if(k==='pedir'){const v=Math.round((3+Math.random()*12)*PM()*(dateOf(S.day).wd>=5?1.5:1));S.money+=v;try{MT().an-=2;}catch(e){}add('social',-10);add('hambre',10);
    tell(huecos(pickR(TXHZ.marginal.pedir),{c:fmt(v),quien:((S.people||[])[0]||{}).n||TXHZ.marginal.alguien_conocido,n:nm}),'🥤');
    for(const p of (S.people||[]))if(Math.random()<.1&&p.rel<70)p.rel=Math.max(0,p.rel-4);return;}
  if(k==='chatarra'){const v=Math.round((6+Math.random()*16)*PM());S.money+=v;add('energia',-25);add('higiene',-15);
    tell(huecos(pickR(TXHZ.marginal.chatarra),{c:fmt(v)}),'🛒');return;}
  if(k==='ssociales'){m.ss++;if(!m.ssSince)m.ssSince=S.day;add('social',5);try{MT().an-=1;}catch(e){}
    tell(m.ss===1?huecos(TXHZ.marginal.ss_1,{}):m.ss===2?TXHZ.marginal.ss_2:huecos(pickR(TXHZ.marginal.ss_otras),{n:nm}),'🏛️');return;}
  return _ob.apply(this,arguments);};}
// ---- la IA: si duerme en la calle, busca albergue las noches malas y pide cuando no hay nada ----
{const _au=autonomy;autonomy=function(){try{if(homeless()&&S.autoHome){const s=S.sim;const h=S.t/60;if(!(s.work>0)&&!s.leaving){
    if(h>=19&&h<21.5&&(S.needs.higiene<40||S.needs.energia<50||Math.random()<.3)&&!outAvail('albergue')){doOut('albergue');return;}
    if(S.outDay===S.day)return _au.apply(this,arguments);
    if(h>=9&&h<13&&dateOf(S.day).wd>=1&&dateOf(S.day).wd<=5&&MG().ss<2&&Math.random()<.03&&!outAvail('ssociales')){doOut('ssociales');return;}
    if(S.money<15&&S.needs.hambre<40&&h>=9&&h<20&&Math.random()<.02){const k=Math.random()<.5?'pedir':'chatarra';if(!outAvail(k)){doOut(k);return;}}
    if(S.needs.hambre<35&&h>=12&&h<15&&Math.random()<.04&&!outAvail('comedor')){doOut('comedor');return;}}}}catch(e){}return _au.apply(this,arguments);};}
// sin domicilio cuesta más que te contraten
{const _as=autoSeek;autoSeek=function(){if(homeless()&&Math.random()<.55){if(throttled('calleJob',6e5)&&S.jobless)tell(huecos(TXHZ.marginal.entrevista_calle,{}),'📋');return;}return _as.apply(this,arguments);};}
// ---- UI ----
function mgBlock(){const m=MG();let h='';
  if(homeless()){const d=S.day-(m.calle?m.calle.since:S.day);h+=`<h3>${TXHZ.marginal.bloque_sin_casa}</h3><div class="sub" style="font-size:12px">${huecos(TXHZ.marginal.bloque_dias,{d,alb:m.alb,multas:m.fines})}${m.imv?TXHZ.marginal.bloque_imv:m.ss?huecos(TXHZ.marginal.bloque_expediente,{citas:m.ss}):''}</div><div class="sub" style="font-size:12px">${huecos(TXHZ.marginal.bloque_salir,{c:fmt(moveCost('habitacion'))})}</div>`;}
  else if(m.wk>=1)h+=`<h3>${TXHZ.marginal.bloque_alquiler}</h3><div class="sub" style="font-size:12px;color:#a04a3a">${huecos(TXHZ.marginal.bloque_alq_d,{sem:Math.round(m.wk),c:fmt(m.debt),estado:m.wk>=5?TXHZ.marginal.bloque_demanda:m.wk>=3?TXHZ.marginal.bloque_burofax:TXHZ.marginal.bloque_pregunta})}</div>`;
  else if(m.bank>=1)h+=`<h3>${TXHZ.marginal.bloque_hipoteca}</h3><div class="sub" style="font-size:12px;color:#a04a3a">${huecos(TXHZ.marginal.bloque_hip_d,{cuotas:m.bank,estado:m.bank>=4?TXHZ.marginal.bloque_ejecutar:TXHZ.marginal.bloque_comisiones})}</div>`;
  if(m.bankDebt)h+=`<div class="sub" style="font-size:12px">${huecos(TXHZ.marginal.bloque_deuda,{c:fmt(m.bankDebt)})}</div>`;
  return h;}
{const _vt=vidaTab;vidaTab=function(){const h=_vt.apply(this,arguments);try{return mgBlock()+h;}catch(e){return h;}};}
// en la calle no hay facturas ni alquiler
{const _pu=payUtilities;payUtilities=function(){if(homeless())return;return _pu.apply(this,arguments);};}
// volver con la madre requiere que la madre quiera
{const _cm=canMove;canMove=function(k){const r=_cm.apply(this,arguments);if(k==='padres'){const md=P_('madre');if(!md){r.ok=false;r.why.push(TXHZ.marginal.sin_madre);}else if(md.rel<25){r.ok=false;r.why.push(huecos(TXHZ.marginal.madre_no_quiere,{}));}}return r;};}
