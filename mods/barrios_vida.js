// =================== BARRIOS CON VIDA: 12 lugares con interior y salidas, y el barrio donde vives importa ===================
// Todo el contenido es data/barrios_vida.json (interiores, precios, tablas por barrio, sucesos, textos); data/lugares.json (lugares y salidas),
// data/ciudad.json (factor de alquiler del barrio). Aquí solo la lógica mínima: una función de interior parametrizada, el efecto de cada salida
// y los enganches (alquiler, compra, averías, casero, trato, ánimo) que envuelven funciones que ya existen.
const BVD=DATA.barrios_vida,BVX=BVD.textos,BVS=BVD.salidas,BVB=BVD.barrios;
const BVG={in:false};
const bvT=(k,v)=>huecos(String(BVX[k]),v||{});
const BV=()=>{if(!S.bv)S.bv={horas:0,itv:0,ett:0,remesas:0,pisoHasta:0,corte:0,ano:{},juicios:0};const b=S.bv;b.ano=b.ano||{};return b;};
const bvBarrioDe=k=>cdBarrioDe(k);
const bvTab=b=>BVB[b]||BVB.ribera;
const bvFBarrio=b=>{const B=CDX().barrios[b];return B&&B.alquiler>0?B.alquiler:1;};
const bvFTipo=t=>{const b=CDX().vivienda[t];return b?bvFBarrio(b):1;};
const bvPlaza=(o,d)=>{const x=BVS[o];return x&&x.kind;};
// de cada salida nueva, el lugar donde se hace
const BVP={};for(const k in PLACES)for(const o of PLACES[k].outs||[])if(BVS[o])BVP[o]=k;
{const _d=destOf;destOf=function(k){if(BVP[k])return BVP[k];return _d.apply(this,arguments);};}
conLogica(OUT,{itv_pasar:{req:()=>S.track==='reparto'||!!(S.bv&&S.bv.vehiculo)}});

// ====================== 1. LA CARTERA: precio y efecto de cada salida ======================
function bvPrecio(k){const s=BVS[k];let c=hrs(s.coste_h||0);if(s.bar){const t=bvTab(bvBarrioDe(BVP[k]));c*=t.bar||1;}return Math.round(c);}
function bvCoste(k){const s=BVS[k];if(!s)return 0;
  if(s.kind==='mercado')return Math.round(compraCost()*s.factor);
  if(s.kind==='giro'){const e=hrs(s.envia_h);return e+Math.max(hrs(s.min_h),Math.round(e*s.comision));}
  if(s.kind==='ett'||s.kind==='juicio'||s.kind==='asamblea'||s.kind==='futbol'||s.kind==='banco_tiempo')return 0;
  return bvPrecio(k);}
{const _oc=outCost;outCost=function(k){if(BVS[k])return BVG.in?0:bvCoste(k);const v=_oc.apply(this,arguments);if(k==='compra'&&!BVG.in)return Math.round(v*(bvTab(cdHome()).compra||1));return v;};}
{const _oa=outAvail;outAvail=function(k){const r=_oa.apply(this,arguments);if(BVS[k]&&typeof r==='string'&&/\d\.\d:00/.test(r))return r.replace(/(\d+)\.(\d+):00/g,(m,h,d)=>h+':'+String(Math.round(+('0.'+d)*60)).padStart(2,'0'));if(r||!BVS[k]||BVG.in)return r;const c=bvCoste(k);if(c>0&&S.money<c)return BVX.sin_dinero;return null;};}
{const _ob=outBack;outBack=function(k){if(!BVS[k])return _ob.apply(this,arguments);
  let r;BVG.in=true;try{r=_ob.apply(this,arguments);}finally{BVG.in=false;}
  try{bvEfecto(k);}catch(e){console.error('barrios_vida',k,e);}return r;};}
