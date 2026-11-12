// =================== PESO CON SENTIDO: comer bien mantiene; el cuerpo tiende a su peso; se puede fijar un objetivo ===================
const pesoSano=()=>{const ch=S.char||{};const H=HP();return ch.alt?Math.round(22*(ch.alt/100)**2):H.base;};
// medir lo que entra y lo que se gasta por la vía del hambre, con todo incluido (plato, tápers, salidas)
{const _up=update;update=function(gm){const h0=S.needs.hambre;const r=_up.apply(this,arguments);try{const d=S.needs.hambre-h0;const P=S.pz=S.pz||{in:0,dr:0,low:0};if(d>0)P.in+=d;else P.dr-=d;if(S.needs.hambre<20)P.low+=gm;}catch(e){}return r;};}
{const _dl=dailyEvents;dailyEvents=function(){const H=HP();const p0=H.peso;const burn=H.burn||0;const r=_dl.apply(this,arguments);try{const P=S.pz||{in:0,dr:0,low:0};S.pz={in:0,dr:0,low:0};
  const phys=['obra','super','hosteleria','cuidados','reparto'].includes(S.track)&&!S.jobless&&S.lastWorkDay===S.day;
  const bal=P.in-P.dr*.97-(burn*.35)-(phys?5:0)-(P.low>240?10:0)+(H.diet?-6:0);
  let d=Math.max(-.12,Math.min(.12,bal*.004));
  const goal=H.goalKg||pesoSano();const nut=typeof CM==='function'?CM().nut:60;
  if(goal>p0+.3&&nut>=55&&P.in>40){d=Math.max(d,0)+Math.min(.13,(goal-p0)*.02)+(burn>0?.02:0);}
  else if(Math.abs(bal)<18&&P.in>40){d+=Math.max(-.08,Math.min(.08,(goal-p0)*.012));}
  if(typeof homeless==='function'&&homeless())d-=.06;
  H.peso=Math.max(H.base-16,Math.min(H.base+45,p0+d));if(H.hist&&H.hist.length)H.hist[H.hist.length-1]=+H.peso.toFixed(1);
  // la anemia se va si vuelve a su peso y come
  if(H.peso>=pesoSano()-5)H.list=(H.list||[]).filter(x=>!(x.k==='anemia'&&!x.dx&&P.in>60));}catch(e){console.error(e);}return r;};}
// objetivo de peso en el bloque de Cuerpo
{const _hb=hpBlock;hpBlock=function(){let h=_hb.apply(this,arguments);try{const H=HP();const g=H.goalKg||pesoSano();h=h.replace('<h3>🫀 Cuerpo</h3>',`<h3>${TXHZ.peso.cuerpo}</h3><div class="kv"><span>${TXHZ.peso.peso_objetivo}</span><span><button class="mini" data-pg="-1">−</button> <b>${huecos(TXHZ.peso.kg,{g})}</b> <button class="mini" data-pg="1">+</button></span></div><div class="sub" style="font-size:11px">${huecos(TXHZ.peso.comiendo_tres_veces_al_dia,{pesoSano:pesoSano()})}</div>`);}catch(e){}return h;};}
document.addEventListener('click',ev=>{const b=ev.target.closest&&ev.target.closest('[data-pg]');if(!b)return;ev.stopPropagation();const H=HP();const s=pesoSano();H.goalKg=Math.max(s-12,Math.min(s+15,(H.goalKg||s)+(+b.dataset.pg)));if(typeof openMenu==='function')openMenu();},true);
// listas de espera según el gobierno
function esperaMul(){const w=W_();const g=w.era||w.gov;return {consejos:.35,comunas:.45,mercado:.5,progresista:.75,centro:1,conservador:1.3,liberal:1.4,austeridad:1.8}[g]||1;}
{const _ha=hpAsk;hpAsk=function(priv){const H=HP();const had=H.cita;const r=_ha.apply(this,arguments);try{if(!had&&H.cita&&!H.citaPriv){const w=H.cita-S.day;H.cita=S.day+Math.max(1,Math.round(w*esperaMul()));}}catch(e){}return r;};}
{const _dl2=dailyEvents;dailyEvents=function(){const r=_dl2.apply(this,arguments);try{const H=HP();if(H.cita&&!H.citaPriv&&!H.citaAdj){H.citaAdj=1;const w=H.cita-S.day;H.cita=S.day+Math.max(1,Math.round(w*esperaMul()));}if(!H.cita)H.citaAdj=0;
  const m=typeof MT==='function'?MT():null;if(m&&m.wait>0&&!m.waitAdj){m.waitAdj=1;m.wait=Math.max(3,Math.round(m.wait*esperaMul()));}if(m&&!m.wait)m.waitAdj=0;}catch(e){}return r;};}
// la anemia depende de comer, no solo del peso: si se come decente, se va (y no vuelve a aparecer)
{const _dl3=dailyEvents;dailyEvents=function(){const r=_dl3.apply(this,arguments);try{const H=HP();const c=typeof CM==='function'?CM():null;const nut=c?c.nut:60;const n=CH().name;
  if(!S.fixAnemia){S.fixAnemia=1;if((H.list||[]).some(x=>x.k==='anemia')){H.list=H.list.filter(x=>x.k!=='anemia');tell(huecos(TXHZ.peso.analitica_nueva_anemia_ya_aparece,{nom:n}),'🩸');}}
  const a=(H.list||[]).find(x=>x.k==='anemia');if(a){if(S.day-(a.since||S.day)<=1&&nut>=45){H.list=H.list.filter(x=>x!==a);}else if(nut>=50&&Math.random()<(a.dx?.2:.1)){H.list=H.list.filter(x=>x!==a);tell(huecos(TXHZ.peso.ya_tiene_anemia_lleva_semanas,{nom:n}),'🩸');}}}catch(e){}return r;};}
