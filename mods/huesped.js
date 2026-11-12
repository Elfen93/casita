// =================== HUÉSPEDES: quien se queda a dormir, duerme; a quien se acoge, vive en casa ===================
// Antes, la visita que se quedaba a dormir y no era pareja pasaba la noche de pie al lado de la jugadora,
// y la amiga acogida («que se quede lo que haga falta») se iba a las nueve de la mañana siguiente aunque el relato dijera semanas.
const huAmigo=r=>!!r&&r.kind==='guest'&&!!r.stay&&!romRes(r);
const HU_SOFA=['sofacama','sofa'],HU_ULT=['sillon','butaca','silla'];
function huCamaAna(){uidSweep();let i=S.anaBedUid!=null?objByUid(S.anaBedUid):-1;if(i<0&&S.lastBed!=null&&S.obj[S.lastBed]&&BEDS.includes(S.obj[S.lastBed].t))i=S.lastBed;return i;}
// dónde duerme, por orden: una cama libre (ni la de la jugadora ni la de otro), el sofá, compartir la cama grande, un sillón, una silla
function huSitios(r){const L=[];const libre=i=>!rvBusy(i,r)&&!(S.obj[i].priv&&S.obj[i].priv!==r.pid);const de=ts=>{for(const t of ts)for(const i of findObjs((d,k)=>k===t))if(libre(i))L.push(i);};
  const b=myBed(r);if(b>=0&&!rvBusy(b,r))L.push(b);de(HU_SOFA);
  const a=huCamaAna();if(a>=0&&['cama','camamat'].includes(S.obj[a].t)&&!(S.res||[]).some(o=>o!==r&&(o.doing&&o.doing.i===a||o.plan&&o.plan.i===a||romRes(o))))L.push(a);
  de(HU_ULT);return L;}
function huIrADormir(r){const h=S.t/60;const cx=Math.floor(r.x),cy=Math.floor(r.y);
  // si el sofá está ocupado por alguien que aún no duerme (un compañero viendo la tele), espera un rato antes de conformarse con algo peor
  if(h>=23&&h<24&&!(myBed(r)>=0)){const ocupado=i=>(S.res||[]).some(o=>o!==r&&(o.doing&&o.doing.i===i&&o.doing.act!=='sleep'||o.plan&&o.plan.i===i&&o.plan.act!=='sleep'))||(S.sim.use&&S.sim.use.i===i&&!sofaDoze());
    const sofas=findObjs((d,k)=>HU_SOFA.includes(k));if(sofas.length&&sofas.every(i=>rvBusy(i,r))&&sofas.some(ocupado))return false;}
  for(const i of huSitios(r)){const ox=i%N,oy=i/N|0;const tgt=new Set();for(const [a,c] of [[ox+1,oy],[ox-1,oy],[ox,oy+1],[ox,oy-1]])if(walkable(a,c))tgt.add(a+','+c);if(!tgt.size)continue;
    const path=tgt.has(cx+','+cy)?[]:bfs([cx,cy],(x,y)=>tgt.has(x+','+y));if(!path)continue;
    const wake=7*60+20+Math.random()*50;const until=(h>=12?1440:0)+wake-S.t;r.path=path;r.plan={i,act:'sleep',pose:'lie',dur:Math.max(60,until),t:S.obj[i].t,fixed:true};return true;}
  return false;}
{const _rc=rvChoose;rvChoose=function(r){try{if(huAmigo(r)&&!r.doing&&!r.away){const h=S.t/60;const u=S.sim.use;
    const anaAcostada=!!u&&(BEDS.includes(u.type)||u.type==='sofacama')&&!u.nap&&(h>=21.5||h<7);
    if(h>=23.2||h<7||anaAcostada){if(huIrADormir(r))return true;}
    // quien vive aquí unas semanas no es una visita: cocina, recoge y sale a sus cosas, como cualquiera de la casa
    else if(r.lodger){const k=r.kind;r.kind='mate';try{return _rc.apply(this,arguments);}finally{r.kind=k;}}}
  }catch(e){console.error(e);}return _rc.apply(this,arguments);};}
