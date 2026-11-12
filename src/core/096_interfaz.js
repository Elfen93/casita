// ---------- interfaz ----------
let speed=1;
document.querySelectorAll('#speed button').forEach(b=>b.onclick=()=>{speed=+b.dataset.s;document.querySelectorAll('#speed button').forEach(x=>x.classList.toggle('on',x===b));});
document.querySelectorAll('#tabs button').forEach(b=>b.onclick=()=>setMode(b.dataset.m));
document.getElementById('zin').onclick=()=>smoothZoom(1.35);
document.getElementById('zout').onclick=()=>smoothZoom(1/1.35);
document.getElementById('rotbtn').onclick=rotate;
const wb=document.getElementById('wallsbtn');
wb.onclick=()=>{wallMode=(wallMode+1)%3;wb.textContent=WALLICON[wallMode];toast(TXN.interfaz.paredes[wallMode]);};
wb.textContent=WALLICON[wallMode];
document.getElementById('center').onclick=()=>centerOnWorld(S.sim.work?N/2:S.sim.x,S.sim.work?N/2:S.sim.y);
const needsEl=document.getElementById('needs');needsEl.onclick=()=>openMenu('perfil');locEl(document.getElementById('act'));locEl(document.getElementById('hname'));

// panel
const menu=document.getElementById('menu'),card=document.getElementById('menucard');
locEl(card);
let menuTab='perfil';
const MTABS=TXN.interfaz.pestanas;
function tabBar(){return `<div class="mtabs">${MTABS.map(([k,e,n])=>`<button class="mt${menuTab===k?' on':''}" data-mt="${k}">${e}<span>${n}</span>${k==='historia'&&storyUnseen?`<i>${Math.min(99,storyUnseen)}</i>`:''}</button>`).join('')}</div>`;}
function openMenu(tab){card.onscroll=null;
  if(typeof tab==='string')menuTab=tab;
  unseen=0;checkGoals();computeRooms();
  const c=CAREER[S.career],next=CAREER[S.career+1],ch=CH(),md=mood();
  let h=`<div class="mhead"><canvas id="mpor" width="132" height="132"></canvas><div style="flex:1;min-width:0"><h2>${ch.name}</h2><div class="sub">${ch.age} ${TXN.interfaz.anios} · ${S.jobless?TXN.interfaz.en_paro:TR().e+' '+c.t} · ${TXN.interfaz.animo[md>72?0:md>55?1:md>38?2:md>22?3:4]}</div><div class="sub" style="font-size:11.5px">${SEASONS[seasonOf()].e} ${SEASONS[seasonOf()].n} · ${S.weather?WX[S.weather.k].e+' '+S.weather.t+' °C':''} · ${TXN.interfaz.dia} ${S.day}</div></div><button class="xbtn" id="closex">✕</button></div>`;
  h+=tabBar();
  if(menuTab==='perfil'){
    if(S.lastLine)h+=`<div class="quote">${S.lastLine.ic} ${S.lastLine.txt}</div>`;
    {const I=ID();h+=`<div class="kv"><span>${I.e} ${TXN.interfaz.ideas}</span><span>${I.n}${S.ideo!=='apolitica'?' · '+COMP[comp()]:''}</span></div>`;}
    h+=`<h3>${TXN.interfaz.personalidad}</h3>`;
    if((S.traits||[]).length)h+=(S.traits||[]).map(k=>`<div class="trait"><b>${TRAITS[k].e} ${TRAITS[k].n}</b><span>${TRAITS[k].d}</span></div>`).join('');
    else h+=`<div class="sub" style="font-size:12px">${TXN.interfaz.sin_rasgos}</div>`;
    h+=innerBlock();
    h+=`<button class="btn grey" id="editchar">${TXN.interfaz.cambiar_aspecto}</button>`;
    {const pt=partner(),L=LIFE();h+=`<div class="kv"><span>${TXN.interfaz.vida_afectiva}</span><span>${pt?'❤️ '+pt.n+' · '+STAGE[pt.stage]:RELSTYLE[L.rel]}${(S.kids||[]).length?' · '+S.kids.map(k=>k.n).join(', '):''}</span></div>`;}
    h+=`<h3>${TXN.interfaz.habilidades}</h3>`;
    for(const [k,e,nm] of SKILLS){const si=skillInfo(S.skills[k]);const src=Object.values(OBJ).filter(o=>o.sk===k).map(o=>o.e).join('');
      h+=`<div class="skill"><span class="lbl">${e} ${nm}</span><div class="bar"><i style="width:${si.prog*100}%;background:#9b8cf2"></i></div><span class="lv">${TXN.interfaz.nv} ${si.lv}</span><span style="font-size:11px">${src}</span></div>`;}
  }
  else if(menuTab==='historia'){
    storyUnseen=0;const st=storyState();
    {const t=TM();const d=S.day-t.start+1;const nxt=Math.min(...Object.entries(t.beats).filter(([k])=>!t.done[k]).map(([,v])=>v-d).filter(v=>v>0),99);h+=`<div class="sub" style="font-size:12px;margin-bottom:6px">${huecos(TXN.interfaz.temporada,{n:t.n,d:Math.min(60,d)})}${nxt<99?' · '+(nxt<=1?TXN.interfaz.cuece_hoy:nxt<=3?TXN.interfaz.cuece:TXN.interfaz.tranquilidad):''}</div>`;}
    const caps=Object.values(st.chap).sort((a,b)=>a.n-b.n);
    if(caps.length)h+=`<div class="chaps">${caps.map(x=>`<span>📕 ${x.n}. ${x.title}</span>`).join('')}</div>`;
    const log=st.log.slice(-60).reverse();
    if(!log.length)h+=`<div class="sub">${TXN.interfaz.nada_que_contar}</div>`;
    let lastD=null;
    for(const e of log){if(e.d!==lastD){const D=dateOf(e.d);h+=`<div class="dday">${WDS[D.wd]} ${D.dm} ${MONTHS[D.m].slice(0,3).toLowerCase()} · ${huecos(TXN.interfaz.dia_n,{d:e.d})}</div>`;lastD=e.d;}
      h+=`<div class="entry ${e.k}"><span class="ic">${e.ic}</span><span>${e.txt}</span></div>`;}
  }
  else if(menuTab==='vida'){h+=vidaTab();}
  else if(menuTab==='gente'){h+=genteTab();}
  else if(menuTab==='trabajo'){
    h+=trackBlock();
    h+=`<div class="career"><div class="ttl">💼 ${S.jobless?TXN.interfaz.en_paro_cap:c.t} · ${fmt(salary())}${TXN.interfaz.por_turno}</div><div class="req">${daysLabel()} ${SHIFT.start}:00–${SHIFT.end}:00 · ${huecos(TXN.interfaz.reputacion,{r:S.rep??70,v:S.vac||0})}</div>`;
    if(next){h+=`<div class="req">${TXN.interfaz.siguiente} <b>${next.t}</b> (${fmt(Math.round(next.pay*Dm().pay*(S.payMul||1)))}${TXN.interfaz.por_turno})</div><div class="req">`;
      const rq=reqOf(next);const parts=[];if(rq.shifts)parts.push(`<span class="${tShifts()>=rq.shifts?'ok':'no'}">${tShifts()}/${rq.shifts} ${TXN.interfaz.turnos}${rq.fast?` <s style="opacity:.5">${rq.baseShifts}</s> ⚡`:''}</span>`);
      for(const [k,e,nm] of SKILLS)if(rq[k])parts.push(`<span class="${lvl(k)>=rq[k]?'ok':'no'}">${e} ${nm} ${lvl(k)}/${rq[k]}</span>`);
      h+=parts.join(' · ')+'</div>';}
    else h+=`<div class="req ok">${TXN.interfaz.lo_mas_alto}</div>`;
    h+=`</div>`;
    if(Dm().soul){if(!S.jobless){const o=office();h+=`<div class="kv"><span>${TXN.interfaz.empresa}</span><span>${o.n} · ${o.known>=0.8?toxLabel(o.tox):o.seen!=null?toxLabel(o.seen)+TXN.interfaz.eso_parece:'¿?'}</span></div>`;
        h+=`<button class="btn grey" id="raise">${TXN.interfaz.pedir_aumento}${S.day-(S.lastRaise??-99)<42?huecos(TXN.interfaz.espera_aumento,{d:42-(S.day-(S.lastRaise??-99))}):''}</button>`;}
      if(S.offer){const f=S.offer;h+=`<div class="sub" style="margin-top:8px;padding:8px;border-radius:10px;background:rgba(46,139,87,.1)">📩 <b>${huecos(TXN.interfaz.oferta_de,{n:f.n})}</b>: ${CAREER[f.career].t} · ${fmt(offerPay(f))}${TXN.interfaz.por_turno} ${huecos(TXN.interfaz.oferta_resto,{ahora:S.jobless?TXN.interfaz.nada:fmt(salary()),amb:toxLabel(f.seen),d:f.until-S.day})}</div>
        <div style="display:flex;gap:6px"><button class="btn" id="offyes">${TXN.interfaz.aceptar}</button>${S.jobless?'':`<button class="btn grey" id="offneg">${TXN.interfaz.negociar}</button>`}<button class="btn grey" id="offno">✕</button></div>`;}}
    if(S.jobless)h+=`<div class="sub" style="color:var(--bad);margin-top:6px">${S.paroWeeks?huecos(TXN.interfaz.paro_semanas,{w:S.paroWeeks}):TXN.interfaz.paro_sin_semanas}</div>`;
    h+=aspBlock();
  }
  else if(menuTab==='casa'){
    h+=homeBlock();
    h+=`<h3>${TXN.interfaz.planes}</h3>`;
    if(S.job){const dn=S.job.steps.filter(x=>x.done).length;h+=`<div class="sub">${S.job.who==='builder'?'👷 '+(S.npc?huecos(TXN.interfaz.npc_coop,{n:S.npc.name}):TXN.interfaz.la_coop):TXN.interfaz.ana_obra} ${TXN.interfaz.esta_con} <b>${S.job.emoji} ${S.job.name}</b> · ${dn}/${S.job.steps.length}${S.job.paused?TXN.interfaz.sin_dinero:''}</div>`;}
    else if(S.want&&S.autoHome){const pr=jobPrice(S.want);h+=`<div class="sub">${TXN.interfaz.quiere} <b>${S.want.emoji} ${S.want.name}</b> ${S.want.why}<br>${huecos(TXN.interfaz.materiales,{m:fmt(pr.mat),l:fmt(pr.labor)})}</div>`;}
    else h+=`<div class="sub">${S.autoHome?TXN.interfaz.nada_nuevo:TXN.interfaz.no_decide}</div>`;
    h+=`<div style="display:flex;gap:6px"><button class="btn grey" id="autob">${S.autoHome?TXN.interfaz.decide_si:TXN.interfaz.decide_no}</button>${S.job?`<button class="btn grey" id="canceljob">${TXN.interfaz.cancelar_obra}</button>`:''}</div>`;
    {const o=mortgageOffer();h+=`<h3>${TXN.interfaz.vivienda}</h3>`;
      if(S.owned){h+=`<div class="kv"><span>${TXN.interfaz.situacion}</span><span>${huecos(TXN.interfaz.propietaria,{x:S.mort?TXN.interfaz.con_hipoteca:TXN.interfaz.sin_deudas})}</span></div>`;
        if(S.mort)h+=`<div class="kv"><span>${TXN.interfaz.hipoteca_pendiente}</span><span>${fmt(S.mort.left)}</span></div><div class="kv"><span>${TXN.interfaz.cuota}</span><span>${huecos(TXN.interfaz.cuota_valor,{p:fmt(S.mort.pay),r:(S.mort.rate*100).toFixed(1)})}</span></div><button class="btn grey" id="amort">${TXN.interfaz.amortizar} ${fmt(Math.min(S.mort.left,Math.max(0,Math.round(S.money-reserveMoney()))))}</button>`;}
      else if(!HT().buy){const tk=(S.home&&S.home.type)||'casita';h+=`<div class="kv"><span>${tk==='padres'?TXN.interfaz.pone_compra:tk==='calle'?TXN.interfaz.alquiler:TXN.interfaz.alquiler}</span><span>${fmt(weeklyRent())}${TXN.interfaz.por_semana}</span></div><div class="sub" style="font-size:12px">${tk==='padres'?TXN.interfaz.no_venta_padres:tk==='habitacion'?TXN.interfaz.no_venta_habitacion:tk==='infra'?TXN.interfaz.no_venta_infra:tk==='calle'?TXN.interfaz.no_venta_calle:TXN.interfaz.no_venta}</div>`;}
      else{h+=`<div class="kv"><span>${TXN.interfaz.alquiler}</span><span>${fmt(weeklyRent())}${TXN.interfaz.por_semana}</span></div><div class="kv"><span>${TXN.interfaz.comprar_casa}</span><span>${huecos(TXN.interfaz.y_gastos,{p:fmt(o.price),c:fmt(o.closing)})}</span></div>`;
        h+=`<div class="kv"><span>${TXN.interfaz.hipoteca}</span><span>${huecos(TXN.interfaz.entrada,{e:fmt(o.down),p:fmt(o.pay)})}</span></div>`;
        if(!o.ok)h+=`<div class="sub" style="font-size:12px">${huecos(TXN.interfaz.banco_no,{why:o.why.join(', ')})}</div>`;
        h+=`<div style="display:flex;gap:6px"><button class="btn" id="buymort" style="${o.ok?'':'opacity:.45'}">${TXN.interfaz.btn_hipoteca}</button><button class="btn grey" id="buycash" style="${S.money>=o.price+o.closing?'':'opacity:.45'}">${TXN.interfaz.btn_contado}</button></div>`;}
      const lb=S.lastBill;h+=`<div class="kv"><span>${TXN.interfaz.facturas}</span><span>~${fmt(utilEstimate())}${lb?huecos(TXN.interfaz.anterior,{t:fmt(lb.total)}):''}</span></div>`;
      if(S.pantry)h+=`<div class="kv"><span>${TXN.interfaz.despensa}</span><span>${S.pantry} ${TXN.interfaz.raciones}</span></div>`;
      if(Dm().soul&&S.market)h+=`<div class="kv"><span>${TXN.interfaz.mercado}</span><span>${huecos(TXN.interfaz.mercado_valor,{p:S.market.price.toFixed(2),u:S.market.util.toFixed(2),e:(S.market.euribor*100).toFixed(1)})}</span></div>`;}
    h+=`<h3>${huecos(TXN.interfaz.habitaciones,{n:rooms.length})}</h3>`;
    if(!rooms.length)h+=`<div class="sub">${TXN.interfaz.sin_habitaciones}</div>`;
    for(const r of rooms)h+=`<div class="room"><button class="mini" data-zone="${r.id}" title="${TXN.interfaz.cambiar_uso}" style="margin:0 4px 0 0">${r.zemoji}</button><span>${r.name}</span><span style="opacity:.6">${huecos(TXN.interfaz.sala_medidas,{m:r.cells.length*4,w:r.wins})}</span><span class="st">${'★'.repeat(r.stars)}${'☆'.repeat(5-r.stars)}</span></div>`;
    {const g=gardenScore();const hs=findObjs((d,t)=>t==='huerto');h+=`<h3>${TXN.interfaz.jardin} <span class="st" style="color:#d79a00">${'★'.repeat(g.stars)}${'☆'.repeat(5-g.stars)}</span></h3>`;
      h+=`<div class="kv"><span>${TXN.interfaz.estacion}</span><span>${SEASONS[seasonOf()].e} ${SEASONS[seasonOf()].n}${S.weather?' · '+WX[S.weather.k].e+' '+WX[S.weather.k].n:''}</span></div>`;
      if(hs.length)for(const i of hs){const cr=S.obj[i].crop;h+=`<div class="kv"><span>${TXN.interfaz.bancal}</span><span>${!cr?TXN.interfaz.vacio:cr.dead?TXN.interfaz.echado_a_perder:huecos(TXN.interfaz.bancal_valor,{e:CROPS[cr.k].e,n:CROPS[cr.k].n,g:cr.g>=1?TXN.interfaz.listo:Math.round(cr.g*100)+' %',w:Math.round(cr.w)})}</span></div>`;}
      else h+=`<div class="sub" style="font-size:12px">${TXN.interfaz.sin_huerto}</div>`;
      h+=`<div class="kv"><span>${TXN.interfaz.malas_hierbas}</span><span>${(S.weeds||[]).length}</span></div>`;}
    const items=findObjs(d=>!!d.need).map(i=>[i,S.obj[i]]).filter(([,o])=>condOf(o)<70).sort((a,b)=>condOf(a[1])-condOf(b[1]));
    if(items.length){h+=`<h3>${TXN.interfaz.gastados}</h3>`;
      for(const [i,o] of items.slice(0,6)){const c2=Math.round(condOf(o));const col=c2<=0?'#e05d5d':c2<35?'#f4a261':c2<60?'#f4c95d':'#5cc98a';
        h+=`<div class="skill"><span class="lbl" style="width:auto;min-width:96px">${OBJ[o.t].e} ${OBJ[o.t].n} ${TIERS[o.q??3].e}</span><div class="bar"><i style="width:${Math.max(3,c2)}%;background:${col}"></i></div><span class="lv" style="width:38px">${c2<=0?TXN.interfaz.rota:c2+'%'}</span></div>`;
        if(c2<60)h+=`<div style="text-align:right;margin:-2px 0 6px"><button class="mini" data-fix="${i}">${TXN.interfaz.btn_ana}</button><button class="mini" data-tech="${i}">${TXN.interfaz.btn_tecnico}</button><button class="mini" data-rep="${i}">${TXN.interfaz.btn_cambiar} ${TIERS[buyTier].e}</button></div>`;}}
  }
  else if(menuTab==='ajustes'){
    h+=`<button class="btn grey" id="soundbtn">${S.sound?TXN.interfaz.sonido_si:TXN.interfaz.sonido_no}</button>`;
    h+=`<h3>${TXN.interfaz.dificultad} ${Dm().e} ${Dm().n}</h3><div class="sub" style="font-size:12px">${Dm().desc}</div><div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap">${DIFF_ORDER.map(k=>`<button class="mini" data-diff="${k}" style="margin:0;${k===S.diff?'background:var(--ink);color:#fff':''}">${DIFF[k].e} ${DIFF[k].n}</button>`).join('')}</div><div class="sub" style="font-size:11px">${TXN.interfaz.dificultad_aviso}</div>`;
    {const c=ex();h+=`<h3>${TXN.interfaz.dilemas}</h3><div class="sub" style="font-size:12px">${TXN.interfaz.dilemas_quien}</div><div class="chips"><button class="mini${c.dmode!=='ana'?' sel':''}" data-dmode="preguntar">${TXN.interfaz.decido_yo}</button><button class="mini${c.dmode==='ana'?' sel':''}" data-dmode="ana">${TXN.interfaz.decide_ana}</button></div>`;}
    h+=`<h3>${TXN.interfaz.partida}</h3><div class="sub" style="font-size:12px">${TXN.interfaz.partida_aviso}</div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px"><button class="mini" id="exportsave">${TXN.interfaz.copiar}</button><button class="mini" id="importsave">${TXN.interfaz.pegar}</button></div>`;
    h+=`<button class="btn grey" id="quitgame">${TXN.interfaz.guardar_salir}</button>`;
    h+=`<button class="btn red" id="newgame">${TXN.interfaz.nueva_partida_btn}</button>`;
  }
  h+=`<button class="btn" id="closemenu">${TXN.interfaz.seguir}</button>`;
  card.innerHTML=h;menu.classList.add('open');card.scrollTop=0;
  paintPortrait(card.querySelector('#mpor'),ch,md);
  const q=s=>card.querySelector(s),on=(s,f)=>{const e=q(s);if(e)e.onclick=f;};
  card.querySelectorAll('[data-mt]').forEach(b=>b.onclick=()=>openMenu(b.dataset.mt));
  on('#closex',()=>{menu.classList.remove('open');save();});on('#closemenu',()=>{menu.classList.remove('open');save();});
  on('#exportsave',async()=>{const txt=JSON.stringify(S);try{await navigator.clipboard.writeText(txt);toast(TXN.interfaz.copiada);}catch(e){prompt(TXN.interfaz.copia_este,txt);}});
  on('#importsave',()=>{const txt=prompt(TXN.interfaz.pega_aqui);if(!txt)return;try{const o=JSON.parse(txt);if(!o||!o.floor)throw 0;localStorage.setItem(KEY,JSON.stringify(o));location.reload();}catch(e){toast(TXN.interfaz.no_partida);}});
  on('#editchar',()=>openCreator(null,true));if(menuTab==='casa')bindHome();card.querySelectorAll('[data-dmode]').forEach(b=>b.onclick=()=>{ex().dmode=b.dataset.dmode;openMenu();});bindSociety();if(menuTab==='gente')bindGente();
  card.querySelectorAll('[data-zone]').forEach(b=>b.onclick=()=>{const r=rooms[+b.dataset.zone];if(!r)return;const cur=ZONE_ORDER.indexOf(r.purpose);const nxt=cur<0?ZONE_ORDER[0]:cur+1<ZONE_ORDER.length?ZONE_ORDER[cur+1]:0;for(const c of r.cells)S.zone[c]=nxt||0;dirty();computeRooms();toast(nxt?huecos(TXN.interfaz.ahora_es,{e:ZONES[nxt].e,n:ZONES[nxt].n}):TXN.interfaz.uso_auto);openMenu();});
  on('#buymort',()=>{if(buyHouse('mortgage'))openMenu();});on('#buycash',()=>{if(buyHouse('cash'))openMenu();});
  on('#raise',()=>{askRaise(true);openMenu();});on('#offyes',()=>{acceptOffer();openMenu();});on('#offneg',()=>{counterOffer();openMenu();});on('#offno',()=>{rejectOffer();openMenu();});
  on('#amort',()=>{amortize(Math.max(0,Math.round(S.money-reserveMoney())));openMenu();});
  card.querySelectorAll('[data-diff]').forEach(b=>b.onclick=()=>{S.diff=b.dataset.diff;toast(huecos(TXN.interfaz.dificultad_toast,{e:Dm().e,n:Dm().n}));buildPalette();openMenu();});
  on('#autob',()=>{S.autoHome=!S.autoHome;if(!S.autoHome)S.want=null;openMenu();});
  on('#canceljob',()=>{cancelJob();openMenu();});
  card.querySelectorAll('[data-fix]').forEach(b=>b.onclick=()=>{const i=+b.dataset.fix;const [fk,fl]=stepReq({k:'fix',i});if(lvl(fk)<fl){toast(huecos(TXN.interfaz.ana_no_sabe,{sk:skLabel(fk),fl,nivel:lvl(fk)}));sfx('bad');return;}addFixStep(i,true);toast(TXN.interfaz.ana_intentara);openMenu();});
  card.querySelectorAll('[data-tech]').forEach(b=>b.onclick=()=>{hireFor(+b.dataset.tech,'fix');openMenu();});
  card.querySelectorAll('[data-rep]').forEach(b=>b.onclick=()=>{const i=+b.dataset.rep;const [k,l]=stepReq({k:'replace',i});if(lvl(k)<l){hireFor(i,'replace');openMenu();return;}orderReplace(i,true);toast(TXN.interfaz.ana_cambiara);openMenu();});
  on('#soundbtn',()=>{S.sound=!S.sound;openMenu();sfx('tap');});
  on('#newgame',()=>chooseDifficulty(true));on('#quitgame',()=>{menu.classList.remove('open');showTitle(true);});
}

function chooseDifficulty(isNew){
  let h=`<h2>${isNew?TXN.interfaz.nueva_partida:TXN.interfaz.bienvenid}</h2><div class="sub">${TXN.interfaz.elige_dureza} ${isNew?TXN.interfaz.se_borra:''} ${TXN.interfaz.despues_creas}</div>`;
  for(const k of DIFF_ORDER){const d=DIFF[k];h+=`<button class="btn ${k==='realista'||k==='soul'?'red':k==='facil'?'':'grey'}" data-nd="${k}" style="text-align:left;${k==='soul'?'background:#2f2a3a':''}"><div>${d.e} ${d.n}</div><div style="font-size:11.5px;font-weight:700;opacity:.85">${d.desc}</div></button>`;}
  if(isNew)h+=`<button class="btn grey" id="ndcancel">${TXN.interfaz.cancelar}</button>`;
  card.innerHTML=h;menu.classList.add('open');card.scrollTop=0;
  card.querySelectorAll('[data-nd]').forEach(b=>b.onclick=()=>openCreator(b.dataset.nd,false));
  const c=card.querySelector('#ndcancel');if(c)c.onclick=()=>openMenu();
}
