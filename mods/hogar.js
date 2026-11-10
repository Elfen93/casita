// =================== LA CASA VIVIDA: el calentador, el casero, los vecinos por la pared ===================
const HG=()=>{if(!S.hg)S.hg={boiler:0,boilerSince:0,fridge:0,wash:0,noise:0,visits:0,req:0,log:[]};return S.hg;};
const renting=()=>!S.owned&&S.home&&!['padres','calle'].includes(S.home.type);
const isWinter=()=>typeof seasonOf==='function'&&seasonOf(S.day)==='inv';
// ---- averías: calentador (invierno), nevera, lavadora ----
{const _dl=dailyEvents;dailyEvents=function(){const r=_dl.apply(this,arguments);try{const g=HG();const n=CH().name;const T=S.home&&S.home.type;if(!T||T==='calle')return r;const old=['infra','viejo','habitacion'].includes(T);
  // calentador
  if(!g.boiler&&Math.random()<(isWinter()?.012:.004)*(old?1.6:T==='bueno'||T==='chalet'?.4:1)){g.boiler=1;g.boilerSince=S.day;g.req=0;tell(`El calentador ha muerto. ${isWinter()?'En enero.':''} Ducha fría hasta que alguien lo arregle${renting()?': el casero dice que «lo mira»':T==='padres'?': su madre ha llamado a un primo que entiende':''}.`,'🚿');}
  if(g.boiler){const d=S.day-g.boilerSince;S.needs.higiene=Math.max(0,S.needs.higiene-2);if(isWinter()&&Math.random()<.04&&!S.sick){S.sick=1+(Math.random()*2|0);tell(`Ducha fría en invierno, ${d} días. ${n} ha cogido un catarro de los de cama.`,'🤒');}
    if(renting()){const fixP=.05+(S.rentStrike?.1:0)+(g.req>=2?.08:0)+(W_().mov>=55?.05:0);if(Math.random()<fixP){g.boiler=0;tell(d>14?`Por fin: el casero ha mandado a un fontanero. ${d} días de ducha fría. Ha descontado cero.`:`El casero ha arreglado el calentador. ${d} días. «Es que el fontanero estaba liado».`,'🚿');}
      else if(d===5||d===15||d===30)tell(pickR([`${n} ha vuelto a escribir al casero por el calentador. Visto. Sin respuesta.`,`El casero: «si quieres lo arreglas tú y me pasas la factura». No dice cuándo la paga.`,`${d} días sin agua caliente. ${n} se ducha en el gimnasio${HP().gymMember?'':', si pudiera pagarlo'}.`]),'🚿');}
    else if(T==='padres'){if(d>=3){g.boiler=0;tell(`El primo de su madre ha cambiado el calentador por ${fmt(hrs(20))} y dos cervezas.`,'🚿');}}
    else{if(S.money>=hrs(45)&&(d>=2||Math.random()<.5)){g.boiler=0;bkAdd('Arreglos',-hrs(45));tell(`Calentador nuevo: ${fmt(hrs(45))}. Ser propietari${oa()} es pagar tú lo que antes no pagaba nadie.`,'🚿');}}}
  // nevera: la comida se estropea
  if(!g.fridge&&has('nevera')&&Math.random()<.004*(old?1.5:1)){g.fridge=1;S.pantry=0;S.tapers=0;tell(`La nevera ha dejado de enfriar. Lo que había dentro, a la basura. ${S.tapers?'Los tápers también.':''}`,'🧊');}
  if(g.fridge){S.needs.hambre=Math.max(0,S.needs.hambre-3);if(S.money>=hrs(30)&&Math.random()<.3){g.fridge=0;bkAdd('Arreglos',-hrs(30));tell(`Nevera arreglada: ${fmt(hrs(30))}${renting()?'. El casero dice que la nevera «no es de la casa»':''}.`,'🧊');}else if(Math.random()<.15)tell(`Sin nevera: comer de lata y comprar cada día, que sale más caro. Ser pobre es caro.`,'🧊');}
  // lavadora: lavandería
  if(!g.wash&&has('lavadora')&&Math.random()<.003){g.wash=1;tell(`La lavadora hace un ruido nuevo y ya no centrifuga.`,'🧺');}
  if(g.wash){if(dateOf(S.day).wd===0){bkAdd('Otros',-hrs(1.5));toast(`🧺 Lavandería: ${fmt(hrs(1.5))}`);}if(S.money>=hrs(25)&&Math.random()<.25){g.wash=0;bkAdd('Arreglos',-hrs(25));tell(`Lavadora arreglada: ${fmt(hrs(25))}.`,'🧺');}}
  // ---- el casero ----
  if(renting()){
    if(Math.random()<.015){g.visits++;const h=HOMES[T];tell(pickR([`El casero ha entrado «a ver una cosa» con su llave, sin avisar. ${n} estaba en la ducha. «Es mi casa», ha dicho.`,`Visita del casero con una pareja joven: «por si acaso». ${n} vive aquí. De momento.`,`El casero ha venido a «revisar» y ha hecho fotos de todo. ${n} ha preguntado para qué. No ha contestado.`,`Mensaje del casero a las once de la noche: «mañana paso». No ha dicho a qué hora.`]),'🔑');try{MT().an-=1;}catch(e){}S.needs.social=Math.max(0,S.needs.social-4);
      if(g.visits===3)chapter('casero','La llave del casero',`Tres visitas sin avisar en pocas semanas. Es ilegal; ${n} lo sabe y no hace nada, porque el contrato acaba en unos meses y el casero también lo sabe. Ser inquilin${oa()} es vivir en casa de otro con derechos que no se pueden usar.`);}
    // renovación: subida, o fuera
    const since=S.day-(S.home.since||0);if(since>0&&since%365===0){const up=1+.06+Math.random()*.12;if(S.rentStrike||W_().mov>=60){tell(`Renovación del contrato. El casero quería subir un ${Math.round((up-1)*100)} %. Con el sindicato de inquilinas en el bloque, se ha quedado en el IPC.`,'🏘️');S.rentMul=(S.rentMul||1)*1.03;}
      else if(Math.random()<.25){tell(`Carta del casero: no renueva. «Necesidad propia» (lo alquilará por el doble, o a turistas). ${n} tiene tres meses para encontrar algo. Con los precios de ahora.`,'📨');S.noRenew=S.day+90;try{MT().an-=5;}catch(e){}chapter('norenueva','No renueva',`El casero no renueva. No ha hecho nada malo ${n}: ha pagado cada semana. Es que vale más vací${oa()==='a'?'a':'o'} que con ${oa()==='a'?'ella':'él'} dentro.`);}
      else{S.rentMul=(S.rentMul||1)*up;tell(`Renovación: el alquiler sube un ${Math.round((up-1)*100)} % «según mercado». El mercado son cuatro fondos y el casero.`,'📨');}}
    if(S.noRenew&&S.day>=S.noRenew){S.noRenew=null;try{if(typeof mgEvict==='function')mgEvict('casero');}catch(e){}}
    if(S.noRenew&&S.noRenew-S.day===30)tell(`Un mes para dejar el piso. ${n} ha visto doce anuncios: todos piden nómina de tres veces el alquiler, dos meses de fianza y «no mascotas, no niños».`,'📨');
    // fianza al irse: lo gestiona moveHome; aquí, lo que no devuelven
  }
  // ---- vecinos ----
  if(T!=='chalet'&&T!=='casita'&&Math.random()<.05){const k=Math.random();if(k<.35){g.noise=S.day;tell(pickR([`Los de arriba, otra vez: ${pickR(['taladro a las ocho de un sábado','la tele a todo volumen hasta las dos','una bronca que se oía entera','reggaetón de bienvenida'])}. ${n} ha dormido mal.`,`Obras en el 3.º: el casero de ese piso lo está «reformando para turistas». Martillos de ocho a seis.`]),'🔊');S.needs.energia=Math.max(0,S.needs.energia-8);}
    else if(k<.6)tell(pickR([`La vecina del 2.º ha dejado una nota en el ascensor: «Si alguien necesita que le hagan la compra, llamad al 2.ºB». ${n} ha guardado el teléfono.`,`En el portal hay un cartel nuevo: reunión de vecinos ${pickR(['por la subida de la luz','por el ascensor que lleva un mes parado','porque quieren vender el bloque a un fondo'])}.`,`Han puesto una cámara en el portal. Nadie sabe quién.`]),'🏘️');
    else if(k<.8){tell(pickR([`El del 4.º ha parado a ${n} en la escalera para quejarse ${pickR(['de la bici en el portal','de que «huele a comida rara»','del ruido de los críos'])}. ${n} ha sonreído. Por dentro, no.`,`Reunión de la comunidad: dos horas discutiendo por ${fmt(hrs(2))} de derrama. Los que no fueron son los que mandan.`]),'🏘️');S.needs.social=Math.max(0,S.needs.social-3);}
    else{const who=solWho&&solWho();if(who){tell(`${who.n} se ha pasado con ${pickR(['un bizcocho','media docena de huevos «que me sobran»','el periódico del domingo','una planta que le sobraba'])}. Diez minutos en la puerta.`,'🏘️');S.needs.social=Math.min(100,S.needs.social+8);}}}
  }catch(e){console.error(e);}return r;};}
