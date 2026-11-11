// =================== QUE SE VEA: llamar llama, ligar liga, y siempre sabes cómo ha ido ===================
let sfxEl=null,sfxT=0;
function sfxCard(icon,title,line,ok,p,b){if(!sfxEl){sfxEl=document.createElement('div');sfxEl.id='sfxcard';document.body.appendChild(sfxEl);sfxEl.onclick=()=>sfxEl.classList.remove('on');}
  let bars='';if(p&&b){const r1=Math.round(p.rel||0),r0=Math.round(b.rel||0);const d=r1-r0;bars+=`<div class="sfxbar"><span>🤝 Relación</span><div class="bar"><i style="width:${r1}%;background:#7a6fd0"></i></div><b class="${d>0?'up':d<0?'dn':''}">${r1}${d?` (${d>0?'+':''}${d})`:''}</b></div>`;
    if(b.love!=null&&p.love!=null&&(['cita','rollo','pareja','convive','casada'].includes(p.stage)||Math.round(p.love)!==Math.round(b.love))){const l1=Math.round(p.love),dl=l1-Math.round(b.love);bars+=`<div class="sfxbar"><span>💗 Amor</span><div class="bar"><i style="width:${l1}%;background:#e88aa8"></i></div><b class="${dl>0?'up':dl<0?'dn':''}">${l1}${dl?` (${dl>0?'+':''}${dl})`:''}</b></div>`;}
    if(b.stage!==p.stage&&typeof STAGE!=='undefined')bars+=`<div class="sfxst">${STAGE[b.stage]||b.stage} → <b>${STAGE[p.stage]||p.stage}</b></div>`;}
  sfxEl.className='on '+(ok===true?'ok':ok===false?'ko':'');sfxEl.innerHTML=`<div class="sfxh"><span class="sfxi">${icon}</span><div><b>${title}</b><div class="sfxl">${line}</div></div></div>${bars}`;
  clearTimeout(sfxT);sfxT=setTimeout(()=>sfxEl.classList.remove('on'),5200);sfx(ok===false?'bad':'tap');}
