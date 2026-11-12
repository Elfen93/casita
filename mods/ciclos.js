// =================== LOS CICLOS: cada sistema tiene su auge, la tensión que acumula, sus señales y su crisis. Más el exterior y el pulso de los actores ===================
const {ciclos:TX_ciclos}=DATA.textos_mods_ag;
const CY=()=>{if(!S.cy)S.cy={ten:0,ph:'auge',sig:0,ext:30,hp:1,wage:1,bias:null,since:S.day,last:null,crises:0};return S.cy;};
const cyKey=()=>{const w=W_();return w.era==='consejos'||w.era==='comunas'?w.era:w.gov;};
// la ficha de cada sistema: nombre de su tensión, velocidad, señales y lo que hace en el auge
const CYS=DATA.gobiernos.ciclos;
const cyS=()=>CYS[cyKey()]||CYS.centro;
// el precio de los pisos sigue al ciclo
{const _hp=housePrice;housePrice=function(){return Math.round(_hp.apply(this,arguments)*(S.cy?S.cy.hp:1)/10)*10;};}
// en el socialismo de mercado no se convocan huelgas
{const _sr=strikeReady;strikeReady=function(){if(W_().gov==='mercado'&&!W_().era)return false;return _sr.apply(this,arguments);};}
// la gente que lo apoya hace que las medidas aguanten
const cyHold=()=>{const w=W_();return Math.min(.92,.35+w.mov/220+(S.union&&S.union.member?.08:0)+((S.pol&&S.pol.inf)||0)/400+((office().org||0)>50?.05:0));};
function cyGov(k,why,e){const w=W_();const old=w.gov;w.gov=k;w.elec=S.day+1460;S.rentCap=k==='progresista'&&!S.owned;const G=GOVS[k];chapter('gov'+k+S.day,G.n,why);toast(`${G.e} ${G.n}`,true);}
function cyLayoff(p,why){if(S.jobless||TR().self||TR().coop||S.track==='funcion'||Math.random()>p)return false;S.jobless=true;S.paroWeeks=S.shifts>=30?12:6;tell(huecos(TX_ciclos.despido,{why,w:S.paroWeeks}),'📦');return true;}
// cada lunes: el auge da, la tensión crece, las señales avisan
{const _ww=worldWeekly;worldWeekly=function(){const r=_ww.apply(this,arguments);try{cyWeek();}catch(e){console.error(e);}return r;};}
function cyWeek(){const c=CY(),w=W_(),k=cyKey(),s=cyS(),n=CH().name;
  if(c.key!==k){c.key=k;c.ten=Math.min(c.ten,25);c.sig=0;c.ph='auge';c.since=S.day;cyPulse(k);}
  if(c.ph==='crisis'){if(S.day>=c.until){c.ph='auge';c.ten=5;c.sig=0;tell(TX_ciclos.crisis_pasa,'🌤️');}return;}
  // lo que da el auge
  const B=BP?BP():null;
  if(k==='liberal'||k==='conservador'||k==='centro'){c.hp=Math.min(2.2,c.hp*1.006);S.rentMul=Math.min(3,(S.rentMul||1)*1.003);w.crisis=Math.max(0,w.crisis-.4);if(B&&B.fondos.v>0)B.fondos.v=Math.round(B.fondos.v*1.004);c.ext=Math.max(5,c.ext-1);}
  else if(k==='progresista'){if(c.wage<1.10){c.wage*=1.003;S.payMul=(S.payMul||1)*1.003;}w.crisis=Math.max(0,w.crisis-.3);c.ext=Math.min(90,c.ext+c.ten/60);}
  else if(k==='austeridad'){c.ext=Math.max(10,c.ext-1.2);if(S.market)S.market.price=Math.max(.9,S.market.price*.998);}
  else if(k==='mercado'){if(c.wage<1.15){c.wage*=1.004;S.payMul=(S.payMul||1)*1.004;}w.crisis=Math.max(0,w.crisis-.5);S.rentMul=Math.max(.3,(S.rentMul||1)*.998);c.ext=45;}
  else{c.ext=Math.min(95,c.ext+.6);}
  // la tensión
  let v=s.v;if(k==='austeridad')v+=w.crisis/40;if(k==='progresista')v+=Math.max(0,(w.mov-40)/40)+Math.max(0,(40-w.crisis)/40);if(k==='consejos'||k==='comunas')v+=Math.max(0,(60-w.mov)/30);
  c.ten=Math.min(100,c.ten+v*.12*(.8+Math.random()*.4));
  // señales
  const th=[35,65,85];while(c.sig<3&&c.ten>=th[c.sig]){tell(s.sig[c.sig],c.sig===2?'⚠️':'📈');c.sig++;}
  if(c.ten>=100)cyCrisis();}
