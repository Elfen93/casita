// ---------- Soul Crusher: la vida no avisa (pero a veces sí sale bien) ----------
const COMPANIES=['Grupo Ofimax','Consultora Nébula','Logística Pardo','Soluciones Tándem','Cooperativa Arcadia','Datanova','Hermanos Ruiz S.L.','Brillo Servicios','Kappa Digital','Talleres Ébano','Estudio Lumbre','Mercantil Vega'];
function office(){if(!S.office){const T0=TR();S.office={n:pickR(T0.cos),org:5,griev:10,tox:T0.tox[0]+Math.random()*(T0.tox[1]-T0.tox[0]),known:0.6};}return S.office;}
const TOX=()=>Dm().soul?office().tox:0.3;
function toxLabel(t){return t<0.25?'😊 sano':t<0.45?'🙂 llevadero':t<0.65?'😐 tenso':t<0.8?'😣 tóxico':'☠️ muy tóxico';}
const noisyTox=t=>Math.max(0,Math.min(1,t+(Math.random()-.5)*0.5));
function newCompanyName(){const cur=S.office&&S.office.n,L0=TR().cos.length>1?TR().cos:COMPANIES;let n;do n=pickR(L0);while(n===cur);return n;}
// ofertas de otras empresas: habilidades y reputación abren puertas, pero lo que se ve desde fuera no siempre es verdad
function makeOffer(){const ch=lvl('carisma'),lg=lvl('logica');
  const up=S.career+1<CAREER.length&&Math.random()<0.25+0.04*(ch+lg)/2;
  const tox=Math.random()<0.5?Math.random()*0.5:Math.random();
  S.offer={n:newCompanyName(),tox,seen:noisyTox(tox),career:up?S.career+1:S.career,payMul:Math.max(0.75,(S.payMul||1)*(0.92+Math.random()*0.28+0.015*ch)),until:S.day+6,day:S.day};
  toast(`📩 ${S.offer.n} le ofrece a Ana un puesto de ${CAREER[S.offer.career].t}. Míralo en 📋.`,true);sfx('level');popBubble('📩');}
const offerPay=o=>Math.round(CAREER[o.career].pay*Dm().pay*o.payMul);
function acceptOffer(){const o=S.offer;if(!o)return;S.offer=null;
  S.office={n:o.n,tox:o.tox,known:0.2,seen:o.seen,since:S.day,org:5,griev:10};S.shiftBase=S.shifts-(reqOf(CAREER[o.career]).shifts||0);S.career=o.career;S.payMul=o.payMul;S.rep=Math.max(55,Math.min(70,(S.rep??70)));S.jobless=false;S.paroWeeks=0;S.lastRaise=S.day;
  toast(`🤝 Ana empieza en ${o.n} como ${CAREER[o.career].t} · ${fmt(salary())}/turno`,true);sfx('level');popBubble('🎉');}
function rejectOffer(silent){if(!S.offer)return;if(!silent)toast(`Ana rechaza la oferta de ${S.offer.n}`);S.offer=null;}
// usar la oferta para negociar con la empresa actual
function counterOffer(){const o=S.offer;if(!o)return;const ch=lvl('carisma');gainSkill('carisma',0.6);
  const p=0.2+0.06*ch+((S.rep??70)-60)/200-0.25*TOX();
  if(Math.random()<p){const k=Math.max(1.03,Math.min(1.25,offerPay(o)/Math.max(1,salary())));S.payMul=(S.payMul||1)*k;S.offer=null;S.lastRaise=S.day;
    toast(`🗣️ Ana enseña la oferta a su jefe… ¡y le igualan! Sueldo +${Math.round((k-1)*100)} %`,true);sfx('level');popBubble('💪');}
  else if(Math.random()<0.3+0.4*TOX()){S.rep=Math.max(0,(S.rep??70)-8);toast('😬 «Si te quieres ir, ahí tienes la puerta». No le suben nada y le ha costado reputación. La oferta sigue en pie.',true);sfx('bad');}
  else toast('🤷 «No podemos igualarlo». La oferta de fuera sigue en pie.');}
