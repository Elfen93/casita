// =================== OPCIONES CON CADA PERSONA: un menú claro en vez de iconos sueltos ===================
OUT.parque={n:'Paseo por el parque',e:'🌳',dur:90,h:[8,21],why:'hablar con calma, aire libre'};
OUT.visita={n:'Ir a su casa',e:'🏡',dur:160,h:[10,22],why:'verse en su terreno'};
if(typeof OUT_LIVE!=='undefined'){OUT_LIVE.parque={social:.22,diversion:.15};OUT_LIVE.visita={social:.3,diversion:.14,hambre:.05};}
const PE_LBL={gest:'🤝 Interactuar aquí',call:'☎️ Llamar',out:'🍻 Quedar para tomar algo',home:'🏠 Invitar a casa',stay:'🌙 Que se quede a dormir',date:'🌹 Ir de cita',flirt:'💘 Ligar',ask:'❤️ Pedirle salir',movein:'🏠 Proponer vivir juntos',wed:'💍 Casarse',hecho:'📜 Pareja de hecho',break:'💔 Romper'};
{const _ob=outBack;outBack=function(k){if(k!=='parque'&&k!=='visita')return _ob.apply(this,arguments);try{const p=(S.people||[]).find(q=>q.k===S.outWith);const n=CH().name;S.outWith=null;S.dateOut=false;if(!p)return;
  p.rel=Math.min(100,(p.rel||0)+(k==='visita'?6:5));p.last=S.day;if(p.love!=null&&['cita','rollo','pareja','convive','casada'].includes(p.stage))p.love=Math.min(100,p.love+4);
  tell(k==='parque'?pickR([`Paseo con ${p.n} por el parque. Dos vueltas al estanque y una conversación que no habrían tenido en un bar.`,`${n} y ${p.n} han acabado sentados en un banco viendo a la gente pasear perros. Nadie miró el móvil.`]):pickR([`${n} ha estado en casa de ${p.n}. Café, fotos viejas en la estantería y un sofá que se hunde.`,`En casa de ${p.n} se nota cómo vive: ${pickR(['todo ordenado al milímetro','ropa en todas las sillas','plantas por todas partes','la tele siempre puesta'])}. Ha sido una buena tarde.`]),k==='parque'?'🌳':'🏡');}catch(e){}};}
function peSend(p){const D=S.pmsg=S.pmsg||{};if(D[p.k]===S.day){toast('Ya le has escrito hoy');return;}D[p.k]=S.day;p.rel=Math.min(100,(p.rel||0)+1.5);S.needs.social=Math.min(100,S.needs.social+5);
  tell(pickR([`${CH().name} le manda un mensaje a ${p.n}. Contesta con tres audios.`,`Mensaje a ${p.n}: un meme y un «¿cómo vas?». Responde enseguida.`,`${p.n} tarda en contestar, pero contesta: «¡qué alegría saber de ti!».`]),'💬');}
function peGo(p,k){menu.classList.remove('open');S.outWith=p.k;S.dateOut=false;const why=outAvail(k);if(why){toast(`Ahora no: ${why}`);S.outWith=null;return;}doOut(k);}
let peEl=null;
function openPe(k){const p=(S.people||[]).find(q=>q.k===k);if(!p)return;if(!peEl){peEl=document.createElement('div');peEl.id='pesheet';document.body.appendChild(peEl);}
  const acts=[...card.querySelectorAll(`.pbtn [data-act][data-p="${k}"]`)].map(b=>b.dataset.act).filter((a,i,arr)=>arr.indexOf(a)===i);
  const rom=['cita','rollo','pareja','convive','casada'].includes(p.stage);
  let h=`<div class="omt">${p.n} <span style="font-weight:700;font-size:11px;color:#8a8294">${p.r||''}</span></div><div class="pegrid">`;
  const B=(id,lab)=>`<button class="btn grey" data-pe="${id}">${lab}</button>`;
  h+=B('msg','💬 Mandar un mensaje');for(const a of ['gest','call'])if(acts.includes(a))h+=B('a:'+a,PE_LBL[a]);
  h+=`</div><div class="pesub">Quedar</div><div class="pegrid">`;
  if(acts.includes('date'))h+=B('a:date',PE_LBL.date);h+=B('parque','🌳 Dar un paseo por el parque');if(acts.includes('out'))h+=B('a:out',PE_LBL.out);if(p.k!=='madre'||true)h+=B('visita',p.k==='madre'?'🏡 Ir a verla a su casa':'🏡 Ir a su casa');
  if(acts.includes('home'))h+=B('a:home',PE_LBL.home);if(acts.includes('stay'))h+=B('a:stay',PE_LBL.stay);
  const rest=['flirt','ask','movein','wed','hecho','break'].filter(a=>acts.includes(a));if(rest.length){h+=`</div><div class="pesub">${rom?'La relación':'Algo más'}</div><div class="pegrid">`;for(const a of rest)h+=B('a:'+a,PE_LBL[a]);}
  h+=`</div><div style="padding:8px 6px 2px"><button class="btn" data-pe="close">Cerrar</button></div>`;
  peEl.innerHTML=h;peEl.classList.add('on');
  peEl.querySelectorAll('[data-pe]').forEach(b=>b.onclick=()=>{const v=b.dataset.pe;peEl.classList.remove('on');if(v==='close')return;if(v==='msg'){peSend(p);openMenu('gente');return;}
    if(v==='parque'||v==='visita'){peGo(p,v);return;}
    if(v.startsWith('a:')){const btn=card.querySelector(`.pbtn [data-act="${v.slice(2)}"][data-p="${k}"]`);if(btn){btn.dataset.sure=1;btn.click();if(btn.dataset.act==='break'){}}}});}
{const _gt=genteTab;genteTab=function(){let h=_gt.apply(this,arguments);try{h=h.replace(/<div class="pbtn">(<button class="mini" data-act="[a-z]+" data-p="([^"]+)")/g,(m,b,k)=>`<div class="pbtn"><button class="mini pmenu" data-pm="${k}">💬 Opciones</button>${b}`);}catch(e){}return h;};}
document.addEventListener('click',ev=>{const b=ev.target.closest&&ev.target.closest('[data-pm]');if(!b)return;ev.stopPropagation();openPe(b.dataset.pm);},true);