const bvN=()=>CH().name;
const bvDec=(s,k,v)=>huecos(pickR(s[k||'tell']),Object.assign({n:bvN()},v||{}));
const bvAnimo=d=>{try{const m=MT();m.an=Math.max(0,Math.min(100,m.an+d));}catch(e){}};
const bvNeed=(n,d)=>{S.needs[n]=Math.max(0,Math.min(100,S.needs[n]+d));};
function bvGasto(k,cost,concepto){if(cost>0)bkAdd(concepto||'Salida',-cost);}
function bvEfecto(k){const s=BVS[k],n=bvN(),B=BV(),e=OUT[k].e,c=bvCoste(k);const ico=e;
  switch(s.kind){
  case 'gasto':case 'portatil':case 'papeles':case 'mus':{bvGasto(k,c,s.concepto);
    if(s.meal!=null)try{cmMeal('bar',s.meal,OUT[k].n);}catch(x){}
    if(s.animo)bvAnimo(s.animo);
    if(s.kind==='portatil'){if(S.jobless){S.netBoost=Math.max(S.netBoost||0,S.day+3);if(!S.seek){try{autoSeek();}catch(x){}}}else gainSkill('logica',8);}
    if(s.kind==='papeles'){S.netBoost=Math.max(S.netBoost||0,S.day+s.dias_red);}
    if(s.kind==='mus'){B.pisoHasta=S.day+s.piso_dias;}
    tell(bvDec(s,'tell',{c:fmt(c)}),ico);break;}
  case 'mercado':{const cm=CM(),cost=c;if(S.money<cost*.5){toast(TX_comidas.compra_no);break;}
    const pay=Math.min(cost,Math.max(0,S.money)),u=Math.round(s.unidades*pay/cost);bkAdd('Compra',-pay);cm.desp=Math.min(30,cm.desp+u);cm.nut=Math.min(100,cm.nut+s.nut);cm.spent+=pay;cm.compra=S.day;
    tell(bvDec(s,'tell',{c:fmt(pay),pct:Math.round((1-s.factor)*100)}),ico);break;}
  case 'juicio':{const m=(W_().mov||0),sind=!!(S.union&&S.union.member)||!!(S.pol&&S.pol.tenant);const p=Math.min(.85,s.base+s.por_mov*m+(sind?s.sindicato:0));B.juicios++;
    const v=P_('vecina');if(v)v.rel=Math.min(100,(v.rel||0)+5);S.pol=S.pol||{xp:0,inf:0,stages:{},comp:2,red:0};
    if(Math.random()<p){W_().mov=Math.min(100,m+1.5);S.pol.xp=(S.pol.xp||0)+2;tell(bvDec(s,'aplaza'),'⚖️');}
    else{W_().mov=Math.min(100,m+.5);S.pol.xp=(S.pol.xp||0)+1;bvAnimo(-2);tell(bvDec(s,'sigue'),'⚖️');}
    break;}
  case 'tramite':{bvGasto(k,c,'Otros');if(S.noRenew&&S.noRenew>S.day){S.noRenew+=s.dias;tell(bvDec(s,'con',{c:fmt(c),d:s.dias}),'📑');}else tell(bvDec(s,'sin',{c:fmt(c)}),'📑');break;}
  case 'futbol':{S.fit=Math.min(100,(S.fit||0)+2);if(Math.random()<.5)tell(bvDec(s),'⚽');break;}
  case 'mercadillo':{const g=HG();let hecho=false;
    if(g.wash&&S.money>=hrs(s.lavadora_h)){const x=hrs(s.lavadora_h);bkAdd('Arreglos',-x);g.wash=0;tell(bvDec(s,'lavadora',{c:fmt(x)}),'🧺');hecho=true;}
    else if(g.fridge&&S.money>=hrs(s.nevera_h)){const x=hrs(s.nevera_h);bkAdd('Arreglos',-x);g.fridge=0;tell(bvDec(s,'nevera',{c:fmt(x)}),'🧊');hecho=true;}
    if(!hecho){const x=hrs(s.coste_h);bkAdd('Salida',-x);bvNeed('diversion',8);tell(bvDec(s,'nada',{c:fmt(x)}),'🧺');}break;}
  case 'giro':{const e=hrs(s.envia_h),f=c-e;bkAdd('Otros',-c);B.remesas+=e;const m=P_('madre');if(m)m.rel=Math.min(100,(m.rel||0)+3);bvNeed('social',4);tell(bvDec(s,'tell',{e:fmt(e),c:fmt(f)}),'💶');break;}
  case 'asamblea':{S.pol=S.pol||{xp:0,inf:0,stages:{},comp:2,red:0};S.pol.xp=(S.pol.xp||0)+1.5;S.pol.red=Math.min(100,(S.pol.red||0)+2);W_().mov=Math.min(100,(W_().mov||0)+s.mov);
    tell(bvDec(s),'🤝');bvBloque(s);break;}
  case 'banco_tiempo':{const g=HG();
    if(B.horas<=0){B.horas=1;bvNeed('social',6);tell(bvDec(s,'deja'),'⏳');break;}
    B.horas--;let q='nada';if(g.boiler){hgListo();q='boiler';}else if(g.wash){g.wash=0;q='wash';}else if(g.fridge){g.fridge=0;q='fridge';}else{try{CM().desp=Math.min(30,CM().desp+5);}catch(x){}}
    tell(bvDec(s,'cobra',{arreglo:s.arreglos[q]}),'⏳');break;}
  case 'ett':{const x=hrs(s.pago_h);bkAdd('Nómina',x);B.ett++;
    if(Math.random()<s.riesgo){bvNeed('energia',-15);bvAnimo(-2);tell(huecos(BVX.ett_accidente,{n}),'🩹');}
    tell(bvDec(s,'tell',{c:fmt(x)}),'📦');break;}
  case 'itv':{bvGasto(k,c,'Otros');B.itv=S.day+s.validez;tell(bvDec(s,'tell',{c:fmt(c)}),'🔧');break;}
  }}
// con tres del bloque dentro hay sindicato de inquilinas (mods/trato.js): la asamblea de barrio puede apuntar a alguien
function bvBloque(s){try{if(S.owned||typeof TT!=='function')return;const T=TT(),b=cdHome(),E=DATA.personas.edificios,H=DATA.personas.hogares;
  const C=pbVec().filter(v=>v&&v.hogar&&H[v.hogar]&&cdBarrioDe(H[v.hogar].edificio)===b&&E[H[v.hogar].edificio]&&E[H[v.hogar].edificio].tipo==='bloque'&&pbAdult(v)&&!T.bloque.ids.includes(v.id));
  if(!C.length||T.bloque.ids.length>=3||Math.random()>.5)return;const v=C[Math.floor(Math.random()*C.length)];T.bloque.ids.push(v.id);
  tell(huecos(pickR(s.bloque),{v:v.n,k:T.bloque.ids.length}),'🏘️');if(typeof trBloqueEfecto==='function')trBloqueEfecto();}catch(e){console.error(e);}}