// pedir aumento: el carisma y la reputación ayudan; un jefe tóxico, no
function askRaise(manual){const ch=lvl('carisma');
  if(S.jobless)return manual&&toast('Ana no tiene trabajo');
  if(S.day-(S.lastRaise??-99)<42)return manual&&toast(`Ana pidió algo hace poco: mejor esperar ${42-(S.day-(S.lastRaise??-99))} días`);
  S.lastRaise=S.day;gainSkill('carisma',0.5);
  const p=0.08+0.07*ch+((S.rep??70)-60)/150-0.25*TOX()+(T('trabajadora')?0.05:0)+ID().neg+(S.pol.delegada?0.08:0);
  if(Math.random()<p){const k=1.03+Math.random()*0.04+0.008*ch;S.payMul=(S.payMul||1)*k;toast(`💬 Ana negocia con su jefe y consigue un aumento del ${Math.round((k-1)*100)} %`,true);sfx('level');popBubble('💪');return true;}
  if(TOX()>0.6&&Math.random()<0.35){S.rep=Math.max(0,(S.rep??70)-4);toast('😒 «Da gracias de tener trabajo». No hay aumento y queda marcada.',true);sfx('bad');}
  else toast(Math.random()<.5?'💬 «Ahora no es buen momento, a final de año lo vemos»':'💬 Le dicen que no, pero reconocen su trabajo');
  return false;}
function luckyEvents(){
  const ch=lvl('carisma');
  // trabajitos por su cuenta con el oficio que mejor domina
  const opts=['carp','elec','font','alba','jard','musica','cocina'].map(k=>[k,lvl(k)]).filter(x=>x[1]>=3);
  const best=opts.length?opts[Math.random()*opts.length|0]:null;
  if(best&&Math.random()<Math.min(0.3,(0.03+0.012*best[1])*(S.pol.hustle?2:isI('libertaria')?1.4:1))){const g=Math.round(best[1]*(8+Math.random()*14)*MK().price);S.money+=g;bumpMoney();
    const txt={carp:'le monta unos armarios a una vecina',elec:'arregla la instalación de un bar',font:'desatasca las tuberías del 3.º B',alba:'alicata un baño a un conocido',jard:'arregla el jardín de una vecina',musica:'toca en una boda',cocina:'cocina para un cumpleaños'}[best[0]];
    toast(`💸 Trabajito: Ana ${txt} · +${fmt(g)}`,true);sfx('cash');gainSkill(best[0],0.3);}
  if(Math.random()<0.05){const ev=[
      ()=>{const g=Math.round((60+Math.random()*180)*MK().price);S.money+=g;return `🧾 Hacienda le devuelve ${fmt(g)}`;},
      ()=>{if(S.jobless||(S.rep??70)<70)return null;const g=Math.round(salary()*(1+Math.random()*2*(1-TOX())));S.money+=g;return `🎯 Bonus por buen trabajo: +${fmt(g)}`;},
      ()=>{S.market.price*=0.95;return '🏷️ Rebajas: los precios bajan un 5 %';},
      ()=>{S.market.util*=0.85;return '🔌 Baja la luz: la energía sale un 15 % más barata';},
      ()=>{S.needs.hambre=100;S.needs.social=Math.min(100,S.needs.social+25);return '🥘 Una vecina le trae un táper de lentejas';},
      ()=>{const g=Math.round(20+Math.random()*80);S.money+=g;return `🎟️ Le toca la pedrea: +${fmt(g)}`;},
    ];const m=ev[Math.random()*ev.length|0]();if(m){bumpMoney();toast(m,true);sfx('cash');popBubble('🍀');}}
  // a veces cambia la jefatura: para bien o para mal
  if(!S.jobless&&Math.random()<0.03){const o=office();const d=(Math.random()-.5)*0.6;o.tox=Math.max(0.05,Math.min(0.95,o.tox+d));o.known=Math.max(o.known,0.8);
    toast(d<0?`👩‍💼 Llega una jefa nueva a ${o.n}: el ambiente mejora (${toxLabel(o.tox)})`:`👔 Cambio de jefe en ${o.n}: el ambiente empeora (${toxLabel(o.tox)})`,true);}
  // ofertas de otras empresas
  if(!S.offer&&!S.jobless&&S.shifts>8){const p=0.012+0.008*(lvl('logica')+ch)+((S.rep??70)>75?0.02:0)+(has('compu')?0.01:0);if(Math.random()<p)makeOffer();}
  // tras unas semanas se ve cómo es de verdad la oficina
  {const o=S.office;if(o&&o.since!=null&&o.seen!=null&&S.day-o.since>=14){if(o.tox-o.seen>0.2)toast(`😩 Resulta que ${o.n} era bastante peor de lo que vendían (${toxLabel(o.tox)})`,true);else if(o.seen-o.tox>0.2)toast(`😌 ${o.n} es mejor de lo que parecía (${toxLabel(o.tox)})`,true);o.seen=null;o.known=1;}}
}
// Ana decide sobre las ofertas si no lo haces tú
function offerTick(){const o=S.offer;if(!o)return;
  if(S.day>o.until){toast(`⌛ La oferta de ${o.n} ha caducado`);S.offer=null;return;}
  if(!S.autoHome||S.day-o.day<2)return;
  const cur=S.jobless?0:salary()*(1-0.5*TOX()*office().known-0.5*0.5*(1-office().known));
  const nw=offerPay(o)*(1-0.5*o.seen)*(o.career>S.career?(T('trabajadora')?1.25:1.12):1);
  if(nw>cur*1.08){toast(`🤔 Ana se lo ha pensado y acepta la oferta de ${o.n}`);acceptOffer();}
  else if(lvl('carisma')>=3&&offerPay(o)>salary()&&!o.tried){o.tried=true;toast('🤔 Ana usa la oferta para negociar en su empresa');counterOffer();}
  else{toast(`🤔 Ana lo piensa y rechaza la oferta de ${o.n}`);rejectOffer(true);}}
