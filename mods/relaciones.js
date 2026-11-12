// =================== RELACIONES: cortejo lento y gestos con quien está delante ===================
const ROM_ST=['cita','rollo','pareja','convive','casada'];
const isRom=p=>ROM_ST.includes(p.stage);
function present(p){return (S.res||[]).some(r=>r.pid===p.k&&!r.away)&&!(S.sim.work>0);}
function moodOk(){const n=S.needs;return n.hambre>25&&n.energia>20&&n.higiene>30;}
// ---- ligar: hace falta algo de confianza, chispa que se acumula y varias veces en días distintos ----
flirt=function(p){
  if(!canLove(p)){toast(huecos(TXHZ.relaciones.esta_interesad_esa_manera,{p:p.n,pO:pO(p)}));return false;}
  const pt=partner();if(pt&&pt!==p&&!S.openRel&&present(pt)){toast(huecos(TXHZ.relaciones.delante,{pt:pt.n}));return false;}
  if(p.noLove&&S.day<p.noLove){toast(huecos(TXHZ.relaciones.ya_dejo_claro_mejor_insistir,{p:p.n}));return false;}
  if((p.rel||0)<30){toast(huecos(TXHZ.relaciones.apenas_conocen_antes_hablar_quedar,{p:p.n}));return false;}
  if(p.flirtDay===S.day){toast(TXHZ.relaciones.ya_ha_intentado_hoy_insistir);return false;}
  if(!moodOk()){toast(huecos(TXHZ.relaciones.no_para_ligar,{motivo:S.needs.higiene<=30?TXHZ.relaciones.huele_tigre:S.needs.hambre<=25?TXHZ.relaciones.tiene_hambre:huecos(TXHZ.relaciones.agotado,{})}));return false;}
  p.flirtDay=S.day;p.chispa=p.chispa||0;
  const c=compatOf(p);let chance=.42+(p.rel-30)/150+(c-50)/200+lvl('carisma')*.04+(p.chispa>0?.12:0)+(S.glow&&S.glow>S.day*1440+S.t?.08:0)-(p.refused||0)*.1;
  if(p.relStyle==='soltera')chance-=.08;chance=Math.max(.1,Math.min(.85,chance));
  if(Math.random()<chance){p.chispa++;p.love=Math.min(100,(p.love||0)+8+Math.round(c/12));p.chispaDay=S.day;p.fails=0;S.needs.diversion=Math.min(100,S.needs.diversion+12);S.needs.social=Math.min(100,S.needs.social+10);
    const lines=[huecos(TXHZ.relaciones.ha_reido_mas_chiste_malo,{p:p.n}),TXHZ.relaciones.ha_habido_mirada_poco_mas,huecos(TXHZ.relaciones.ha_tocado_brazo_al_hablar,{p:p.n}),TXHZ.relaciones.han_quedado_hablando_hasta_cerraron,huecos(TXHZ.relaciones.ha_escrito_primero_eso_cuenta,{p:p.n})];
    if(p.chispa>=3&&p.love>=40&&(p.dates||0)>=1){const ptx=partner();setStage(p,(p.relStyle==='libre'&&LIFE().rel==='libre')||(ptx&&ptx!==p)?'rollo':'cita');p.love=Math.min(100,p.love+10);if(ptx&&ptx!==p&&!S.openRel){p.affair=1;chapter('lio1',TXHZ.relaciones.lio,huecos(TXHZ.relaciones.tiene_algo_espaldas_mientras_nadie,{p:p.n,ptx:ptx.n}));toast(huecos(TXHZ.relaciones.lio2,{p:p.n}),true);return true;}
      if(p.stage==='rollo')chapter('rollo1',TXHZ.relaciones.sin_etiquetas,huecos(TXHZ.relaciones.han_decidido_verse_sin_compromisos,{p:p.n}));
      else chapter('cita1',TXHZ.relaciones.primera_cita,huecos(TXHZ.relaciones.despues_semanas_tonteo_ha_atrevido,{p:p.n,roleTxt:roleTxt(p)}));
      toast(huecos(TXHZ.relaciones.ha_dicho_si,{p:p.n}),true);sfx('level');popBubble('💘');return true;}
    tell(huecos(TXHZ.relaciones.txt,{pickR:pickR(lines),x:p.chispa===1?TXHZ.relaciones.algo_hay:p.chispa===2?TXHZ.relaciones.hay_chispa_pero_aun_momento:(p.dates||0)<1?TXHZ.relaciones.tocaria_quedar_solas_antes_dar:TXHZ.relaciones.falta_poco_mas}),'✨');toast(huecos(TXHZ.relaciones.chispa_toast,{p:p.n,x:p.chispa>=2&&(p.dates||0)<1?huecos(TXHZ.relaciones.chispa_toast_a_solas,{p:p.n}):''}));popBubble('✨');return true;}
  p.fails=(p.fails||0)+1;if(p.fails>1)p.rel=Math.max(0,p.rel-4);S.needs.diversion=Math.max(0,S.needs.diversion-12);
  if(p.fails>=4&&c<60){p.noLove=S.day+30;p.refused=(p.refused||0)+1;tell(huecos(TXHZ.relaciones.ha_sido_clar_te_quiero,{p:p.n,pO:pO(p)}),'💔');toast(huecos(TXHZ.relaciones.quiere_nada_mas_al_menos,{p:p.n}));return false;}
  tell(huecos(TXHZ.relaciones.intento,{p:p.n,resultado:huecos(pickR(TXHZ.relaciones.intento_resultado),{})}),'🙈');toast(huecos(TXHZ.relaciones.esta_labor,{p:p.n}));return false;};