// ====================== 2. EL ALQUILER DEL BARRIO ======================
// S.home.bf es el factor con el que se contrató: lo fija el piso nuevo (mudarse o partida nueva) o la renovación del contrato. Una partida guardada sin él cobra igual que siempre hasta renovar.
// Interruptor en datos (`alquiler_por_barrio`): apagado, porque el alquiler de cada tipo de vivienda ya está puesto a precio real de su barrio y multiplicarlo lo contaría dos veces.
const bvRentaOn=()=>!!DATA.barrios_vida.alquiler_por_barrio;
{const _wr=weeklyRent;weeklyRent=function(){const v=_wr.apply(this,arguments);try{const f=bvRentaOn()&&S.home&&S.home.bf;if(f>0&&f!==1&&!(typeof REV==='function'&&REV()&&typeof govPh==='function'&&govPh()>=1&&!S.owned))return Math.round(v*f);}catch(e){}return v;};}
{const _ah=applyHome;applyHome=function(type){const r=_ah.apply(this,arguments);try{if(S.home)S.home.bf=bvFTipo(type);}catch(e){}return r;};}
// al mirar casas y al mudarse, las demás viviendas valen lo que valen en su barrio (fianza, aval y lista incluidos)
function bvConRentas(fn){if(!bvRentaOn())return fn();const old={},cur=(S.home&&S.home.type)||'casita';try{for(const k in HOMES){if(k===cur)continue;old[k]=HOMES[k].rent;HOMES[k].rent=Math.round(old[k]*bvFTipo(k)*100)/100;}}catch(e){}
  try{return fn();}finally{for(const k in old)HOMES[k].rent=old[k];}}
{const _cm=canMove;canMove=function(k){return bvConRentas(()=>_cm.call(this,k));};}
{const _mc=moveCost;moveCost=function(k){let v=bvConRentas(()=>_mc.call(this,k));try{if(BV().pisoHasta>=S.day&&HOMES[k].cls>=2&&HOMES[k].cls<=3)v=Math.round(v*.8);}catch(e){}return v;};}
{const _mh=moveHome;moveHome=function(k,auto){const from=S.home&&S.home.type,r=_mh.apply(this,arguments);try{if(bvRentaOn()&&r&&S.home&&S.home.type===k&&k!==from&&k!=='padres'&&!auto)toast(bvT('aviso_alquiler',{f:String(bvFTipo(k)).replace('.',',')}));}catch(e){}return r;};}
// al mirar casas: cada vivienda dice lo que supone vivir en su barrio
{const _hb=homeBlock;homeBlock=function(){let h=bvConRentas(()=>_hb.apply(this,arguments));try{const cur=(S.home&&S.home.type)||'casita';
  for(const k of HOME_ORDER){if(k===cur||!HOMES[k]||!HOMES[k].d)continue;const b=CDX().vivienda[k],t=bvTab(b),mark='<div class="sub" style="font-size:11px">'+HOMES[k].d+'</div>',i=h.indexOf(mark);if(i<0)continue;
    const ln=bvT('casa_linea',{b:CDX().barrios[b].n,m:bvMinTrabajo(b)==null?'—':bvMinTrabajo(b),compra:String(t.compra).replace('.',','),ruido:t.ruido});
    h=h.slice(0,i+mark.length)+'<div class="sub" style="font-size:11px;color:#6b6178">'+ln+'</div>'+h.slice(i+mark.length);}}catch(e){}return h;};}

// ====================== 3. LO QUE PASA CADA DÍA, CADA SEMANA Y CADA AÑO ======================
const bvPobre=()=>{const h=HOMES[(S.home&&S.home.type)||'casita'];return !h||h.cls<3;};
function bvAplica(s){const n=bvN(),f=s.fx||{};let c=0;
  if(f.dinero_h){c=Math.abs(Math.round(hrs(f.dinero_h)));if(f.dinero_h<0)bkAdd('Otros',-c);else bkAdd('Ayuda',c);}
  if(f.energia)bvNeed('energia',f.energia);if(f.social)bvNeed('social',f.social);if(f.diversion)bvNeed('diversion',f.diversion);
  if(f.animo)bvAnimo(f.animo);if(f.mov)W_().mov=Math.min(100,(W_().mov||0)+f.mov);if(f.rep)S.rep=Math.max(0,Math.min(100,(S.rep??70)+f.rep));
  if(f.renta_pct&&!S.owned)S.rentMul=(S.rentMul||1)*(1+f.renta_pct);
  if(f.corte){const B=BV();B.corte=S.day+Math.max(1,Math.round(f.corte));tell(bvT('corte_inicio',{d:Math.round(f.corte)}),'🚰');}
  tell(huecos(s.t,{n,c:fmt(c)}),s.e);}
