// =================== LO COLECTIVO SE NOTA: lo que das vuelve, con nombre y apellidos ===================
const SOL=()=>{if(!S.sol)S.sol={fav:0,seen:0,log:[],owed:0};return S.sol;};
function solAdd(n,why){const s=SOL();s.fav=Math.min(12,s.fav+n);if(why)s.log.push([S.day,why]);if(s.log.length>12)s.log.shift();}
// lo que cuenta: actos de solidaridad (dilemas), asambleas, piquetes, parar desahucios
{const _dl=dailyEvents;dailyEvents=function(){const r=_dl.apply(this,arguments);try{const s=SOL();const e=ex().exp.solid||0;if(e>s.seen){solAdd((e-s.seen)*1.5,'se plantó por alguien');s.seen=e;}
  const ch=storyState().chap;if(ch.parado&&!s.parado){s.parado=1;solAdd(3,'paró un desahucio');}if(S.union&&S.union.member&&dateOf(S.day).wd===0)solAdd(.15);if(S.rentStrike&&dateOf(S.day).wd===0)solAdd(.2);
  solBack();}catch(e){console.error(e);}return r;};}
{const _ob=outBack;outBack=function(k){const r=_ob.apply(this,arguments);try{if(['sindicato','militancia','piquete','voluntariado','manifestacion'].includes(k))solAdd(k==='piquete'?.8:k==='voluntariado'?.5:.3);}catch(e){}return r;};}
function solWho(){const ps=(S.people||[]).filter(p=>p.rel>=35&&p.k!=='madre');const v=P_('vecina'),c=P_('compi');const pool=[];if(v&&v.rel>=40)pool.push(v);if(c&&c.rel>=40)pool.push(c);for(const p of ps)if(!pool.includes(p))pool.push(p);return pool.length?pickR(pool.slice(0,4)):null;}
// ---- vuelve: cuando hace falta, alguien aparece ----
function solBack(){const s=SOL();if(s.fav<1)return;const n=CH().name;const o=oa();const nd=S.needs;const G=typeof MG==='function'?MG():{};const who=solWho();const union=S.union&&S.union.member;
  // en números rojos: un préstamo sin intereses
  if(S.money<-50&&!s.loanDay&&who&&s.fav>=1&&Math.random()<.35){const v=Math.round(Math.min(-S.money+40,hrs(40)));bkAdd('Préstamo',v);s.owed+=v;s.loanDay=S.day;s.loanWho=who.n;s.fav-=1;tell(`${who.n} se ha enterado de que ${n} va mal de dinero y le ha dejado ${fmt(v)}. «Me lo devuelves cuando puedas, sin prisa». Sin intereses, sin papeles, sin banco. Lo que da la gente cuando la gente ha dado.`,'🤝');toast(`🤝 ${who.n} le deja ${fmt(v)}`,true);return;}
  // enferm@: alguien trae comida
  if(S.sick&&who&&nd.hambre<45&&Math.random()<.4&&s.fav>=.5){nd.hambre=Math.min(100,nd.hambre+40);nd.social=Math.min(100,nd.social+15);s.fav-=.5;tell(pickR([`${who.n} ha subido con un táper de lentejas. «No me des las gracias; tú hiciste lo mismo».`,`${who.n} ha venido a hacer la compra para ${n}. Se ha quedado media hora.`,`Mensaje de ${who.n}: «te dejo caldo en la puerta». Estaba.`]),'🤝');return;}
  // en paro: alguien pasa una oferta
  if(S.jobless&&!(S.netBoost>S.day)&&who&&s.fav>=1&&Math.random()<.12){S.netBoost=S.day+14;s.fav-=1;tell(`${who.n} ha hablado de ${n} en su trabajo. «Mañana llama y pregunta por el encargado». Las ofertas de verdad nunca salen en el portal.`,'🤝');return;}
  // desahucio en marcha: el sindicato de vivienda / la abogada
  if(G.wk>=5&&!s.lawyer&&(union||s.fav>=3)){s.lawyer=S.day;G.wk=Math.max(2,G.wk-3);s.fav-=2;tell(`${union?'La abogada del sindicato':'Una abogada del sindicato de vivienda, a la que llegó por '+(who?who.n:'el barrio')} ha recurrido la demanda. Un mes más, mínimo. Un mes es mucho cuando lo que hay es una fecha.`,'⚖️');return;}
  // en la calle: un sofá
  if(typeof homeless==='function'&&homeless()&&who&&s.fav>=2&&!s.sofa&&Math.random()<.2){s.sofa=S.day;s.fav-=2;applyHome('habitacion');computeRooms();S.rentMul=0;S.sofaUntil=S.day+45;if(typeof centerOnWorld==='function')centerOnWorld(S.sim.x,S.sim.y);if(G.calle)G.calle=null;chapter('sofa','El sofá de '+who.n,`${who.n} le ha dicho a ${n} que se venga. «Tengo un sofá y una llave de sobra». Mes y medio sin pagar, con la condición de buscar algo. No lo hace el Estado; lo hace ${who.n}.`);toast('🔑 '+who.n+' le deja un sofá',true);return;}
  // multa o policía: alguien graba, alguien testifica
  if(S.jail>0&&!s.jailed&&(union||s.fav>=2)){s.jailed=S.day;s.fav-=1;S.jail=Math.max(0,S.jail-Math.min(S.jail,2));tell(`Había gente en la puerta de comisaría. ${union?'El sindicato ha mandado abogada':'Alguien grabó la detención'}. Sale antes y con el expediente más fino.`,'✊');return;}
  // caja de resistencia en huelga
  if(S.strike&&S.strike.on&&S.strike.join&&dateOf(S.day).wd===0&&s.fav>=1){const v=hrs(12);bkAdd('Ayuda',v);s.fav-=.3;toast(`✊ Caja de resistencia: ${fmt(v)}`);return;}}
// devolver lo prestado cuando se puede
{const _dl2=dailyEvents;dailyEvents=function(){const r=_dl2.apply(this,arguments);try{const s=SOL();if(s.owed>0&&S.money>s.owed+hrs(30)&&Math.random()<.3){bkAdd('Cuota',-s.owed);tell(`${CH().name} le ha devuelto a ${s.loanWho||'quien le prestó'} los ${fmt(s.owed)}. Han ido a tomar algo. Ha pagado ${CH().name}.`,'🤝');s.owed=0;s.loanDay=null;solAdd(.5);}
  if(S.sofaUntil&&S.day>=S.sofaUntil){S.sofaUntil=null;S.rentMul=1;tell(`Se acabó el mes y medio en el sofá. ${CH().name} se queda en el piso, pagando su parte.`,'🔑');}}catch(e){}return r;};}
// el barrio organizado también se nota en lo pequeño
{const _pr=payRent;payRent=function(){if(S.sofaUntil&&S.day<S.sofaUntil)return;return _pr.apply(this,arguments);};}
// ---- UI ----
{const _vt=vidaTab;vidaTab=function(){const h=_vt.apply(this,arguments);try{const s=SOL();let x=`<h3>🤝 Red</h3><div class="sub" style="font-size:12px">${s.fav>=3?'Hay gente que le debe una. Cuando falle algo, aparecerán.':s.fav>=1?'Alguien se acuerda de lo que hizo.':'Nadie le debe nada. Lo que no se da, no vuelve.'}${s.owed?' · debe '+fmt(s.owed)+' a '+(s.loanWho||'alguien'):''}</div>`;if(s.log.length)x+=`<div class="sub" style="font-size:11.5px">${s.log.slice(-3).map(l=>l[1]).join(' · ')}</div>`;return x+h;}catch(e){return h;}};}