// el estallido de cada sistema
function cyCrisis(){const c=CY(),w=W_(),k=cyKey(),n=CH().name;const later=(f,ms)=>later(()=>{if(cyKey()===k)f();},ms);c.ph='crisis';c.until=S.day+300;c.crises++;c.ten=0;const B=BP?BP():null;
  if(k==='liberal'||k==='conservador'||k==='centro'){
    c.hp*=.68;w.crisis=Math.min(100,w.crisis+32);w.mov=Math.min(100,w.mov+10);if(B){B.fondos.v=Math.round(B.fondos.v*.62);B.cripto.v=Math.round(B.cripto.v*.4);}c.ext=Math.min(100,c.ext+40);
    chapter('crisis'+S.day,TX_ciclos.burbuja_titulo,huecos(TX_ciclos.burbuja,{piso:S.owned&&S.mort?huecos(TX_ciclos.burbuja_piso_deuda,{}):TX_ciclos.burbuja_piso_bajan}));
    cyLayoff(.3,TX_ciclos.burbuja_despidos);
    if(Math.random()<.45+c.ext/250)later(()=>cyGov('austeridad',TX_ciclos.burbuja_austeridad),1500);}
  else if(k==='progresista'){
    if(S.market)S.market.price*=1.08;S.payMul=(S.payMul||1)*.96;w.crisis=Math.min(100,w.crisis+22);c.ext=Math.min(100,c.ext+30);
    chapter('crisis'+S.day,TX_ciclos.inversion_titulo,huecos(TX_ciclos.inversion,{}));
    cyLayoff(.15,TX_ciclos.inversion_despidos);
    if(Math.random()<cyHold())later(()=>tell(huecos(TX_ciclos.inversion_aguanta,{sind:S.union&&S.union.member?huecos(TX_ciclos.inversion_aguanta_sind,{}):''}),'🌹'),1500);
    else later(()=>cyGov('liberal',TX_ciclos.inversion_liberal),1500);}
  else if(k==='austeridad'){
    w.mov=Math.min(100,w.mov+25);w.crisis=Math.min(100,w.crisis+8);if(!w.gsDay)w.gsDay=S.day+4;
    chapter('crisis'+S.day,TX_ciclos.estallido_titulo,TX_ciclos.estallido);
    later(()=>{if(w.mov>=55&&Math.random()<cyHold()+.1)cyGov('progresista',TX_ciclos.estallido_progresista);
      else cyGov('conservador',TX_ciclos.estallido_conservador);},2500);}
  else if(k==='mercado'){
    c.hp*=.8;w.crisis=Math.min(100,w.crisis+15);
    chapter('crisis'+S.day,TX_ciclos.frenazo_titulo,TX_ciclos.frenazo);
    cyLayoff((S.char&&S.char.age<30)?.3:.1,TX_ciclos.frenazo_despidos);
    later(()=>{S.payMul=(S.payMul||1)*1.03;tell(TX_ciclos.frenazo_plan,'⭐');},2000);}
  else{ // consejos / comunas
    w.mov=Math.max(0,w.mov-10);
    chapter('crisis'+S.day,k==='comunas'?TX_ciclos.consejos_titulo_comuna:TX_ciclos.consejos_titulo,TX_ciclos.consejos);
    later(()=>{const hold=cyHold();const r=Math.random();
      if(r<hold){w.mov=Math.min(100,w.mov+15);tell(huecos(TX_ciclos.consejos_renovacion,{rev:isI('marxista','anarquista')?huecos(TX_ciclos.consejos_renovacion_rev,{}):''}),'✊');}
      else if(r<hold+(1-hold)*.45){w.era=null;cyGov('mercado',TX_ciclos.consejos_mercado);}
      else{w.era=null;S.rentMul=Math.min(3,(S.rentMul||1)*2.6);S.payMul=(S.payMul||1)*.9;S.noOvertime=0;cyGov('conservador',TX_ciclos.consejos_restauracion);}},2500);}
}
// el pulso: cada gobierno nuevo provoca reacciones de quien sale perdiendo
function cyPulse(k){const n=CH().name;const h=cyHold();const T=(t,e,d)=>setTimeout(()=>tell(t,e),d||2500);
  if(k==='progresista'){
    if(Math.random()>h){S.cy.feeMul=1.5;T(huecos(TX_ciclos.pulso_banca_repercute,{}),'🏦');}else T(TX_ciclos.pulso_banca_prohibe,'🏦');
    if(Math.random()<.5)T(TX_ciclos.pulso_fortunas,'🧳',4000);
    if(Math.random()>h){S.rentCap=false;T(TX_ciclos.pulso_tope,'⚖️',6000);}}
  else if(k==='conservador'||k==='liberal'){S.cy.feeMul=1;
    T(huecos(TX_ciclos.pulso_impuestos,{aella:ga(...TX_ciclos.pulso_aella)}),'🏛️');
    if(W_().mov>=45&&!W_().gsDay){W_().gsDay=S.day+10;T(TX_ciclos.pulso_huelga,'🪧',4500);}}
  else if(k==='austeridad'){T(TX_ciclos.pulso_austeridad,'✂️');W_().mov=Math.min(100,W_().mov+5);}
  else if(k==='mercado'){S.cy.feeMul=.8;T(TX_ciclos.pulso_mercado,'⭐');}
  else if(k==='consejos'||k==='comunas'){S.cy.feeMul=0;}}