const bvReq=(r)=>!r||(r==='pobre'?bvPobre():r==='laboral'?(!S.jobless&&!!S.track&&dayType(S.day)==='work'):true);
function bvDia(rm0){const b=cdHome(),t=bvTab(b),B=BV(),H=S.home;if(!H||H.type==='calle')return;const d=dateOf(S.day);
  // renovación del contrato: el casero reajusta al barrio; en el centro, los fondos y los turistas empujan
  const since=S.day-(H.since||0);if(since>0&&since%365===0&&renting()){const f=bvFBarrio(b);if(bvRentaOn()&&H.bf!==f){H.bf=f;tell(bvT('renueva_barrio',{f:String(f).replace('.',',')}),'📨');}
    if(t.presion>0&&(S.rentMul||1)>rm0+1e-9){S.rentMul=(S.rentMul||1)*(1+t.presion);tell(bvT('presion_casco',{pct:Math.round(t.presion*100)}),'📨');}}
  // ruido
  if(t.ruido>0&&Math.random()<.5)bvNeed('energia',-t.ruido*BVD.pesos.energia_ruido);
  // un corte de agua o de luz en el barrio: ducharse cuesta
  if(B.corte>=S.day){bvNeed('higiene',-BVD.pesos.corte_higiene);bvNeed('energia',-BVD.pesos.corte_energia);if(B.corte===S.day){tell(bvT('corte_fin'),'🚰');}}
  // el casero, más o menos presente según el barrio
  if(renting()&&t.visitas_casero&&Math.random()<t.visitas_casero){try{HG().visits++;MT().an-=1;}catch(e){}tell(bvT('casero_visita'),'🔑');}
  // policía: quién la sufre depende de dónde vives y de quién eres
  const pol=t.policia;if(pol){const q=pol.p*(bvPobre()?pol.pobre:pol.rico);if(Math.random()<q){const tx=bvPobre()?pol.txt_pobre:pol.txt_rico;if(tx){bvAnimo(bvPobre()?-3:-1);bvNeed('social',-3);if(bvPobre()&&Math.random()<.3)bkAdd('Multa',-hrs(.8));tell(huecos(tx,{n:bvN()}),'🚓');}}}
  // sucesos de barrio
  const SU=BVD.sucesos[b]||{};
  for(const s of SU.fijos||[])if(bvReq(s.req)&&Math.random()<s.p)bvAplica(s);
  for(const s of SU.anuales||[]){const k=s.id+'|'+d.year;if(d.m===s.m&&d.dm===s.dm&&!B.ano[k]){B.ano[k]=1;bvAplica(s);}}
  // la ITV caducada del reparto
  if(S.track==='reparto'&&dayType(S.day)==='work'&&!S.jobless){if(!B.itv)B.itv=S.day+120;if(B.itv<S.day&&Math.random()<.04){bkAdd('Multa',-hrs(BVS.itv_pasar.multa_h));tell(huecos(BVX.itv_multa,{c:fmt(hrs(BVS.itv_pasar.multa_h))}),'🚔');}}}
{const _dl=dailyEvents;dailyEvents=function(){const rm0=S.rentMul||1;const r=_dl.apply(this,arguments);try{bvDia(rm0);}catch(e){console.error('barrios_vida',e);}return r;};}
// cada lunes: el barrio pesa en el ánimo (seguridad, servicios, ruido, vida de calle)
{const _pr=payRent;payRent=function(){const r=_pr.apply(this,arguments);try{const t=bvTab(cdHome()),P=BVD.pesos,H=S.home;if(H&&H.type!=='calle'){const dl=(t.seguridad-3)*P.animo_seguridad+(t.servicios-3)*P.animo_servicios-t.ruido*P.animo_ruido+(t.red-1)*P.animo_red;bvAnimo(Math.round(dl*10)/10);}}catch(e){}return r;};}
// la compra: el precio del barrio (el súper cobra lo que cobra la zona)
{const _hc=hacerCompra;hacerCompra=function(){const m0=S.money,r=_hc.apply(this,arguments);try{const f=bvTab(cdHome()).compra||1,gastado=m0-S.money;if(gastado>0&&f!==1){const ex=Math.round(gastado*(f-1));if(ex>0)bkAdd('Compra',-ex);else if(ex<0)bkAdd('Compra',-ex);}}catch(e){}return r;};}
// red de vecinos: en los barrios con vida de calle, más gente llama a la puerta; en los de portal cerrado, menos
{const _tp=typeof trPlanDia==='function'?trPlanDia:null;if(_tp){trPlanDia=function(){const r=_tp.apply(this,arguments);try{const t=bvTab(cdHome()),f=t.red||1,T=TT();
  if(f>1&&!T.plan&&Math.random()<(f-1)*.45){_tp.apply(this,arguments);}
  else if(f<1&&T.plan&&Math.random()<(1-f)*.5){T.plan=null;}
  if(f>1.15&&!T.plan&&Math.random()<(f-1.15)*.2){const L=pbVec().filter(v=>v&&v.hogar&&cdBarrioDe((DATA.personas.hogares[v.hogar]||{}).edificio)===cdHome()&&pbAdult(v));if(L.length&&S.people&&S.people.some(p=>p.vid!=null)){const v=L[Math.floor(Math.random()*L.length)];if(throttled('redvisita',3e5))tell(bvT('red_visita',{v:v.n}),'🏘️');bvNeed('social',4);}}}catch(e){}return r;};}}

// ====================== 4. LA FICHA DEL BARRIO Y «VIVIR AQUÍ» ======================
function bvPuertaProxy(b){if(b===cdHome())return 'casa';const E=DATA.personas.edificios||{},P=CDX().barrios[b].puertas;
  for(const k in E)if(cdBarrioDe(k)===b&&P[k])return k;for(const k in P)if(k!=='casaV'&&k!=='casa2'&&k!=='casa')return k;return null;}
function bvMinTrabajo(b){try{if(S.jobless||!S.track)return null;const w=destOf('work');if(!w||w==='_ride')return null;const a=bvPuertaProxy(b);if(!a||!cdPuerta(w))return null;const r=cdTrayecto(a,w);return r?Math.round(r.min):null;}catch(e){return null;}}
function bvVivirAqui(b){const t=bvTab(b),f=bvFBarrio(b),fs=String(f).replace('.',','),tipos=Object.keys(CDX().vivienda).filter(k=>CDX().vivienda[k]===b&&k!=='calle'&&k!=='padres');
  let ej=Infinity;for(const k of tipos)if(HOMES[k]&&HOMES[k].rent>0)ej=Math.min(ej,Math.round(HOMES[k].rent*Dm().rent*(bvRentaOn()?f:1)));
  const w=S.jobless||!S.track?null:destOf('work'),m=bvMinTrabajo(b),aqui=cdHome()===b,sg=x=>String(x).replace('.',',');
  let h=`<div class="clab">${BVX.ficha_titulo}</div>`;
  h+=bmRow('💶',ej<Infinity?bvT('ficha_ejemplo',{r:fmt(ej)})+(aqui&&!S.owned?bvT('ficha_tuyo',{r:fmt(weeklyRent())}):''):BVX.ficha_sin_vivienda,bvT('ficha_alquiler',{f:fs}));
  h+=bmRow('🚶',m!=null?bvT('ficha_trayecto',{sitio:placeName(w),m}):BVX.ficha_trayecto_sin,'');
  h+=bmRow('👣',BVX.ficha_pie_t,bvT('ficha_pie',{parada:t.pie.parada,cole:t.pie.cole,amb:t.pie.ambulatorio}));
  h+=bmRow('👍',BVX.ficha_gana_t,t.ficha.gana);
  h+=bmRow('😮‍💨',BVX.ficha_cuesta_t,t.ficha.pierde+' '+bvT('ficha_cuesta_cifras',{compra:sg(t.compra),bar:sg(t.bar),ruido:t.ruido}));return h;}