// citas cuentan; pedir salir necesita varias
{const _do=doOut;doOut=function(kind){const r=_do.apply(this,arguments);try{if(kind==='amigos'&&S.outWith){const p=(S.people||[]).find(q=>q.k===S.outWith);if(p){p.dates=(p.dates||0)+1;p.lastDate=S.day;}}}catch(e){}return r;};}
askOut=function(p){const pt0=partner();if(pt0&&pt0!==p){toast(huecos(TXHZ.relaciones.primero_tendria_dejar,{pt0:pt0.n}));return;}if(p.love<60){toast(huecos(TXHZ.relaciones.aun_pronto_estan_conociendo,{p:p.n}));return;}
  if((p.dates||0)<3||S.day-(p.stageDay||0)<7){toast(huecos(TXHZ.relaciones.todavia_pronto_para_pedirle_salir,{x:p.dates||0,x2:(p.dates||0)===1?'':'s',x3:S.day-(p.stageDay||0)}));return;}
  if(p.relStyle==='soltera'&&Math.random()<.6){tell(huecos(TXHZ.relaciones.ha_dicho_quiere_pareja_ahora,{p:p.n}),'💔');p.love-=15;p.refused=(p.refused||0)+1;return;}
  setStage(p,'pareja');chapter('pareja1',TXHZ.relaciones.pareja,huecos(TXHZ.relaciones.ya_son_pareja_han_dicho,{p:p.n}));toast(huecos(TXHZ.relaciones.son_pareja,{p:p.n}),true);sfx('level');popBubble('❤️');};
