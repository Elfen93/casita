// ---------- interfaz ----------
function homeBlock(){const t=(S.home&&S.home.type)||'casita',H=HT();let h=`<h3>${H.e} Dónde vive: ${H.n}</h3><div class="sub" style="font-size:12px">${H.d}</div>`;
  if(H.build!=='all')h+=`<div class="sub" style="font-size:11.5px">🔒 Solo puede decorar ${t==='habitacion'||t==='padres'?'su cuarto':'por dentro'}: las paredes no son suyas.</div>`;
  const ms=((S.home&&S.home.mates)||[]).map(k=>(S.people||[]).find(p=>p.k===k)).filter(Boolean);if(ms.length)h+=`<div class="kv"><span>🛋️ Vive con</span><span>${ms.map(p=>p.n+(p.mjob?' ('+p.mjob+')':'')).join(', ')}</span></div>`;
  h+=`<details class="mud"><summary>🔑 Mudarse a otro sitio</summary>`;
  for(const k of HOME_ORDER){if(k===t)continue;const K=HOMES[k],cm=canMove(k),r=Math.round(K.rent*Dm().rent*(Dm().soul?MK().price:1));
    h+=`<div class="hopt"><div><b>${K.e} ${K.n}</b> <small>${k==='padres'?'§ '+r+'/sem para la compra':fmt(r)+'/sem'} · entrada ${fmt(moveCost(k))}</small><div class="sub" style="font-size:11px">${K.d}</div>${cm.ok?(cm.aval?'<div class="sub" style="font-size:11px">🤝 Necesita que su madre la avale</div>'.replace('la avale',ga('la avale','lo avale','le avale')):''):`<div class="sub" style="font-size:11px;color:#c0392b">✗ ${cm.why.join(' · ')}</div>`}</div><button class="mini"${cm.ok?'':' disabled'} data-move="${k}">Mudarse</button></div>`;}
  h+=`</details>`;return h;}
function bindHome(){card.querySelectorAll('[data-move]').forEach(b=>b.onclick=()=>{const k=b.dataset.move;const K=HOMES[k];if(!b.dataset.sure){b.dataset.sure=1;b.textContent='¿Seguro? Se pierde la casa actual';return;}if(moveHome(k,false)){menu.classList.remove('open');toast(`${K.e} ${CH().name} se muda: ${K.n}`,true);}});}


// =================== PANTALLA DE TÍTULO / SALIR ===================
let titleSpeed=null;
function showTitle(quit){try{save();}catch(e){}if(titleSpeed===null)titleSpeed=speed;speed=0;
  let el=document.getElementById('title');if(!el){el=document.createElement('div');el.id='title';document.body.appendChild(el);}
  const c=S&&S.char?S.char:null,has=!!(c&&S.day);const pc=has?`<canvas id="tpor" width="180" height="180"></canvas>`:'';
  el.innerHTML=`<div class="tcard"><div class="tlogo">🏡 Casita</div><div class="tsub">Construye una casa. Vive una vida.</div>${pc}
   ${has?`<div class="tinfo"><b>${c.name}</b> · día ${S.day} · ${HT?HT().n.toLowerCase():''}<br>${S.jobless?'en paro':L(CAREER[S.career].t)} · ${fmt(Math.round(S.money))}</div><button class="btn" id="tcont">▶️ Continuar</button>`:''}
   <button class="btn grey" id="tnew">✨ Nueva partida</button>
   ${quit?`<div class="tsub" style="margin-top:8px">Partida guardada. Puedes cerrar la app tranquilamente.</div>`:''}
   <button class="btn grey" id="texit">🚪 Salir</button></div>`;
  el.style.display='flex';
  if(has){const cv=el.querySelector('#tpor');if(cv)paintPortrait(cv,c,70);}
  const hide=()=>{el.style.display='none';speed=titleSpeed??1;titleSpeed=null;document.querySelectorAll('#speed button').forEach(x=>x.classList.toggle('on',+x.dataset.s===speed));};
  const b=el.querySelector('#tcont');if(b)b.onclick=hide;
  el.querySelector('#tnew').onclick=()=>{hide();chooseDifficulty(true);};
  el.querySelector('#texit').onclick=()=>{try{save();}catch(e){}try{window.close();}catch(e){}setTimeout(()=>{const t=el.querySelector('.tsub:last-of-type');el.querySelector('.tcard').innerHTML=`<div class="tlogo">🏡 Casita</div><div class="tsub" style="margin:14px 0">Partida guardada.<br>Ya puedes cerrar la app o la pestaña.</div><button class="btn" id="tback">Volver al juego</button>`;el.querySelector('#tback').onclick=hide;},250);};}

