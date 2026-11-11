// =================== LOS CICLOS: cada sistema tiene su auge, la tensión que acumula, sus señales y su crisis. Más el exterior y el pulso de los actores ===================
GOVS.mercado={n:'Socialismo de mercado',e:'⭐',fx:'El Estado manda sobre el capital: obras, industria y sueldos que suben · poca voz en el trabajo y control social'};
if(typeof FS_GOV!=='undefined')FS_GOV.mercado={...FS_REF,k:'mercado',tr:[[12450,.15],[35200,.25],[80000,.35],[1e12,.45]],iva:{sup:.04,red:.09,gen:.13},ah:[[1e12,.20]],ibi:.8,soc:.25,hold:.03,smiTo:20000,
  gana:'Los sueldos suben cada año y nadie rescata a especuladores; el Estado decide dónde va el capital.',pierde:'Los hogares se quedan una parte pequeña del pastel; tu voz en el trabajo pesa poco.'};
const CY=()=>{if(!S.cy)S.cy={ten:0,ph:'auge',sig:0,ext:30,hp:1,wage:1,bias:null,since:S.day,last:null,crises:0};return S.cy;};
const cyKey=()=>{const w=W_();return w.era==='consejos'||w.era==='comunas'?w.era:w.gov;};
// la ficha de cada sistema: nombre de su tensión, velocidad, señales y lo que hace en el auge
const CYS={
  liberal:{t:'Acumulación',v:3.2,sig:[`Los pisos del barrio suben un 15 % al año. En el bar dicen que «esto no baja nunca».`,`El banco ofrece hipotecas al 100 % y créditos para el coche sin preguntar. «Esta vez es diferente», dice el de la sucursal.`,`Hay grúas por todas partes y pisos vacíos comprados para revender. Los sueldos, igual que hace cinco años.`]},
  conservador:{t:'Acumulación',v:2.6,sig:[`La bolsa en máximos. Los sueldos no. En la tele hablan de «recuperación».`,`Las empresas tienen beneficios récord y no saben dónde meterlos: compran pisos.`,`Medio barrio vive del crédito. Los avisos de impago empiezan a llegar a los portales.`]},
  centro:{t:'Acumulación',v:2,sig:[`Todo va «bien»: crece el PIB, el alquiler y la deuda de las familias.`,`El dinero de las empresas no va a fábricas, va a pisos y a la bolsa.`,`En el banco hay más prisa por cobrar que por prestar. Mala señal.`]},
  austeridad:{t:'Espiral deuda-recesión',v:3,sig:[`Cierra el centro de salud por las tardes. «Ajustes».`,`Tres de cada diez jóvenes del barrio se han ido a buscarse la vida lejos.`,`Recortan, la economía cae, la deuda pesa más y vuelven a recortar.`]},
  progresista:{t:'Compresión de beneficios',v:2.6,sig:[`Hay trabajo para casi todo el mundo y los sindicatos aprietan: los sueldos suben.`,`La patronal avisa: «con estos costes no se puede invertir». Los precios empiezan a subir.`,`Las empresas aplazan inversiones y sacan dinero fuera. En la prensa, «huida de capitales».`]},
  mercado:{t:'Sobreinversión',v:2.4,sig:[`Han abierto otro polígono. La mitad de las naves siguen vacías.`,`Las fábricas compiten bajando precios hasta no ganar nada. Lo llaman «involución».`,`El ayuntamiento debe más de lo que recauda en diez años. Las obras se paran a medias.`]},
  consejos:{t:'Burocratización',v:1.6,sig:[`El delegado ya no viene al tajo: «tiene reuniones».`,`Cola de dos horas por zapatos; en el portal de al lado los venden sin cola, más caros.`,`A la asamblea van cada vez menos. Los mismos de siempre deciden por todos.`]},
  comunas:{t:'Descoordinación',v:1.6,sig:[`La comuna de al lado tiene tractores; la vuestra, tres azadas. Nadie coordina.`,`Para decidir lo del agua hacen falta cinco asambleas y nadie quiere ir a la quinta.`,`Unas comunas prosperan y otras se vacían. Empieza a haber «comunas ricas».`]}};
