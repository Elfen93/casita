// ---------- interfaz ----------
function homeBlock(){const t=(S.home&&S.home.type)||'casita',H=HT();let h=`<h3>${huecos(TXN.interfaz_casa.ui_donde_vive,{e:H.e,n:H.n})}</h3><div class="sub" style="font-size:12px">${H.d}</div>`;
  if(H.build!=='all')h+=`<div class="sub" style="font-size:11.5px">${huecos(TXN.interfaz_casa.ui_solo_decorar,{x:t==='habitacion'||t==='padres'?TXN.interfaz_casa.ui_su_cuarto:TXN.interfaz_casa.ui_por_dentro})}</div>`;
  const ms=((S.home&&S.home.mates)||[]).map(k=>(S.people||[]).find(p=>p.k===k)).filter(Boolean);if(ms.length)h+=`<div class="kv"><span>${TXN.interfaz_casa.ui_vive_con}</span><span>${ms.map(p=>p.n+(p.mjob?' ('+p.mjob+')':'')).join(', ')}</span></div>`;
  h+=`<details class="mud"><summary>${TXN.interfaz_casa.ui_mudarse}</summary>`;
  for(const k of HOME_ORDER){if(k===t)continue;const K=HOMES[k],cm=canMove(k),r=Math.round(K.rent*Dm().rent*(Dm().soul?MK().price:1));
    h+=`<div class="hopt"><div><b>${K.e} ${K.n}</b> <small>${huecos(TXN.interfaz_casa.ui_renta_entrada,{r:k==='padres'?huecos(TXN.interfaz_casa.ui_sem_compra,{r:fmt(r)}):huecos(TXN.interfaz_casa.ui_sem,{r:fmt(r)}),e:fmt(moveCost(k))})}</small><div class="sub" style="font-size:11px">${K.d}</div>${cm.ok?(cm.aval?huecos(TXN.interfaz_casa.ui_necesita_aval,{avale:ga('la avale','lo avale','le avale')}):''):`<div class="sub" style="font-size:11px;color:#c0392b">✗ ${cm.why.join(' · ')}</div>`}</div><button class="mini"${cm.ok?'':' disabled'} data-move="${k}">${TXN.interfaz_casa.ui_mudarse_btn}</button></div>`;}
  h+=`</details>`;return h;}
function bindHome(){card.querySelectorAll('[data-move]').forEach(b=>b.onclick=()=>{const k=b.dataset.move;const K=HOMES[k];if(!b.dataset.sure){b.dataset.sure=1;b.textContent=TXN.interfaz_casa.ui_seguro;return;}if(moveHome(k,false)){menu.classList.remove('open');toast(huecos(TXN.interfaz_casa.se_muda,{e:K.e,n:CH().name,k:K.n}),true);}});}


// =================== PANTALLA DE TÍTULO / SALIR ===================
let titleSpeed=null;
function showTitle(quit){try{save();}catch(e){}if(titleSpeed===null)titleSpeed=speed;speed=0;
  let el=document.getElementById('title');if(!el){el=document.createElement('div');el.id='title';document.body.appendChild(el);}
  const c=S&&S.char?S.char:null,has=!!(c&&S.day);const pc=has?`<canvas id="tpor" width="180" height="180"></canvas>`:'';
  el.innerHTML=`<div class="tcard"><div class="tlogo">${TXN.interfaz_casa.ui_logo}</div><div class="tsub">${TXN.interfaz_casa.ui_lema}</div>${pc}
   ${has?`<div class="tinfo"><b>${c.name}</b> · ${huecos(TXN.interfaz_casa.ui_dia,{d:S.day})} · ${HT?HT().n.toLowerCase():''}<br>${S.jobless?TXN.interfaz_casa.ui_en_paro:L(CAREER[S.career].t)} · ${fmt(Math.round(S.money))}</div><button class="btn" id="tcont">${TXN.interfaz_casa.ui_continuar}</button>`:''}
   <button class="btn grey" id="tnew">${TXN.interfaz_casa.ui_nueva}</button>
   ${quit?`<div class="tsub" style="margin-top:8px">${TXN.interfaz_casa.ui_guardada}</div>`:''}
   <button class="btn grey" id="texit">${TXN.interfaz_casa.ui_salir}</button></div>`;
  el.style.display='flex';
  if(has){const cv=el.querySelector('#tpor');if(cv)paintPortrait(cv,c,70);}
  const hide=()=>{el.style.display='none';speed=titleSpeed??1;titleSpeed=null;document.querySelectorAll('#speed button').forEach(x=>x.classList.toggle('on',+x.dataset.s===speed));};
  const b=el.querySelector('#tcont');if(b)b.onclick=hide;
  el.querySelector('#tnew').onclick=()=>{hide();chooseDifficulty(true);};
  el.querySelector('#texit').onclick=()=>{try{save();}catch(e){}try{window.close();}catch(e){}setTimeout(()=>{const t=el.querySelector('.tsub:last-of-type');el.querySelector('.tcard').innerHTML=`<div class="tlogo">${TXN.interfaz_casa.ui_logo}</div><div class="tsub" style="margin:14px 0">${TXN.interfaz_casa.ui_cerrar}</div><button class="btn" id="tback">${TXN.interfaz_casa.ui_volver}</button>`;el.querySelector('#tback').onclick=hide;},250);};}