// la chispa se enfría si no se ven
{const _cd=conexDaily;conexDaily=function(){const r=_cd.apply(this,arguments);try{for(const p of S.people||[]){if(p.chispa&&!isRom(p)&&S.day-(p.chispaDay||0)>10){p.chispa=Math.max(0,p.chispa-1);p.chispaDay=S.day;}}}catch(e){}return r;};}
// ---- gestos con quien está delante ----
// nombre e icono de cada gesto: data/interacciones.json (gestos). Aquí, cuándo se puede (ok), lo que cuesta (cost) y lo que pasa (run)
const GEST=conLogica(DATA.interacciones.gestos,{
  charlar:{ok:()=>true,run:p=>{talkTo(p);popBubble('💬');bubbleFor(p,pickR(TXHZ.relaciones.ya_ves_lista));return huecos(TXHZ.relaciones.ponen_al_dia,{p:p.n});}},
  chiste:{ok:()=>true,run:p=>{const q=lvl('carisma')+Math.random()*4;if(q>3){p.rel=Math.min(100,p.rel+5);S.needs.diversion=Math.min(100,S.needs.diversion+10);bubbleFor(p,'😂');return huecos(TXHZ.relaciones.rie_verdad,{p:p.n});}p.rel=Math.max(0,p.rel-1);bubbleFor(p,'😐');return huecos(TXHZ.relaciones.sonrie_compromiso,{p:p.n});}},
  abrazar:{ok:p=>p.rel>=40||isRom(p)||p.k==='madre',run:p=>{p.rel=Math.min(100,p.rel+4);if(p.love!=null)p.love=Math.min(100,p.love+2);S.needs.social=Math.min(100,S.needs.social+10);bubbleFor(p,'🫂');return huecos(TXHZ.relaciones.abrazo_largo,{p:p.n});}},
  ligar:{ok:p=>romPersona(p)&&!isRom(p)&&p.stage!=='ex'&&canLove(p),run:p=>{flirt(p);return null;}},
  besar:{ok:p=>romPersona(p)&&p.stage!=='ex'&&canLove(p)&&(isRom(p)||(p.chispa||0)>=2),run:p=>{
    if(!isRom(p)){const c=.3+(p.love||0)/150+lvl('carisma')*.04;if(Math.random()<c){p.love=Math.min(100,p.love+12);p.chispa=(p.chispa||0)+1;p.chispaDay=S.day;bubbleFor(p,'💋');popBubble('💋');sfx('level');if(p.chispa>=3&&p.love>=40){setStage(p,'cita');chapter('cita1',TXHZ.relaciones.primera_cita,huecos(TXHZ.relaciones.beso_pasillo_ha_cambiado_todo,{p:p.n}));}return huecos(TXHZ.relaciones.han_besado,{p:p.n,x:p.stage==='cita'?TXHZ.relaciones.ya_hay_vuelta_atras:TXHZ.relaciones.nadie_ha_dicho_nada_despues});}
      p.rel=Math.max(0,p.rel-8);p.fails=(p.fails||0)+1;bubbleFor(p,'😳');return huecos(TXHZ.relaciones.ha_lanzado_ha_apartado_incomodisimo,{p:p.n});}
    p.love=Math.min(100,p.love+4);S.needs.social=Math.min(100,S.needs.social+8);S.needs.diversion=Math.min(100,S.needs.diversion+6);bubbleFor(p,'💋');popBubble('💕');return null;}},
  cama:{ok:p=>romPersona(p)&&canLove(p)&&(['rollo','pareja','convive','casada'].includes(p.stage)||(p.stage==='cita'&&(p.love||0)>=55)),run:p=>intimo(p)},
  hotel:{cost:()=>Math.round(9*Math.max(5,90*Dm().pay/8)),ok:p=>romPersona(p)&&canLove(p)&&p.stage!=='ex'&&(isRom(p)||(p.chispa||0)>=2),run:p=>escapada(p,'hotel')},
  sucasa:{ok:p=>romPersona(p)&&canLove(p)&&p.stage!=='ex'&&(isRom(p)||(p.chispa||0)>=2)&&ownPlace(p),run:p=>escapada(p,'sucasa')},
  discutir:{ok:()=>true,run:p=>{p.rel=Math.max(0,p.rel-8);if(p.love!=null)p.love=Math.max(0,p.love-5);p.wear=Math.min(100,(p.wear||0)+6);p.wearWhy='broncas';bubbleFor(p,'😠');popBubble('😠');S.needs.social=Math.max(0,S.needs.social-5);return huecos(TXHZ.relaciones.han_discutido,{p:p.n,x:pickR([TXHZ.relaciones.platos,TXHZ.relaciones.discute_politica,TXHZ.relaciones.discute_dinero,TXHZ.relaciones.quien_contesta_mensajes,TXHZ.relaciones.tonteria_era_tonteria])});}},
  echar:{ok:p=>{const r=(S.res||[]).find(x=>x.pid===p.k);return r&&r.kind==='guest';},run:p=>{const r=(S.res||[]).find(x=>x.pid===p.k);if(r){r.until=S.day*1440+S.t;r.stay=false;}p.rel=Math.max(0,p.rel-3);return huecos(TXHZ.relaciones.marcha,{p:p.n});}},
});
function bubbleFor(p,txt){const r=(S.res||[]).find(x=>x.pid===p.k);if(!r)return;r.bub={t:txt,until:performance.now()+2200};}
{const _dr3=drawResident;drawResident=function(r){const out=_dr3(r);try{if(r.bub&&performance.now()<r.bub.until&&!r.away){const [u,v]=w2v(r.x,r.y);const [bx,by]=P(u,v,0);label(r.bub.t,bx,by-80,'rgba(255,253,248,.95)','#3b3247',10);}}catch(e){}return out;};}
// ir a la cama juntos
function intimo(p){const r=(S.res||[]).find(x=>x.pid===p.k);if(!r||r.away)return huecos(TXHZ.relaciones.esta_casa,{p:p.n});
  const h=S.t/60;const others=(S.res||[]).filter(x=>x!==r&&x.kind!=='kid'&&!x.away&&!(x.doing&&x.doing.act==='sleep'));
  if(others.length&&!(h>=23||h<7)){const q=(S.people||[]).find(z=>z.k===others[0].pid);toast(huecos(TXHZ.relaciones.casa_mejor,{x:q?q.n:TXHZ.relaciones.gente}));return null;}
  const beds=findObjs((d,t)=>['cama','camamat','colchon','sofacama'].includes(t));if(!beds.length){toast(TXHZ.relaciones.hay_cama);return null;}
  if(S.needs.energia<15){toast(huecos(TXHZ.relaciones.esta_demasiado_cansad,{}));return null;}
  const b=bestObjFor('energia');if(!b||!b.path){toast(TXHZ.relaciones.llega_cama);return null;}const i=b.obj;
  go(b,'intimo',true);S.sim.think=0;
  r.path=[];r.plan=null;r.doing={i,act:'love',pose:'lie',t:S.obj[i].t,until:S.day*1440+S.t+45,from:[r.x,r.y]};r.x=i%N+.5;r.y=(i/N|0)+.5;r.next=99;S.intimo={p:p.k,i};
  return null;}
{const _su3=startUse;startUse=function(){const s=S.sim;const r=_su3.apply(this,arguments);try{const u=s.use;if(u&&S.intimo&&u.i===S.intimo.i){u.goal='intimo';u.intimo=S.intimo.p;u.actT=0;u.actDur=45;u.act='intimo';u.actUntil=S.day*1440+S.t+45;popBubble('💕');}}catch(e){}return r;};}
{const _up4=update;update=function(gm){const s=S.sim,u=s.use;const r=_up4.apply(this,arguments);try{
  if(u&&u.intimo){const now=S.day*1440+S.t;if(now>=u.actUntil||s.use!==u){const p=(S.people||[]).find(q=>q.k===u.intimo);if(p){p.love=Math.min(100,(p.love||0)+10);p.rel=Math.min(100,p.rel+6);p.lastIntimo=S.day;S.needs.diversion=Math.min(100,S.needs.diversion+30);S.needs.social=Math.min(100,S.needs.social+25);S.needs.energia=Math.max(0,S.needs.energia-12);S.needs.higiene=Math.max(0,S.needs.higiene-10);
      tell(huecos(TXHZ.relaciones.y,{p:p.n,x:pickR([TXHZ.relaciones.han_pasado_rato_cama_pasa,TXHZ.relaciones.han_ido_cama_han_salido,TXHZ.relaciones.han_desaparecido_hora_nadie_pregunto])}),'💕');tally('intimo',p.n);
      if(typeof tryBaby==='function'&&S.wantBaby&&['pareja','convive','casada'].includes(p.stage)&&Math.random()<.15)try{tryBaby(p);}catch(e){}}
      const rr=(S.res||[]).find(x=>x.pid===u.intimo);if(rr&&rr.doing&&rr.doing.act==='love'){rr.doing=null;rr.next=0;}u.intimo=null;S.intimo=null;if(s.use===u){s.use=null;s.cmd=false;}}
    else if(Math.random()<gm*.05)popBubble(pickR(['💕','❤️','🔥']));}
  if(S.intimo&&!(u&&u.intimo)&&!(s.target===S.intimo.i)){const rr=(S.res||[]).find(x=>x.pid===S.intimo.p);if(rr&&rr.doing&&rr.doing.act==='love'){rr.doing=null;rr.next=0;}S.intimo=null;}}catch(e){console.error(e);}return r;};}