CYS.consejos.boost=CYS.comunas.boost=null;
const cyS=()=>CYS[cyKey()]||CYS.centro;
// el precio de los pisos sigue al ciclo
{const _hp=housePrice;housePrice=function(){return Math.round(_hp.apply(this,arguments)*(S.cy?S.cy.hp:1)/10)*10;};}
// en el socialismo de mercado no se convocan huelgas
{const _sr=strikeReady;strikeReady=function(){if(W_().gov==='mercado'&&!W_().era)return false;return _sr.apply(this,arguments);};}
// la gente que lo apoya hace que las medidas aguanten
const cyHold=()=>{const w=W_();return Math.min(.92,.35+w.mov/220+(S.union&&S.union.member?.08:0)+((S.pol&&S.pol.inf)||0)/400+((office().org||0)>50?.05:0));};
function cyGov(k,why,e){const w=W_();const old=w.gov;w.gov=k;w.elec=S.day+1460;S.rentCap=k==='progresista'&&!S.owned;const G=GOVS[k];chapter('gov'+k+S.day,G.n,why);toast(`${G.e} ${G.n}`,true);}
function cyLayoff(p,why){if(S.jobless||TR().self||TR().coop||S.track==='funcion'||Math.random()>p)return false;S.jobless=true;S.paroWeeks=S.shifts>=30?12:6;tell(`${why} A ${CH().name} le ha tocado: despido. ${S.paroWeeks} semanas de paro.`,'📦');return true;}
// cada lunes: el auge da, la tensión crece, las señales avisan
{const _ww=worldWeekly;worldWeekly=function(){const r=_ww.apply(this,arguments);try{cyWeek();}catch(e){console.error(e);}return r;};}
function cyWeek(){const c=CY(),w=W_(),k=cyKey(),s=cyS(),n=CH().name;
  if(c.key!==k){c.key=k;c.ten=Math.min(c.ten,25);c.sig=0;c.ph='auge';c.since=S.day;cyPulse(k);}
  if(c.ph==='crisis'){if(S.day>=c.until){c.ph='auge';c.ten=5;c.sig=0;tell(`Lo peor de la crisis ha pasado. No para todo el mundo.`,'🌤️');}return;}
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
    chapter('crisis'+S.day,'La burbuja',`Ha estallado. Los bancos dejan de prestar, las obras se paran y las empresas despiden en cadena. ${S.owned&&S.mort?`El piso de ${n} vale ahora menos de lo que debe.`:'Los pisos bajan, pero nadie tiene con qué comprarlos.'} En la tele, el rescate a la banca: miles de millones, sin condiciones.`);
    cyLayoff(.3,'Despidos en cadena.');
    if(Math.random()<.45+c.ext/250)later(()=>cyGov('austeridad',`Los acreedores exigen garantías. Cae el gobierno y llega uno «técnico» con un único programa: recortar para pagar la deuda. El rescate a la banca lo pagará quien no la rescató.`),1500);}
  else if(k==='progresista'){
    if(S.market)S.market.price*=1.08;S.payMul=(S.payMul||1)*.96;w.crisis=Math.min(100,w.crisis+22);c.ext=Math.min(100,c.ext+30);
    chapter('crisis'+S.day,'Huelga de inversión',`Las empresas han dejado de invertir y sacan el dinero fuera. Suben los precios, sube el paro, y la prima de riesgo se dispara. La patronal dice que es «el mercado»; los sindicatos, que es un chantaje. ${n} nota las dos cosas en el súper.`);
    cyLayoff(.15,'La empresa «reajusta plantilla».');
    if(Math.random()<cyHold())later(()=>tell(`El gobierno aguanta: control de capitales y un plan de inversión pública. La calle lo sostiene. ${S.union&&S.union.member?n+' estuvo en todas las movilizaciones.':''}`,'🌹'),1500);
    else later(()=>cyGov('liberal',`Elecciones anticipadas. Gana quien promete «devolver la confianza a los mercados»: bajar impuestos arriba y flexibilizar abajo. El péndulo.`),1500);}
  else if(k==='austeridad'){
    w.mov=Math.min(100,w.mov+25);w.crisis=Math.min(100,w.crisis+8);if(!w.gsDay)w.gsDay=S.day+4;
    chapter('crisis'+S.day,'El estallido',`La gente ya no aguanta más recortes. Mareas en la calle, huelga general convocada.`);
    later(()=>{if(w.mov>=55&&Math.random()<cyHold()+.1)cyGov('progresista','Cae el gobierno de los recortes. Gana quien prometió revertirlos. Ahora toca ver si puede.');
      else cyGov('conservador','El malestar no fue contra quien recortó, sino contra el vecino: «los de fuera», «los que cobran ayudas». Gana el orden. Los recortes siguen; ahora con otro discurso.');},2500);}
  else if(k==='mercado'){
    c.hp*=.8;w.crisis=Math.min(100,w.crisis+15);
    chapter('crisis'+S.day,'El frenazo',`Sobran fábricas y faltan compradores. Los pisos bajan, cierran naves, y el paro juvenil se dispara. No hay rescate a la banca: el Estado deja caer a los promotores y reordena el crédito. Pero quien perdió el trabajo lo perdió igual.`);
    cyLayoff((S.char&&S.char.age<30)?.3:.1,'Cierran líneas de producción.');
    later(()=>{S.payMul=(S.payMul||1)*1.03;tell(`Plan de reequilibrio: más dinero a los hogares, pensiones y sanidad. «Que la gente consuma lo que produce». A ver si llega.`,'⭐');},2000);}
  else{ // consejos / comunas
    w.mov=Math.max(0,w.mov-10);
    chapter('crisis'+S.day,k==='comunas'?'La comuna se rompe':'Los consejos se atascan',`Colas, mercado negro, asambleas vacías y delegados que ya no se revocan. Fuera, el cerco aprieta. Hay tres salidas encima de la mesa, y depende de quién se mueva.`);
    later(()=>{const hold=cyHold();const r=Math.random();
      if(r<hold){w.mov=Math.min(100,w.mov+15);tell(`Renovación: revocación masiva de delegados, asambleas llenas otra vez, y un plan para lo que falta. ${isI('marxista','anarquista')?n+' ha vuelto a no dormir. Merece la pena.':''}`,'✊');}
      else if(r<hold+(1-hold)*.45){w.era=null;cyGov('mercado',`Un partido fuerte toma las riendas «para salvar lo conseguido»: el Estado dirige, vuelve el mercado para lo pequeño, y los consejos se convierten en comités. Hay orden y obras. La asamblea ya no decide.`);}
      else{w.era=null;S.rentMul=Math.min(3,(S.rentMul||1)*2.6);S.payMul=(S.payMul||1)*.9;S.noOvertime=0;cyGov('conservador',`La restauración. Vuelven los dueños con los papeles de antes y ganas de cobrarse lo perdido. Los alquileres, a precio de mercado; las horas extra, sin pagar. Y una lista de quién estuvo en qué asamblea.`);}},2500);}
}
// el pulso: cada gobierno nuevo provoca reacciones de quien sale perdiendo
function cyPulse(k){const n=CH().name;const h=cyHold();const T=(t,e,d)=>setTimeout(()=>tell(t,e),d||2500);
  if(k==='progresista'){
    if(Math.random()>h){S.cy.feeMul=1.5;T(`La banca anuncia que «repercutirá» el nuevo impuesto en las comisiones. A ${n} le subirá lo que cobra el banco por no tener nada.`,'🏦');}else T(`La banca amenazó con subir comisiones; el gobierno lo ha prohibido por decreto. La calle aprieta.`,'🏦');
    if(Math.random()<.5)T(`Varias grandes fortunas se empadronan en otra comunidad con menos impuestos. Siguen viviendo aquí.`,'🧳',4000);
    if(Math.random()>h){S.rentCap=false;T(`Los tribunales tumban el tope del alquiler. Recurso de los fondos de inversión.`,'⚖️',6000);}}
  else if(k==='conservador'||k==='liberal'){S.cy.feeMul=1;
    T(`Primera medida: bajan los impuestos más altos y el de sucesiones. ${n} hace la cuenta: a ella le toca nada.`.replace('a ella',ga('a ella','a él','a elle')),'🏛️');
    if(W_().mov>=45&&!W_().gsDay){W_().gsDay=S.day+10;T(`Los sindicatos convocan huelga general contra la reforma laboral.`,'🪧',4500);}}
  else if(k==='austeridad'){T(`Llegan «los hombres de negro» a revisar las cuentas. Primera lista: sanidad, educación, pensiones.`,'✂️');W_().mov=Math.min(100,W_().mov+5);}
  else if(k==='mercado'){S.cy.feeMul=.8;T(`Los bancos pasan a ser del Estado o a obedecerle. El crédito va a fábricas y vivienda, no a la bolsa. El sindicato pasa a ser «oficial»: media, no convoca.`,'⭐');}
  else if(k==='consejos'||k==='comunas'){S.cy.feeMul=0;}}
