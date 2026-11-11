// ---------- hitos ----------
const BEATS={
  primer(){if(TM().n>1||S.jobless)return;const tx=TOX(),b=bossT(),c=compiN();let x;
    if(TR().self)x=`Primera venta en ${office().n}. ${fmt(Math.round(WP()*.03))}. Ana se ha quedado mirando el ticket como si fuera un diploma. Luego ha hecho cuentas: hacen falta cuarenta como ese cada día.`;
    else if(TR().coop)x=`Asamblea de bienvenida en ${office().n}. Nadie le ha dicho qué hacer: le han preguntado qué sabe hacer. Ha tardado en contestar; no estaba acostumbrada.`;
    else if(S.track==='reparto')x=`Primer día con la mochila. La app le ha dado nueve pedidos, una tormenta y una valoración de tres estrellas por «tardar». Ha ganado ${fmt(Math.round(salary()*.8))} y se ha pagado la gasolina.`;
    else if(tx>.6)x=`Primer día de verdad en ${office().n}. Nadie le ha explicado nada. A las ${SHIFT.end}:00 ha recogido y ${b} le ha dicho sin mirarla: «aquí se sale cuando se acaba». ${c} le ha hecho un gesto: ya te acostumbras.`;
    else if(tx>.35)x=`Primer día de verdad en ${office().n}. ${c} le ha enseñado dónde está todo y a quién no conviene llevar la contraria. ${cap(b)} parece normal. «Parece», ha dicho ${c}.`;
    else x=`Primer día de verdad en ${office().n}. ${cap(b)} se ha presentado y le ha preguntado si necesitaba algo. ${c} le ha dicho que aquí se está bien, «dentro de lo que cabe».`;
    chapter('primer_dia','El primer día de verdad',x.replace('mirarla',ga('mirarla','mirarlo','mirarle')));},
  semana(){const r=weeklyRent(),p=S.jobless?0:weekPay();const left=Math.round(S.money);
    let x=`Primera semana. ${S.jobless?'Sin trabajo todavía':'Ha cobrado '+fmt(p)}; el alquiler se lleva ${fmt(r)}. Quedan ${fmt(left)} para comer, la luz y lo que surja.`;
    x+=left<r*1.5?' Si pasa cualquier cosa, no hay colchón.':left<r*4?' Llega, pero sin alegrías.':' Por ahora, respira.';
    if(!S.jobless&&r>p*.45)x+=` Casi la mitad de lo que gana se va a la casa. Alguien cobra ese alquiler sin trabajar una hora.`;
    tell(x,'🧾');},
  incidente(){if(S.jobless){tell('Semana de currículos. Tres respuestas automáticas y un «ya te llamaremos».','📭');return;}
    const V=INCID[TR().self?'negocio':TR().coop?'coop':S.track]||INCID.oficina;const v=useVar('inc',V);askDilemma('incidente',{v:v.id});},
  golpe(){const V=GOLPES.filter(g=>!g.c||g.c());const v=useVar('golpe',V);const m=Math.round(v.m()*PM());askDilemma('golpe',{v:v.id,m});},
  encrucijada(){let id;const o=S.jobless?null:office();
    if(S.jobless)id='entrevista';else if(TR().self||TR().coop)id='cliente';else if((o.org>=25||(S.union&&S.union.member)||(isLeft()&&comp()>=2))&&!(S.strike&&S.strike.on))id='asamblea';else if((S.rep??70)>=62&&S.career+1<CAREER.length&&!TR().gig)id='envenenado';else id='oferta';
    askDilemma(id,{});},
  personal(){const V=PERSONAL.filter(p=>!p.c||p.c());const v=useVar('pers',V);askDilemma('personal',{v:v.id});},
  eco(){const t=TM();const c=t.choices;if(!c.length)return;tell(`Ana repasa estos dos meses: ${c.slice(-3).map(x=>x.toLowerCase()).join('; ')}. ${pickR(['No sabe si volvería a hacer lo mismo.','Lo volvería a hacer.','Cada cosa le ha costado algo.'])}`,'🪞');},
  epilogo(){const t=TM();const dm=Math.round(S.money)-t.money0;const same=S.track===t.track0&&S.career===t.career0&&!S.jobless&&!t.jobless0;
    const near=[...(S.people||[])].filter(p=>p.stage!=='ex').sort((a,b)=>closeTo(b)-closeTo(a)).slice(0,2).map(p=>p.n);
    let x=`Han pasado dos meses. ${typeof patrimonioTxt==='function'?patrimonioTxt(t,dm):(dm>=0?'Tiene '+fmt(dm)+' más que al empezar':'Tiene '+fmt(-dm)+' menos que al empezar')}. `;
    x+=S.jobless?'Está sin trabajo. ':same?`Sigue de ${L(CAREER[S.career].t).toLowerCase()} en ${office().n}. `:`Ahora es ${L(CAREER[S.career].t).toLowerCase()}${S.office?' en '+office().n:''}. `;
    if(S.ideo!==t.ideo0)x+=`Ya no piensa como antes: se siente ${IDEOS[S.ideo].n.toLowerCase()}. `;
    if(near.length)x+=`Si algo se tuerce, llamará a ${near.join(' o a ')}. `;
    if(t.choices.length)x+=`Decidió: ${t.choices.slice(-4).map(c=>c.toLowerCase()).join('; ')}. `;
    x+=same&&dm<=0?'Sesenta días de trabajo para estar donde estaba. La diferencia se la ha quedado alguien.':ex().exp.win>0?'Ha ganado alguna. Sabe que se puede.':dm>weeklyRent()*3?'Ha ahorrado. Ya veremos cuánto dura.':'Sigue en pie. Que no es poco.';
    chapter('temporada_'+t.n,`Temporada ${t.n}: dos meses`,x);
    const w=W_();w.crisis=Math.min(100,w.crisis+(Dm().soul?8:4));S.tmp=newSeason(t.n+1,S.day+1);toast(`📖 Empieza la temporada ${t.n+1}`,true);}};
