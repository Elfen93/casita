// ---------- pestaña de gente ----------
function genteTab(){
  const L=LIFE(),pt=partner();let h='';
  const chips=(key,obj)=>`<div class="chips">${Object.entries(obj).map(([k,v])=>`<button class="mini${L[key]===k?' sel':''}" data-life="${key}" data-v="${k}">${v}</button>`).join('')}</div>`;
  h+=`<h3>💭 Lo que quiere en la vida</h3><div class="clab">Le atraen</div>${chips('orient',ORIENT)}<div class="clab">Relaciones</div>${chips('rel',RELSTYLE)}<div class="clab">Hijos</div>${chips('kids',KIDSW)}<div class="clab">Boda</div>${chips('boda',BODAW)}`;
  h+=`<h3>🏡 Familia</h3>`;
  if(pt)h+=`<div class="kv"><span>❤️ ${pt.n}</span><span>${STAGE[pt.stage]} · amor ${Math.round(pt.love)}</span></div>`;else h+=`<div class="sub">${L.rel==='soltera'?'Soltería elegida y bien llevada.':'Sin pareja ahora mismo.'}</div>`;
  if(S.baby)h+=`<div class="kv"><span>${S.baby.mode==='adopcion'?'📋 Adopción':'🍼 Bebé en camino'}</span><span>faltan ${Math.max(0,S.baby.due-S.day)} días</span></div>`;
  for(const k of S.kids||[])h+=`<div class="kv"><span>${k.g==='f'?'👧':'👦'} ${k.n}</span><span>${kidAge(k)<1?'bebé':kidAge(k)+' años'}</span></div>`;
  if(onLeave())h+=`<div class="kv"><span>👶 Permiso</span><span>hasta el día ${S.leaveUntil}</span></div>`;
  if(!S.baby&&L.kids!=='no'){if(pt&&['convive','casada'].includes(pt.stage))h+=`<button class="btn grey" data-act="baby" data-p="${pt.k}">👶 Buscar un bebé con ${pt.n}</button>`;else if(!pt)h+=`<button class="btn grey" data-act="solo">👶 Tener un hijo por su cuenta (clínica o adopción)</button>`;}
  if(L.orient!=='nadie')h+=`<button class="btn grey" id="appbtn">📱 Abrir la app de citas</button>`;
  h+=`<h3>🫂 Gente</h3>`;
  const order=p=>isPartner(p)?0:p.stage==='rollo'?1:p.stage==='cita'?2:['madre','amiga'].includes(p.k)?3:p.stage==='ex'?9:5;
  for(const p of [...(S.people||[])].sort((a,b)=>order(a)-order(b)||b.rel-a.rel)){
    const rom=p.k.startsWith('p');const st=rom?STAGE[p.stage]:p.r;
    h+=`<div class="pers"><canvas data-por="${p.k}" width="80" height="80"></canvas><div class="pi"><b>${p.n}</b> <small>${rom?roleTxt(p)+' · '+(IDEOS[p.ideo]?IDEOS[p.ideo].e:''):''}</small><div class="sub" style="font-size:11px">${st}${rom&&p.met?' · de '+p.met.replace(/^el /,''):''}</div>${p.bio?`<div class="sub" style="font-size:11px;font-style:italic;margin-top:2px">${!rom&&p.job&&p.ch&&p.ch.look?p.job[0].toUpperCase()+p.job.slice(1)+'. ':''}${p.bio}</div>`:''}${(p.rev||[]).length?`<div class="hbs">${hidBadges(p)}</div>`:''}`;
    h+=`<div class="minibars"><i style="width:${p.rel}%;background:#7a6fd0"></i></div>`;if(rom&&p.stage!=='conocida'&&p.stage!=='amiga'&&p.stage!=='ex')h+=`<div class="minibars"><i style="width:${p.love}%;background:#e88aa8"></i></div>`;if((p.wear||0)>12&&p.stage!=='ex')h+=`<div class="minibars" title="Desgaste"><i style="width:${p.wear}%;background:#e9a23b"></i></div><div class="sub" style="font-size:10.5px">Desgaste${p.wearWhy?': '+p.wearWhy:''}</div>`;
    h+=`<div class="pbtn"><button class="mini" data-act="call" data-p="${p.k}">☎️</button><button class="mini" data-act="out" data-p="${p.k}">🍻</button><button class="mini" data-act="home" data-p="${p.k}">🏠</button>`;
    if(rom&&p.stage!=='ex'){if(['conocida','amiga'].includes(p.stage)&&canLove(p))h+=`<button class="mini" data-act="flirt" data-p="${p.k}">💘 Ligar</button>`;
      if(p.stage==='cita'||p.stage==='rollo')h+=`<button class="mini" data-act="date" data-p="${p.k}">🌹 Cita</button><button class="mini" data-act="stay" data-p="${p.k}">🌙 Que se quede</button><button class="mini" data-act="ask" data-p="${p.k}">❤️ Pedir salir</button>`;
      if(p.stage==='pareja')h+=`<button class="mini" data-act="date" data-p="${p.k}">🌹 Cita</button><button class="mini" data-act="stay" data-p="${p.k}">🌙</button><button class="mini" data-act="movein" data-p="${p.k}">🏠 Vivir juntos</button>`;
      if(p.stage==='convive')h+=`<button class="mini" data-act="wed" data-p="${p.k}">💍 Casarse</button><button class="mini" data-act="hecho" data-p="${p.k}">📜 Pareja de hecho</button>`;
      if(['cita','rollo','pareja','convive','casada'].includes(p.stage))h+=`<button class="mini" data-act="break" data-p="${p.k}">💔</button>`;}
    h+=`</div></div></div>`;}
  return h;
}
function bindGente(){
  card.querySelectorAll('[data-por]').forEach(c=>{const p=S.people.find(q=>q.k===c.dataset.por);if(!p)return;const ch=p.ch||personCh(p);if(!p.ch)p.ch=ch;paintPortrait(c,ch,65);});
  card.querySelectorAll('[data-life]').forEach(b=>b.onclick=()=>{LIFE()[b.dataset.life]=b.dataset.v;openMenu('gente');});
  const ab=card.querySelector('#appbtn');if(ab)ab.onclick=()=>{datingApp(false);openMenu('gente');};
  card.querySelectorAll('[data-act]').forEach(b=>b.onclick=()=>{const p=S.people.find(q=>q.k===b.dataset.p);const a=b.dataset.act;
    if(a==='solo'){tryBaby(null);openMenu('gente');return;}if(!p)return;
    if(a==='call')callP(p);else if(a==='out'){menu.classList.remove('open');S.outWith=p.k;S.dateOut=['cita','rollo','pareja','convive','casada'].includes(p.stage);if(outAvail('amigos')&&outAvail('amigos')!=='solo en días libres'){toast('Ahora no puede salir: '+outAvail('amigos'));S.outWith=null;return;}doOut('amigos');return;}
    else if(a==='home')inviteHome(p,false);else if(a==='stay')inviteHome(p,true);else if(a==='flirt')flirt(p);else if(a==='ask')askOut(p);else if(a==='movein')moveIn(p);
    else if(a==='wed')wedding(p,S.money>1600*PM()*1.3?'grande':'sencilla');else if(a==='hecho')wedding(p,'hecho');else if(a==='break')breakUp(p,'');else if(a==='baby')tryBaby(p);
    else if(a==='date'){menu.classList.remove('open');S.outWith=p.k;S.dateOut=true;doOut('amigos');return;}
    openMenu('gente');});
}

// =================== CONEXIONES: rasgos ocultos, desgaste, clase, cambio de ideas y consecuencias ===================