// comisiones del banco según el pulso
// en el socialismo de mercado, el botón de huelga cambia
{const _vt=vidaTab;vidaTab=function(){let h=_vt.apply(this,arguments);try{const w=W_();const c=CY();const s=cyS();
  if(w.gov==='mercado'&&!w.era)h=h.replace(/<button class="btn[^"]*" id="ustrike"[^>]*>[^<]*<\/button>/,'').replace(/Para convocar huelga hace falta organización 50 y malestar 35\.[^<]*/,'El sindicato es oficial: negocia con la dirección y media en los conflictos, pero no convoca huelgas.');
  const bar=(v,col)=>`<div class="bar"><i style="width:${Math.round(v)}%;background:${col}"></i></div>`;
  const ph=c.ph==='crisis'?'💥 crisis':c.ten>=65?'⚠️ tensión alta':c.ten>=35?'📈 se calienta':'🌱 auge';
  h=h.replace('<h3>🌍 El mundo</h3>',`<h3>🌍 El mundo</h3><div class="skill"><span class="lbl">🔁 ${s.t}</span>${bar(c.ten,c.ten>=65?'#c0392b':'#e9a23b')}<span class="lv">${Math.round(c.ten)}</span></div><div class="skill"><span class="lbl">🌐 Presión exterior</span>${bar(c.ext,'#5a7a9a')}<span class="lv">${Math.round(c.ext)}</span></div><div class="sub" style="font-size:11.5px">Ciclo: ${ph}${c.crises?` · ${c.crises} crisis vividas`:''}. Cada sistema tiene su época buena y la tensión que la rompe; las señales salen en la Historia.</div>`);}catch(e){}return h;};}
