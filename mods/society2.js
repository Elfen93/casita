function dailySociety(){
  const w=W_();
  if(w.gsDay===S.day){w.gs=S.day;w.gsDay=null;w.mov=Math.min(100,w.mov+5);const join=ID().strike>=.5;
    if(join){S.pol.xp+=3;S.pol.inf=Math.min(100,S.pol.inf+3);}
    tell(join?`Huelga general. ${CH().name} no fue a trabajar: estuvo en los piquetes desde las siete de la mañana.`:`Huelga general. ${CH().name} fue a trabajar igualmente${isI('libertaria','conservadora')?': «a mí nadie me dice cuándo no puedo trabajar».':'.'}`,'🪧');
    if(Math.random()<.4){S.payMul=(S.payMul||1)*1.03;setTimeout(()=>tell('Tras la huelga general, el gobierno sube el salario mínimo y pacta mejoras salariales. Hasta su nómina lo nota.','📜'),10);}}
  if(w.gs&&w.gs<S.day-1)w.gs=null;
  revolutionDaily();strikeDay();courtTick();seekTick();oposTick();electionCheck();arcTick();
  if(S.jobless&&!S.seek)autoSeek();
  if(dark()&&!S.story.chap.oscuros)chapter('oscuros','Tiempos oscuros',`La crisis se lo come todo: cierres, desahucios, colas en el banco de alimentos. ${isI('marxista','anarquista')?'Pero en los barrios la gente ha empezado a organizarse.':isI('libertaria','liberal')?'Quien se mueva rápido sobrevivirá.':isI('conservadora')?'Toca apretarse el cinturón y cuidar de los suyos.':'Nadie sabe qué va a pasar.'}`);
}
function ideoThoughts(add){
  const I=ID(),o=oa();if(!S.ideo||S.ideo==='apolitica'){if(Math.random()<.3)add(pickR(I.th),.5);return;}
  add(pickR(I.th),0.6*comp());
  if(dark())add(isI('marxista','anarquista')?'O nos organizamos o nos aplastan.':isI('libertaria')?'En las crisis se hacen las fortunas.':isI('conservadora')?'Hay que aguantar. Siempre se ha aguantado.':'Esto no puede seguir así.',1.2);
  if(S.strike&&S.strike.on)add(S.strike.join?'Hoy no se trabaja: hoy se lucha.':'Cruzar el piquete me revuelve el estómago… pero tengo facturas.',3);
  if(!S.jobless&&S.office&&S.office.org>45&&S.union&&S.union.member)add('Ya somos muchas en la plantilla.',1);
  if(!S.jobless&&TOX()>0.65&&isI('marxista','anarquista'))add('Mi jefe vive de mi tiempo.',1.2);
  if(!S.jobless&&TOX()>0.65&&isI('libertaria','liberal'))add('Me merezco algo mejor. Me iré a otra empresa.',1.2);
  if(S.rentStrike)add('Este mes no pagamos la subida. Juntas.',1.2);
  if(W_().era==='consejos'||W_().era==='comunas')add(isI('marxista','anarquista')?'Lo hemos conseguido. Ahora hay que cuidarlo.':'¿Y ahora qué va a pasar con todo?',1.5);
  if(W_().era==='represion')add(isI('marxista','anarquista')?'Nos han ganado esta vez. Solo esta vez.':'Ojalá vuelva la calma.',1.5);
  if(S.inv&&S.inv.v>0)add(S.pol.invest==='cripto'?'¿Cómo irá bitcoin hoy?':'Mi cartera sigue creciendo, poco a poco.',.8);
  if(S.opos&&S.opos.on)add('Tema 14: el procedimiento administrativo…',1);
  if(S.track==='reparto'&&(S.weather||{}).k==='lluvia')add('Con esta lluvia, hoy se cobra más… si no me caigo.',1.5);
  if(S.track==='negocio')add(pickR(['¿Llegaré a pagar el local este mes?','Sin jefe, pero sin descanso.']),1);
  if(S.pol.concejal)add('Mañana hay pleno en el ayuntamiento.',1);
}
// panel: vida pública y profesiones
function vidaTab(){
  const I=ID(),w=W_(),p=S.pol;let h='';
  h+=`<h3>${I.e} Ideas: ${I.n}${S.ideo!=='apolitica'?` · ${COMP[comp()]}`:''}</h3><div class="sub" style="font-size:12px">${I.d}</div>`;
  h+=I.fx.map(x=>`<div class="sub" style="font-size:11.5px">• ${x}</div>`).join('');
  const arc=ARCS[S.ideo];if(arc){h+=`<div class="arc">${arc.map(a=>`<span class="${p.stages[a.id]?'ok':''}" title="${a.x}">${p.stages[a.id]?'✅':'⬜'} ${a.t}</span>`).join('')}</div>`;}
  h+=`<div class="kv"><span>📢 Influencia</span><span>${Math.round(p.inf)}/100</span></div>`;
  if(p.concejal)h+=`<div class="kv"><span>🏛️ Concejala</span><span>hasta el día ${p.concejal}</span></div>`;
  if(S.inv&&(S.inv.v||S.inv.in))h+=`<div class="kv"><span>${p.invest==='cripto'?'🪙 Cripto':'📈 Fondos indexados'}</span><span>${fmt(S.inv.v)} (aportado ${fmt(S.inv.in)})</span></div>`;
  h+=`<h3>🚶 Salir</h3>`;
  for(const k of ['amigos','sindicato','militancia','manifestacion','piquete','voluntariado','networking','misa','deporte','biblioteca']){const o=OUT[k];if(o.req&&!o.req()&&k!=='sindicato'&&k!=='militancia')continue;if(k==='misa'&&!isI('conservadora')&&!p.parish)continue;
    const why=outAvail(k);const c=outCost(k);h+=`<div class="outrow"><span>${o.e} <b>${outName(k)}</b><small>${o.why}${c?' · '+fmt(c):''}</small></span><button class="mini" data-out="${k}" ${why?'disabled style="opacity:.45"':''}>${why||'Ir ahora'}</button></div>`;}
  h+=`<h3>✊ Sindicato</h3>`;
  if(TR().self)h+=`<div class="sub">Con negocio propio no hay sindicato. ${isI('libertaria')?'Ni falta que hace.':''}</div>`;
  else if(S.jobless)h+=`<div class="sub">Sin trabajo no hay plantilla que organizar.</div>`;
  else{const o=office();h+=`<div class="kv"><span>Afiliación</span><span>${S.union&&S.union.member?`sí, desde el día ${S.union.since} · ${fmt(unionFee())}/mes`:'no'}</span></div>`;
    h+=`<div class="skill"><span class="lbl">🤝 Organización</span><div class="bar"><i style="width:${o.org||0}%;background:#d9605a"></i></div><span class="lv">${Math.round(o.org||0)}</span></div>`;
    h+=`<div class="skill"><span class="lbl">😤 Malestar</span><div class="bar"><i style="width:${o.griev||0}%;background:#e3b341"></i></div><span class="lv">${Math.round(o.griev||0)}</span></div>`;
    if(S.strike&&S.strike.on)h+=`<div class="sub" style="color:var(--bad)">🪧 Huelga en marcha: quedan ${S.strike.left} días${S.strike.join?'':' · Ana va a trabajar'}.</div>`;
    h+=`<div style="display:flex;gap:6px">${S.union&&S.union.member?`<button class="btn grey" id="uleave">Darse de baja</button><button class="btn${strikeReady()?'':' grey'}" id="ustrike" ${strikeReady()?'':'style="opacity:.45"'}>🪧 Convocar huelga</button>`:`<button class="btn" id="ujoin">✊ Afiliarse (${fmt(unionFee())}/mes)</button>`}</div>`;
    h+=`<div class="sub" style="font-size:11px">Para convocar huelga hace falta organización 50 y malestar 35. Las asambleas organizan; las horas extra, los recortes y los despidos generan malestar.</div>`;}
  h+=`<h3>🌍 El mundo</h3>`;
  h+=`<div class="skill"><span class="lbl">📉 Crisis</span><div class="bar"><i style="width:${w.crisis}%;background:${w.crisis>65?'#2f2a3a':'#8a94a6'}"></i></div><span class="lv">${Math.round(w.crisis)}</span></div>`;
  h+=`<div class="skill"><span class="lbl">✊ Movimiento</span><div class="bar"><i style="width:${w.mov}%;background:#d9605a"></i></div><span class="lv">${Math.round(w.mov)}</span></div>`;
  if(dark())h+=`<div class="sub" style="color:#2f2a3a;font-weight:900">🌑 Tiempos oscuros: más despidos, más miedo… y más gente en la calle.</div>`;
  const G=GOVS[w.gov];h+=`<div class="kv"><span>${G.e} ${G.n}</span><span style="font-size:11px;text-align:right;max-width:58%">${G.fx}</span></div>`;
  if(!w.era)h+=`<div class="kv"><span>🗳️ Próximas elecciones</span><span>día ${w.elec}${p.cand?' · va en las listas':''}</span></div>`;
  if(w.manif)h+=`<div class="kv"><span>📣 Manifestación</span><span>${w.manif.cause} · ${WDL[dateOf(w.manif.day).wd].toLowerCase()}</span></div>`;
  if(w.gsDay)h+=`<div class="kv"><span>🪧 Huelga general</span><span>${WDL[dateOf(w.gsDay).wd].toLowerCase()} ${dateOf(w.gsDay).dm}</span></div>`;
  if(w.rev)h+=`<div class="sub" style="color:var(--bad);font-weight:900">🚩 Huelga general indefinida: día ${w.rev.total+1}.</div>`;
  if(S.rentStrike)h+=`<div class="kv"><span>🏘️ Huelga de alquileres</span><span>en marcha</span></div>`;
  if(S.record)h+=`<div class="kv"><span>🚔 Antecedentes</span><span>cuesta más encontrar trabajo</span></div>`;
  return h;
}
function trackBlock(){
  let h=`<h3>${TR().e} Profesión: ${TR().n}</h3><div class="sub" style="font-size:12px">${TR().d}</div>`;
  h+=`<div class="kv"><span>Horario</span><span>${TR().days.map(d=>WDS[d]).join(' ')} · ${SHIFT.start}:00–${SHIFT.end===24?'00':SHIFT.end}:00</span></div>`;
  if(!S.jobless&&S.office)h+=`<div class="kv"><span>Dónde</span><span>${S.office.n}</span></div>`;
  if(S.seek)h+=`<div class="sub" style="color:#2f8a5a">🔎 Buscando trabajo de ${TRACKS[S.seek].n.toLowerCase()}… <button class="mini" id="seekno">dejarlo</button></div>`;
  h+=`<details class="tracks"><summary>🔄 Cambiar de profesión</summary>`;
  for(const k of TRK_ORDER){const T0=TRACKS[k],m=entryMissing(k);if(k===S.track&&!S.jobless)continue;
    h+=`<div class="outrow"><span>${T0.e} <b>${T0.n}</b><small>${T0.levels[0].t} · ${fmt(Math.round(T0.levels[0].pay*Dm().pay))}/turno${m.length?' · falta: '+m.join(', '):''}</small></span><button class="mini" data-seek="${k}" ${m.length?'disabled style="opacity:.45"':''}>${T0.self?'Abrir':'Buscar'}</button></div>`;}
  h+=`</details>`;
  h+=`<div class="kv"><span>📚 Oposiciones</span><span>${S.oposPassed?'aprobadas ✅':S.opos&&S.opos.on?`${Math.round(S.opos.h)} h · examen día ${S.opos.exam}`:'no'}</span></div>`;
  if(!S.oposPassed)h+=`<button class="btn grey" id="oposb">${S.opos&&S.opos.on?'Dejar de estudiar oposiciones':'📚 Prepararse oposiciones'}</button>`;
  if(!S.jobless)h+=`<button class="btn grey" id="quitb">🚪 Dejar el trabajo</button>`;
  return h;
}
function bindSociety(){
  const q=s=>card.querySelector(s),on=(s,f)=>{const e=q(s);if(e)e.onclick=f;};
  card.querySelectorAll('[data-out]').forEach(b=>b.onclick=()=>{const k=b.dataset.out;if(outAvail(k))return;menu.classList.remove('open');doOut(k);});
  on('#ujoin',()=>{joinUnion();openMenu();});on('#uleave',()=>{leaveUnion();openMenu();});on('#ustrike',()=>{if(strikeReady()){callStrike(false);openMenu();}});
  card.querySelectorAll('[data-seek]').forEach(b=>b.onclick=()=>{const k=b.dataset.seek;if(entryMissing(k).length)return;S.seek=k;if(TRACKS[k].self||TRACKS[k].opos||k==='coop')seekTick();else toast(`🔎 Ana busca trabajo de ${TRACKS[k].n.toLowerCase()}`);openMenu();});
  on('#seekno',()=>{S.seek=null;openMenu();});
  on('#oposb',()=>{S.opos=S.opos||{on:false,h:0};S.opos.on=!S.opos.on;if(S.opos.on&&!S.opos.exam)S.opos.exam=S.day+90;openMenu();});
  on('#quitb',()=>{if(confirmQuit!==S.day){confirmQuit=S.day;toast('Toca otra vez para dejar el trabajo (sin paro)');return;}quitJob();openMenu();});
}
let confirmQuit=null;
