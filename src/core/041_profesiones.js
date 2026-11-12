// ---------- profesiones ----------
const TRACKS=DATA.profesiones.sectores;
const TRK_ORDER=DATA.profesiones.orden;
const TR=()=>TRACKS[(S&&S.track)||'oficina'];
function daysLabel(){const d=[...TR().days].sort((a,b)=>a-b);const run=d.length>=3&&d.every((v,i)=>i===0||v===d[i-1]+1);return run?`${WDS[d[0]]}–${WDS[d[d.length-1]]}`:d.length>=5?'6 días':d.map(x=>WDS[x]).join(' ');}
function setTrack(k){S.track=k;CAREER=TRACKS[k].levels;}
const tShifts=()=>S.shifts-(S.shiftBase||0);
const bizCapital=()=>Math.round(900*PM());
function entryMissing(k){
  const T0=TRACKS[k],m=[];if(k===S.track&&!S.jobless)return ['ya trabajas aquí'];
  for(const [sk,,nm] of SKILLS){const r=T0.levels[0].req[sk];if(r&&lvl(sk)<r)m.push(`${nm} ${r}`);}
  if(T0.needs&&!has(T0.needs))m.push('tener ordenador');
  if(T0.opos&&!S.oposPassed)m.push('aprobar oposiciones');
  if(T0.self&&S.money<bizCapital())m.push(`${fmt(bizCapital())} de capital`);
  if(T0.coop&&!(S.pol&&S.pol.coopOK))m.push('montar o encontrar una cooperativa (sindicato, militancia o huelga ganada)');
  if(S.world&&S.world.era==='comuna'&&k==='negocio')m.push('ya no hay negocios privados');
  return m;
}
function startTrack(k,silent){
  const old=S.track;setTrack(k);S.career=0;S.shiftBase=S.shifts;S.payMul=1;S.jobless=false;S.paroWeeks=0;S.seek=null;S.rep=Math.max(55,S.rep??60);S.offer=null;
  const T0=TRACKS[k];S.office={n:pickR(T0.cos),tox:T0.tox[0]+Math.random()*(T0.tox[1]-T0.tox[0]),known:0.3,seen:null,since:S.day,org:T0.coop?60:5+Math.random()*10,griev:10};
  if(T0.self){S.money-=bizCapital();S.biz={weeks:0,loss:0};}
  if(!silent)toast(`${T0.e} ${CH().name} empieza de ${CAREER[0].t.toLowerCase()} en ${S.office.n}`,true);
  tell(T0.self?`Ha invertido ${fmt(bizCapital())} en abrir su propio negocio. Ya no tiene jefe… ni red.`:old&&old!==k?`Cambio de vida: deja ${TRACKS[old].n.toLowerCase()} y empieza de ${CAREER[0].t.toLowerCase()} en ${S.office.n}.`:`Empieza de ${CAREER[0].t.toLowerCase()} en ${S.office.n}.`,T0.e);
}
function quitJob(){if(S.jobless)return;tell(`${CH().name} ha dejado su trabajo en ${S.office?S.office.n:'la empresa'}.`,'🚪');S.jobless=true;S.paroWeeks=0;S.seek=S.seek||null;}
// búsqueda de trabajo: cada día laborable, con más suerte si hay ofertas en ese sector
const SEEK_BASE=DATA.profesiones.prob_contrato;
function seekTick(){
  if(!S.seek)return;const k=S.seek;if(entryMissing(k).length&&!(k===S.track&&S.jobless)){S.seek=null;return;}
  if(TRACKS[k].self||TRACKS[k].opos||k==='coop'){startTrack(k);return;}
  if(dayType(S.day)==='weekend'&&!S.jobless)return;
  let p=SEEK_BASE[k]*(Dm().soul?0.5:Dm().money<500?0.7:1.3)*(1-W_().crisis/220)*(S.record?0.55:1)*(1+0.03*lvl('carisma'))*(k==='tech'?1+0.05*(lvl('logica')-4):1)*(S.netBoost>S.day?1.4:1);
  if(Math.random()<p){startTrack(k);}else if(S.jobless&&Math.random()<0.25)toast(`📨 ${CH().name} sigue buscando trabajo en ${TRACKS[k].n.toLowerCase()}`);
}
// Ana elige de qué buscar trabajo según su situación y sus ideas
function autoSeek(){
  if(!S.autoHome||S.seek)return;
  const ok=TRK_ORDER.filter(k=>!entryMissing(k).length);if(!ok.length)return;
  const pref=(IDEOS[S.ideo]||IDEOS.apolitica).tracks||[];
  const score=k=>{const T0=TRACKS[k];let v=T0.levels[0].pay*(T0.gig?0.75:1)-(T0.tox[0]+T0.tox[1])*40+(pref.includes(k)?40:0)+(T0.lay===0&&Dm().soul?30:0);if(T0.self)v+=S.money>bizCapital()*2?40:-120;if(k==='reparto')v+=S.jobless&&S.money<0?60:-60;return v+Math.random()*20;};
  if(S.jobless){const best=ok.sort((a,b)=>score(b)-score(a))[0];S.seek=best;toast(`🔎 ${CH().name} busca trabajo de ${TRACKS[best].n.toLowerCase()}`);return;}
  // con trabajo: cambia si el suyo es claramente peor
  if(S.pol.coopOK&&S.track!=='coop'&&pref.includes('coop')&&Math.random()<.35){S.seek='coop';seekTick();return;}
  if(S.strike||S.career>=2||(S.union&&S.union.member&&office().org>30&&isI('marxista','anarquista','socialdemocrata')))return; // se queda a pelear o ya ha prosperado
  const cur=TRACKS[S.track],curV=salary()/Dm().pay-(TOX()*60)+(pref.includes(S.track)?40:0)+tShifts()*1.5;
  const best=ok.filter(k=>k!==S.track).sort((a,b)=>score(b)-score(a))[0];
  if(best&&!TRACKS[best].gig&&score(best)>curV*1.3+50&&Math.random()<0.12){S.seek=best;toast(`🔎 ${CH().name} empieza a buscar trabajo de ${TRACKS[best].n.toLowerCase()}`);}
}
// oposiciones
function oposTick(){
  const o=S.opos;if(!o||!o.on)return;if(!o.exam||o.exam<S.day)o.exam=S.day+Math.max(30,120-(S.day%120));
  if(S.day!==o.exam)return;
  if(o.h<15){tell(`Se presentó a las oposiciones casi sin estudiar (${Math.round(o.h)} h). Ni lo intentó de verdad.`,'📝');o.h*=0.8;o.exam=S.day+120;return;}
  const freeze=W_().gov==='austeridad';const p=Math.min(.82,(0.04+o.h/220*0.55+lvl('logica')*0.03)*(Dm().soul?0.7:1)*(freeze?0.3:1));
  if(Math.random()<p){S.oposPassed=true;o.on=false;chapter('opos','La plaza',`Después de ${Math.round(o.h)} horas de estudio, ${CH().name} ha aprobado las oposiciones. Una plaza fija. Por primera vez en años, el futuro no da miedo.`);if(S.autoHome||true)S.seek='funcion';}
  else{tell(`Suspendió las oposiciones${freeze?' (este año apenas había plazas)':''}. ${pickR(['Lloró un rato y volvió a abrir el temario.','Habrá otra convocatoria.','Se le quedó la plaza a tres décimas.'])}`,'📝');o.h*=0.7;o.exam=S.day+120;}
}