function weeklyEvents(){
  if(!Dm().soul)return;
  const m=S.market=S.market||{price:1,util:1,euribor:0.035};
  const g=()=>{let a=0;for(let k=0;k<6;k++)a+=Math.random();return (a-3)/1.5;};
  m.price=Math.max(0.8,m.price*(1+0.003+g()*0.012));m.util=Math.max(0.7,m.util*(1+0.002+g()*0.03));m.euribor=Math.min(0.08,Math.max(0,m.euribor+g()*0.002));
  if(Math.random()<0.04){const k=1+0.08+Math.random()*0.2;m.util*=k;toast(`📈 La luz y el gas se disparan un ${Math.round((k-1)*100)} %`,true);}
  if(Math.random()<0.03){m.price*=1.05+Math.random()*0.08;toast('📈 Inflación: todo está más caro este mes',true);}
  if(!S.owned&&Math.random()<0.06&&S.rentStrike){tell('El casero intenta subir el alquiler otra vez. El sindicato de inquilinas responde con una carta: no se paga.','🏘️');}
  else if(!S.owned&&Math.random()<0.06){let k=1.05+Math.random()*0.12;if(S.rentCap)k=Math.min(k,1.03);const ch=lvl('carisma'),r=Math.random();gainSkill('carisma',0.3);
    if(r<0.05+0.05*ch){toast(`🗣️ El casero quería subir el alquiler un ${Math.round((k-1)*100)} %, pero Ana le convence de dejarlo como está`,true);sfx('level');}
    else{if(r<0.2+0.08*ch){const k0=k;k=1+(k-1)/2;toast(`🗣️ Ana negocia: el casero sube el alquiler un ${Math.round((k-1)*100)} % en vez de un ${Math.round((k0-1)*100)} %`,true);}else{toast(`📄 El casero sube el alquiler un ${Math.round((k-1)*100)} %. Lo tomas o lo dejas.`,true);sfx('bad');}S.rentMul=(S.rentMul||1)*k;}}
  if(S.mort&&S.mort.variable!==false){const nr=m.euribor+0.015;if(Math.abs(nr-S.mort.rate)>0.002){S.mort.rate=nr;const rr=nr/52;S.mort.pay=Math.round(S.mort.left*rr/(1-Math.pow(1+rr,-Math.max(1,S.mort.weeks))));toast(`🏦 El euríbor cambia: la cuota pasa a ${fmt(S.mort.pay)}/semana`);}}
  if(!S.jobless&&S.shifts>3&&TR().lay>0){const og=office().org||0;const risk=(0.008+0.02*TOX()+((S.rep??70)<40?0.04:0))*TR().lay*(W_().gov==='liberal'?1.3:1)*(dark()?1.5:1)*(S.pol.delegada?0.5:1)*(og>50?0.7:1);if(Math.random()<risk){S.jobless=true;S.paroWeeks=TR().auto?0:S.shifts>=30?(W_().gov==='austeridad'?6:W_().gov==='conservador'?8:12):0;grieve(10);toast(`📦 Reestructuración en la empresa: han despedido a Ana.${S.paroWeeks?' Cobrará el paro unas semanas.':' No tiene derecho a paro.'}`,true);sfx('bad');popBubble('😞');}
    else if(!TR().self&&!TR().coop&&Math.random()<(0.01+0.03*TOX())*(office().org>60?0.4:1)){S.payMul=(S.payMul||1)*0.9;grieve(18);toast('✂️ La empresa recorta un 10 % los sueldos',true);sfx('bad');}}
  if(S.jobless&&S.paroWeeks>0){const b=Math.round(CAREER[S.career].pay*Dm().pay*(S.payMul||1)*5*0.5);S.money+=b;S.paroWeeks--;toast(`💶 Prestación por desempleo: +${fmt(b)}`);}
  if(Math.random()<0.05){const ev=[['🦷 Dentista',150,400],['🚓 Multa',80,200],['📱 Se le rompe el móvil',120,300],['🎁 Boda de una amiga',100,250],['🩺 Gafas nuevas',150,350]][Math.random()*5|0];const c=Math.round((ev[1]+Math.random()*(ev[2]-ev[1]))*MK().price);S.money-=c;toast(`${ev[0]}: imprevisto de ${fmt(c)}`,true);sfx('bad');}
  luckyEvents();
  if(S.autoHome&&!S.jobless&&(S.rep??70)>=60&&lvl('carisma')>=2&&S.day-(S.lastRaise??-99)>=56&&S.shifts>15&&Math.random()<0.5)askRaise(false);
}
function dailyEvents(){
  if(S.sick>0){S.sick--;if(!S.sick)toast('😌 Ana se encuentra mejor');}
  if(!Dm().soul)return;
  if(!S.sick&&Math.random()<0.012*(1-(S.fit||0)/150)){S.sick=1+(Math.random()*3|0);const c=Math.round(15*MK().price);S.money-=c;toast(`🤒 Ana se ha puesto enferma: ${S.sick} día(s) de baja sin cobrar · farmacia ${fmt(c)}`,true);sfx('bad');}
  offerTick();
}
function goWork(silent){
  const s=S.sim,nd=S.needs;
  if(s.work>0)return toast('Ana ya está en el trabajo');
  if(!silent&&s.leaving)return toast('Ana ya va de camino 🚶‍♀️');
  const dt=dayType(S.day),h=S.t/60;
  if(S.jobless){sfx('bad');return toast('Ana no tiene trabajo ahora mismo: está buscando');}
  if(S.sick>0){sfx('bad');return toast('Ana está de baja, enferma 🤒');}
  if(dt!=='work'){sfx('bad');return toast(`Hoy no se trabaja: ${DAYNAME[dt].toLowerCase()} ${DAYICON[dt]}`);}
  if(S.lastWorkDay===S.day){return toast('Ana ya ha ido a trabajar hoy');}
  if(noWorkToday()){return toast(S.jail>0?'Ana está detenida':'Hoy no se trabaja: hay huelga ✊');}
  if(h<SHIFT.leave-1){return toast(`Es muy pronto: el turno es de ${SHIFT.start}:00 a ${SHIFT.end}:00`);}
  if(h>=SHIFT.end-1){sfx('bad');return toast('Ya es tarde para ir: el turno casi ha terminado');}
  if(nd.energia<6){sfx('bad');return toast('Ana tiene demasiado sueño para trabajar');}
  s.use=null;s.target=null;
  const edge=(x,y)=>x===0||y===0||x===N-1||y===N-1;
  const p=bfs(simCell(),edge);
  if(p&&p.length){s.path=p;s.leaving=true;if(!silent)toast('Ana sale hacia el trabajo 🚶‍♀️');}
  else depart();
}
function goOut(kind){
  const s=S.sim;s.use=null;s.target=null;s.outing=kind;
  const p=bfs(simCell(),(x,y)=>x===0||y===0||x===N-1||y===N-1);
  if(p&&p.length){s.path=p;s.leaving=true;}else depart();
  toast(kind==='eat'?'🍔 No hay nada para comer en casa: Ana sale a comer fuera':kind==='amigos'?`🍻 Ana ha quedado con ${(outFriend()||{n:'unos amigos'}).n}`:OUT[kind]?`${OUT[kind].e} Ana sale: ${outName(kind).toLowerCase()}`:'🚶‍♀️ Ana sale a dar una vuelta');
}
const mealOutCost=()=>Math.round(8*PM()+Dm().food*3);
function depart(){
  {const s=S.sim;if(s.outing){s.leaving=false;s.path=[];s.exit=simCell();s.work=OUT[s.outing]?OUT[s.outing].dur:50;s.dest=destOf(s.outing);s.route=null;s.awayTotal=s.work;s.outingActive=s.outing;s.outing=null;return;}}
  const s=S.sim;s.leaving=false;s.path=[];s.exit=simCell();s.workMood=mood();S.lastWorkDay=S.day;s.ateAtWork=false;
  const extra=Dm().soul&&!(S.noOvertime>S.day)&&!TR().self&&!TR().coop&&Math.random()<(0.04+0.3*TOX())*(TR().over||1)?60+(Math.random()*90|0):0;if(extra){grieve(6);setTimeout(()=>toast(`⏳ Hoy toca quedarse ${Math.round(extra/60*10)/10} h más sin cobrar`),800);}
  const arrive=S.t+30,start=SHIFT.start*60,end=SHIFT.end*60+extra;s.late=Math.max(0,Math.round(arrive-start));s.worked=Math.max(30,end-Math.max(start,arrive));
  s.work=Math.max(arrive,start)-S.t+s.worked+30;s.dest=destOf('work');s.route=null;s.awayTotal=s.work;s.rideDir=Math.random()<.5?1:-1;
  toast(s.late>15?`🚌 Ana va al trabajo… llegará ${s.late} min tarde 😬`:`🚌 Ana se va al trabajo (${SHIFT.start}:00–${SHIFT.end}:00)`);
}
function finishWork(){
  const s=S.sim;s.dest=null;s.route=null;placeAuto=true;
  if(s.outingActive){const k=s.outingActive;s.outingActive=null;s.work=0;
    if(s.exit&&walkable(s.exit[0],s.exit[1])){s.x=s.exit[0]+.5;s.y=s.exit[1]+.5;}ensureSimFree();s.think=0;
    if(k==='calabozo'){S.jail=0;tell('Ha salido de comisaría. En la puerta la esperaban sus compañeras.'.replace('la esperaban',ga('la esperaban','lo esperaban','le esperaban')),'🚔');return;}
    if(k==='amigos')friendBack();else if(OUT[k])outBack(k);
    if(k==='eat'){const c=mealOutCost();S.money-=c;S.needs.hambre=95;S.needs.social=Math.min(100,S.needs.social+12);floatText('-'+fmt(c),s.x,s.y,50,'#c0392b');toast(`🍔 Ana ha comido fuera · ${fmt(c)}`);}
    return;}
  const perf=Math.max(0.7,Math.min(1.3,0.8+(s.workMood||50)/200+(T('trabajadora')?0.1:0)-(T('perezosa')?0.1:0)));
  const frac=Math.min(1,(s.worked||480)/((SHIFT.end-SHIFT.start)*60));const pay=Math.round(salary()*perf*frac*payFactor());if(S.track==='negocio'&&S.biz)S.biz.last=(S.biz.last||0)+pay;
  if(s.late>15){S.rep=Math.max(0,(S.rep??70)-(s.late>45?6:3));}else S.rep=Math.min(100,(S.rep??70)+(T('trabajadora')?3:2)*(isI('conservadora')?1.3:isI('anarquista')?0.6:1));
  if(S.shifts%5===4){S.vac=(S.vac||0)+1;setTimeout(()=>toast('🏖️ Ana ha ganado un día de vacaciones'),1400);}
  S.money+=pay;S.shifts++;bumpMoney();sfx('cash');tally('work',{pay,late:s.late||0,perf,extra:(s.worked||0)>480});
  s.work=0;
  if(s.exit&&walkable(s.exit[0],s.exit[1])){s.x=s.exit[0]+.5;s.y=s.exit[1]+.5;}
  ensureSimFree();s.think=0;
  if(Dm().soul){const t=TOX();S.needs.diversion=Math.max(0,S.needs.diversion-t*22);S.needs.social=Math.min(100,Math.max(0,S.needs.social+(0.5-t)*30));if(t>0.7&&Math.random()<0.25)setTimeout(()=>toast('😣 Día horrible en la oficina: Ana vuelve quemada'),1000);}
  floatText('+'+fmt(pay),s.x,s.y,60,'#2e8b57');burst('spark',s.x,s.y,40,12,.8,{vz:140,life:1.2,col:'#f6c453'});
  const produced=Math.round(pay*(2.6+Math.random()));
  let note=(s.late>15?` Llegó ${s.late} min tarde.`:'')+(perf>=1.1?' Fue de buen humor: ¡plus!':perf<0.9?' Fue de mal humor y rindió menos.':'');
  toast(TR().self?`${pay>=0?'Hoy la tienda ha dejado':'Hoy la tienda ha perdido'} ${fmt(Math.abs(pay))}.${note}`:TR().coop?`Ana cobró ${fmt(pay)}: en la cooperativa todo se reparte.${note}`:isI('marxista','anarquista')?`Ana cobró ${fmt(pay)}.${note} Produjo ${fmt(produced)} de valor; el resto se lo quedó la empresa 🙃`:isI('libertaria')?`Ana cobró ${fmt(pay)}.${note} Y Hacienda se quedó ${fmt(Math.round(pay*0.28))} 🙄`:`Ana cobró ${fmt(pay)}.${note}`);
  workHazards();
  const next=CAREER[S.career+1];
  if(next){
    const miss=missingReq(next);
    if(!miss.length&&(S.rep??70)<50){setTimeout(()=>toast(`Para ascender a ${next.t}, a Ana le falta reputación en el trabajo (${S.rep}/50)`),700);}
    else if(!miss.length&&isI('anarquista')&&/Jefa|Encargada|Supervisora|Gerente|Coordinadora|Directora/.test(next.t)&&!TR().coop){if(S.declined!==S.day&&Math.random()<.3){S.declined=S.day;tell(`Le han ofrecido ser ${next.t.toLowerCase()} y ha dicho que no: no quiere mandar sobre sus compañeras.`,'🏴');}}
    else if(!miss.length&&Dm().soul&&!TR().coop&&!TR().self&&Math.random()<0.25+0.6*TOX()){setTimeout(()=>toast(Math.random()<.5?`😑 El puesto de ${next.t} se lo han dado a otra persona`:`😑 «Este trimestre no hay ascensos», dice su jefe`),700);}
    else if(!miss.length){S.career++;setTimeout(storyPromo,1500);setTimeout(()=>{toast(`🎉 ¡Ascenso! Ana ahora es ${next.t} (${fmt(next.pay)} por turno)`,true);sfx('level');popBubble('🎉');},700);}
    else if(tShifts()>=(reqOf(next).shifts||0)){setTimeout(()=>toast(`Para ser ${next.t} le falta: ${miss.join(', ')}`),700);}
  }
  if(mode==='live')buildPalette();
}
function missingReq(c){
  const m=[],rq=reqOf(c);
  if(rq.shifts&&tShifts()<rq.shifts)m.push(`${rq.shifts-tShifts()} turnos más`);
  for(const [k,,nm] of SKILLS)if(rq[k]&&lvl(k)<rq[k])m.push(`${nm} ${rq[k]}`);
  return m;
}

