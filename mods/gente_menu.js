// =================== OPCIONES CON CADA PERSONA: un menú claro en vez de iconos sueltos ===================
const {gente_menu:TX_gente_menu}=DATA.textos_mods_ag;
const PE_LBL=DATA.interacciones.menu_persona;
{const _ob=outBack;outBack=function(k){if(k!=='parque'&&k!=='visita')return _ob.apply(this,arguments);try{const p=(S.people||[]).find(q=>q.k===S.outWith);const n=CH().name;S.outWith=null;S.dateOut=false;if(!p)return;
  p.rel=Math.min(100,(p.rel||0)+(k==='visita'?6:5));p.last=S.day;if(p.love!=null&&['cita','rollo','pareja','convive','casada'].includes(p.stage))p.love=Math.min(100,p.love+4);
  tell(k==='parque'?pickR([huecos(TX_gente_menu.parque[0],{p:p.n}),huecos(TX_gente_menu.parque[1],{n,p:p.n})]):pickR([huecos(TX_gente_menu.visita[0],{n,p:p.n}),huecos(TX_gente_menu.visita[1],{p:p.n,x:pickR(TX_gente_menu.casas)})]),k==='parque'?'🌳':'🏡');}catch(e){}};}
function peSend(p){const D=S.pmsg=S.pmsg||{};if(D[p.k]===S.day){toast(TX_gente_menu.ya_escrito);return;}D[p.k]=S.day;p.rel=Math.min(100,(p.rel||0)+1.5);S.needs.social=Math.min(100,S.needs.social+5);
  tell(huecos(pickR(TX_gente_menu.mensaje),{p:p.n}),'💬');}
function peGo(p,k){menu.classList.remove('open');S.outWith=p.k;S.dateOut=false;const why=outAvail(k);if(why){toast(huecos(TX_gente_menu.ahora_no,{why}));S.outWith=null;return;}doOut(k);}
let peEl=null;
function openPe(k){const p=(S.people||[]).find(q=>q.k===k);if(!p)return;if(!peEl){peEl=document.createElement('div');peEl.id='pesheet';document.body.appendChild(peEl);}
  const acts=[...card.querySelectorAll(`.pbtn [data-act][data-p="${k}"]`)].map(b=>b.dataset.act).filter((a,i,arr)=>arr.indexOf(a)===i);
  const rom=['cita','rollo','pareja','convive','casada'].includes(p.stage);
  let h=`<div class="omt">${p.n} <span style="font-weight:700;font-size:11px;color:#8a8294">${p.r||''}</span></div><div class="pegrid">`;
  const B=(id,lab)=>`<button class="btn grey" data-pe="${id}">${lab}</button>`;
  h+=B('msg',TX_gente_menu.ui.mensaje);for(const a of ['gest','call'])if(acts.includes(a))h+=B('a:'+a,PE_LBL[a]);
  h+=`</div><div class="pesub">${TX_gente_menu.ui.quedar}</div><div class="pegrid">`;
  if(acts.includes('date'))h+=B('a:date',PE_LBL.date);h+=B('parque',TX_gente_menu.ui.parque);if(acts.includes('out'))h+=B('a:out',PE_LBL.out);if(p.k!=='madre'||true)h+=B('visita',p.k==='madre'?TX_gente_menu.ui.visita_madre:TX_gente_menu.ui.visita);
  if(acts.includes('home'))h+=B('a:home',PE_LBL.home);if(acts.includes('stay'))h+=B('a:stay',PE_LBL.stay);
  const rest=['flirt','ask','movein','wed','hecho','break'].filter(a=>acts.includes(a));if(rest.length){h+=`</div><div class="pesub">${rom?TX_gente_menu.ui.relacion:TX_gente_menu.ui.algo_mas}</div><div class="pegrid">`;for(const a of rest)h+=B('a:'+a,PE_LBL[a]);}
  if(p.k==='madre'&&typeof IDEOS!=='undefined'){h+=`</div><div class="pesub">${TX_gente_menu.ui.pie}</div><div class="pegrid" style="flex-direction:row;flex-wrap:wrap">`;for(const k of Object.keys(IDEOS))h+=`<button class="mini${p.ideo===k?' sel':''}" data-pi="${k}">${IDEOS[k].e} ${IDEOS[k].n}</button>`;}
  h+=`</div><div style="padding:8px 6px 2px"><button class="btn" data-pe="close">${TX_gente_menu.ui.cerrar}</button></div>`;
  peEl.innerHTML=h;peEl.classList.add('on');
  peEl.querySelectorAll('[data-pi]').forEach(b=>b.onclick=()=>{p.ideo=b.dataset.pi;toast(`${p.n}: ${IDEOS[p.ideo].e} ${IDEOS[p.ideo].n.toLowerCase()}`);openPe(k);if(typeof openMenu==='function')openMenu('gente');});
  peEl.querySelectorAll('[data-pe]').forEach(b=>b.onclick=()=>{const v=b.dataset.pe;peEl.classList.remove('on');if(v==='close')return;if(v==='msg'){peSend(p);openMenu('gente');return;}
    if(v==='parque'||v==='visita'){peGo(p,v);return;}
    if(v.startsWith('a:')){const btn=card.querySelector(`.pbtn [data-act="${v.slice(2)}"][data-p="${k}"]`);if(btn){btn.dataset.sure=1;btn.click();if(btn.dataset.act==='break'){}}}});}
{const _gt=genteTab;genteTab=function(){let h=_gt.apply(this,arguments);try{h=h.replace(/<div class="pbtn">(<button class="mini" data-act="[a-z]+" data-p="([^"]+)")/g,(m,b,k)=>`<div class="pbtn"><button class="mini pmenu" data-pm="${k}">${TX_gente_menu.ui.opciones}</button>${b}`);}catch(e){}return h;};}
document.addEventListener('click',ev=>{const b=ev.target.closest&&ev.target.closest('[data-pm]');if(!b)return;ev.stopPropagation();openPe(b.dataset.pm);},true);
