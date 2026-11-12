// ---------- diario: un resumen de cada día contado como una historia ----------
const ACTIVITY=DATA.reglas.diario_actividad;
const OPEN=DATA.reglas.diario_apertura;
function writeDiary(){
  const td=S.today;if(!td){newToday();return;}
  const d=dateOf(S.day),c=CH(),n=c.name,W=S.weather||{k:'sol'},o=oa();const parts=[];
  parts.push(pickR(OPEN[W.k]||OPEN.sol));
  const dt=dayType(S.day);if(festivo(S.day))parts.push(huecos(TXN.diario.festivo,{nombre:festivo(S.day)}));else if(dt==='vac')parts.push(TXN.diario.vacaciones);else if(dt==='weekend'&&Math.random()<.5)parts.push(pickR(TXN.diario.libre_finde));
  if(td.work){const w=td.work;const wp=TR().self?TXN.diario.lugar_tienda:S.track==='reparto'?TXN.diario.lugar_reparto:S.track==='obra'?TXN.diario.lugar_obra:S.track==='hosteleria'?TXN.diario.lugar_bar:S.track==='arte'?huecos(TXN.diario.lugar_arte,{e:S.office?S.office.n:TXN.diario.lugar_arte_sin}):S.track==='oficina'?TXN.diario.lugar_oficina:huecos(TXN.diario.lugar_otro,{e:S.office?S.office.n:TXN.diario.lugar_otro_sin});let t=pickR([huecos(TXN.diario.trabajo_dia[0],{nombre:n}),huecos(TXN.diario.trabajo_dia[1],{nombre:n,lugar:wp}),huecos(TXN.diario.trabajo_dia[2],{nombre:n})]);
    if(w.late>15)t+=huecos(TXN.diario.trabajo_tarde,{min:w.late});if(w.extra)t+=TXN.diario.trabajo_extra;t+=huecos(TXN.diario.trabajo_vuelve,{pago:fmt(w.pay)});
    if(Dm().soul&&TOX()>0.65)t+=pickR(TXN.diario.trabajo_toxico);
    else if(w.perf>=1.1)t+=pickR([TXN.diario.trabajo_bien[0],TXN.diario.trabajo_bien[1],huecos(TXN.diario.trabajo_bien[2],{la:ga('la','lo','le')})]);
    else if(w.perf<0.9)t+=pickR(TXN.diario.trabajo_mal);
    parts.push(t);}
  else if(S.jobless&&dt==='work')parts.push(pickR(TXN.diario.paro_dia));
  if(td.out)parts.push(td.out);
  const used=Object.entries(td.used).filter(([t])=>ACTIVITY[t]).sort((a,b)=>b[1]-a[1]).slice(0,2).map(([t])=>pickR(ACTIVITY[t]));
  if(used.length)parts.push(capF(huecos(TXN.diario.actividad,{cuando:pickR(TXN.diario.actividad_cuando),lista:used.join(' y ')})));
  if(td.calls.length)parts.push(huecos(TXN.diario.llamadas,{con:td.calls.join(' y ')}));
  if(td.built.length)parts.push(huecos(TXN.diario.terminado,{que:pickR(TXN.diario.terminado_ini),lista:td.built.join(', ').toLowerCase()}));
  if(td.skills.length)parts.push(huecos(TXN.diario.habilidades,{que:td.skills.map(x=>x.toLowerCase()).join(' y ')}));
  if(td.harvest)parts.push(huecos(TXN.diario.huerto,{raciones:td.harvest}));
  if(td.weeds>=3)parts.push(TXN.diario.jardin);
  for(const e of td.ev.slice(0,3))parts.push(e.replace(/^\S+\s/,'').replace(/([^.!?»])$/,'$1.'));
  const m=td.moodN?td.moodS/td.moodN:mood();
  parts.push(m>70?pickR(TXN.diario.animo_alto):m>50?pickR(TXN.diario.animo_medio):m>32?pickR([huecos(TXN.diario.animo_bajo[0],{o:o}),TXN.diario.animo_bajo[1],TXN.diario.animo_bajo[2]]):pickR([TXN.diario.animo_peor[0],TXN.diario.animo_peor[1],huecos(TXN.diario.animo_peor[2],{o:o})]));
  if(S.money<reserveMoney())parts.push(pickR(TXN.diario.dinero_preocupa));
  else if(S.want&&Math.random()<.5)parts.push(huecos(TXN.diario.sueno,{que:S.want.name.toLowerCase()}));
  const me=m>70?'😊':m>50?'🙂':m>32?'😐':'😞';
  tell(huecos(TXN.diario.dia,{semana:WDL[d.wd],dia:d.dm,mes:MONTHS[d.m].toLowerCase(),partes:parts.join(' ')}),me,'d');
}
// llamadas y relaciones
function phoneCall(){const ps=(S.people||[]).filter(p=>p.k!=='vecina');if(!ps.length)return;
  const p=ps.sort((a,b)=>a.rel-b.rel+Math.random()*30-15)[0];p.rel=Math.min(100,p.rel+14);p.last=S.day;
  const topics=[...TXN.diario.llamada_temas];
  if(S.money<reserveMoney())topics.push(TXN.diario.llamada_dinero);if(S.want&&S.want.kind==='buy')topics.push(huecos(TXN.diario.llamada_compra,{que:S.want.name.toLowerCase()}));else if(S.want&&S.want.kind==='build')topics.push(huecos(TXN.diario.llamada_obra,{que:S.want.name.toLowerCase()}));
  if(S.jobless)topics.push(TXN.diario.llamada_animos);
  const t=pickR(topics);tally('calls',`${p.n}`);
  if(Math.random()<0.15&&!(S.lastCallTell>S.day-4)){S.lastCallTell=S.day;tell(huecos(TXN.diario.llamada,{n:CH().name,p:p.n,rol:p.r,tema:t}),'☎️');}
  if(p.k==='madre'&&S.money<reserveMoney()*0.6&&Math.random()<0.35*(isI('conservadora')?1.7:1)&&!(S.momHelp>S.day-30)){const g=Math.round((40+Math.random()*80)*(Dm().soul?0.6:1));S.money+=g;S.momHelp=S.day;bumpMoney();tell(huecos(TXN.diario.madre_transfiere,{p:p.n,g:fmt(g)}),'💌');toast(huecos(TXN.diario.transfiere_aviso,{p:p.n,g:fmt(g)}),true);}
}
function peopleDaily(){
  for(const p of S.people||[]){p.rel=Math.max(5,p.rel-(p.k==='vecina'?0.3:p.k==='madre'&&isI('conservadora')?0.35:0.8));}
  const m=P_('madre');if(m&&m.rel<35&&Math.random()<0.2&&!(S.momMsg>S.day-12)&&(S.momMsg=S.day))tell(huecos(TXN.diario.madre_mensaje,{p:m.n}),'📱');
  const f=P_('amiga');if(f&&f.rel<30&&Math.random()<0.15&&!(S.friMsg>S.day-15)&&(S.friMsg=S.day))tell(huecos(TXN.diario.amiga_distancia,{p:f.n}),'💭');
  const cp=P_('compi');if(cp&&S.today&&S.today.work)cp.rel=Math.min(100,cp.rel+1.5);
}
// salir con amigos los días libres
function maybeFriendOuting(){
  const h=S.t/60,dt=dayType(S.day),nd=S.needs;if(dt==='work'||h<17||h>20||S.sim.work>0||S.outDay===S.day)return false;
  if(nd.social>65||nd.energia<35||nd.hambre<25||spare()<mealOutCost()*1.6)return false;
  if((S.weather||{}).k==='tormenta'||Math.random()>0.35){S.outDay=S.day;return false;}
  S.outDay=S.day;goOut('amigos');return true;
}
function outFriend(){return (S.outWith&&(S.people||[]).find(q=>q.k===S.outWith))||P_('amiga');}
function friendBack(){const f=(S.outWith&&(S.people||[]).find(q=>q.k===S.outWith))||P_('amiga')||{n:TXN.diario.amigos_sin};const date=S.dateOut;S.outWith=null;S.dateOut=false;f.last=S.day;
  if(date&&f.love!=null){f.love=Math.min(100,f.love+8+compatOf(f)/10);f.rel=Math.min(100,f.rel+8);}else if(Math.random()<.5)setTimeout(()=>maybeMeet('amigos'),5);const c=Math.round(mealOutCost()*1.6);S.money-=c;S.needs.social=100;S.needs.diversion=Math.min(100,S.needs.diversion+40);S.needs.hambre=Math.max(S.needs.hambre,85);if(f.rel!=null)f.rel=Math.min(100,f.rel+18);
  const plan=date?pickR(TXN.diario.plan_cita):pickR(TXN.diario.plan_salida);
  const txt=date?huecos(TXN.diario.cita,{p:f.n,plan:plan,cierre:pickR(TXN.diario.cita_cierre)}):huecos(TXN.diario.salida,{p:f.n,plan:plan,cierre:pickR(TXN.diario.salida_cierre)});
  if(S.today)S.today.out=txt;tell(`${CH().name} ${txt.charAt(0).toLowerCase()+txt.slice(1)}`,'🍻');toast(huecos(TXN.diario.salida_aviso,{n:CH().name,p:f.n,c:fmt(c)}));}
