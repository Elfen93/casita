// =================== JUNTOS DE VERDAD: nadie se teletransporta; la pareja comparte cama; ir a la cama es ir, los dos ===================
const romRes=r=>{if(!r||r.kind==='kid')return false;const p=(S.people||[]).find(q=>q.k===r.pid);return !!p&&(r.kind==='partner'||(r.kind==='guest'&&r.stay&&['rollo','cita','pareja','convive','casada'].includes(p.stage)));};
// la pareja duerme en la cama de Ana (no en otra)
{const _mb=myBed;myBed=function(r){if(romRes(r)){uidSweep();let i=S.anaBedUid!=null?objByUid(S.anaBedUid):-1;if(i<0){const u=S.sim.use;if(u&&BEDS.includes(u.type))i=u.i;else if(S.lastBed!=null&&S.obj[S.lastBed]&&BEDS.includes(S.obj[S.lastBed].t))i=S.lastBed;}if(i>=0&&S.obj[i]&&['cama','camamat'].includes(S.obj[i].t)){r.bedUid=S.obj[i].uid;return i;}}return _mb.apply(this,arguments);};}
// solo aparece en la cama quien está en la cama
const resInBed=(p,i)=>{const r=(S.res||[]).find(x=>x.pid===p.k);if(!r||r.away)return false;if(r.doing&&r.doing.i===i&&(r.doing.act==='sleep'||r.doing.act==='love'))return true;return Math.hypot(r.x-(i%N+.5),r.y-((i/N|0)+.5))<1.1&&!(r.path&&r.path.length);};
{const _bm=bedMate;bedMate=function(){const p=_bm.apply(this,arguments);const s=S.sim;if(!p||!s.use)return p;if(s.use.intimo)return p;return resInBed(p,s.use.i)?p:null;};}
// ---- ir a la cama: los dos andando. Si no está en casa, se la llama y viene ----
intimo=function(p){const r=(S.res||[]).find(x=>x.pid===p.k);const n=CH().name;
  if(!r||r.away){if(S.intimoPending===p.k)return huecos(TXHZ.intimo.ya_viene,{p:p.n});if(typeof inviteHome!=='function')return huecos(TXHZ.intimo.esta_casa,{p:p.n});const h=S.t/60;if(h>=23.5||h<7)return huecos(TXHZ.intimo.estas_horas_va_venir,{p:p.n});S.intimoPending=p.k;inviteHome(p,h>=20);return huecos(TXHZ.intimo.llama_te_vienes_viene,{nom:n,p:p.n});}
  const h=S.t/60;const others=(S.res||[]).filter(x=>x!==r&&x.kind!=='kid'&&!x.away&&!(x.doing&&x.doing.act==='sleep'));
  if(others.length&&!(h>=23||h<7)){const q=(S.people||[]).find(z=>z.k===others[0].pid);toast(huecos(TXHZ.intimo.casa_mejor,{x:q?q.n:TXHZ.intimo.gente}));return null;}
  const beds=findObjs((d,t)=>['cama','camamat','colchon','sofacama'].includes(t));if(!beds.length){toast(TXHZ.intimo.hay_cama);return null;}
  if(S.needs.energia<15){toast(huecos(TXHZ.intimo.esta_demasiado_cansad,{nom:n}));return null;}
  const b=bestObjFor('energia');if(!b||!b.path){toast(TXHZ.intimo.llega_cama);return null;}const i=b.obj;
  // Ana va; la pareja va por su lado
  go(b,'intimo',true);S.sim.think=0;
  const cx=Math.floor(r.x),cy=Math.floor(r.y);const ox=i%N,oy=i/N|0;const tgt=new Set();for(const [a,c] of [[ox+1,oy],[ox-1,oy],[ox,oy+1],[ox,oy-1]])if(walkable(a,c))tgt.add(a+','+c);
  let path=tgt.has(cx+','+cy)?[]:bfs([cx,cy],(x,y)=>tgt.has(x+','+y));if(!path)path=[];
  r.doing=null;r.path=path;r.plan={i,act:'love',pose:'lie',dur:45,t:S.obj[i].t,fixed:true};r.next=99;S.intimo={p:p.k,i};
  bubbleFor(p,pickR(['😏','🔥','💕']));return null;};
// cuando llega a la cama, se tumba en ella (en la cama, no al lado)
{const _ur=updateResidents;updateResidents=function(gm){const r0=_ur.apply(this,arguments);try{for(const r of S.res||[]){if(r.doing&&r.doing.act==='love'&&r.doing.i!=null){r.x=r.doing.i%N+.5;r.y=(r.doing.i/N|0)+.5;}}
  // la pareja llamada ya ha llegado: a la cama
  if(S.intimoPending){const p=(S.people||[]).find(q=>q.k===S.intimoPending);const r=p&&(S.res||[]).find(x=>x.pid===p.k);if(!p||!r){S.intimoPending=null;}else if(!r.away&&typeof inArea==='function'&&inArea(Math.floor(r.x),Math.floor(r.y))&&!(S.sim.work>0)){S.intimoPending=null;const t=intimo(p);if(t)tell(t,'🔥');}}
  }catch(e){}return r0;};}