const sxSnap=p=>({rel:p.rel,love:p.love,stage:p.stage});
// ---------- la llamada: pantalla de llamada, contesta o no, y resultado ----------
let callEl=null;
function callScreen(p,txt){if(!callEl){callEl=document.createElement('div');callEl.id='callov';document.body.appendChild(callEl);}
  callEl.innerHTML=`<div class="cav">${(p.n||'?')[0]}</div><b>${p.n}</b><div class="cst">${txt}</div><div class="cbtn">📞</div>`;callEl.classList.add('on');}
{const _cp=callP;callP=function(p){if(!p||S.sim.work>0)return _cp.apply(this,arguments);const n=CH().name;const h=S.t/60;
  if(S.callBusy)return;S.callBusy=true;menu.classList.remove('open');popBubble('📱');callScreen(p,'Llamando…');
  let pick=.85;if(h<9||h>=23.5)pick=.35;if((p.rel||0)<20)pick-=.3;if(p.stage==='ex')pick=.2;if(S.sim.outingActive)pick=.9;
  const ok=Math.random()<pick;
  setTimeout(()=>{if(!ok){callEl.classList.remove('on');S.callBusy=false;tell(`${n} ha llamado a ${p.n}. No lo ha cogido.${h>=23||h<8?' Normal, a estas horas.':''}`,'📵');sfxCard('📵',`${p.n} no lo coge`,h>=23||h<8?'Son horas raras para llamar. Prueba mañana o mándale un mensaje.':(p.rel||0)<20?'Todavía no hay tanta confianza. Un mensaje es menos invasivo.':'Estará liada. Seguro que devuelve la llamada.'.replace('liada',p.g==='m'?'liado':'liada'),false);return;}
    let s=0;callScreen(p,'En llamada · 0:00');const iv=setInterval(()=>{s+=7;if(callEl)callEl.querySelector('.cst').textContent=`En llamada · ${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;},300);
    setTimeout(()=>{clearInterval(iv);callEl.classList.remove('on');S.callBusy=false;const b=sxSnap(p);_cp.call(this,p);
      const top=pickR([`Han estado ${8+(Math.random()*30|0)} minutos hablando de ${pickR(['nada y de todo','el curro','la familia','lo caro que está todo','una serie','planes para el finde'])}.`,`${p.n} se ha alegrado de la llamada.`,`Se han reído un rato. Hacía falta.`]);
      sfxCard('📞',`Llamada con ${p.n}`,top,true,p,b);},1900);},1500);};}
// ---------- ligar, pedir salir, invitar, mensaje: siempre con resultado ----------
{const _fl=flirt;flirt=function(p){const b=sxSnap(p);const r=_fl.apply(this,arguments);try{const ok=p.stage!==b.stage||r===true;sfxCard(ok?'💘':'🙈',ok?`¡A ${p.n} le ha gustado!`:`${p.n} no está por la labor`,ok?'Ha habido chispa. Quedáis para una cita.':(p.rel||0)<40?'Hace falta más confianza antes de intentarlo.':'Esta vez no ha salido. A veces simplemente no hay química.',ok,p,b);}catch(e){}return r;};}
{const _ao=askOut;askOut=function(p){const b=sxSnap(p);const r=_ao.apply(this,arguments);try{if(p.stage!==b.stage)sfxCard('❤️',`¡${p.n} ha dicho que sí!`,'Ahora sois pareja.',true,p,b);else if((b.love||0)>=60)sfxCard('💔',`${p.n} no quiere ir más allá`,'Por ahora prefiere seguir como estáis.',false,p,b);else sfxCard('⏳','Aún es pronto',`Necesitáis conoceros más (amor ${Math.round(b.love||0)}/60). Citas, llamadas, tiempo juntos.`,null,p,b);}catch(e){}return r;};}
{const _ih=inviteHome;inviteHome=function(p,stay){const b=sxSnap(p);const r=_ih.apply(this,arguments);try{const here=(S.res||[]).some(x=>x.pid===p.k);sfxCard(stay?'🌙':'🏠',here?(stay?`${p.n} se queda esta noche`:`${p.n} viene a casa`):`${p.n} no puede venir`,here?'Ya está de camino. Tócale cuando llegue para hacer cosas juntos.':'Hoy no le viene bien. Prueba otro día.',here,p,b);}catch(e){}return r;};}
if(typeof peSend==='function'){const _ps=peSend;peSend=function(p){const b=sxSnap(p);const was=(S.pmsg||{})[p.k];_ps.apply(this,arguments);if(was!==S.day)sfxCard('💬',`Mensaje a ${p.n}`,pickR(['Te contesta con tres audios.','Responde enseguida, con un emoji.','Tarda, pero contesta: «¡qué alegría!».']),true,p,b);};}
// ---------- ir a su casa: se va a un portal, y luego te escribe ----------
{const _d=destOf;destOf=function(k){if(k==='visita'){const p=(S.people||[]).find(q=>q.k===S.outWith);return p&&p.k==='madre'?'casaV':pickR(['casaV','casa2']);}return _d.apply(this,arguments);};}
{const _ob=outBack;outBack=function(k){const p=(k==='visita'||k==='parque')?(S.people||[]).find(q=>q.k===S.outWith):null;const b=p?sxSnap(p):null;const r=_ob.apply(this,arguments);
  try{if(p){sfxCard(k==='visita'?'🏡':'🌳',k==='visita'?`Tarde en casa de ${p.n}`:`Paseo con ${p.n}`,'Ha ido bien.',true,p,b);
    setTimeout(()=>tell(`📱 ${p.n}: «${pickR(['Gracias por venir, me ha encantado 😊','A ver si repetimos pronto','Llegaste bien a casa?','Qué bien lo hemos pasado'])}»`,'💬'),2500);}}catch(e){}return r;};}
{const _go=doOut;doOut=function(k){const r=_go.apply(this,arguments);try{if((k==='visita'||k==='parque')&&S.outWith){const p=(S.people||[]).find(q=>q.k===S.outWith);if(p)toast(k==='visita'?`🏡 ${CH().name} va a casa de ${p.n}`:`🌳 ${CH().name} ha quedado con ${p.n} en el parque`,true);}}catch(e){}return r;};}