// cumpleaños y aniversarios
function birthdayCheck(){const c=S.char;if(!c||!c.bday)return;const d=dateOf(S.day);if(d.m!==c.bday[0]||d.dm!==c.bday[1])return;
  c.age=(c.age||27)+1;S.needs.social=100;S.needs.diversion=Math.min(100,S.needs.diversion+30);
  const m=P_('madre'),f=P_('amiga');for(const p of S.people||[])p.rel=Math.min(100,p.rel+8);
  const gift=Math.round((Dm().soul?30:80)*(1+Math.random()));S.money+=gift;bumpMoney();
  tell(huecos(TXN.diario.cumple,{n:c.name,edad:c.age,madre:m?huecos(TXN.diario.cumple_madre,{p:m.n,la:ga('la','lo','le')}):'',amiga:f?huecos(TXN.diario.cumple_amiga,{p:f.n}):'',regalo:fmt(gift)}),'🎂','c');
  toast(huecos(TXN.diario.cumple_aviso,{n:c.name,edad:c.age}),true);popBubble('🎂');}
function milestones(){
  if(S.day===31)chapter('mes',TXN.diario.mes_titulo,huecos(TXN.diario.mes,{casa:rooms.length>1?TXN.diario.mes_hogar:huecos(TXN.diario.mes_vacia,{ella:ga('a ella','a él','a elle')})}));
  if(S.day===366)chapter('ano',TXN.diario.ano_titulo,TXN.diario.ano);
  if(S.money<0&&!S.story.chap.rojo)chapter('rojo',TXN.diario.rojo_titulo,TXN.diario.rojo);
}