// Ana espera en la cama a que llegue; el rato empieza cuando están los dos
{const _up=update;update=function(gm){const r=_up.apply(this,arguments);try{const s=S.sim;const u=s.use;if(u&&u.intimo&&S.intimo){const rr=(S.res||[]).find(x=>x.pid===u.intimo);const there=rr&&rr.doing&&rr.doing.act==='love';if(there){S.needs.diversion=Math.min(100,S.needs.diversion+.55*gm);S.needs.social=Math.min(100,S.needs.social+.45*gm);}if(!there){u.waited=(u.waited||0)+gm;if(u.waited>40||!rr||rr.away){toast(huecos(TXHZ.intimo.ha_llegado,{x:(S.people||[]).find(q=>q.k===u.intimo)?.n||TXHZ.intimo.nadie}));u.intimo=null;S.intimo=null;s.use=null;s.cmd=false;if(rr){rr.plan=null;rr.next=0;}return r;}u.actUntil=S.day*1440+S.t+45;if(rr&&!(rr.path&&rr.path.length)&&!rr.plan&&!there){// se ha perdido por el camino: que venga
          const i=u.i;const cx=Math.floor(rr.x),cy=Math.floor(rr.y);const ox=i%N,oy=i/N|0;const tgt=new Set();for(const [a,c] of [[ox+1,oy],[ox-1,oy],[ox,oy+1],[ox,oy-1]])if(walkable(a,c))tgt.add(a+','+c);const path=tgt.has(cx+','+cy)?[]:bfs([cx,cy],(x,y)=>tgt.has(x+','+y));if(path){rr.path=path;rr.plan={i,act:'love',pose:'lie',dur:45,t:S.obj[i].t,fixed:true};rr.next=99;}}}}}catch(e){}return r;};}
// ---- que no parezca dormir: la manta se mueve, las cabezas juntas, corazones ----
{const _bsl=bedSleepLayers;bedSleepLayers=function(L,sl,blanket,tt){const s=S.sim;const love=s.use&&s.use.intimo&&sl.length>1;if(!love)return _bsl.apply(this,arguments);
  const r=_bsl.apply(this,arguments);try{const w=Math.sin(tt*5.5),w2=Math.sin(tt*5.5+1.3);
    L.push([ldepth(.5,.5)+.002,()=>{lp(.14+w*.015,.3,.86+w*.015,.62,16,21+w2*1.5,'#f3eef6');lp(.3+w2*.02,.36,.7+w2*.02,.56,19,24+w*2,'#ebe3f2');}]);
    if(Math.random()<.04){const i=s.use.i;emit('text',i%N+.5,(i/N|0)+.5,40,{vz:22,life:1.4,txt:pickR(['💕','❤️','🔥']),col:'#e2457a'});}
  }catch(e){}return r;};}
// las cabezas, juntas
{const _sh=sleepHeadAt;sleepHeadAt=function(ch,a,b,z,ua,ub,tt,ph,sc){const s=S.sim;if(s.use&&s.use.intimo){a=a<.5?.42:.58;ua=a;tt=tt*2.5;}return _sh.call(this,ch,a,b,z,ua,ub,tt,ph,sc);};}
// ---- gestos: hay que estar al lado; si se mueve, se la sigue; nada a distancia ----
{const _up2=update;update=function(gm){const s=S.sim;if(s.gest&&!(s.path&&s.path.length)){const g=s.gest;const p=(S.people||[]).find(q=>q.k===g.p);const r=p&&(S.res||[]).find(x=>x.pid===p.k);
    if(!r||r.away){s.gest=null;}
    else{const d=Math.hypot(r.x-s.x,r.y-s.y);if(d<=2.0){s.gest=null;try{if(present(p))runGest(p,g.g);}catch(e){console.error(e);}}
      else if((g.tries||0)<3){g.tries=(g.tries||0)+1;const cx=Math.floor(r.x),cy=Math.floor(r.y);const [sx,sy]=simCell();const path=bfs([sx,sy],(x,y)=>Math.abs(x-cx)+Math.abs(y-cy)<=1&&walkable(x,y));if(path&&path.length){s.path=path;s.cmd=true;}else{s.gest=null;toast(huecos(TXHZ.intimo.hay_forma_llegar_hasta,{p:p.n}));}}
      else{s.gest=null;toast(huecos(TXHZ.intimo.para_quieta,{p:p.n}));}}}
  return _up2.apply(this,arguments);};}