// en la cama juntos: la pareja no se dibuja aparte (la pinta la cama) y hay corazones
{const _bm=bedMate;bedMate=function(){const s=S.sim;if(s.use&&s.use.intimo){return (S.people||[]).find(q=>q.k===s.use.intimo)||null;}return _bm.apply(this,arguments);};}
{const _dr4=drawResident;drawResident=function(r){if(r.doing&&r.doing.act==='love'){const [u,v]=w2v(r.x,r.y);const [bx,by]=P(u,v,0);if(cam.z>.6)emoji(pickR(['💕','❤️']),bx+Math.sin(performance.now()/300)*4,by-34-((performance.now()/50)%16),9);return;}return _dr4(r);};}
{const _bs=bedSleepers;bedSleepers=function(i){const L_=_bs(i);const s=S.sim;if(L_&&s.use&&s.use.intimo&&L_.length<2){const p=(S.people||[]).find(q=>q.k===s.use.intimo);if(p)L_.push({ch:p.ch||personCh(p),k:p.k});}return L_;};}
// ---- menú al tocar a alguien en casa ----
let perMenuEl=null;function closePerMenu(){if(perMenuEl)perMenuEl.classList.remove('on');}
function openPerMenu(p){if(!perMenuEl){perMenuEl=document.createElement('div');perMenuEl.id='permenu';perMenuEl.className='';document.body.appendChild(perMenuEl);addEventListener('pointerdown',e=>{if(perMenuEl.classList.contains('on')&&!perMenuEl.contains(e.target))closePerMenu();},true);}
  const rom=romPersona(p);let h=`<div class="omt">${p.ch&&p.ch.look&&LOOK_SRC[p.ch.look]?`<img src="${LOOK_SRC[p.ch.look]}" class="pmav">`:'🙂'} <span><b>${p.n}</b><small>${rom?STAGE[p.stage]||'':p.r||''} · ${p.rel|0}% ${p.love!=null&&isRom(p)?'· ❤️ '+(p.love|0):''}</small></span></div>`;
  for(const k in GEST){const g=GEST[k];if(!g.ok(p))continue;h+=`<button class="oma" data-g="${k}"><span>${g.e}</span><span class="omn"><b>${g.n}</b></span></button>`;}
  perMenuEl.innerHTML=h;perMenuEl.classList.add('on');const W=perMenuEl.offsetWidth||230,H=perMenuEl.offsetHeight||200;let [x,y]=lastPtr;x=Math.max(8,Math.min(innerWidth-W-8,x-W/2));y=y+14+H>innerHeight-130?Math.max(60,y-H-14):y+14;perMenuEl.style.left=x+'px';perMenuEl.style.top=y+'px';
  perMenuEl.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>{closePerMenu();const g=GEST[b.dataset.g];if(S.sim.work>0){toast(huecos(TXHZ.relaciones.esta_casa2,{}));return;}
    const r=(S.res||[]).find(x=>x.pid===p.k);if(r&&Math.hypot(r.x-S.sim.x,r.y-S.sim.y)>2.2&&b.dataset.g!=='cama'&&b.dataset.g!=='echar'){// acercarse primero
      const cx=Math.floor(r.x),cy=Math.floor(r.y);const [sx,sy]=simCell();const path=bfs([sx,sy],(x,y)=>Math.abs(x-cx)+Math.abs(y-cy)<=1&&walkable(x,y));if(path){S.sim.path=path;S.sim.target=null;S.sim.use=null;S.sim.cmd=true;S.sim.goal=null;S.sim.gest={p:p.k,g:b.dataset.g};return;}}
    runGest(p,b.dataset.g);});}
