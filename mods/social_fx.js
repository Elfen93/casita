// =================== QUE SE VEA: llamar llama, ligar liga, y siempre sabes cómo ha ido ===================
let sfxEl=null,sfxT=0;
function sfxCard(icon,title,line,ok,p,b){if(!sfxEl){sfxEl=document.createElement('div');sfxEl.id='sfxcard';document.body.appendChild(sfxEl);sfxEl.onclick=()=>sfxEl.classList.remove('on');}
  let bars='';if(p&&b){const r1=Math.round(p.rel||0),r0=Math.round(b.rel||0);const d=r1-r0;bars+=`<div class="sfxbar"><span>${TXHZ.social_fx.relacion}</span><div class="bar"><i style="width:${r1}%;background:#7a6fd0"></i></div><b class="${d>0?'up':d<0?'dn':''}">${r1}${d?` (${d>0?'+':''}${d})`:''}</b></div>`;
    if(b.love!=null&&p.love!=null&&(['cita','rollo','pareja','convive','casada'].includes(p.stage)||Math.round(p.love)!==Math.round(b.love))){const l1=Math.round(p.love),dl=l1-Math.round(b.love);bars+=`<div class="sfxbar"><span>${TXHZ.social_fx.amor}</span><div class="bar"><i style="width:${l1}%;background:#e88aa8"></i></div><b class="${dl>0?'up':dl<0?'dn':''}">${l1}${dl?` (${dl>0?'+':''}${dl})`:''}</b></div>`;}
    if(b.stage!==p.stage&&typeof STAGE!=='undefined')bars+=`<div class="sfxst">${STAGE[b.stage]||b.stage} → <b>${STAGE[p.stage]||p.stage}</b></div>`;}
  sfxEl.className='on '+(ok===true?'ok':ok===false?'ko':'');sfxEl.innerHTML=`<div class="sfxh"><span class="sfxi">${icon}</span><div><b>${title}</b><div class="sfxl">${line}</div></div></div>${bars}`;
  clearTimeout(sfxT);sfxT=setTimeout(()=>sfxEl.classList.remove('on'),5200);sfx(ok===false?'bad':'tap');}
const sxSnap=p=>({rel:p.rel,love:p.love,stage:p.stage});
// ---------- la llamada: pantalla de llamada, contesta o no, y resultado ----------
let callEl=null;
function callScreen(p,txt){if(!callEl){callEl=document.createElement('div');callEl.id='callov';document.body.appendChild(callEl);}
  callEl.innerHTML=`<div class="cav">${(p.n||'?')[0]}</div><b>${p.n}</b><div class="cst">${txt}</div><div class="cbtn">📞</div>`;callEl.classList.add('on');}
{const _cp=callP;callP=function(p){if(!p||S.sim.work>0)return _cp.apply(this,arguments);const n=CH().name;const h=S.t/60;
  if(S.callBusy)return;S.callBusy=true;menu.classList.remove('open');popBubble('📱');callScreen(p,TXHZ.social_fx.llamando);
  let pick=.85;if(h<9||h>=23.5)pick=.35;if((p.rel||0)<20)pick-=.3;if(p.stage==='ex')pick=.2;if(S.sim.outingActive)pick=.9;
  const ok=Math.random()<pick;
  setTimeout(()=>{if(!ok){callEl.classList.remove('on');S.callBusy=false;tell(`${n} ha llamado a ${p.n}. No lo ha cogido.${h>=23||h<8?' Normal, a estas horas.':''}`,'📵');sfxCard('📵',huecos(TXHZ.social_fx.coge,{p:p.n}),h>=23||h<8?TXHZ.social_fx.son_horas_raras_para_llamar:(p.rel||0)<20?TXHZ.social_fx.todavia_hay_tanta_confianza_mensaje:TXHZ.social_fx.estara_liada_seguro_devuelve_llamada.replace('liada',p.g==='m'?'liado':'liada'),false);return;}
    let s=0;callScreen(p,TXHZ.social_fx.llamada_0_00);const iv=setInterval(()=>{s+=7;if(callEl)callEl.querySelector('.cst').textContent=huecos(TXHZ.social_fx.llamada,{x:Math.floor(s/60),x2:String(s%60).padStart(2,'0')});},300);
    setTimeout(()=>{clearInterval(iv);callEl.classList.remove('on');S.callBusy=false;const b=sxSnap(p);_cp.call(this,p);
      const top=pickR([huecos(TXHZ.social_fx.han_estado_minutos_hablando,{x:8+(Math.random()*30|0),x2:pickR([TXHZ.social_fx.nada_todo,TXHZ.social_fx.curro,TXHZ.social_fx.familia,TXHZ.social_fx.caro_esta_todo,TXHZ.social_fx.serie,TXHZ.social_fx.planes_para_finde])}),huecos(TXHZ.social_fx.ha_alegrado_llamada,{p:p.n}),TXHZ.social_fx.han_reido_rato_hacia_falta]);
      sfxCard('📞',huecos(TXHZ.social_fx.llamada2,{p:p.n}),top,true,p,b);},1900);},1500);};}