// ---- que se vea: quien duerme en una cama o en un sofá está en ella, no es un «zzz» sobre un mueble vacío ----
// (vale para cualquiera de la casa: la madre, los compañeros de piso, la visita)
function huDurmiendoEn(i){for(const r of S.res||[]){if(r.away||!r.doing||r.doing.act!=='sleep'||r.doing.i!==i)continue;const p=(S.people||[]).find(q=>q.k===r.pid);if(!p)continue;if(!p.ch)p.ch=personCh(p);return p;}return null;}
{const _do=drawObj;drawObj=function(vx,vy,o,i,ghost,wx,wy){const p=!ghost&&i!=null&&S.res&&S.res.length?huDurmiendoEn(i):null;if(!p)return _do.apply(this,arguments);
  const s=S.sim;const c0=S.char,b0=bubbleAt;
  if(s.use&&s.use.i===i&&!s.work){// la jugadora también está: en la cama de matrimonio, la segunda cabeza
    const r=_do.apply(this,arguments);if(o.t==='camamat'&&sleeping(true)){try{S.char=p.ch;headOnPillow(.72,.26,20);}finally{S.char=c0;bubbleAt=b0;}}return r;}
  const u0=s.use,w0=s.work;try{s.use={i,type:o.t,goal:'energia',huFake:true};s.work=0;S.char=p.ch;return _do.apply(this,arguments);}finally{s.use=u0;s.work=w0;S.char=c0;bubbleAt=b0;}};}
{const _sd=sofaDoze;sofaDoze=function(){const u=S.sim.use;if(u&&u.huFake)return u.type==='sofa';return _sd.apply(this,arguments);};}
// compartir la cama individual con la jugadora dentro: dos cabezas, como con la pareja
{const _bs=bedSleepers;bedSleepers=function(i){const L=_bs.apply(this,arguments);try{if(L&&L.length===1&&!(S.sim.use&&S.sim.use.huFake)){const p=huDurmiendoEn(i);if(p)L.push({ch:p.ch,k:p.k});}}catch(e){}return L;};}
// ---- la persona acogida (S.lodger): está en casa mientras dure, no una noche ----
function huEntra(p){S.res=S.res||[];const [sx,sy]=simCell();const e=bfs([sx,sy],(x,y)=>x===0||y===0||x===N-1||y===N-1);const c=e&&e.length?e[e.length-1]:[sx,sy];
  S.res.push({kind:'guest',pid:p.k,x:c[0]+.5,y:c[1]+.5,path:[],phase:0,until:(S.day+2)*1440,stay:true,lodger:true});}
function huTick(){const now=S.day*1440+S.t;
  for(const r of S.res||[])if(r.lodger&&r.pid!==S.lodger){r.lodger=false;r.stay=false;r.until=Math.min(r.until,now);}// ya ha encontrado sitio: se va
  if(!S.lodger)return;const p=(S.people||[]).find(q=>q.k===S.lodger&&!q.dead);const T=S.home&&S.home.type;
  if(!p||!T||T==='calle'||T==='padres'){S.lodger=null;S.lodgerEnd=null;return;}
  if(S.lodgerEnd&&S.day>=S.lodgerEnd){S.lodger=null;S.lodgerEnd=null;tell(huecos(HU_T.semana_fin,{p:p.n,c:fmt(Math.round(weeklyRent()*.7))}),'🧳');return;}
  const r=(S.res||[]).find(x=>x.pid===p.k);
  if(r){r.lodger=true;r.stay=true;r.until=(S.day+2)*1440;}
  else if(!(S.sim.work>0)&&!S.sim.leaving)huEntra(p);}
{const _ur=updateResidents;updateResidents=function(gm){try{huTick();}catch(e){console.error(e);}return _ur.apply(this,arguments);};}
// echarla desde su menú es echarla de verdad: no vuelve a entrar por la puerta al minuto
{const _e=GEST.echar.run;GEST.echar.run=function(p){const era=S.lodger&&p&&p.k===S.lodger;const r=_e.apply(this,arguments);if(era){S.lodger=null;S.lodgerEnd=null;p.rel=Math.max(0,p.rel-12);return huecos(HU_T.echar,{p:p.n});}return r;};}
// los textos dicen dónde duerme de verdad: [dónde duerme, qué deja al irse]
const HU_T={cama:['en la cama que sobraba','la cama hecha'],sofa:['en el sofá','el sofá hecho'],comp:['en la misma cama, cada cual en una punta','su lado de la cama hecho'],
  sillon:['en el sillón, con una manta','la manta doblada en el sillón'],silla:['en una silla, con la cabeza sobre la mesa','la silla en su sitio'],nada:['en el suelo, sobre dos mantas','las mantas dobladas en un rincón'],
  semana_fin:'{p} ya tiene una habitación: {c} a la semana, compartiendo con cuatro desconocidos. Ha dejado las llaves en la mesa.',
  echar:'{p} recoge la maleta sin decir nada. No tenía adónde ir; eso no ha cambiado.'};
function huDonde(p){try{const r=(S.res||[]).find(x=>x.pid===p.k)||{pid:p.k,kind:'guest',stay:true};const i=huSitios(r)[0];if(i==null)return HU_T.nada;const t=S.obj[i].t;
  return i===huCamaAna()?HU_T.comp:BEDS.includes(t)?HU_T.cama:HU_SOFA.includes(t)?HU_T.sofa:t==='silla'?HU_T.silla:HU_T.sillon;}catch(e){return HU_T.sofa;}}