function storyPromo(){const c=CH(),t=CAREER[S.career].t;
  if(S.career===1)chapter('promo1',TXN.diario.promo_titulo,huecos(TXN.diario.promo,{antes:CAREER[0].t.toLowerCase(),ahora:t.toLowerCase(),cierre:pickR(TXN.diario.promo_cierre)}));
  else if(S.career===CAREER.length-1)chapter('top',TXN.diario.top_titulo,huecos(TXN.diario.top,{n:c.name,puesto:t.toLowerCase()}));
  else tell(huecos(TXN.diario.ascenso,{n:c.name,puesto:t.toLowerCase(),cierre:pickR(TXN.diario.ascenso_cierre)}),'🎉');}
function jobStory(){
  const now=S.jobless?'paro':(S.office?S.office.n:'job'),was=S.prevJob;
  if(was!=null&&was!==now){
    if(S.jobless){if(S.story.chap.paro)tell(huecos(TXN.diario.paro_otra_vez,{n:CH().name}),'📦');else chapter('paro',TXN.diario.paro_titulo,TXN.diario.paro);}
    else if(was==='paro'){if(S.story.chap.nuevo)tell(huecos(TXN.diario.nuevo_tell,{empresa:S.office?S.office.n:TXN.diario.empresa_nueva}),'📝');else chapter('nuevo',TXN.diario.nuevo_titulo,huecos(TXN.diario.nuevo,{empresa:S.office?S.office.n:TXN.diario.empresa_nueva}));}
    else tell(huecos(TXN.diario.primer_dia,{ahora:now}),'🏢');}
  S.prevJob=now;}