// ---------- ligar, pedir salir, invitar, mensaje: siempre con resultado ----------
{const _fl=flirt;flirt=function(p){const b=sxSnap(p);const r=_fl.apply(this,arguments);try{const ok=p.stage!==b.stage||r===true;sfxCard(ok?'💘':'🙈',ok?huecos(TXHZ.social_fx.ha_gustado,{p:p.n}):huecos(TXHZ.social_fx.esta_labor,{p:p.n}),ok?TXHZ.social_fx.ha_habido_chispa_quedais_para:(p.rel||0)<40?TXHZ.social_fx.hace_falta_mas_confianza_antes:TXHZ.social_fx.esta_vez_ha_salido_veces,ok,p,b);}catch(e){}return r;};}
{const _ao=askOut;askOut=function(p){const b=sxSnap(p);const r=_ao.apply(this,arguments);try{if(p.stage!==b.stage)sfxCard('❤️',huecos(TXHZ.social_fx.ha_dicho_si,{p:p.n}),TXHZ.social_fx.ahora_sois_pareja,true,p,b);else if((b.love||0)>=60)sfxCard('💔',huecos(TXHZ.social_fx.quiere_ir_mas_alla,{p:p.n}),TXHZ.social_fx.ahora_prefiere_seguir_como_estais,false,p,b);else sfxCard('⏳',TXHZ.social_fx.aun_pronto,huecos(TXHZ.social_fx.necesitais_conoceros_mas_amor_60,{num:Math.round(b.love||0)}),null,p,b);}catch(e){}return r;};}
{const _ih=inviteHome;inviteHome=function(p,stay){const b=sxSnap(p);const r=_ih.apply(this,arguments);try{const here=(S.res||[]).some(x=>x.pid===p.k);sfxCard(stay?'🌙':'🏠',here?(stay?huecos(TXHZ.social_fx.queda_esta_noche,{p:p.n}):huecos(TXHZ.social_fx.viene_casa,{p:p.n})):huecos(TXHZ.social_fx.puede_venir,{p:p.n}),here?TXHZ.social_fx.ya_esta_camino_tocale_cuando:TXHZ.social_fx.hoy_viene_bien_prueba_otro,here,p,b);}catch(e){}return r;};}
if(typeof peSend==='function'){const _ps=peSend;peSend=function(p){const b=sxSnap(p);const was=(S.pmsg||{})[p.k];_ps.apply(this,arguments);if(was!==S.day)sfxCard('💬',huecos(TXHZ.social_fx.mensaje,{p:p.n}),pickR(TXHZ.social_fx.te_contesta_tres_audios_lista),true,p,b);};}
// ---------- ir a su casa: se va a un portal, y luego te escribe ----------
{const _d=destOf;destOf=function(k){if(k==='visita'){const p=(S.people||[]).find(q=>q.k===S.outWith);return p&&p.k==='madre'?'casaV':pickR(TXHZ.social_fx.casav_lista);}return _d.apply(this,arguments);};}
{const _ob=outBack;outBack=function(k){const p=(k==='visita'||k==='parque')?(S.people||[]).find(q=>q.k===S.outWith):null;const b=p?sxSnap(p):null;const r=_ob.apply(this,arguments);
  try{if(p){sfxCard(k==='visita'?'🏡':'🌳',k==='visita'?huecos(TXHZ.social_fx.tarde_casa,{p:p.n}):huecos(TXHZ.social_fx.paseo,{p:p.n}),TXHZ.social_fx.ha_ido_bien,true,p,b);
    setTimeout(()=>tell(huecos(TXHZ.social_fx.txt,{p:p.n,x:pickR([TXHZ.social_fx.gracias_venir_me_ha_encantado,TXHZ.social_fx.ver_si_repetimos_pronto,TXHZ.social_fx.llegaste_bien_casa,TXHZ.social_fx.bien_hemos_pasado])}),'💬'),2500);}}catch(e){}return r;};}
{const _go=doOut;doOut=function(k){const r=_go.apply(this,arguments);try{if((k==='visita'||k==='parque')&&S.outWith){const p=(S.people||[]).find(q=>q.k===S.outWith);if(p)toast(k==='visita'?huecos(TXHZ.social_fx.va_casa,{p:p.n}):huecos(TXHZ.social_fx.ha_quedado_parque,{p:p.n}),true);}}catch(e){}return r;};}
