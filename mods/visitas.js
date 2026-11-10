// =================== VISITAS: la pareja y los amigos de verdad se pasan por casa (la tuya, no la de tu madre) ===================
const VS=()=>{if(!S.vs)S.vs={last:{},day:-1};S.vs.last=S.vs.last||{};return S.vs;};
const ownHome=()=>S.home&&!['padres','calle'].includes(S.home.type)&&!(S.sofaUntil&&S.day<S.sofaUntil);
const isFlirtish=p=>p.k.startsWith('p')&&!isRom(p)&&(p.chispa||0)>0;
const bestFriend=p=>!p.k.startsWith('p')&&p.k!=='madre'&&p.rel>=65;
function vsCandidates(){const pt=partner();const L=[];for(const p of S.people||[]){if(p.dead)continue;if((S.res||[]).some(r=>r.pid===p.k))continue;
    if(pt&&p.k===pt.k&&!liveIn())L.push([p,.4,'pareja']);
    else if(p.k.startsWith('p')&&!isRom(p)&&['cita','rollo'].includes(p.stage)&&!pt)L.push([p,.25,'rollo']);
    else if(isFlirtish(p)&&!pt)L.push([p,.08,'ligue']);
    else if(bestFriend(p))L.push([p,.15,'amig'+oa()]);}
  return L;}
{const _dl=dailyEvents;dailyEvents=function(){const r=_dl.apply(this,arguments);try{const V=VS();V.plan=null;if(!ownHome())return r;const L=vsCandidates();if(!L.length)return r;
    const wd=dateOf(S.day).wd;const free=dayType(S.day)!=='work';
    // una visita como mucho al día; más los fines de semana
    for(const [p,w,role] of L.sort(()=>Math.random()-.5)){const last=V.last[p.k]||-99;if(S.day-last<(role==='pareja'?2:5))continue;if(Math.random()<w*(free?1.4:.7)*(p.rel>=80?1.3:1)){
        const avisa=role==='ligue'||role==='rollo'||Math.random()<.55;const h=free?12+Math.random()*8:18+Math.random()*3;V.plan={k:p.k,h,avisa,role,asked:false};break;}}}catch(e){console.error(e);}return r;};}
{const _up=update;update=function(gm){const r=_up.apply(this,arguments);try{const V=VS();const pl=V.plan;if(!pl||!ownHome())return r;const h=S.t/60;const p=(S.people||[]).find(q=>q.k===pl.k);if(!p){V.plan=null;return r;}
    if(pl.avisa&&!pl.asked&&h>=pl.h-1.5){pl.asked=true;const txt=pl.role==='pareja'?pickR(['¿Estás en casa luego? Me paso 😘','Salgo ahora, ¿voy para tu casa?','Tengo ganas de verte. ¿Subo en un rato?']):pl.role==='ligue'?pickR(['Oye… ¿qué haces luego? Podría pasarme 👀','Estoy por tu barrio. ¿Te apetece que suba?']):pickR(['¿Estás en casa? Me paso a tomar algo','Tengo una botella y cero planes. ¿Voy?','¿Te pillo bien? Me acerco un rato']);
      phIncoming(p,txt,[['🏠 «Claro, sube»',4,'home',pl.role==='ligue'?'Voy 😏':'¡Voy! 🚪'],['😮‍💨 «Hoy no puedo»',-1,null,pl.role==='pareja'?'Vale… mañana entonces 😘':'Otro día 🙂']]);V.last[p.k]=S.day;V.plan=null;return r;}
    if(!pl.avisa&&h>=pl.h&&h<pl.h+1){V.plan=null;V.last[p.k]=S.day;if(S.sim.work>0){tell(`${p.n} ha pasado por casa y no había nadie. Ha dejado ${pickR(['una nota en el buzón','un mensaje: «¿dónde andas?»','una bolsa colgada de la puerta'])}.`,'🚪');p.rel=Math.max(0,p.rel-1);return r;}
      const others=(S.res||[]).filter(x=>x.kind==='guest');if(others.length>=2)return r;
      inviteHome(p,false);const rr=(S.res||[]).find(x=>x.pid===p.k);if(rr){rr.until=S.day*1440+Math.min(23.5*60,S.t+90+Math.random()*120);}
      tell(pl.role==='pareja'?`${p.n} ha aparecido sin avisar, con ${pickR(['cena para dos','una peli descargada','cara de día largo'])}. Tiene llave, o casi.`:`${p.n} ha llamado al timbre sin avisar: «pasaba por aquí». ${pickR(['Trae cervezas.','Trae un problema que contar.','No trae nada; con eso basta.'])}`,'🚪');toast(`🚪 ${p.n} ha venido a verte`,true);sfx('tap');}}catch(e){console.error(e);}return r;};}