bmVivirAqui=bvVivirAqui;

// ====================== 5. LOS INTERIORES: una sola función, doce lugares ======================
const bvInt=BVD.interiores,bvTipos=BVD.piezas;
// gente: afluencia y sitio donde se pone cada cual (lo lee mods/poblacion.js)
for(const k in bvInt){const I=bvInt[k],a=I.afluencia;POB[k]={pk:a.pk,base:a.base,we:a.we,lo:a.lo,hi:a.hi};ZON[k]={cli:I.cli,posts:I.posts||[]};}
const bvHora=k=>{try{const r=bmAhora(k,S.day,S.t/60);return !!(r&&r.on);}catch(e){return true;}};
function bvTexto(s,x,y,z,col,sz,onX,maxw,font){const [a,b]=onX?P(0,x,z):P(x,0,z);ctx.save();ctx.translate(a,b);ctx.transform(1,onX?-.5:.5,0,1,0,0);
  ctx.font=`900 ${sz}px ${font||'Nunito, sans-serif'}`;if(maxw){let m=ctx.measureText(s).width,g=0;while(m>maxw&&g++<14){sz*=.93;ctx.font=`900 ${sz}px ${font||'Nunito, sans-serif'}`;m=ctx.measureText(s).width;}}
  ctx.fillStyle=col;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(s,0,0);ctx.restore();}
