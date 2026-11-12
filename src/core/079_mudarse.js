// ---------- mudarse ----------
function moveCost(k){const H=HOMES[k],r=Math.round(H.rent*Dm().rent*(Dm().soul?MK().price:1));return k==='padres'?0:k==='infra'?r*2:k==='habitacion'?r*3:r*(H.cls>=3?6:5);}
function canMove(k){const H=HOMES[k],r=H.rent*Dm().rent,inc=S.jobless?0:salary()*TR().days.length,why=[];if(k===((S.home&&S.home.type)||'casita'))return {ok:false,why:[TXN.mudarse.ya_vive]};
  if(k==='padres'){const m=P_('madre');if(!m)why.push(TXN.mudarse.sin_vuelta);else if(m.rel<35)why.push(TXN.mudarse.madre_no_habla);return {ok:!why.length,why};}
  if(S.money<moveCost(k))why.push(huecos(TXN.mudarse.falta_fianza,{coste:fmt(moveCost(k)),agencia:H.cls>=2?TXN.mudarse.y_agencia:''}));
  let aval=false;if(H.need&&inc<r*H.need){const m=P_('madre');if(S.jobless)why.push(TXN.mudarse.sin_nomina);else if(m&&m.rel>=60&&H.cls<=2)aval=true;else why.push(huecos(TXN.mudarse.casero_pide,{g:fmt(Math.round(r*H.need))}));}
  return {ok:!why.length,why,aval};}
function moveHome(k,auto){const cm=canMove(k);if(!cm.ok){toast(huecos(TXN.mudarse.no_puede,{why:cm.why.join(', ')}));return false;}
  const from=(S.home&&S.home.type)||'casita';let extra='';
  if(S.owned){const v=housePrice(),left=S.mort?Math.round(S.mort.left):0;const net=Math.round(v*.95)-left;S.money+=net;S.owned=false;S.mort=null;extra+=huecos(TXN.mudarse.vende_casa,{x:net>=0?huecos(TXN.mudarse.vende_quedan,{k:fmt(net)}):huecos(TXN.mudarse.vende_debe,{k:fmt(-net)})});}
  let sold=0;for(let i=0;i<N*N;i++){const o=S.obj[i];if(o&&!o.priv&&!OBJ[o.t].big&&OBJ[o.t].cat!=='garden')sold+=Math.round(OBJ[o.t].p*(o.q===4?1.5:1)*.25*((o.c??100)/100));}
  S.money+=sold-moveCost(k);bumpMoney();if(sold>0)extra+=huecos(TXN.mudarse.vende_muebles,{k:fmt(sold)});
  applyHome(k);computeRooms();if(typeof centerOnWorld==='function')centerOnWorld(S.sim.x,S.sim.y);
  const up=HOMES[k].cls>HOMES[from].cls;
  const txt={padres:huecos(TXN.mudarse.llega_padres,{n:CH().name}),
    infra:huecos(TXN.mudarse.llega_infra,{n:CH().name}),
    habitacion:huecos(TXN.mudarse.llega_habitacion,{n:CH().name,mates:S.home.mates.map(q=>{const p=(S.people||[]).find(x=>x.k===q);return p?p.n+' ('+p.mjob+')':'';}).filter(Boolean).join(' y ')}),
    viejo:huecos(TXN.mudarse.llega_viejo,{n:CH().name}),
    casita:huecos(TXN.mudarse.llega_casita,{n:CH().name}),
    bueno:huecos(TXN.mudarse.llega_bueno,{n:CH().name,up:up?TXN.mudarse.llega_bueno_up:''}),
    chalet:huecos(TXN.mudarse.llega_chalet,{n:CH().name,up:up?TXN.mudarse.llega_chalet_up:''})}[k];
  chapter('casa_'+k+'_'+S.day,`${HOMES[k].e} ${HOMES[k].n}`,txt+(cm.aval?huecos(TXN.mudarse.aval,{avalarla:ga('avalarla','avalarlo','avalarle')}):'')+extra);
  if(!up&&HOMES[k].cls<HOMES[from].cls){ex().exp.stress++;pushI(isRight()?'socialdemocrata':LEANL(),15,'vivienda');}
  if(up&&HOMES[k].cls>=3)pushI(isI('conservadora')?'conservadora':'liberal',12,'dinero');
  const pt=liveIn();if(pt&&['habitacion','padres','infra'].includes(k)){pt.wear=Math.min(100,(pt.wear||0)+30);tell(huecos(TXN.mudarse.pareja_no_cabe,{p:pt.n,n:CH().name}),'💔');pt.stage='pareja';}
  save();return true;}
// la pareja no se muda a un cuarto compartido
{const _mi=moveIn;moveIn=function(p){const t=(S.home&&S.home.type)||'casita';if(['habitacion','padres','infra'].includes(t)){toast(huecos(TXN.mudarse.no_hay_sitio,{casa:HOMES[t].n.toLowerCase(),p:p.n}));return;}return _mi.apply(this,arguments);};}
// el ambiente de la casa
{const _eb=envBonus;envBonus=function(){let v=_eb();const t=(S.home&&S.home.type)||'casita';if(t==='infra')v-=10;if(t==='habitacion')v-=3;if(t==='bueno')v+=4;if(t==='chalet')v+=6;return v;};}
{const _cw=conexWeekly;conexWeekly=function(){_cw.apply(this,arguments);try{homeWeekly();}catch(e){console.error('home',e);}};}