function runGest(p,k){const g=GEST[k];if(!g)return;try{const txt=g.run(p);if(txt)tell(txt,g.e);if(typeof p.last!=='undefined')p.last=S.day;if(k!=='cama'&&k!=='echar'){const rr=(S.res||[]).find(x=>x.pid===p.k);if(rr&&!rr.doing){rr.next=Math.max(rr.next||0,6);}}}catch(e){console.error(e);}}
{const _up5=update;update=function(gm){const s=S.sim;const r=_up5.apply(this,arguments);try{if(s.gest&&!(s.path&&s.path.length)){const g=s.gest;s.gest=null;const p=(S.people||[]).find(q=>q.k===g.p);if(p&&present(p))runGest(p,g.g);}}catch(e){}return r;};}
function resAtScreen(sx,sy){let best=null,bd=1e9;for(const r of S.res||[]){if(r.away||r.kind==='kid')continue;const [u,v]=w2v(r.x,r.y);const [wx,wy]=P(u,v,r.doing&&r.doing.pose==='sit'?10:0);const px=cam.x+wx*cam.z,py=cam.y+wy*cam.z;const dx=sx-px,dy=sy-py;if(Math.abs(dx)<20*cam.z&&dy<12*cam.z&&dy>-72*cam.z){const d=Math.abs(dx)+Math.abs(dy+30*cam.z);if(d<bd){bd=d;best=r;}}}return best;}
{const _lt2=liveTap;liveTap=function(x,y){try{if(!viewPlace&&!(S.sim.work>0)){const [sx,sy]=simCell();if(!(x===sx&&y===sy)){const r=resAtScreen(lastPtr[0],lastPtr[1]);if(r){const p=(S.people||[]).find(q=>q.k===r.pid);if(p){openPerMenu(p);sfx('tap');return;}}}}}catch(e){console.error(e);}return _lt2.apply(this,arguments);};}
// también desde la pestaña Gente cuando la persona está en casa
{const _rg=genteTab;genteTab=function(...a){let h=_rg.apply(this,a);try{for(const p of S.people||[]){if(present(p)){h=h.replace(`<button class="mini" data-act="call" data-p="${p.k}">☎️</button>`,`<button class="mini" data-act="gest" data-p="${p.k}">${TXHZ.relaciones.interactuar}</button><button class="mini" data-act="call" data-p="${p.k}">☎️</button>`);}}}catch(e){}return h;};}
{const _bg=bindGente;bindGente=function(...a){_bg.apply(this,a);card.querySelectorAll('[data-act="gest"]').forEach(b=>b.onclick=()=>{const p=S.people.find(q=>q.k===b.dataset.p);if(!p)return;menu.classList.remove('open');lastPtr=[innerWidth/2,innerHeight/2];openPerMenu(p);});};}

