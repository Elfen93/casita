// ---------- interfaz: lo que Ana va descubriendo ----------
function innerBlock(){const c=ex(),L=latentOf();let h=`<h3>${TXN.interfaz_ana.ui_por_dentro}</h3>`;
  h+=`<div class="kv"><span>${TXN.interfaz_ana.ui_clase}</span><span>${CLASSN[classOf()]}</span></div>`;
  if(L.hidden.length)h+=`<div class="sub" style="font-size:11.5px">${huecos(TXN.interfaz_ana.ui_ocultas,{x:L.hidden.length===1?TXN.interfaz_ana.ui_ocultas_1:TXN.interfaz_ana.ui_ocultas_n})}</div>`;
  if(c.contra>10)h+=`<div class="kv"><span>${TXN.interfaz_ana.ui_contradiccion}</span><span><span class="minibars" style="display:inline-block;width:90px;vertical-align:middle"><i style="width:${c.contra}%;background:#e07a5f"></i></span></span></div>`;
  const dr=Object.entries(c.drift).filter(([k,v])=>k!==S.ideo&&v>15).sort((a,b)=>b[1]-a[1]).slice(0,2);
  for(const [k,v] of dr)h+=`<div class="kv"><span>${huecos(TXN.interfaz_ana.ui_se_acerca,{e:IDEOS[k].e,n:IDEOS[k].n.toLowerCase()})}</span><span style="font-size:11px">${huecos(TXN.interfaz_ana.ui_por,{why:topWhy(k)})}</span></div>`;
  const pend=c.cq.length;if(pend)h+=`<div class="sub" style="font-size:11.5px">⏳ ${pend===1?TXN.interfaz_ana.ui_pend_1:huecos(TXN.interfaz_ana.ui_pend_n,{k:pend})}</div>`;
  const mem=c.mem.slice(-4).reverse();if(mem.length)h+=`<div class="sub" style="font-size:11.5px;margin-top:4px">${mem.map(m=>'• '+m.t).join('<br>')}</div>`;
  h+=`<div class="chips" style="margin-top:6px"><span class="sub" style="font-size:11px;align-self:center">${TXN.interfaz_ana.ui_dilemas}</span><button class="mini${c.dmode!=='ana'?' sel':''}" data-dmode="preguntar">${TXN.interfaz_ana.ui_decido_yo}</button><button class="mini${c.dmode==='ana'?' sel':''}" data-dmode="ana">${TXN.interfaz_ana.ui_decide_ana}</button></div>`;
  return h;}
function hidBadges(p){const r=(p.rev||[]).map(k=>HID[k]).filter(Boolean);return r.map(H=>`<span title="${H.n}" class="hb${H.pos?' pos':''}">${H.e} ${H.n}</span>`).join('');}

// =================== TEMPORADAS: la espina de la historia (60 días ≈ una hora de juego) ===================
// los avisos importantes también quedan escritos en la historia
{const _t=toast;toast=function(msg,gold){if(gold&&S&&S.story&&typeof msg==='string'&&!/^(📕|📅|💭|🎂|⭐|✅|🏡|🍻|🧭|📌|🏠 El casero cobró)/.test(msg)){const m=msg.match(/^(\p{Extended_Pictographic}️?)\s*(.*)$/su);const ic=m?m[1]:'📌',tx=(m?m[2]:msg).replace(/\s*·?\s*Míralo en 📋\.?$/,'');const st=storyState();const lt=L(tx);if(!st.log.some(e=>e.d===S.day&&e.txt===lt))tell(tx,ic);}return _t.apply(this,arguments);};}
// quién manda
const BOSSN=DATA.personas.jefes_nombres;
const BOSST=DATA.personas.jefes_trato;
function boss(){const o=office();if(!o.boss){const g=Math.random()<.5?'f':'m';o.boss={n:pickR(BOSSN[g]),g};}return o.boss;}
const bossT=()=>{const b=boss();const t=(BOSST[S.track]||['la jefa','el jefe'])[b.g==='f'?0:1];return S.track==='reparto'?'la app':`${t}, ${b.n},`;};
const bossS=()=>S.track==='reparto'?'la app':boss().n;
const compiN=()=>{const c=P_('compi');return c?c.n:TXN.interfaz_ana.una_companera;};
const weekPay=()=>Math.round(salary()*TR().days.length);
const WP=()=>Math.max(150,weekPay());
const cap=t=>t.charAt(0).toUpperCase()+t.slice(1);