// sin calentador, la ducha no limpia igual (y es horrible)
{const _su=startUse;startUse=function(){const r=_su.apply(this,arguments);try{const u=S.sim.use;if(u&&(u.type==='ducha'||u.type==='banera')&&HG().boiler){u.cold=true;if(throttled('cold',3e5))toast('🥶 Ducha fría');}}catch(e){}return r;};}
{const _up=update;update=function(gm){const u=S.sim.use;const h0=S.needs.higiene;const r=_up.apply(this,arguments);try{if(u&&u.cold&&S.sim.use===u){const d=S.needs.higiene-h0;if(d>0)S.needs.higiene=h0+d*.5;S.needs.diversion=Math.max(0,S.needs.diversion-.3*gm);}}catch(e){}return r;};}
// perfil de casa: estado
{const _vt=vidaTab;vidaTab=function(){const h=_vt.apply(this,arguments);try{const g=HG();const L=[];if(g.boiler)L.push('🚿 sin agua caliente ('+(S.day-g.boilerSince)+' días)');if(g.fridge)L.push('🧊 nevera rota');if(g.wash)L.push('🧺 lavadora rota');if(S.noRenew)L.push('📨 contrato sin renovar: '+(S.noRenew-S.day)+' días');if(!L.length)return h;return `<h3>🏚️ En casa</h3><div class="sub" style="font-size:12px;color:#a04a3a">${L.join(' · ')}</div>`+h;}catch(e){return h;}};}