// ---- infidelidad: riesgo de que se entere ----
function ownPlace(p){if(p.ownPlace==null){let h=0;for(const c of p.k+p.n)h=(h*31+c.charCodeAt(0))>>>0;p.ownPlace=(h%10)<6;}return p.ownPlace;}
function cheatingOn(p){const pt=partner();return pt&&pt!==p&&!S.openRel?pt:null;}
function caught(pt,p,how){pt.love=Math.max(0,(pt.love||0)-45);pt.rel=Math.max(0,pt.rel-25);pt.wear=Math.min(100,(pt.wear||0)+35);pt.wearWhy='infidelidad';p.affair=0;
  chapter('pillado'+S.day,huecos(TXHZ.relaciones.pillado_titulo,{}),huecos(TXHZ.relaciones.ha_enterado,{pt:pt.n,p:p.n,how,x:pickR([TXHZ.relaciones.hubo_gritos_luego_silencio_fue,TXHZ.relaciones.lloro_delante_fue_dando_portazo,TXHZ.relaciones.has_hecho_como_me_he])}));
  toast(huecos(TXHZ.relaciones.ha_enterado2,{pt:pt.n,p:p.n}),true);sfx('bad');S.needs.diversion=Math.max(0,S.needs.diversion-30);
  try{phIncoming(pt,huecos(pickR(TXHZ.relaciones.quien_lista),{p:p.n}),'gen');}catch(e){}
  if(pt.love<25&&Math.random()<.7){setTimeout(()=>{try{breakUp(pt,'infidelidad');}catch(e){}},1200);}}