// mientras Ana se acerca, la otra persona se queda donde está
{const _om=openPerMenu;openPerMenu=function(p){_om.apply(this,arguments);try{perMenuEl.querySelectorAll('[data-g]').forEach(b=>{const prev=b.onclick;b.onclick=()=>{const r=(S.res||[]).find(x=>x.pid===p.k);if(r&&!(r.doing&&(r.doing.act==='sleep'||r.doing.act==='love'))&&b.dataset.g!=='cama'){if(!r.doing){r.path=[];r.plan=null;r.next=Math.max(r.next||0,8);}}prev();};});}catch(e){}};}
// ---- pedirle que se quede a dormir, desde el menú de la persona ----
conLogica(GEST,{quedarse:{ok:p=>{const r=(S.res||[]).find(x=>x.pid===p.k);return !!r&&r.kind==='guest'&&!r.stay&&p.k.startsWith('p')&&['cita','rollo','pareja'].includes(p.stage)&&S.t/60>=18;},
  run:p=>{const r=(S.res||[]).find(x=>x.pid===p.k);if(!r)return null;const ok=p.stage!=='cita'||(p.love||0)>=50||Math.random()<.4;if(!ok){bubbleFor(p,'😅');p.rel=Math.max(0,p.rel-1);return huecos(TXHZ.intimo.dice_manana_madruga_otro_dia,{p:p.n});}
    r.stay=true;r.until=(S.day+1)*1440+9*60;try{r.bedUid=null;}catch(e){}bubbleFor(p,'😊');p.love=Math.min(100,(p.love||0)+4);return huecos(TXHZ.intimo.se_queda,{p:p.n,x:huecos(pickR(TXHZ.intimo.se_queda_lista),{})});}}});
conLogica(GEST,{irse:{ok:p=>{const r=(S.res||[]).find(x=>x.pid===p.k);return !!r&&r.kind==='guest'&&r.stay&&S.t/60<23;},run:p=>{const r=(S.res||[]).find(x=>x.pid===p.k);if(r){r.stay=false;r.until=S.day*1440+S.t+30;}return huecos(TXHZ.intimo.va_dormir_casa,{p:p.n});}}});
// la pareja o la invitada que se queda: de noche se va a la cama de Ana andando (aunque Ana ya esté en ella)
{const _rc=rvChoose;rvChoose=function(r){try{const h=S.t/60;if(romRes(r)&&(h>=23.2||h<7)&&!r.doing&&!(S.sim.work>0)){const anaInBed=S.sim.use&&BEDS.includes(S.sim.use.type)&&!S.sim.use.nap;if(h>=23.6||anaInBed||h<7){const i=myBed(r);if(i>=0&&['cama','camamat'].includes(S.obj[i].t)){const cx=Math.floor(r.x),cy=Math.floor(r.y);const ox=i%N,oy=i/N|0;const tgt=new Set();for(const [a,c] of [[ox+1,oy],[ox-1,oy],[ox,oy+1],[ox,oy-1]])if(walkable(a,c))tgt.add(a+','+c);const path=tgt.has(cx+','+cy)?[]:bfs([cx,cy],(x,y)=>tgt.has(x+','+y));if(path){const wake=7*60+Math.random()*40;const until=(h>=12?1440:0)+wake-S.t;r.path=path;r.plan={i,act:'sleep',pose:'lie',dur:Math.max(60,until),t:S.obj[i].t,fixed:true};return true;}}}}}catch(e){}return _rc.apply(this,arguments);};}
// al dormir en la cama de Ana, tumbada en la cama
{const _ur2=updateResidents;updateResidents=function(gm){const r0=_ur2.apply(this,arguments);try{for(const r of S.res||[]){if(r.doing&&r.doing.act==='sleep'&&r.doing.i!=null&&romRes(r)){r.x=r.doing.i%N+.5;r.y=(r.doing.i/N|0)+.5;}}}catch(e){}return r0;};}
// la pareja que vuelve del trabajo entra por la puerta, no aparece al lado
{const _rs=residents;residents=function(){const before=new Set((S.res||[]).map(r=>r.pid));const L=_rs.apply(this,arguments);try{for(const r of S.res||[]){if(r.kind==='partner'&&!before.has(r.pid)){const e=S.sim.exit||[N/2|0,N-1];r.x=e[0]+.5;r.y=e[1]+.5;r.path=[];r.next=0;}}}catch(e){}return L;};}
// en el HUD no pone «durmiendo»
{const _ul=useLabel;useLabel=function(u){if(u&&u.intimo){const p=(S.people||[]).find(q=>q.k===u.intimo);const r=p&&(S.res||[]).find(x=>x.pid===p.k);const there=r&&r.doing&&r.doing.act==='love';return {b:there?'🔥':'⏳',v:huecos(there?TXHZ.intimo.en_cama:TXHZ.intimo.esperando,{p:p?p.n:TXHZ.intimo.alguien})};}return _ul.apply(this,arguments);};}
