// ---------- interfaz ----------
let speed=1;
document.querySelectorAll('#speed button').forEach(b=>b.onclick=()=>{speed=+b.dataset.s;document.querySelectorAll('#speed button').forEach(x=>x.classList.toggle('on',x===b));});
document.querySelectorAll('#tabs button').forEach(b=>b.onclick=()=>setMode(b.dataset.m));
document.getElementById('zin').onclick=()=>smoothZoom(1.35);
document.getElementById('zout').onclick=()=>smoothZoom(1/1.35);
document.getElementById('rotbtn').onclick=rotate;
const wb=document.getElementById('wallsbtn');
wb.onclick=()=>{wallMode=(wallMode+1)%3;wb.textContent=WALLICON[wallMode];toast(['Paredes altas','Paredes en corte (ves dentro de las habitaciones)','Paredes bajas'][wallMode]);};
wb.textContent=WALLICON[wallMode];
document.getElementById('center').onclick=()=>centerOnWorld(S.sim.work?N/2:S.sim.x,S.sim.work?N/2:S.sim.y);
const needsEl=document.getElementById('needs');needsEl.onclick=()=>openMenu('perfil');locEl(document.getElementById('act'));locEl(document.getElementById('hname'));

// panel
const menu=document.getElementById('menu'),card=document.getElementById('menucard');
locEl(card);
let menuTab='perfil';
const MTABS=[['perfil','👤','Perfil'],['gente','💞','Gente'],['historia','📖','Historia'],['trabajo','💼','Trabajo'],['vida','✊','Vida'],['casa','🏠','Casa'],['ajustes','⚙️','Ajustes']];
function tabBar(){return `<div class="mtabs">${MTABS.map(([k,e,n])=>`<button class="mt${menuTab===k?' on':''}" data-mt="${k}">${e}<span>${n}</span>${k==='historia'&&storyUnseen?`<i>${Math.min(99,storyUnseen)}</i>`:''}</button>`).join('')}</div>`;}
function openMenu(tab){card.onscroll=null;
  if(typeof tab==='string')menuTab=tab;
  unseen=0;checkGoals();computeRooms();
  const c=CAREER[S.career],next=CAREER[S.career+1],ch=CH(),md=mood();
  let h=`<div class="mhead"><canvas id="mpor" width="132" height="132"></canvas><div style="flex:1;min-width:0"><h2>${ch.name}</h2><div class="sub">${ch.age} años · ${S.jobless?'en paro':TR().e+' '+c.t} · ${md>72?'😄 feliz':md>55?'🙂 a gusto':md>38?'😐 regular':md>22?'😟 de bajón':'😫 fatal'}</div><div class="sub" style="font-size:11.5px">${SEASONS[seasonOf()].e} ${SEASONS[seasonOf()].n} · ${S.weather?WX[S.weather.k].e+' '+S.weather.t+' °C':''} · Día ${S.day}</div></div><button class="xbtn" id="closex">✕</button></div>`;
  h+=tabBar();
  if(menuTab==='perfil'){
    if(S.lastLine)h+=`<div class="quote">${S.lastLine.ic} ${S.lastLine.txt}</div>`;
    {const I=ID();h+=`<div class="kv"><span>${I.e} Ideas</span><span>${I.n}${S.ideo!=='apolitica'?' · '+COMP[comp()]:''}</span></div>`;}
    h+=`<h3>🧠 Personalidad</h3>`;
    if((S.traits||[]).length)h+=(S.traits||[]).map(k=>`<div class="trait"><b>${TRAITS[k].e} ${TRAITS[k].n}</b><span>${TRAITS[k].d}</span></div>`).join('');
    else h+=`<div class="sub" style="font-size:12px">Sin rasgos: Ana es equilibrada.</div>`;
    h+=innerBlock();
    h+=`<button class="btn grey" id="editchar">✏️ Cambiar aspecto y personalidad</button>`;
    {const pt=partner(),L=LIFE();h+=`<div class="kv"><span>💞 Vida afectiva</span><span>${pt?'❤️ '+pt.n+' · '+STAGE[pt.stage]:RELSTYLE[L.rel]}${(S.kids||[]).length?' · '+S.kids.map(k=>k.n).join(', '):''}</span></div>`;}
    h+=`<h3>Habilidades</h3>`;
    for(const [k,e,nm] of SKILLS){const si=skillInfo(S.skills[k]);const src=Object.values(OBJ).filter(o=>o.sk===k).map(o=>o.e).join('');
      h+=`<div class="skill"><span class="lbl">${e} ${nm}</span><div class="bar"><i style="width:${si.prog*100}%;background:#9b8cf2"></i></div><span class="lv">Nv ${si.lv}</span><span style="font-size:11px">${src}</span></div>`;}
  }
  else if(menuTab==='historia'){
    storyUnseen=0;const st=storyState();
    {const t=TM();const d=S.day-t.start+1;const nxt=Math.min(...Object.entries(t.beats).filter(([k])=>!t.done[k]).map(([,v])=>v-d).filter(v=>v>0),99);h+=`<div class="sub" style="font-size:12px;margin-bottom:6px">📖 Temporada ${t.n} · día ${Math.min(60,d)} de 60${nxt<99?' · '+(nxt<=1?'hoy se cuece algo':nxt<=3?'algo se cuece':'tranquilidad, de momento'):''}</div>`;}
    const caps=Object.values(st.chap).sort((a,b)=>a.n-b.n);
    if(caps.length)h+=`<div class="chaps">${caps.map(x=>`<span>📕 ${x.n}. ${x.title}</span>`).join('')}</div>`;
    const log=st.log.slice(-60).reverse();
    if(!log.length)h+=`<div class="sub">Todavía no ha pasado nada digno de contar.</div>`;
    let lastD=null;
    for(const e of log){if(e.d!==lastD){const D=dateOf(e.d);h+=`<div class="dday">${WDS[D.wd]} ${D.dm} ${MONTHS[D.m].slice(0,3).toLowerCase()} · día ${e.d}</div>`;lastD=e.d;}
      h+=`<div class="entry ${e.k}"><span class="ic">${e.ic}</span><span>${e.txt}</span></div>`;}
  }
  else if(menuTab==='vida'){h+=vidaTab();}
  else if(menuTab==='gente'){h+=genteTab();}
  else if(menuTab==='trabajo'){
    h+=trackBlock();
    h+=`<div class="career"><div class="ttl">💼 ${S.jobless?'En paro':c.t} · ${fmt(salary())}/turno</div><div class="req">${daysLabel()} ${SHIFT.start}:00–${SHIFT.end}:00 · reputación ${S.rep??70}/100 · 🏖️ ${S.vac||0} días libres</div>`;
    if(next){h+=`<div class="req">Siguiente: <b>${next.t}</b> (${fmt(Math.round(next.pay*Dm().pay*(S.payMul||1)))}/turno)</div><div class="req">`;
      const rq=reqOf(next);const parts=[];if(rq.shifts)parts.push(`<span class="${tShifts()>=rq.shifts?'ok':'no'}">${tShifts()}/${rq.shifts} turnos${rq.fast?` <s style="opacity:.5">${rq.baseShifts}</s> ⚡`:''}</span>`);
      for(const [k,e,nm] of SKILLS)if(rq[k])parts.push(`<span class="${lvl(k)>=rq[k]?'ok':'no'}">${e} ${nm} ${lvl(k)}/${rq[k]}</span>`);
      h+=parts.join(' · ')+'</div>';}
    else h+=`<div class="req ok">¡Lo más alto de la empresa! (y aun así no es la dueña)</div>`;
    h+=`</div>`;
    if(Dm().soul){if(!S.jobless){const o=office();h+=`<div class="kv"><span>🏢 Empresa</span><span>${o.n} · ${o.known>=0.8?toxLabel(o.tox):o.seen!=null?toxLabel(o.seen)+' (eso parece)':'¿?'}</span></div>`;
        h+=`<button class="btn grey" id="raise">💬 Pedir aumento${S.day-(S.lastRaise??-99)<42?' (espera '+(42-(S.day-(S.lastRaise??-99)))+' d)':''}</button>`;}
      if(S.offer){const f=S.offer;h+=`<div class="sub" style="margin-top:8px;padding:8px;border-radius:10px;background:rgba(46,139,87,.1)">📩 <b>Oferta de ${f.n}</b>: ${CAREER[f.career].t} · ${fmt(offerPay(f))}/turno (ahora ${S.jobless?'nada':fmt(salary())}) · ambiente ${toxLabel(f.seen)} según dicen · caduca en ${f.until-S.day} d</div>
        <div style="display:flex;gap:6px"><button class="btn" id="offyes">✅ Aceptar</button>${S.jobless?'':'<button class="btn grey" id="offneg">🗣️ Negociar</button>'}<button class="btn grey" id="offno">✕</button></div>`;}}
    if(S.jobless)h+=`<div class="sub" style="color:var(--bad);margin-top:6px">📨 Ana está en paro y busca trabajo cada día laborable${S.paroWeeks?` · le quedan ${S.paroWeeks} semanas de paro`:''}.</div>`;
    h+=aspBlock();
  }
  else if(menuTab==='casa'){
    h+=homeBlock();
    h+=`<h3>🏡 Planes</h3>`;
    if(S.job){const dn=S.job.steps.filter(x=>x.done).length;h+=`<div class="sub">${S.job.who==='builder'?'👷 '+(S.npc?S.npc.name+' (cooperativa)':'La cooperativa'):'🔨 Ana'} está con: <b>${S.job.emoji} ${S.job.name}</b> · ${dn}/${S.job.steps.length}${S.job.paused?' · ⏸ sin dinero':''}</div>`;}
    else if(S.want&&S.autoHome){const pr=jobPrice(S.want);h+=`<div class="sub">💭 Quiere: <b>${S.want.emoji} ${S.want.name}</b> ${S.want.why}<br>Materiales ${fmt(pr.mat)} · si contrata, +${fmt(pr.labor)}</div>`;}
    else h+=`<div class="sub">${S.autoHome?'Ahora mismo no quiere nada nuevo.':'Ana no toma decisiones de compra ni obras.'}</div>`;
    h+=`<div style="display:flex;gap:6px"><button class="btn grey" id="autob">${S.autoHome?'🏗️ Decide por su cuenta: sí':'🏗️ Decide por su cuenta: no'}</button>${S.job?'<button class="btn grey" id="canceljob">✕ Cancelar obra</button>':''}</div>`;
    {const o=mortgageOffer();h+=`<h3>🔑 Vivienda y gastos</h3>`;
      if(S.owned){h+=`<div class="kv"><span>Situación</span><span>Propietaria ${S.mort?'con hipoteca':'sin deudas ✅'}</span></div>`;
        if(S.mort)h+=`<div class="kv"><span>Hipoteca pendiente</span><span>${fmt(S.mort.left)}</span></div><div class="kv"><span>Cuota</span><span>${fmt(S.mort.pay)}/semana · ${(S.mort.rate*100).toFixed(1)} %</span></div><button class="btn grey" id="amort">🏦 Amortizar ${fmt(Math.min(S.mort.left,Math.max(0,Math.round(S.money-reserveMoney()))))}</button>`;}
      else if(!HT().buy){const tk=(S.home&&S.home.type)||'casita';h+=`<div class="kv"><span>${tk==='padres'?'Lo que pone para la compra':tk==='calle'?'Alquiler':'Alquiler'}</span><span>${fmt(weeklyRent())}/semana</span></div><div class="sub" style="font-size:12px">${tk==='padres'?'🏠 La casa es de su madre: no está en venta.':tk==='habitacion'?'🚪 Una habitación no se compra: el piso es del casero.':tk==='infra'?'🏚️ Sin contrato no hay nada que comprar.':tk==='calle'?'🧳 Sin casa.':'No está en venta.'}</div>`;}
      else{h+=`<div class="kv"><span>Alquiler</span><span>${fmt(weeklyRent())}/semana</span></div><div class="kv"><span>Comprar la casa</span><span>${fmt(o.price)} + ${fmt(o.closing)} de gastos</span></div>`;
        h+=`<div class="kv"><span>Hipoteca</span><span>entrada ${fmt(o.down)} · ${fmt(o.pay)}/sem</span></div>`;
        if(!o.ok)h+=`<div class="sub" style="font-size:12px">🏦 El banco ahora no la da: ${o.why.join(', ')}.</div>`;
        h+=`<div style="display:flex;gap:6px"><button class="btn" id="buymort" style="${o.ok?'':'opacity:.45'}">🏦 Hipoteca</button><button class="btn grey" id="buycash" style="${S.money>=o.price+o.closing?'':'opacity:.45'}">💵 Al contado</button></div>`;}
      const lb=S.lastBill;h+=`<div class="kv"><span>💡 Facturas del mes</span><span>~${fmt(utilEstimate())}${lb?` · anterior ${fmt(lb.total)}`:''}</span></div>`;
      if(S.pantry)h+=`<div class="kv"><span>🧺 Despensa del huerto</span><span>${S.pantry} raciones</span></div>`;
      if(Dm().soul&&S.market)h+=`<div class="kv"><span>📉 Mercado</span><span>precios ×${S.market.price.toFixed(2)} · energía ×${S.market.util.toFixed(2)} · euríbor ${(S.market.euribor*100).toFixed(1)} %</span></div>`;}
    h+=`<h3>🏠 Habitaciones (${rooms.length})</h3>`;
    if(!rooms.length)h+=`<div class="sub">Aún no hay habitaciones cerradas.</div>`;
    for(const r of rooms)h+=`<div class="room"><button class="mini" data-zone="${r.id}" title="Cambiar uso" style="margin:0 4px 0 0">${r.zemoji}</button><span>${r.name}</span><span style="opacity:.6">${r.cells.length*4} m² · ${r.wins} 🪟</span><span class="st">${'★'.repeat(r.stars)}${'☆'.repeat(5-r.stars)}</span></div>`;
    {const g=gardenScore();const hs=findObjs((d,t)=>t==='huerto');h+=`<h3>🌳 Jardín <span class="st" style="color:#d79a00">${'★'.repeat(g.stars)}${'☆'.repeat(5-g.stars)}</span></h3>`;
      h+=`<div class="kv"><span>Estación</span><span>${SEASONS[seasonOf()].e} ${SEASONS[seasonOf()].n}${S.weather?' · '+WX[S.weather.k].e+' '+WX[S.weather.k].n:''}</span></div>`;
      if(hs.length)for(const i of hs){const cr=S.obj[i].crop;h+=`<div class="kv"><span>🥕 Bancal</span><span>${!cr?'vacío':cr.dead?'🥀 echado a perder':`${CROPS[cr.k].e} ${CROPS[cr.k].n} · ${cr.g>=1?'¡listo!':Math.round(cr.g*100)+' %'} · 💧${Math.round(cr.w)} %`}</span></div>`;}
      else h+=`<div class="sub" style="font-size:12px">Sin huerto. Compra un 🥕 bancal en Comprar → Jardín: da verduras para cocinar gratis.</div>`;
      h+=`<div class="kv"><span>🌿 Malas hierbas</span><span>${(S.weeds||[]).length}</span></div>`;}
    const items=findObjs(d=>!!d.need).map(i=>[i,S.obj[i]]).filter(([,o])=>condOf(o)<70).sort((a,b)=>condOf(a[1])-condOf(b[1]));
    if(items.length){h+=`<h3>🔧 Muebles gastados</h3>`;
      for(const [i,o] of items.slice(0,6)){const c2=Math.round(condOf(o));const col=c2<=0?'#e05d5d':c2<35?'#f4a261':c2<60?'#f4c95d':'#5cc98a';
        h+=`<div class="skill"><span class="lbl" style="width:auto;min-width:96px">${OBJ[o.t].e} ${OBJ[o.t].n} ${TIERS[o.q??3].e}</span><div class="bar"><i style="width:${Math.max(3,c2)}%;background:${col}"></i></div><span class="lv" style="width:38px">${c2<=0?'rota':c2+'%'}</span></div>`;
        if(c2<60)h+=`<div style="text-align:right;margin:-2px 0 6px"><button class="mini" data-fix="${i}">🔧 Ana</button><button class="mini" data-tech="${i}">🧰 Técnico</button><button class="mini" data-rep="${i}">🔁 Cambiar ${TIERS[buyTier].e}</button></div>`;}}
  }
  else if(menuTab==='ajustes'){
    h+=`<button class="btn grey" id="soundbtn">${S.sound?'🔊 Sonido: sí':'🔇 Sonido: no'}</button>`;
    h+=`<button class="btn grey" id="entbtn">${S.entorno!==false?'🏘️ Calle y vecinos: sí':'🏘️ Calle y vecinos: no'}</button>`;
    h+=`<h3>Dificultad: ${Dm().e} ${Dm().n}</h3><div class="sub" style="font-size:12px">${Dm().desc}</div><div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap">${DIFF_ORDER.map(k=>`<button class="mini" data-diff="${k}" style="margin:0;${k===S.diff?'background:var(--ink);color:#fff':''}">${DIFF[k].e} ${DIFF[k].n}</button>`).join('')}</div><div class="sub" style="font-size:11px">Cambiarla afecta desde ahora a precios, sueldo, alquiler y ascensos.</div>`;
    {const c=ex();h+=`<h3>🧭 Dilemas</h3><div class="sub" style="font-size:12px">Cuando la vida pone a Ana en una encrucijada, ¿quién decide?</div><div class="chips"><button class="mini${c.dmode!=='ana'?' sel':''}" data-dmode="preguntar">Decido yo (se pausa el juego)</button><button class="mini${c.dmode==='ana'?' sel':''}" data-dmode="ana">Decide Ana según su carácter</button></div>`;}
    h+=`<h3>💾 Partida</h3><div class="sub" style="font-size:12px">Se guarda sola en este navegador. Para llevarla a otro dispositivo, cópiala.</div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px"><button class="mini" id="exportsave">📤 Copiar partida</button><button class="mini" id="importsave">📥 Pegar partida</button></div>`;
    h+=`<button class="btn grey" id="quitgame">🚪 Guardar y salir</button>`;
    h+=`<button class="btn red" id="newgame">Nueva partida (nuevo personaje)</button>`;
  }
  h+=`<button class="btn" id="closemenu">Seguir jugando</button>`;
  card.innerHTML=h;menu.classList.add('open');card.scrollTop=0;
  paintPortrait(card.querySelector('#mpor'),ch,md);
  const q=s=>card.querySelector(s),on=(s,f)=>{const e=q(s);if(e)e.onclick=f;};
  card.querySelectorAll('[data-mt]').forEach(b=>b.onclick=()=>openMenu(b.dataset.mt));
  on('#closex',()=>{menu.classList.remove('open');save();});on('#closemenu',()=>{menu.classList.remove('open');save();});
  on('#exportsave',async()=>{const txt=JSON.stringify(S);try{await navigator.clipboard.writeText(txt);toast('📤 Partida copiada al portapapeles');}catch(e){prompt('Copia este texto:',txt);}});
  on('#importsave',()=>{const txt=prompt('Pega aquí la partida copiada:');if(!txt)return;try{const o=JSON.parse(txt);if(!o||!o.floor)throw 0;localStorage.setItem(KEY,JSON.stringify(o));location.reload();}catch(e){toast('❌ Eso no parece una partida de Casita');}});
  on('#entbtn',()=>{S.entorno=S.entorno===false;save();openMenu('ajustes');});
  on('#editchar',()=>openCreator(null,true));if(menuTab==='casa')bindHome();card.querySelectorAll('[data-dmode]').forEach(b=>b.onclick=()=>{ex().dmode=b.dataset.dmode;openMenu();});bindSociety();if(menuTab==='gente')bindGente();
  card.querySelectorAll('[data-zone]').forEach(b=>b.onclick=()=>{const r=rooms[+b.dataset.zone];if(!r)return;const cur=ZONE_ORDER.indexOf(r.purpose);const nxt=cur<0?ZONE_ORDER[0]:cur+1<ZONE_ORDER.length?ZONE_ORDER[cur+1]:0;for(const c of r.cells)S.zone[c]=nxt||0;dirty();computeRooms();toast(nxt?`Ahora es ${ZONES[nxt].e} ${ZONES[nxt].n}`:'Uso automático (según lo que haya dentro)');openMenu();});
  on('#buymort',()=>{if(buyHouse('mortgage'))openMenu();});on('#buycash',()=>{if(buyHouse('cash'))openMenu();});
  on('#raise',()=>{askRaise(true);openMenu();});on('#offyes',()=>{acceptOffer();openMenu();});on('#offneg',()=>{counterOffer();openMenu();});on('#offno',()=>{rejectOffer();openMenu();});
  on('#amort',()=>{amortize(Math.max(0,Math.round(S.money-reserveMoney())));openMenu();});
  card.querySelectorAll('[data-diff]').forEach(b=>b.onclick=()=>{S.diff=b.dataset.diff;toast(`Dificultad: ${Dm().e} ${Dm().n}`);buildPalette();openMenu();});
  on('#autob',()=>{S.autoHome=!S.autoHome;if(!S.autoHome)S.want=null;openMenu();});
  on('#canceljob',()=>{cancelJob();openMenu();});
  card.querySelectorAll('[data-fix]').forEach(b=>b.onclick=()=>{const i=+b.dataset.fix;const [fk,fl]=stepReq({k:'fix',i});if(lvl(fk)<fl){toast(`Ana no sabe: pide ${skLabel(fk)} ${fl} (tiene ${lvl(fk)}). Llama a un técnico`);sfx('bad');return;}addFixStep(i,true);toast('🔧 Ana lo intentará arreglar');openMenu();});
  card.querySelectorAll('[data-tech]').forEach(b=>b.onclick=()=>{hireFor(+b.dataset.tech,'fix');openMenu();});
  card.querySelectorAll('[data-rep]').forEach(b=>b.onclick=()=>{const i=+b.dataset.rep;const [k,l]=stepReq({k:'replace',i});if(lvl(k)<l){hireFor(i,'replace');openMenu();return;}orderReplace(i,true);toast('🔁 Ana lo cambiará por uno nuevo');openMenu();});
  on('#soundbtn',()=>{S.sound=!S.sound;openMenu();sfx('tap');});
  on('#newgame',()=>chooseDifficulty(true));on('#quitgame',()=>{menu.classList.remove('open');showTitle(true);});
}

function chooseDifficulty(isNew){
  let h=`<h2>${isNew?'Nueva partida':'¡Bienvenid@ a Casita!'}</h2><div class="sub">Elige cómo de dura será la vida. ${isNew?'Se borrará la partida actual.':''} Después crearás a tu personaje.</div>`;
  for(const k of DIFF_ORDER){const d=DIFF[k];h+=`<button class="btn ${k==='realista'||k==='soul'?'red':k==='facil'?'':'grey'}" data-nd="${k}" style="text-align:left;${k==='soul'?'background:#2f2a3a':''}"><div>${d.e} ${d.n}</div><div style="font-size:11.5px;font-weight:700;opacity:.85">${d.desc}</div></button>`;}
  if(isNew)h+=`<button class="btn grey" id="ndcancel">Cancelar</button>`;
  card.innerHTML=h;menu.classList.add('open');card.scrollTop=0;
  card.querySelectorAll('[data-nd]').forEach(b=>b.onclick=()=>openCreator(b.dataset.nd,false));
  const c=card.querySelector('#ndcancel');if(c)c.onclick=()=>openMenu();
}