function riskCheck(p,how,base){const pt=cheatingOn(p);if(!pt)return;let ch=base;if(present(pt))ch=1;else{const others=(S.res||[]).filter(r=>r.pid!==p.k&&!r.away&&r.kind!=='kid'&&!(r.doing&&r.doing.act==='sleep'));if(others.length&&how.startsWith(TXHZ.relaciones.casa))ch+=.35;}
  if(Math.random()<ch)caught(pt,p,how);else if(Math.random()<.3)tell(huecos(TXHZ.relaciones.mira_movil_reojo_sospecha_momento,{pt:pt.n}),'🤫');}
{const _b=GEST.besar.run;GEST.besar.run=p=>{const r=_b(p);riskCheck(p,TXHZ.relaciones.casa_beso_vio_quien_debia,.12);return r;};}
{const _c=GEST.cama.run;GEST.cama.run=p=>{const pt=cheatingOn(p);if(pt&&present(pt)){toast(huecos(TXHZ.relaciones.casa_ni_broma,{pt:pt.n}));return null;}const r=_c(p);if(pt)S.riskAfter={p:p.k,how:TXHZ.relaciones.casa_vecinos_hablan,ch:.2};return r;};}
{const _up6=update;update=function(gm){const r=_up6.apply(this,arguments);try{if(S.riskAfter&&!S.intimo){const q=(S.people||[]).find(x=>x.k===S.riskAfter.p);const R=S.riskAfter;S.riskAfter=null;if(q)riskCheck(q,R.how,R.ch);}}catch(e){}return r;};}
// escapadas discretas: hotel (cuesta) o su casa (gratis, si tiene)
function escapada(p,where){const cost=where==='hotel'?GEST.hotel.cost():0;if(S.money<cost){toast(huecos(TXHZ.relaciones.hay_dinero_para_hotel,{c:fmt(cost)}));return null;}
  const why=outAvail('amigos');if(why&&why!==TXN.politica.solo_libres){toast(huecos(TXHZ.relaciones.no_puede_salir,{why}));return null;}
  const pt=cheatingOn(p);if(pt&&present(pt)&&where!=='hotel'){/* se puede ir igualmente: «he quedado» */}
  S.money-=cost;S.outWith=p.k;S.dateOut=true;S.escapada={p:p.k,where,cost};const r=(S.res||[]).find(x=>x.pid===p.k);if(r){r.until=S.day*1440+S.t;}
  doOut('amigos');return null;}
{const _fb=friendBack;friendBack=function(){const E=S.escapada;S.escapada=null;const r=_fb.apply(this,arguments);if(!E)return r;try{const p=(S.people||[]).find(x=>x.k===E.p);if(!p)return r;
  p.love=Math.min(100,(p.love||0)+12);p.rel=Math.min(100,p.rel+6);p.lastIntimo=S.day;S.needs.diversion=100;S.needs.social=100;S.needs.energia=Math.max(0,S.needs.energia-10);tally('intimo',p.n);
  tell(E.where==='hotel'?huecos(TXHZ.relaciones.han_pasado_unas_horas_hotel,{p:p.n,x:E.cost?huecos(TXHZ.relaciones.bien_gastados,{c:fmt(E.cost)}):''}):huecos(TXHZ.relaciones.ha_estado_casa_volvio_tarde,{p:p.n}),'💕');
  riskCheck(p,E.where==='hotel'?TXHZ.relaciones.alguien_vio_salir_hotel:huecos(TXHZ.relaciones.conocido_vio_entrar_casa,{p:p.n}),E.where==='hotel'?.06:.1);}catch(e){console.error(e);}return r;};}
// la pareja puede enterarse por redes
{const _pf=phFeedDaily;phFeedDaily=function(){const r=_pf.apply(this,arguments);try{const pt=partner();if(!pt)return r;for(const p of S.people||[]){if(p.affair&&p!==pt&&Math.random()<.04){const P=PH();P.feed.unshift({pk:p.k,txt:TXHZ.relaciones.alguien_especial_digo_mas,d:S.day,likes:5,liked:false});if(Math.random()<.5)caught(pt,p,huecos(TXHZ.relaciones.publicacion_fotogram,{p:p.n}));break;}}}catch(e){}return r;};}
// menú: mostrar coste del hotel y aviso de riesgo
{const _om=openPerMenu;openPerMenu=function(p){_om(p);try{const b=perMenuEl.querySelector('[data-g="hotel"] b');if(b)b.textContent=huecos(TXHZ.relaciones.escapada_hotel,{c:fmt(GEST.hotel.cost())});const pt=cheatingOn(p);if(pt&&(GEST.besar.ok(p)||GEST.hotel.ok(p))){const w=document.createElement('div');w.className='sub';w.style.cssText='font-size:11px;padding:2px 8px 6px;color:#a04a3a';w.textContent=huecos(TXHZ.relaciones.sabe_nada_casa_arriesgado_fuera,{pt:pt.n});perMenuEl.appendChild(w);}}catch(e){}};}
// celos: solo tienen sentido en pareja; un amigo, como mucho, se queja de que no le haces caso
{const H=HID.celosa;const _w=H.w,_rev=H.rev,_txt=H.txt,_d=H.d;
  H.w=p=>intimate(p)?_w(p):(p.rel>=60?ex().wk.out*.15:0);
  H.rev=p=>intimate(p)?_rev(p):ex().wk.out>=3&&p.rel>=60;
  H.txt=p=>intimate(p)?_txt(p):huecos(TXHZ.relaciones.ha_soltado_ya_ni_me,{p:p.n});
  H.d=p=>intimate(p)?_d(p):huecos(TXHZ.relaciones.pica_cuando_hace_planes_sin,{pArt:pArt(p)});}