// comisiones del banco según el pulso
// en el socialismo de mercado, el botón de huelga cambia
{const _vt=vidaTab;vidaTab=function(){let h=_vt.apply(this,arguments);try{const w=W_();const c=CY();const s=cyS();
  if(w.gov==='mercado'&&!w.era)h=h.replace(/<button class="btn[^"]*" id="ustrike"[^>]*>[^<]*<\/button>/,'').replace(/Para convocar huelga hace falta organización 50 y malestar 35\.[^<]*/,TX_ciclos.ui_sindicato_oficial);
  const bar=(v,col)=>`<div class="bar"><i style="width:${Math.round(v)}%;background:${col}"></i></div>`;
  const ph=c.ph==='crisis'?TX_ciclos.ui_fase.crisis:c.ten>=65?TX_ciclos.ui_fase.alta:c.ten>=35?TX_ciclos.ui_fase.calienta:TX_ciclos.ui_fase.auge;
  h=h.replace('<h3>🌍 El mundo</h3>',`<h3>🌍 El mundo</h3><div class="skill"><span class="lbl">🔁 ${s.t}</span>${bar(c.ten,c.ten>=65?'#c0392b':'#e9a23b')}<span class="lv">${Math.round(c.ten)}</span></div><div class="skill"><span class="lbl">${TX_ciclos.ui_presion}</span>${bar(c.ext,'#5a7a9a')}<span class="lv">${Math.round(c.ext)}</span></div><div class="sub" style="font-size:11.5px">${huecos(TX_ciclos.ui_ciclo,{ph,crisis:c.crises?huecos(TX_ciclos.ui_crisis,{c:c.crises}):''})}</div>`);}catch(e){}return h;};}