const bvU=()=>Math.abs(P(1,0)[0]-P(0,0)[0]);
const BV_GOODS={fruta:['#e85d3f','#f0ad4e','#58ac4e'],pescado:['#cfd8e0','#9fb4c8','#e8a0a0'],carne:['#c0392b','#e07a7a','#f4d9c9'],verdura:['#58ac4e','#3f8a3a','#e9a23b'],encurtidos:['#9b5de5','#6b8e23','#c9c3b8']};
function bvChair(cx,cy,c){sChair(cx-.5,cy-.5,c||'#8a6a4a');}
function bvPieza(p,E,I){const T=bvTipos[p.t];if(!T)return null;const x=p.x,y=p.y,w=p.w||1,d=p.d||1,c=p.c||T.c,h=p.h||T.h,tt=E.tt||0;
  const mk=(f,key)=>({d:key==null?x+w+y+d-.1:key,f});
  switch(T.f){
  case 'caja':return mk(()=>{sBox(x,y,x+w,y+d,0,h,c);if(T.top){sBox(x-.04,y-.04,x+w+.04,y+d+.04,h,h+(T.tope||2),T.top);}});
  case 'mesa':{const r=T.r||.42,ns=p.sillas!=null?p.sillas:T.sillas;return [{d:x+y,f:()=>{cyl(x,y,.08,0,h,'#3b3f46');cyl(x,y,r,h,h+2,c,shade(c,1.1));}},
     ...(ns>=1?[{d:x-.75+y,f:()=>bvChair(x-.78,y)}]:[]),...(ns>=2?[{d:x+.75+y+.1,f:()=>bvChair(x+.78,y)}]:[])];}
  case 'mesalarga':{const ns=p.sillas!=null?p.sillas:T.sillas,out=[{d:x+w+y+d-.1,f:()=>{sBox(x,y,x+w,y+d,0,h,'#3b3f46');sBox(x-.05,y-.05,x+w+.05,y+d+.05,h,h+2,c);}}];
    for(let i=0;i<ns;i++){const cx=x+(w/ns)*(i+.5);out.push({d:cx+y-.5,f:()=>bvChair(cx,y-.45)});out.push({d:cx+y+d+.5,f:()=>bvChair(cx,y+d+.45)});}return out;}
  case 'silla':return {d:x+y,f:()=>bvChair(x,y,c)};
  case 'taburete':return {d:x+y,f:()=>{cyl(x,y,.05,0,14,'#6b6f78');cyl(x,y,.24,14,16.5,c,shade(c,1.1));}};
  case 'banco':return mk(()=>{sBox(x,y,x+w,y+d,0,9,c);sBox(x,y+d-.1,x+w,y+d,9,20,shade(c,.9));});
  case 'estante':return mk(()=>{sBox(x,y,x+w,y+d,0,h,c);const n=Math.floor(w/.45);for(let z=6;z<h-4;z+=11)for(let j=0;j<n;j++){const col=T.libros?['#8c4b5a','#3a5a8c','#5a7a3a','#a0754c','#d9c7a8'][(j+z)%5]:['#e85d3f','#5bc0be','#f0ad4e','#9b5de5','#00bb7f','#f4f1ea'][(j*3+z)%6];sBox(x+.06+j*(w-.12)/n,y+d-.3,x+.06+(j+.8)*(w-.12)/n,y+d,z,z+7,col);}});
  case 'puesto':{const gs=BV_GOODS[p.n]||BV_GOODS.fruta;return mk(()=>{sBox(x,y,x+w,y+d,0,16,c);sBox(x-.05,y-.05,x+w+.05,y+d+.05,16,18,'#e8e2d4');
      const nb=Math.floor(w/.5);for(let k=0;k<nb;k++){const xx=x+.1+k*(w-.2)/nb;poly([P(xx,y+d,2),P(xx+(w-.2)/nb,y+d,2),P(xx+(w-.2)/nb,y+d,14),P(xx,y+d,14)],k%2?'#fffdf8':shade(c,1.05));}
      for(let k=0;k<Math.floor(w/.55);k++){const xx=x+.1+k*.55;sBox(xx,y+.12,xx+.45,y+d-.12,18,24,gs[k%gs.length]);}
      sBox(x+w-.45,y+.15,x+w-.1,y+.5,18,24,'#cfd4d8');});}
  case 'ventanilla':return mk(()=>{sBox(x,y,x+w,y+d,0,h,c);sBox(x-.04,y-.04,x+w+.04,y+d+.04,h,h+2,T.top);poly([P(x,y+.12,h+2),P(x+w,y+.12,h+2),P(x+w,y+.12,h+30),P(x,y+.12,h+30)],'rgba(190,225,240,.38)');
      capsule(...P(x,y+.12,h+30),...P(x+w,y+.12,h+30),1.6,'#5d626b');sBox(x+w*.35,y+d-.3,x+w*.65,y+d-.1,h+2,h+9,'#cfd4d8');});
  case 'cabina':return mk(()=>{sBox(x,y,x+.1,y+d,0,h,c);sBox(x,y,x+w,y+.08,0,h,shade(c,.9));sBox(x,y+d-.08,x+w,y+d,0,h,shade(c,.9));sBox(x+.05,y+.08,x+w-.1,y+d-.08,15,17,'#d9d2c3');
      const [a,b]=P(x+.3,y+d/2,26);emoji('📞',a,b,9);},x+w+y+d-.05);
  case 'escritorio':return mk(()=>sDesk(x,y,c));
  case 'palet':return mk(()=>{sBox(x,y,x+w,y+d,0,3,'#9a7a4a');sBox(x+.05,y+.05,x+w-.05,y+d-.05,3,h,c);sBox(x+.18,y+.18,x+w-.18,y+d-.18,h,h+9,shade(c,1.1));for(const z of [6,9])poly([P(x+.05,y+d-.05,z),P(x+w-.05,y+d-.05,z),P(x+w-.05,y+d-.05,z+.7),P(x+.05,y+d-.05,z+.7)],'rgba(60,40,20,.25)');});
  case 'rack':return mk(()=>{for(const [a,b] of [[x,y],[x+w-.1,y],[x,y+d-.1],[x+w-.1,y+d-.1]])sBox(a,b,a+.1,b+.1,0,h,c);for(const z of [12,28,44]){sBox(x,y,x+w,y+.08,z,z+3,'#3a86ff');sBox(x,y+d-.08,x+w,y+d,z,z+3,'#3a86ff');
      const n=Math.floor(w/.7);for(let j=0;j<n;j++)sBox(x+.1+j*(w-.1)/n,y+.12,x+.1+(j+.8)*(w-.1)/n,y+d-.12,z+3,z+3+8+(j*5+z)%5,['#c8a46a','#d6b47a','#b08850'][(j+z)%3]);}});
  case 'cinta':return mk(()=>{sBox(x,y,x+w,y+d,0,h,c);sBox(x,y,x+w,y+d,h,h+2,'#8d99ae');for(let k=0;k<3;k++){const u=((tt*.45+k*w/3)%w);sBox(x+u,y+.12,x+Math.min(w,u+.5),y+d-.12,h+2,h+8,['#c8a46a','#d6b47a','#b08850'][k]);}});
  case 'carretilla':return mk(()=>{sBox(x,y,x+.9,y+1.2,2,14,c);sBox(x+.05,y+.1,x+.85,y+.7,14,24,shade(c,.9));sBox(x+.1,y+1.2,x+.22,y+1.32,0,36,'#555');sBox(x+.15,y+1.3,x+.75,y+2.0,2,4,'#555');for(const a of [x,x+.75])sBox(a,y+.1,a+.15,y+.4,0,3,'#222');});
  case 'coche':return mk(()=>{const cw=1.6,ch=.9;for(const [a,b] of [[x+.1,y],[x+1.2,y],[x+.1,y+ch-.15],[x+1.2,y+ch-.15]])sBox(a,b,a+.3,b+.15,0,4,'#222');sBox(x,y+.05,x+cw,y+ch-.05,3,10,c);sBox(x+.4,y+.12,x+1.25,y+ch-.12,10,16,shade(c,1.1));
      poly([P(x+.4,y+ch-.12,10.5),P(x+1.25,y+ch-.12,10.5),P(x+1.25,y+ch-.12,15.5),P(x+.4,y+ch-.12,15.5)],'rgba(180,220,255,.75)');},x+1.6+y+.9-.1);
  case 'foso':return mk(()=>{sBox(x,y,x+w,y+d,0,6,c);for(const [a,b] of [[y,y+.15],[y+d-.15,y+d]])sBox(x,a,x+w,b,6,6.8,'#f0b429');sBox(x,y,x+.15,y+d,6,6.8,'#f0b429');sBox(x+w-.15,y,x+w,y+d,6,6.8,'#f0b429');},x+y+.2);
  case 'porteria':return {d:x+y+1.2,f:()=>{for(const s of [-.9,.9]){const a=P(x,y+s,0),b=P(x,y+s,30);capsule(a[0],a[1],b[0],b[1],2.2,'#fffdf8');}capsule(...P(x,y-.9,30),...P(x,y+.9,30),2.2,'#fffdf8');
      ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=.8;ctx.beginPath();for(let k=-.9;k<=.9;k+=.3){ctx.moveTo(...P(x,y+k,30));ctx.lineTo(...P(x+(x<6?-.6:.6),y+k,8));}ctx.stroke();}};
  case 'valla':return {d:-5,f:()=>{poly([P(x,y,0),P(x+w,y+d,0),P(x+w,y+d,h),P(x,y,h)],'rgba(138,122,98,.28)');capsule(...P(x,y,h),...P(x+w,y+d,h),1.4,'#7a6a52');const n=Math.max(w,d)/1.4;for(let k=0;k<=n;k++){const a=P(x+w*k/n,y+d*k/n,0),b=P(x+w*k/n,y+d*k/n,h);capsule(a[0],a[1],b[0],b[1],1.4,'#7a6a52');}}};
  case 'lona':return mk(()=>{sBox(x,y+d-.7,x+w,y+d,0,13,'#8a6a4a');sBox(x-.04,y+d-.74,x+w+.04,y+d+.04,13,14.5,'#e8e2d4');for(let k=0;k<Math.floor(w/.4);k++)sBox(x+.1+k*.4,y+d-.6,x+.1+k*.4+.3,y+d-.1,14.5,14.5+5+(k*7)%6,['#e85d3f','#5bc0be','#f0ad4e','#9b5de5','#00bb7f'][k%5]);
      for(const a of [x-.05,x+w-.05])sBox(a,y+.1,a+.1,y+.2,0,h,'#6b6f78');sBox(x-.1,y,x+w+.1,y+d-.5,h-2,h,c);poly([P(x-.1,y+d-.5,h-2),P(x+w+.1,y+d-.5,h-2),P(x+w+.1,y+d-.5,h-7),P(x-.1,y+d-.5,h-7)],shade(c,.85));});
  case 'arbol':return {d:x+y,f:()=>sTree(x,y)};
  case 'planta':return {d:x+y,f:()=>{cyl(x,y,.2,0,10,'#b5543c','#c27458');const [a,b]=P(x,y,10);for(let k=0;k<6;k++){ctx.fillStyle=['#3f8a3a','#58ac4e'][k%2];ctx.beginPath();ctx.ellipse(a+Math.cos(k*1.3)*6,b-10-Math.abs(Math.sin(k))*6,5,2.8,k,0,7);ctx.fill();}}};
  case 'fuente':return {d:x+y,f:()=>{cyl(x,y,1.1,0,6,c,'#7cc8f0');cyl(x,y,.15,6,24,'#c9c3b8');const [a,b]=P(x,y,26);ctx.fillStyle='rgba(124,200,240,.7)';ctx.beginPath();ctx.arc(a,b,3,0,7);ctx.fill();}};
  case 'escaparate':return {d:x+y-.3,f:()=>{poly([P(x,0,0),P(x+w,0,0),P(x+w,0,52),P(x,0,52)],c);poly([P(x+.15,0,8),P(x+w-.15,0,8),P(x+w-.15,0,42),P(x+.15,0,42)],'rgba(200,230,245,.55)');
      bvTexto(p.n||'',x+w/2,0,46,'#fffdf8',4,false,w*bvU()*.8);sBox(x+.1,y,x+w-.1,y+d,0,10,'#fffdf8');for(let k=0;k<3;k++){const [a,b]=P(x+.4+k*(w-.8)/2,y+d/2,10);emoji(['👕','👟','📱'][(p.n==='calzado'?1:p.n==='móviles'?2:0)],a,b-2,9);}}};
  case 'detector':return {d:x+y+1,f:()=>{sBox(x,y,x+.15,y+.15,0,40,c);sBox(x+1,y,x+1.15,y+.15,0,40,c);sBox(x,y,x+1.15,y+.15,38,42,c);}};
  case 'pizarra':return mk(()=>{sBox(x+.1,y,x+.2,y+.12,0,14,'#6b4a2e');sBox(x+w-.2,y,x+w-.1,y+.12,0,14,'#6b4a2e');sBox(x,y,x+w,y+d,12,40,c);for(let k=0;k<4;k++)poly([P(x+.2,y+d,17+k*5),P(x+w-.3-(k%2)*.7,y+d,17+k*5),P(x+w-.3-(k%2)*.7,y+d,18+k*5),P(x+.2,y+d,18+k*5)],'rgba(255,255,255,.7)');});
  }return null;}
