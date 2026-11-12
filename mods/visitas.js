// =================== VISITAS: la pareja y los amigos de verdad se pasan por casa (la tuya, no la de tu madre) ===================
const VS=()=>{if(!S.vs)S.vs={last:{},day:-1};S.vs.last=S.vs.last||{};return S.vs;};
const ownHome=()=>S.home&&!['padres','calle'].includes(S.home.type)&&!(S.sofaUntil&&S.day<S.sofaUntil);
const isFlirtish=p=>p.k.startsWith('p')&&!isRom(p)&&(p.chispa||0)>0;
const bestFriend=p=>!p.k.startsWith('p')&&p.k!=='madre'&&p.rel>=65;
function vsCandidates(){const pt=partner();const L=[];for(const p of S.people||[]){if(p.dead)continue;if((S.res||[]).some(r=>r.pid===p.k))continue;
    if(pt&&p.k===pt.k&&!liveIn())L.push([p,.4,'pareja']);
    else if(p.k.startsWith('p')&&!isRom(p)&&['cita','rollo'].includes(p.stage)&&!pt)L.push([p,.25,'rollo']);
    else if(isFlirtish(p)&&!pt)L.push([p,.08,'ligue']);
    else if(bestFriend(p))L.push([p,.18,'amig'+oa()]);
    else if(!p.k.startsWith('p')&&p.k!=='madre'&&!p.mjob&&(p.rel||0)>=45)L.push([p,.07,'amig'+oa()]);}
  return L;}
{const _dl=dailyEvents;dailyEvents=function(){const r=_dl.apply(this,arguments);try{const V=VS();V.plan=null;if(!ownHome())return r;const L=vsCandidates();if(!L.length)return r;
    const wd=dateOf(S.day).wd;const free=dayType(S.day)!=='work';
    // una visita como mucho al día; más los fines de semana
    for(const [p,w,role] of L.sort(()=>Math.random()-.5)){const last=V.last[p.k]||-99;if(S.day-last<(role==='pareja'?2:4))continue;if(Math.random()<w*(free?1.4:.7)*(p.rel>=80?1.3:1)){
        const avisa=role==='ligue'||role==='rollo'||Math.random()<.55;const h=free?12+Math.random()*8:18+Math.random()*3;V.plan={k:p.k,h,avisa,role,asked:false};break;}}}catch(e){console.error(e);}return r;};}
{const _up=update;update=function(gm){const r=_up.apply(this,arguments);try{const V=VS();const pl=V.plan;if(!pl||!ownHome())return r;const h=S.t/60;const p=(S.people||[]).find(q=>q.k===pl.k);if(!p){V.plan=null;return r;}
    if(pl.avisa&&!pl.asked&&h>=pl.h-1.5){pl.asked=true;const txt=pl.role==='pareja'?pickR(TXHZ.visitas.estas_casa_luego_me_paso_lista):pl.role==='ligue'?pickR(TXHZ.visitas.oye_haces_luego_podria_pasarme_lista):pickR(TXHZ.visitas.estas_casa_me_paso_tomar_lista);
      phIncoming(p,txt,[[TXHZ.visitas.claro_sube,4,'home',pl.role==='ligue'?TXHZ.visitas.voy:TXHZ.visitas.voy2],[TXHZ.visitas.hoy_puedo,-1,null,pl.role==='pareja'?TXHZ.visitas.vale_manana_entonces:TXHZ.visitas.otro_dia]]);if(!(S.sim.work>0)&&!S.sim.leaving){try{const th=PH().th[p.k];phAnswer(p.k,th.length-1,0);toast(huecos(TXHZ.visitas.viene_casa,{p:p.n}),true);}catch(e){console.error(TXHZ.visitas.vis_auto,e);window.__errs&&window.__errs.push("visauto "+e.message);}}V.last[p.k]=S.day;V.plan=null;return r;}
    if(!pl.avisa&&h>=pl.h&&h<pl.h+1){if(S.sim.work>0&&!pl.retry){const back=h+S.sim.work/60+.4;if(back<23){pl.retry=true;pl.h=back;tell(huecos(TXHZ.visitas.te_escribe_estaba_tu_zona,{p:p.n,x:Math.floor(back),x2:String(Math.round((back%1)*60)).padStart(2,'0')}),'📱');return r;}}V.plan=null;V.last[p.k]=S.day;if(S.sim.work>0){tell(huecos(TXHZ.visitas.ha_pasado_casa_habia_nadie,{p:p.n,x:pickR([TXHZ.visitas.nota_buzon,TXHZ.visitas.mensaje_donde_andas,TXHZ.visitas.bolsa_colgada_puerta])}),'🚪');p.rel=Math.max(0,p.rel-1);return r;}
      const others=(S.res||[]).filter(x=>x.kind==='guest');if(others.length>=2)return r;
      inviteHome(p,false);const rr=(S.res||[]).find(x=>x.pid===p.k);if(rr){rr.until=S.day*1440+Math.min(23.5*60,S.t+90+Math.random()*120);}
      tell(pl.role==='pareja'?huecos(TXHZ.visitas.ha_aparecido_sin_avisar_tiene,{p:p.n,x:pickR([TXHZ.visitas.cena_para_dos,TXHZ.visitas.peli_descargada,TXHZ.visitas.cara_dia_largo])}):huecos(TXHZ.visitas.ha_llamado_al_timbre_sin,{p:p.n,x:pickR([TXHZ.visitas.trae_cervezas,TXHZ.visitas.trae_problema_contar,TXHZ.visitas.trae_nada_eso_basta])}),'🚪');toast(huecos(TXHZ.visitas.ha_venido_verte,{p:p.n}),true);sfx('tap');}}catch(e){console.error(e);}return r;};}