function bvDoMuros(I,T,E,W,D){const night=E.night,pared=I.pared||T.pared,WH=T.WH;
  if(T.estilo==='solar')return;
  sBox(0,-.15,W,0,0,WH,pared);sBox(-.15,-.15,0,D,0,WH,shade(pared,.95));
  const fY=(x0,x1,y,z0,z1,c)=>poly([P(x0,y,z0),P(x1,y,z0),P(x1,y,z1),P(x0,y,z1)],c),fX=(x,y0,y1,z0,z1,c)=>poly([P(x,y0,z0),P(x,y1,z0),P(x,y1,z1),P(x,y0,z1)],c);
  const cielo=night>.5?'#2c3558':'#bfe3f7';
  if(T.estilo==='azulejo'){fY(0,W,0,0,24,'#e9f0ee');fX(0,0,D,0,24,'#dfe7e5');ctx.strokeStyle='rgba(60,110,130,.22)';ctx.lineWidth=.7;ctx.beginPath();for(let k=0;k<=W*3;k++){ctx.moveTo(...P(k/3,0,0));ctx.lineTo(...P(k/3,0,24));}for(let k=0;k<=D*3;k++){ctx.moveTo(...P(0,k/3,0));ctx.lineTo(...P(0,k/3,24));}ctx.stroke();
    fY(0,W,0,24,27,I.rot_c||'#2f6f86');fX(0,0,D,24,27,shade(I.rot_c||'#2f6f86',.9));fY(0,W,0,WH-6,WH-2,'#6b4a2e');fX(0,0,D,WH-6,WH-2,'#5d4027');}
  else if(T.estilo==='chapa'){for(let k=0;k<=W*2;k++){fY(k/2,k/2+.22,0,0,WH,shade(pared,k%2?.93:1.03));}for(let k=0;k<=D*2;k++){fX(0,k/2,k/2+.22,0,WH,shade(pared,k%2?.9:.98));}
    fY(0,W,0,0,5,shade(pared,.7));fX(0,0,D,0,5,shade(pared,.7));
    // puerta de muelle: persiana a medio abrir con un camión detrás
    fY(W-4.2,W-1.4,0,0,46,'#5d626b');for(let z=2;z<30;z+=4)fY(W-4.2,W-1.4,0,z,z+2.2,'#7a808a');fY(W-4.2,W-1.4,0,30,46,'#2b2b33');fY(W-3.9,W-1.7,0,30,44,'#f4efe1');}
  else{fY(0,W,0,0,5,shade(pared,.85));fX(0,0,D,0,5,shade(pared,.85));}
  // ventanas
  if(T.estilo!=='chapa'){for(let k=1.2;k<W-1.6;k+=2.6)if(!(I.sin_ventana&&I.sin_ventana.includes(Math.round(k))))fY(k,k+1.3,0,WH*.38,WH*.8,cielo);}
  else for(let k=.6;k<W-4.6;k+=1.8)fY(k,k+1.2,0,WH-18,WH-8,cielo);
  for(let k=1.2;k<D-1.2;k+=2.8)fX(0,k,k+1.3,WH*.38,WH*.8,cielo);}
function bvEscena(key,E){const I=bvInt[key],T=BVD.plantillas[I.plantilla],W=I.W||T.W,D=I.D||T.D,tt=E.tt||0,night=E.night,h=S.t/60,it=[],add=(d,f)=>it.push({d,f});
  const abierto=bvHora(key),dt=dateOf(S.day);
  const drawBase=()=>{
    if(T.estilo==='solar'){sFloor(W,D,I.suelo||T.suelo,false);ctx.strokeStyle='rgba(120,100,70,.18)';ctx.lineWidth=1;for(let k=0;k<26;k++){const a=P(.5+(k*7.3)%(W-1),.5+(k*3.7)%(D-1)),b=[a[0]+9+(k%4)*3,a[1]+2];ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.stroke();}
      ctx.strokeStyle='rgba(255,255,255,.5)';ctx.lineWidth=1.5;ctx.setLineDash([6,5]);ctx.beginPath();ctx.moveTo(...P(W/2,2.4));ctx.lineTo(...P(W/2,D-.6));ctx.stroke();ctx.setLineDash([]);return;}
    sFloor(W,D,I.suelo||T.suelo,T.tile);bvDoMuros(I,T,E,W,D);
    // rótulo de la pared del fondo y carteles
    if(I.rotulo)bvTexto(I.rotulo,W/2,0,T.WH-11,I.rot_c||'#7a1f1f',11,false,(W-1.5)*bvU()*.72,'Georgia, serif');
    for(const c of I.carteles||[]){if(!c.txt)continue;const fondo=c.lado==='fondo';
      if(fondo)poly([P(c.pos,0,c.z),P(c.pos+c.w,0,c.z),P(c.pos+c.w,0,c.z+c.h),P(c.pos,0,c.z+c.h)],c.c);else poly([P(0,c.pos,c.z),P(0,c.pos+c.w,c.z),P(0,c.pos+c.w,c.z+c.h),P(0,c.pos,c.z+c.h)],c.c);
      bvTexto(c.txt,fondo?c.pos+c.w/2:c.pos+c.w/2,fondo?0:c.pos+c.w/2,c.z+c.h/2,c.tc,c.sz*1.5,!fondo,(c.w-.2)*bvU()*.9);}};
  const decor=()=>{};
  const piezas=(I.piezas||[]).slice();if(T.estilo==='solar'&&dt.wd===6&&h>=9.5&&h<15)for(const p of I.domingo||[])piezas.push(p);
  for(const p of piezas){const r=bvPieza(p,E,I);if(!r)continue;for(const q of [].concat(r))add(q.d,q.f);}
  if(abierto)(I.personal||[]).forEach((q,i)=>{const ch={...(E.npc[(i*5+3)%E.npc.length]||{}),shirt:q.sh||'#8d99ae'};add(q.x+q.y,()=>sPerson(q.x,q.y,ch,{pose:'stand',front:true,right:q.right!==false,act:q.act||null}));});
  const ana={x:I.ana[0],y:I.ana[1],pose:'stand',front:true,right:false,act:null};
  const after=()=>{if(night>.4){ctx.fillStyle='rgba(20,30,60,.12)';ctx.fillRect(-2000,-2000,4000,4000);}};
  return {W,D,floor:I.suelo||T.suelo,wall:I.pared||T.pared,out:!!T.fuera,tile:!!T.tile,drawBase,decor,items:it,ana,after};}
// registro: la escena y la gente (mismo envoltorio que usa mods/poblacion.js)
for(const k of Object.keys(bvInt)){const base=function(E){return bvEscena(k,E);};
  SCENES[k]=function(E){const r=base.apply(this,arguments);try{if(r&&r.items){const g=pbSuelo(k,E,base);const o=crowd(E,k,{...r,g});r.pob=o;for(const q of o)r.items.push({d:q.d,f:q.f});}}catch(e){console.error('población',k,e);}return r;};}
// el descampado, visto desde la calle: un solar con vallas (no un cubo)
{const _db=drawBuilding;drawBuilding=function(key,tt,night,rv){const p=PLACES[key];if(!(p&&p.solar))return _db.apply(this,arguments);
  const [u0,v0,u1,v1]=rv,col=p.c||'#cdbf9f',cu=(u0+u1)/2;topQuad(u0,v0,u1,v1,.12,col);topQuad(u0+.5,v0+.5,u1-.5,v1-.5,.14,shade(col,.94));
  for(let u=u0;u<=u1+.1;u+=3.4)for(const v of [v0,v1]){const [x,y]=P(u,v,0),[x2,y2]=P(u,v,5);capsule(x,y,x2,y2,1.3,'#8a7a62');}
  for(let v=v0;v<=v1+.1;v+=3.4)for(const u of [u0,u1]){const [x,y]=P(u,v,0),[x2,y2]=P(u,v,5);capsule(x,y,x2,y2,1.3,'#8a7a62');}
  for(const v of [(v0+v1)/2-.8,(v0+v1)/2+.8]){const [x,y]=P(u0+1.2,v,0),[x2,y2]=P(u0+1.2,v,7);capsule(x,y,x2,y2,1.1,'#f4f1ea');}
  emoji(p.e,...P(cu,(v0+v1)/2,6),14);};}
